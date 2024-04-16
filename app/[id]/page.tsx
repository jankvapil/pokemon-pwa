'use client'

import { useGraphQLClient } from '@/components/hooks/useGraphQLClient'
import { GraphQLTypes } from '@/lib/graphql/zeus'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Pokemon = Pick<
  GraphQLTypes['Pokemon'],
  | 'name'
  | 'image'
  | 'types'
  | 'evolutions'
  | 'maxCP'
  | 'maxHP'
  | 'height'
  | 'weight'
>

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
            weight: {
              minimum: true,
              maximum: true,
            },
            height: {
              minimum: true,
              maximum: true,
            },
            evolutions: {
              id: true,
              name: true,
              image: true,
            },
          },
        ],
      }).then((res) => {
        setPokemon(res.pokemonById as Pokemon) // TODO: fix type error
      })
    }

    fetchDetail()
  }, [])

  return (
    <div className="max-w-2xl m-auto min-h-screen">
      <header className="bg-gray-200 flex flex-col text-center pb-2 md:border-x md:border-x-gray-600">
        <img
          src={pokemon?.image}
          alt="Pokemon image"
          className="rounded-full border border-gray-600 m-6 mb-0 w-64 h-64 self-center"
        />
        <h1 className="_h1 pt-2">{pokemon?.name}</h1>
        <ul className="flex gap-2 justify-center">
          {pokemon?.types.map((type) => (
            <li key={type}>{type}</li>
          ))}
        </ul>
      </header>

      <ul className="flex text-center bg-gray-200 border border-gray-600 border-x-0 mb-8 md:border-x md:border-x-gray-600">
        <li className="flex-1 py-4 border-r border-r-gray-600">
          <h3 className="font-bold">Weight</h3>
          <span>
            {pokemon?.weight.minimum} - {pokemon?.weight.maximum}
          </span>
        </li>
        <li className="flex-1 py-4">
          <h3 className="font-bold">Height</h3>
          <span>
            {pokemon?.height.minimum} - {pokemon?.height.maximum}
          </span>
        </li>
      </ul>

      {pokemon?.evolutions.length !== undefined &&
        pokemon.evolutions.length > 0 && (
          <section className="px-2">
            <h2 className="text-2xl pb-2">Evolutions</h2>
            <ul className="flex gap-2 justify-center">
              {pokemon?.evolutions.map((evolution) => (
                <li className="border flex-1" key={evolution.name}>
                  <Link
                    href={`/${evolution.id}`}
                    className="flex flex-col items-center gap-2 py-4 text-center"
                  >
                    <img
                      className="w-40 h-40"
                      src={evolution.image}
                      alt={`${evolution.name} image`}
                    />
                    <span className="text-lg">{evolution.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
    </div>
  )
}
