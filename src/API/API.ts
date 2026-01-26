import type { Pokemon } from '../pokemon_list' 

export async function fetchPokemonById(id: number): Promise<Pokemon> {
  return loadPokemonData(id)
}


export async function fetchPokemons(page : number): Promise<Pokemon[]> 
{
  const limit = 30; 
  const offset = (page - 1) * limit; 

  const listResponse = await fetch
  (
    `https://pokeapi.co/api/v2/pokemon/?limit=${limit}&offset=${offset}`
  );
  const listData = await listResponse.json()

  // On lance tous les appels détails en parallèle
  const promises = listData.results.map((pokemon: any) =>
    loadPokemonDataFromUrl(pokemon.url)
  )

  const pokemons: Pokemon[] = await Promise.all(promises)



  return pokemons
}

async function loadPokemonDataFromUrl(url: string): Promise<Pokemon> {
  const response = await fetch(url)
  const data = await response.json()
  return loadPokemonData(data.id)
}

async function loadPokemonData(id: number): Promise<Pokemon> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  const data = await response.json()

  const speciesResponse = await fetch(data.species.url)
  const speciesData = await speciesResponse.json()

  let evolutionFromId = undefined
  if (speciesData.evolves_from_species) {
    const urlParts = speciesData.evolves_from_species.url.split('/')
    evolutionFromId = parseInt(urlParts[urlParts.length - 2])
  }

  return {
    id: data.id,
    name: data.name,
    image:
      data.sprites.other['official-artwork'].front_default ||
      data.sprites.front_default,
    type: data.types.map((typesInfos: any) => typesInfos.type.name),
    abilities: data.abilities.map((abilitiesInfos: any) => abilitiesInfos.ability.name),
    stats: {
      hp: data.stats[0].base_stat,
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      speed: data.stats[5].base_stat,
    },
    poids: data.weight / 10,
    taille: data.height / 10,
    cries: data.cries?.latest,

    evolutionFrom: evolutionFromId,
    evolutionTo: []
  }
}

// RECERCHE AVANCEE/FILTRE(TYPE)

export function filterPokemonByType (allPokemons:Pokemon[], choice: string)
{
  console.log("Selected Type:", choice); 

  if (!choice || choice ==="all")
  {
      return  allPokemons
  }
  return allPokemons.filter(pokemon => 
    pokemon.type.includes(choice.toLowerCase())
  );
}

