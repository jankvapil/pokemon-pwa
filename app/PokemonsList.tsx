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

      console.log(res)
      setPokemons(res.pokemons.edges)
    }

    fetchPokemons()
  }, [])

  return (
    <ul>
      {pokemons.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  )
}
