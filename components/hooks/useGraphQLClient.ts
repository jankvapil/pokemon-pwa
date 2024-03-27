import { Chain } from '@/lib/graphql/zeus'
import { useState } from 'react'

/**
 * Hook provides GraphQL client's functions for queries
 */
export const useGraphQLClient = () => {
  const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL

  if (!GRAPHQL_URL) {
    throw new Error('GraphQL URL env is not defined')
  }

  const zeusClient = Chain(GRAPHQL_URL, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const [query, _setQuery] = useState(() => zeusClient('query'))

  return { query }
}
