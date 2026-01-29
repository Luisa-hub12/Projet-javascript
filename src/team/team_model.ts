import type { Pokemon } from "../pokemon_list";

export interface Team {
    pokemons: Pokemon[]
}

export const team: Team = {
    pokemons: []
}