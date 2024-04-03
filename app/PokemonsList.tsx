'use client'

import { useGraphQLClient } from '@/components/hooks/useGraphQLClient'
import { useEffect, useState } from 'react'
import { GraphQLTypes } from '@/lib/graphql/zeus'

/**
 * Pokemons list view
 */
export const PokemonsList = () => {
  const { query } = useGraphQLClient()
  const [pokemons, setPokemons] = useState<
    Array<Pick<GraphQLTypes['Pokemon'], 'name' | 'id'>>
  >([])

  useEffect(() => {
    const fetchPokemons = async () => {
      const res = await query({
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
      })

      // console.log(res)
      setPokemons(res.pokemons.edges)
    }

    fetchPokemons()
  }, [])

  return (
    <ul>
      {pokemons.map((p) => (
        <li className="border-b px-4 py-3 flex items-center" key={p.id}>
          <span className="flex-1">{p.name}</span>
          <button
            className="border border-gray-200 rounded-full w-10 text-2xl"
            onClick={() => alert('TODO: Add favorite')}
          >
            &hearts;
          </button>
        </li>
      ))}
    </ul>
  )
}
