import type { Pokemon } from "../pokemon_list";
import type { Team, TeamPokemon } from "./interface";

const MAX_TEAM_SIZE = 6;

export const team: Team = {
    pokemons: []
}

/* ---------------------
   AJOUT / RETRAIT
---------------------- */
export function addToTeam(pokemon: Pokemon): boolean {
    if (team.pokemons.length >= MAX_TEAM_SIZE) return false;
    if (team.pokemons.some(p => p.id === pokemon.id)) return false;

    const teamPokemon: TeamPokemon = {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.image,
        types: pokemon.type,
        moves: pokemon.moves
    }

    team.pokemons.push(teamPokemon);
    saveTeam(); // sauvegarde automatique
    return true;
}

export function removeFromTeam(id: number) {
    team.pokemons = team.pokemons.filter(p => p.id !== id);
    saveTeam(); // sauvegarde automatique
}

/* ---------------------
   TYPES DE L'ÉQUIPE
---------------------- */
export function getTeamTypes(): string[] {
    return [...new Set(team.pokemons.flatMap(p => p.types))];
}

/* ---------------------
   FAIBLESSES
---------------------- */
const TYPE_WEAKNESSES: Record<string, string[]> = {
    normal: ['fighting'],
    fire: ['water', 'ground', 'rock'],
    water: ['electric', 'grass'],
    electric: ['ground'],
    grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
    ice: ['fire', 'fighting', 'rock', 'steel'],
    fighting: ['flying', 'psychic', 'fairy'],
    poison: ['ground', 'psychic'],
    ground: ['water', 'grass', 'ice'],
    flying: ['electric', 'ice', 'rock'],
    psychic: ['bug', 'ghost', 'dark'],
    bug: ['fire', 'flying', 'rock'],
    rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
    ghost: ['ghost', 'dark'],
    dragon: ['ice', 'dragon', 'fairy'],
    dark: ['fighting', 'bug', 'fairy'],
    steel: ['fire', 'fighting', 'ground'],
    fairy: ['poison', 'steel']
};

export function getTeamWeaknesses(): string[] {
    const weaknesses: string[] = [];
    for (const poke of team.pokemons) {
        for (const t of poke.types) {
            weaknesses.push(...(TYPE_WEAKNESSES[t] || []));
        }
    }
    return [...new Set(weaknesses)]; // unique
}

/* ---------------------
   LOCALSTORAGE
---------------------- */
export function saveTeam() {
    localStorage.setItem('pokemonTeam', JSON.stringify(team.pokemons));
}

export function loadTeam() {
    const saved = localStorage.getItem('pokemonTeam');
    if (saved) {
        team.pokemons = JSON.parse(saved);
    }
}