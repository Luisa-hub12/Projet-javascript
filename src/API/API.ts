import type { Pokemon } from '../pokemon_list'

export async function fetchPokemons(limit = 400): Promise<Pokemon[]> {
  const pokemons: Pokemon[] = []
  const promises = []

  // On lance toutes les requêtes en parallèle
  for (let i = 1; i <= limit; i++) {
    promises.push(loadPokemonData(i))
  }

  // On attend la fin de toutes les requêtes
  const results = await Promise.all(promises)
  pokemons.push(...results)

  // Calcul des évolutions "suivantes" (enfants)
  pokemons.forEach(pokemon => {
    if (pokemon.evolutionFrom) {
      const parent = pokemons.find(p => p.id === pokemon.evolutionFrom)

      if (parent) {
        if (!parent.evolutionTo) parent.evolutionTo = []
        parent.evolutionTo.push(pokemon.id)
      }
    }
  })

  return pokemons
}

// Correction de la syntaxe ici (ajout du ' :' avant Promise)
async function loadPokemonData(id: number): Promise<Pokemon> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  const data = await response.json()

  // CORRECTION ICI : on utilise 'data', pas 'DataTransfer'
  const speciesResponse = await fetch(data.species.url)
  const speciesData = await speciesResponse.json()

  // Extraction de l'ID du parent depuis l'URL
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