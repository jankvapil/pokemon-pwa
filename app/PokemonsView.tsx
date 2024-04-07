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
  useQuerySubscription,
} from '@evolu/react'
import {
  NonEmptyString,
  type Database,
} from '@/components/providers/evoluProvider'
import Link from 'next/link'
import { OwnerActions } from '@/components/ui/OwnerActions'
import { HeartSVG } from '@/components/ui/Heart'

type IPokemonsList = {
  showFavorites: boolean
  setShowFavorites: Dispatch<SetStateAction<boolean>>
}

type Pokemon = Pick<GraphQLTypes['Pokemon'], 'name' | 'id' | 'image'>

/**
 * Pokemons view
 */
export const PokemonsView = (props: IPokemonsList) => {
  const evolu = useEvolu()
  const { query } = useGraphQLClient()
  const { create } = useEvolu<Database>()
  const { createQuery, update } = useEvolu<Database>()

  const [isLoading, setIsLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [pokemons, setPokemons] = useState<Array<Pokemon>>([])
  const [favories, setFavorites] = useState<Readonly<Array<PokemonRow>>>([])
  const favoritesQuery = createQuery((db) =>
    db
      .selectFrom('pokemon')
      .select(['id', 'name', 'image'])
      .where('isDeleted', 'is not', cast(true))
      .where('name', 'is not', null)
      .$narrowType<{ name: NotNull }>()
      .orderBy('createdAt')
  )

  const sub = useQuerySubscription(favoritesQuery)
  type PokemonRow = ExtractRow<typeof favoritesQuery>

  const [loadedImg, setloadedImg] = useState<string>()

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
              image: true,
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
    fetch(`/api/proxy-image?url=${p.image}`)
      .then((response) => response.text())
      .then((base64String) => {
        create('pokemon', {
          name: NonEmptyString1000(p.name),
          image: NonEmptyString(base64String),
        })
      })
      .catch((error) => console.error('Error fetching image:', error))
  }

  /**
   * Deletes pokemon from db
   */
  const handleDeleteClick = (fav: PokemonRow): void => {
    update('pokemon', { id: fav.id, isDeleted: true })
  }

  /**
   * Unfavorites pokemon
   */
  const unFavorite = (p: Pokemon) => {
    const fav = favories.find((fav) => fav.name === NonEmptyString1000(p.name))
    if (fav) {
      handleDeleteClick(fav)
    }
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
    <div className="min-h-screen">
      {loadedImg && <img src={loadedImg} alt="My Image" />}

      {props.showFavorites ? (
        <section>
          <ul className="py-2 flex flex-wrap">
            {favories.map((fav) => (
              <li key={fav.id} className="w-1/2 px-2 py-2">
                <div className="w-full border py-4 flex flex-col items-center">
                  <img
                    src={fav.image?.toString()}
                    alt={`${fav.name} image`}
                    className="w-16 h-16"
                  />
                  <span className="text-lg font-bold">{fav.name}</span>
                </div>

                {/* <button
                  className="_btn py-2"
                  onClick={() => handleDeleteClick(fav)}
                >
                  Delete
                </button> */}
              </li>
            ))}
          </ul>
          <OwnerActions />
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <ul>
            {pokemons.map((p) => {
              const isFavorite = favNames.includes(NonEmptyString1000(p.name))
              return (
                <li
                  className="border-b px-4 py-3 gap-4 flex items-center"
                  key={p.id}
                >
                  <img
                    src={p.image}
                    alt={`${p.name} image`}
                    className="w-12 h-12"
                  />

                  <span className="flex-1 text-lg">
                    <Link href={`/${p.id}`}>
                      {p.name}
                      {` (${p.id})`}
                    </Link>
                  </span>

                  <button
                    className="border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center"
                    onClick={
                      isFavorite ? () => unFavorite(p) : () => makeFavorite(p)
                    }
                  >
                    <HeartSVG color={isFavorite ? 'red' : 'black'} />
                    {/* <span
                      className="text-3xl text-red-500"
                      style={{
                        color: isFavorite ? 'red' : 'black',
                      }}
                    >
                      &hearts;
                    </span> */}
                  </button>
                </li>
              )
            })}
          </ul>

          {isLoading && <div>Loading...</div>}
        </section>
      )}
    </div>
  )
}