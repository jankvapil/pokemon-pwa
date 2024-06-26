'use client'

import { useGraphQLClient } from '@/components/hooks/useGraphQLClient'
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
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
import { useIntersectionObserver } from 'usehooks-ts'

type IPokemonsList = {
  showFavorites: boolean
  setShowFavorites: Dispatch<SetStateAction<boolean>>
}

type Pokemon = Pick<GraphQLTypes['Pokemon'], 'name' | 'id' | 'image' | 'types'>

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
  const [types, setTypes] = useState<Array<string>>([])

  // helper state
  const [formChanged, setFormChanged] = useState(0)

  const searchRef = useRef('')
  const filterTypeRef = useRef('')

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
   * Fetch pokemons on page load, offset changes or form change
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
              filter: {
                type: filterTypeRef.current,
              },
              search: searchRef.current,
            },
          },
          {
            edges: {
              id: true,
              name: true,
              image: true,
              types: true,
            },
          },
        ],
        pokemonTypes: true,
      })
        .then((res) => {
          setTypes(res.pokemonTypes)
          setPokemons((prev) => {
            let newPrev = prev

            // if previous pokemons contains a new loaded pokemons, filter them
            const filtered = res.pokemons.edges.filter(
              (p) => !newPrev.map((prev) => prev.id).includes(p.id)
            )

            return [...newPrev, ...filtered].sort((a, b) =>
              a.id.localeCompare(b.id)
            )
          })
        })
        .catch((err) => console.error(err))
        .finally(() => setTimeout(() => setIsLoading(false), 200))
    }

    if (!isLoading) {
      fetchPokemons()
    }
  }, [offset, formChanged])

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
   *
   * - when referenced div is reached, increase offset
   */
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.5,
  })
  useEffect(() => {
    if (!props.showFavorites && isIntersecting && pokemons.length > 0) {
      setOffset((prevOffset) => prevOffset + 20)
    }
  }, [isIntersecting])

  /**
   * Handles search after the form is submitted
   *
   * - reset offset & pokemons
   * - refetch pokemons with applied filters
   */
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem('search') as HTMLInputElement
    const inputValue = input.value

    searchRef.current = inputValue
    setOffset((prev) => {
      if (prev === 0) {
        setFormChanged((prev) => prev + 1)
      }
      return 0
    })
    setPokemons([])
  }

  /**
   * Handle filter by type
   *
   * - reset offset & pokemons
   * - refetch pokemons with applied filters
   */
  const handleFilterByType = (e: ChangeEvent<HTMLSelectElement>) => {
    filterTypeRef.current = e.target.value
    setOffset((prev) => {
      if (prev === 0) {
        setFormChanged((prev) => prev + 1)
      }
      return 0
    })
    setPokemons([])
  }

  const favNames = favories.map((fav) => fav.name)
  return (
    <div className="min-h-screen">
      {props.showFavorites ? (
        <section>
          <ul className="pb-4 flex flex-wrap">
            {favories.map((fav) => (
              <li key={fav.id} className="w-1/2 even:pl-1 odd:pr-1 pt-2">
                <div className="w-full border pt-4 pb-2 flex flex-col gap-2 items-center">
                  <img
                    src={fav.image?.toString()}
                    alt={`${fav.name} image`}
                    className="w-16 h-16"
                  />
                  <span className="text-lg font-bold">{fav.name}</span>
                </div>
              </li>
            ))}
          </ul>
          <OwnerActions />
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <div className="flex m-2 mb-0 gap-2">
            <form className="flex-1" onSubmit={handleSearch}>
              <input type="text" id="search" className="p-2 border w-full" />
            </form>
            <select
              className="p-2 border text-gray-700 w-24 cursor-pointer"
              onChange={handleFilterByType}
            >
              <option value="" disabled selected hidden>
                Type
              </option>
              <option key="" value=""></option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
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

                  <span className="flex-1 text-lg font-bold">
                    <Link href={`/${p.id}`}>{p.name}</Link>
                  </span>

                  <button
                    className="border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center"
                    onClick={
                      isFavorite ? () => unFavorite(p) : () => makeFavorite(p)
                    }
                  >
                    <HeartSVG color={isFavorite ? 'red' : 'black'} />
                  </button>
                </li>
              )
            })}
          </ul>

          <div ref={ref} />
        </section>
      )}
    </div>
  )
}
