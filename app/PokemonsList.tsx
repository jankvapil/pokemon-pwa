'use client'

import { useGraphQLClient } from '@/components/hooks/useGraphQLClient'
import { Dispatch, SetStateAction, use, useEffect, useState } from 'react'
import { GraphQLTypes } from '@/lib/graphql/zeus'

import {
  ExtractRow,
  NonEmptyString1000,
  NotNull,
  cast,
  useEvolu,
  useQuery,
  useQuerySubscription,
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
  const evolu = useEvolu()
  const { query } = useGraphQLClient()
  const { create } = useEvolu<Database>()
  const { createQuery, update } = useEvolu<Database>()

  const [isLoading, setIsLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [pokemons, setPokemons] = useState<Array<Pokemon>>([])
  const [favories, setFavorites] = useState<Readonly<Array<PokemonRow>>>([])
  const favoritesQuery = createQuery(
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

  const sub = useQuerySubscription(favoritesQuery)
  type PokemonRow = ExtractRow<typeof favoritesQuery>

  /**
   * Subscribe for favorite pokemons changes in SQLite db
   */
  useEffect(() => {
    setFavorites(sub.rows)
  }, [sub])

  /**
   * Prefetch favorite pokemons from SQLite db
   */
  useEffect(() => {
    const fetchFavorites = async () => {
      evolu
        .loadQuery(favoritesQuery)
        .then((res) => setFavorites(res.rows))
        .catch((err) => console.error(err))
    }

    fetchFavorites()
  }, [])

  /**
   * Fetch pokemons on page load or offset changes
   */
  useEffect(() => {
    const fetchPokemons = async () => {
      setIsLoading(true)
      query({
        pokemons: [
          {
            query: {
              offset: offset,
              limit: 20,
            },
          },
          {
            edges: {
              id: true,
              name: true,
            },
          },
        ],
      })
        .then((res) => {
          setPokemons((prev) => {
            const filtered = res.pokemons.edges.filter(
              (p) => !prev.map((p2) => p2.id).includes(p.id)
            )
            return [...prev, ...filtered]
          })
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false))
    }

    fetchPokemons()
  }, [offset])

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

  /**
   * Infifinite scroll
   */
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
          document.documentElement.offsetHeight ||
        isLoading
      )
        return

      setOffset((prev) => prev + 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoading])

  const favNames = favories.map((fav) => fav.name)
  return (
    <>
      {props.showFavorites ? (
        <ul className="py-2">
          {favories.map((fav) => (
            <li
              key={fav.id}
              className="border-b py-3 flex justify-center items-center gap-3"
            >
              <span className="text-lg font-bold">{fav.name}</span>
              <button
                className="_btn py-2"
                onClick={() => handleDeleteClick(fav)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <section className="flex flex-col gap-4">
          <ul>
            {pokemons.map((p) => (
              <li className="border-b px-4 py-3 flex items-center" key={p.id}>
                <span className="flex-1">
                  <Link href={`/${p.id}`}>
                    {p.name}
                    {` (${p.id})`}
                  </Link>
                </span>

                {!favNames.includes(NonEmptyString1000(p.name)) && (
                  <button
                    className="border border-gray-200 rounded-full w-10 text-xl"
                    onClick={() => makeFavorite(p)}
                  >
                    &hearts;
                  </button>
                )}
              </li>
            ))}
          </ul>

          {isLoading && <div>Loading...</div>}
        </section>
      )}
    </>
  )
}
