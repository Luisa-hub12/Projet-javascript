import type { Pokemon } from "../pokemon_list";
import type { Team, TeamPokemon } from "./interface";

const MAX_TEAM_SIZE = 6

export const team: Team = {
    pokemons: []
}


export function addToTeam(pokemon: Pokemon): boolean {
    if (team.pokemons.length >= MAX_TEAM_SIZE) return false
    if (team.pokemons.some(poke => poke.id === pokemon.id)) return false

    const teamPokemon: TeamPokemon = {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.image,
        types: pokemon.type,
        moves: pokemon.moves
    }

    team.pokemons.push(teamPokemon)
    return true
}

export function removeFromTeam(id: number) {
    team.pokemons = team.pokemons.filter(poke => poke.id !== id)
}

export function getTeamTypes(): string[] {
    return [...new Set(team.pokemons.flatMap(poke => poke.types))]
}