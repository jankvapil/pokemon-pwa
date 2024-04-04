'use client'

import { useGraphQLClient } from '@/components/hooks/useGraphQLClient'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { GraphQLTypes } from '@/lib/graphql/zeus'

import { NonEmptyString1000, useEvolu } from '@evolu/react'
import { type Database } from '@/components/providers/evoluProvider'

import { FavoritesList } from './FavoritesList'

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

  const [pokemons, setPokemons] = useState<Array<Pokemon>>([])

  useEffect(() => {
    const fetchPokemons = async () => {
      query({
        pokemons: [
          {
            query: {
              offset: 2,
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
        // console.log(res)
        setPokemons(res.pokemons.edges)
      })
    }

    fetchPokemons()
  }, [])

  /**
   * Saves pokemon to db
   */
  const makeFavorite = (p: Pokemon) => {
    create('pokemon', { name: NonEmptyString1000(p.name) })
    props.setShowFavorites(true)
  }

  return (
    <>
      {props.showFavorites ? (
        <FavoritesList />
      ) : (
        <ul>
          {pokemons.map((p) => (
            <li className="border-b px-4 py-3 flex items-center" key={p.id}>
              <span className="flex-1">{p.name}</span>
              <button
                className="border border-gray-200 rounded-full w-10 text-xl"
                onClick={() => makeFavorite(p)}
              >
                &hearts;
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
