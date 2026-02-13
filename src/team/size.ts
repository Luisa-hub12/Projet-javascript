import type { Pokemon } from "../pokemon_list";
import type { Team, TeamPokemon } from "./interface";

const MAX_TEAM_SIZE = 6;
const STORAGE_KEY = "pokemonTeams";

export const team: Team = {
  pokemons: []
};

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
  };

  team.pokemons.push(teamPokemon);
  saveTeam();
  return true;
}

export function removeFromTeam(id: number) {
  team.pokemons = team.pokemons.filter(p => p.id !== id);
  saveTeam();
}

/* ---------------------
   TYPES
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

export function getTeamWeaknesses(): { type: string; count: number }[] {
  const counter: Record<string, number> = {};

  for (const poke of team.pokemons) {
    for (const t of poke.types) {
      const weak = TYPE_WEAKNESSES[t] || [];
      weak.forEach(w => {
        counter[w] = (counter[w] || 0) + 1;
      });
    }
  }

  return Object.entries(counter)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
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

export function saveNamedTeam(name: string) {
  const cleanName = name.trim();
  if (!cleanName) return;

  const saved = localStorage.getItem(STORAGE_KEY);
  const teams = saved ? JSON.parse(saved) : {};

  teams[cleanName] = JSON.parse(JSON.stringify(team.pokemons));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

export function loadNamedTeam(name: string) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const teams = JSON.parse(saved);
  if (teams[name]) {
    team.pokemons = JSON.parse(JSON.stringify(teams[name]));
    saveTeam();
  }
}

export function getSavedTeamNames(): string[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  return Object.keys(JSON.parse(saved));
}

export function deleteNamedTeam(name: string) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const teams = JSON.parse(saved);

  if (name in teams) {
    delete teams[name];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  }
}

export function clearCurrentTeam() {
  team.pokemons = [];
  saveTeam();
}