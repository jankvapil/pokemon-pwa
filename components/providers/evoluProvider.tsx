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
} from '@evolu/react'
import { ReactNode } from 'react'

type IEvoluProvider = {
  children: ReactNode
}

/**
 * Provides initialized evolu context
 */
export const EvoluProvider = (props: IEvoluProvider) => {
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
  type Database = S.Schema.Type<typeof Database>

  const evolu = createEvolu(Database)

  return <_EvoluProvider value={evolu}>{props.children}</_EvoluProvider>
}
