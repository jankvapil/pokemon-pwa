'use client'
import { useGraphQLClient } from '@/components/hooks/useGraphQLClient'

export function Button() {
  const { query } = useGraphQLClient()

  const handleOnClick = async () => {
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
  }

  return (
    <button type="button" onClick={handleOnClick}>
      Fetch pokemons
    </button>
  )
}
