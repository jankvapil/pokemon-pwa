/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	PokemonsQueryInput:{
		filter:"PokemonFilterInput"
	},
	PokemonFilterInput:{

	},
	Query:{
		pokemons:{
			query:"PokemonsQueryInput"
		},
		pokemonByName:{

		},
		pokemonById:{

		}
	}
}

export const ReturnTypes: Record<string,any> = {
	Attack:{
		name:"String",
		type:"String",
		damage:"Int"
	},
	Pokemon:{
		id:"ID",
		number:"Int",
		name:"String",
		weight:"PokemonDimension",
		height:"PokemonDimension",
		classification:"String",
		types:"String",
		resistant:"String",
		attacks:"PokemonAttack",
		weaknesses:"String",
		fleeRate:"Float",
		maxCP:"Int",
		evolutions:"Pokemon",
		evolutionRequirements:"PokemonEvolutionRequirement",
		maxHP:"Int",
		image:"String"
	},
	PokemonConnection:{
		limit:"Int",
		offset:"Int",
		count:"Int",
		edges:"Pokemon"
	},
	PokemonAttack:{
		fast:"Attack",
		special:"Attack"
	},
	PokemonDimension:{
		minimum:"String",
		maximum:"String"
	},
	PokemonEvolutionRequirement:{
		amount:"Int",
		name:"String"
	},
	Query:{
		pokemons:"PokemonConnection",
		pokemonByName:"Pokemon",
		pokemonById:"Pokemon",
		pokemonTypes:"String"
	},
	Root:{
		query:"Query"
	}
}

export const Ops = {
query: "Query" as const
}