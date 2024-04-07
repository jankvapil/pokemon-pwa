'use client'

import { useGraphQLClient } from '@/components/hooks/useGraphQLClient'
import { GraphQLTypes } from '@/lib/graphql/zeus'
import { useEffect, useState } from 'react'

type Pokemon = Pick<GraphQLTypes['Pokemon'], 'name' | 'image' | 'types'>

/**
 * Pokemon detail page
 */
export default function Page(props: any) {
  const { query } = useGraphQLClient()
  const [pokemon, setPokemon] = useState<Pokemon | undefined>()

  useEffect(() => {
    const fetchDetail = async () => {
      query({
        pokemonById: [
          {
            id: String(props.params.id),
          },
          {
            name: true,
            image: true,
            types: true,
            maxHP: true,
            maxCP: true,
          },
        ],
      }).then((res) => {
        setPokemon(res.pokemonById)
      })
    }

    fetchDetail()
  }, [])

  return (
    <div>
      <header className="bg-gray-200 flex flex-col text-center">
        <img
          src={pokemon?.image}
          alt="Pokemon image"
          className="rounded-full m-6 mb-0 w-64 h-64 self-center"
        />
        <h1 className="_h1 py-2">{pokemon?.name}</h1>
        <ul className="flex gap-2 justify-center">
          {pokemon?.types.map((type) => (
            <li key={type}>{type}</li>
          ))}
        </ul>
      </header>
    </div>
  )
}
