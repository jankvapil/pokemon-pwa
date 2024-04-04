'use client'

import { ExtractRow, NotNull, cast, useEvolu, useQuery } from '@evolu/react'

import { type Database } from '@/components/providers/evoluProvider'

/**
 * Favorite pokemons list
 */
export const FavoritesList = () => {
  const { create, createQuery, update } = useEvolu<Database>()
  const pokemons = createQuery(
    (db) =>
      db
        .selectFrom('pokemon')
        .select(['id', 'name'])
        .where('isDeleted', 'is not', cast(true))
        // Filter null value and ensure non-null type.
        .where('name', 'is not', null)
        .$narrowType<{ name: NotNull }>()
        .orderBy('createdAt'),
    {
      // logQueryExecutionTime: true,
      // logExplainQueryPlan: true,
    }
  )

  type PokemonRow = ExtractRow<typeof pokemons>

  const { rows } = useQuery(pokemons)

  const handleDeleteClick = (row: PokemonRow): void => {
    update('pokemon', { id: row.id, isDeleted: true })
  }

  return (
    <>
      <ul className="py-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="border-b py-3 flex justify-center items-center gap-3"
          >
            <span className="text-lg font-bold">{row.name}</span>
            <button
              className="_btn py-2"
              onClick={() => handleDeleteClick(row)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
