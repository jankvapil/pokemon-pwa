'use client'

import { FC, useEffect } from 'react'
import {
  ExtractRow,
  NonEmptyString1000,
  NotNull,
  cast,
  jsonArrayFrom,
  useEvolu,
  useQuery,
} from '@evolu/react'

import { type Database } from '@/components/providers/evoluProvider'
import { prompt } from '@/lib/utils/prompt'

/**
 * Todos list
 */
const Todos: FC = () => {
  const { create, createQuery, update } = useEvolu<Database>()

  // Evolu queries should be collocated. If necessary, they can be preloaded.
  const todosWithCategories = createQuery(
    (db) =>
      db
        .selectFrom('todo')
        .select(['id', 'title', 'isCompleted', 'categoryId'])
        .where('isDeleted', 'is not', cast(true))
        // Filter null value and ensure non-null type.
        .where('title', 'is not', null)
        .$narrowType<{ title: NotNull }>()
        .orderBy('createdAt')
        // https://kysely.dev/docs/recipes/relations
        .select((eb) => [
          jsonArrayFrom(
            eb
              .selectFrom('todoCategory')
              .select(['todoCategory.id', 'todoCategory.name'])
              .where('isDeleted', 'is not', cast(true))
              .orderBy('createdAt')
          ).as('categories'),
        ]),
    {
      // logQueryExecutionTime: true,
      // logExplainQueryPlan: true,
    }
  )

  type TodoRow = ExtractRow<typeof todosWithCategories>

  const { rows } = useQuery(todosWithCategories)

  useEffect(() => {
    console.log('Rows has been changed')
    console.log(rows)
  }, [rows])

  const handleAddTodoClick = (): void => {
    prompt(NonEmptyString1000, 'What needs to be done?', (title) => {
      create('todo', { title })
    })
  }

  const handleToggleCompletedClick = (row: TodoRow): void => {
    update('todo', { id: row.id, isCompleted: !row.isCompleted })
  }

  const handleRenameClick = (row: TodoRow): void => {
    prompt(NonEmptyString1000, 'New Name', (title) => {
      update('todo', { id: row.id, title: title })
    })
  }

  const handleDeleteClick = (row: TodoRow): void => {
    update('todo', { id: row.id, isDeleted: true })
  }

  return (
    <>
      <ul className="py-2">
        {rows.map((row) => (
          <li key={row.id}>
            <span
              className="text-sm font-bold"
              style={{
                textDecoration: row.isCompleted ? 'line-through' : 'none',
              }}
            >
              {row.title}
            </span>
            <button onClick={() => handleToggleCompletedClick(row)}>
              {row.isCompleted ? 'Completed' : 'Complete'}
            </button>
            <button onClick={() => handleRenameClick(row)}>Rename</button>
            <button onClick={() => handleDeleteClick(row)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={handleAddTodoClick}>Add Todo</button>
    </>
  )
}

export { Todos }
