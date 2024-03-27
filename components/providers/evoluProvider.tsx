'use client'
import * as S from '@effect/schema/Schema'

import {
  EvoluProvider as _EvoluProvider,
  NonEmptyString1000,
  SqliteBoolean,
  String,
  createEvolu,
  database,
  id,
  table,
  createIndex,
  ExtractRow,
  jsonArrayFrom,
  NotNull,
  cast,
} from '@evolu/react'
import { ReactNode } from 'react'

type IEvoluProvider = {
  children: ReactNode
}

// Every table needs Id. It's defined as a branded type.
// Branded types make database types super safe.
const TodoId = id('Todo')
type TodoId = S.Schema.Type<typeof TodoId>

const TodoCategoryId = id('TodoCategory')
type TodoCategoryId = S.Schema.Type<typeof TodoCategoryId>

// This branded type ensures a string must be validated before being put
// into the database. Check the prompt function to see Schema validation.
const NonEmptyString50 = String.pipe(
  S.minLength(1),
  S.maxLength(50),
  S.brand('NonEmptyString50')
)
type NonEmptyString50 = S.Schema.Type<typeof NonEmptyString50>

// Now we can define tables.
const TodoTable = table({
  id: TodoId,
  title: NonEmptyString1000,
  isCompleted: S.nullable(SqliteBoolean),
  categoryId: S.nullable(TodoCategoryId),
})
type TodoTable = S.Schema.Type<typeof TodoTable>

// Evolu tables can contain typed JSONs.
const SomeJson = S.struct({ foo: S.string, bar: S.boolean })
type SomeJson = S.Schema.Type<typeof SomeJson>

// Let's make a table with JSON value.
const TodoCategoryTable = table({
  id: TodoCategoryId,
  name: NonEmptyString50,
  json: S.nullable(SomeJson),
})
type TodoCategoryTable = S.Schema.Type<typeof TodoCategoryTable>

// Now, we can define the database schema.
const Database = database({
  todo: TodoTable,
  todoCategory: TodoCategoryTable,
})
export type Database = S.Schema.Type<typeof Database>

/**
 * Indexes
 *
 * Indexes are not necessary for development but are required for production.
 *
 * Before adding an index, use `logExecutionTime` and `logExplainQueryPlan`
 * createQuery options.
 *
 * SQLite has a tool for Index Recommendations (SQLite Expert)
 * https://sqlite.org/cli.html#index_recommendations_sqlite_expert_
 */
const indexes = [
  createIndex('indexTodoCreatedAt').on('todo').column('createdAt'),

  createIndex('indexTodoCategoryCreatedAt')
    .on('todoCategory')
    .column('createdAt'),
]

const evolu = createEvolu(Database, { indexes })

// export type TodoRow = ExtractRow<typeof todosWithCategories>

/**
 * Provides initialized evolu context
 */
export const EvoluProvider = (props: IEvoluProvider) => {
  return <_EvoluProvider value={evolu}>{props.children}</_EvoluProvider>
}
