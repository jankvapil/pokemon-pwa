'use client'
import * as S from '@effect/schema/Schema'

import {
  EvoluProvider as _EvoluProvider,
  NonEmptyString1000,
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

// Every table needs Id. It's defined as a branded type.
// Branded types make database types super safe.
const PokemonId = id('Pokemon')
type PokemonId = S.Schema.Type<typeof PokemonId>

// This branded type ensures a string must be validated before being put
// into the database. Check the prompt function to see Schema validation.
const NonEmptyString50 = String.pipe(
  S.minLength(1),
  S.maxLength(50),
  S.brand('NonEmptyString50')
)
type NonEmptyString50 = S.Schema.Type<typeof NonEmptyString50>

export const NonEmptyString = String.pipe(
  S.minLength(1),
  S.brand('NonEmptyString')
)
export type NonEmptyString = S.Schema.Type<typeof NonEmptyString50>

// Now we can define tables.
const PokemonTable = table({
  id: PokemonId,
  name: NonEmptyString1000,
  image: NonEmptyString,
})
type PokemonTable = S.Schema.Type<typeof PokemonTable>

// Now, we can define the database schema.
const Database = database({
  pokemon: PokemonTable,
})
export type Database = S.Schema.Type<typeof Database>

const evolu = createEvolu(Database)

/**
 * Provides initialized evolu context
 */
export const EvoluProvider = (props: IEvoluProvider) => {
  return <_EvoluProvider value={evolu}>{props.children}</_EvoluProvider>
}
