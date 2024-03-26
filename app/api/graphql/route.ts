import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { ApolloServer } from '@apollo/server'
import { NextRequest } from 'next/server'
import { gql } from 'graphql-tag'

const pokemonsData = require('./pokemons')

const typeDefs = gql`
  type Attack {
    name: String!
    type: String!
    damage: Int!
  }

  type Pokemon {
    id: ID!
    number: Int!
    name: String!
    weight: PokemonDimension!
    height: PokemonDimension!
    classification: String!
    types: [String!]!
    resistant: [String!]!
    attacks: PokemonAttack!
    weaknesses: [String!]!
    fleeRate: Float!
    maxCP: Int!
    evolutions: [Pokemon!]!
    evolutionRequirements: PokemonEvolutionRequirement
    maxHP: Int!
    image: String!
  }

  type PokemonConnection {
    limit: Int!
    offset: Int!
    count: Int!
    edges: [Pokemon!]!
  }

  input PokemonsQueryInput {
    limit: Int = 10
    offset: Int = 0
    search: String
    filter: PokemonFilterInput
  }

  input PokemonFilterInput {
    type: String
  }

  type PokemonAttack {
    fast: [Attack!]!
    special: [Attack!]!
  }

  type PokemonDimension {
    minimum: String!
    maximum: String!
  }

  type PokemonEvolutionRequirement {
    amount: Int!
    name: String!
  }

  type Query {
    pokemons(query: PokemonsQueryInput!): PokemonConnection!
    pokemonByName(name: String!): Pokemon
    pokemonById(id: ID!): Pokemon
    pokemonTypes: [String!]!
  }

  type Root {
    query: Query!
  }
`

const resolvers = {
  Query: {
    pokemons: (__, args) => {
      const { limit, offset, search, filter } = args.query
      let pokemons = pokemonsData

      if (search) {
        const regex = new RegExp(search, 'i')
        pokemons = _.filter(pokemons, (p) => p.name.match(regex))
      }

      if (filter) {
        if (filter.type) {
          const regex = new RegExp(filter.type, 'i')
          pokemons = _.filter(pokemons, (p) =>
            _.some(p.types, (t) => t.match(regex))
          )
        }
      }

      const count = pokemons.length
      const edges = pokemons.slice(offset, offset + limit)

      return {
        limit,
        offset,
        count,
        edges,
      }
    },
    pokemonById: (_, args) =>
      pokemonsData.find((pokemon) => pokemon.id === args.id),
    pokemonByName: (_, args) =>
      pokemonsData.find(
        (pokemon) => pokemon.name.toLowerCase() === args.name.toLowerCase()
      ),
    pokemonTypes: () =>
      _.uniq(_.flatMap(pokemonsData, (pokemon) => pokemon.types)),
  },
  Pokemon: {
    number: (pokemon) => parseInt(pokemon.id, 10),
    image: (pokemon) =>
      `https://img.pokemondb.net/artwork/${pokemon.name
        .toLowerCase()
        .replace(/[&\\/\\\\#,+()$~%.'":*?<>{}]/g, '')
        .replace(' ', '-')}.jpg`,
    evolutions: (pokemon) =>
      _.map(pokemon.evolutions || [], (ev) => ({
        ...ev,
        id: _.padStart(ev.id, 3, '0'),
      })),
  },
  PokemonAttack: {
    fast: (pokemonAttack) => pokemonAttack.fast || [],
    special: (pokemonAttack) => pokemonAttack.special || [],
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => ({ req }),
})

export { handler as GET, handler as POST }
