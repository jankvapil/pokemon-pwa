'use client'

import { useGraphQLClient } from '@/components/hooks/useGraphQLClient'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { GraphQLTypes } from '@/lib/graphql/zeus'

import {
  ExtractRow,
  NonEmptyString1000,
  NotNull,
  cast,
  useEvolu,
  useQuery,
} from '@evolu/react'
import { type Database } from '@/components/providers/evoluProvider'
import Link from 'next/link'

type IPokemonsList = {
  showFavorites: boolean
  setShowFavorites: Dispatch<SetStateAction<boolean>>
}

type Pokemon = Pick<GraphQLTypes['Pokemon'], 'name' | 'id'>

/**
 * Pokemons list view
 */
export const PokemonsList = (props: IPokemonsList) => {
  const { query } = useGraphQLClient()
  const { create } = useEvolu<Database>()
  const { createQuery, update } = useEvolu<Database>()

  const [offset, setOffset] = useState(0)
  const [pokemons, setPokemons] = useState<Array<Pokemon>>([])
  const favorites = createQuery(
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

  type PokemonRow = ExtractRow<typeof favorites>
  const { rows } = useQuery(favorites)

  useEffect(() => {
    const fetchPokemons = async () => {
      query({
        pokemons: [
          {
            query: {
              offset: offset,
            },
          },
          {
            edges: {
              id: true,
              name: true,
            },
          },
        ],
      }).then((res) => {
        setPokemons((prev) => {
          const filtered = res.pokemons.edges.filter(
            (p) => !prev.map((p2) => p2.id).includes(p.id)
          )
          return [...prev, ...filtered]
        })
      })
    }

    fetchPokemons()
  }, [rows, offset])

  /**
   * Saves pokemon to db
   */
  const makeFavorite = (p: Pokemon) => {
    create('pokemon', { name: NonEmptyString1000(p.name) })
    props.setShowFavorites(true)
  }

  /**
   * Deletes pokemon from db
   */
  const handleDeleteClick = (row: PokemonRow): void => {
    update('pokemon', { id: row.id, isDeleted: true })
  }

  return (
    <>
      {props.showFavorites ? (
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
      ) : (
        <section className="flex flex-col gap-4">
          <ul>
            {pokemons?.map((p) => (
              <li className="border-b px-4 py-3 flex items-center" key={p.id}>
                <span className="flex-1">
                  <Link href={`/${p.id}`}>
                    {p.name}
                    {` (${p.id})`}
                  </Link>
                </span>
                <button
                  className="border border-gray-200 rounded-full w-10 text-xl"
                  onClick={() => makeFavorite(p)}
                >
                  &hearts;
                </button>
              </li>
            ))}
          </ul>
          <button
            className="_btn py-2"
            onClick={() => setOffset((prev) => prev + 10)}
          >
            Load more
          </button>
        </section>
      )}
    </>
  )
}
