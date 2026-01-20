import type { Pokemon } from '../pokemon_list'

export async function fetchPokemons(limit = 151): Promise<Pokemon[]> {
  const pokemons: Pokemon[] = []

  for (let i = 1; i <= limit; i++) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
    const data = await response.json()

    pokemons.push({
      id: data.id,
      name: data.name,
      image:
        data.sprites.other['official-artwork'].front_default ||
        data.sprites.front_default,
      type: data.types.map((t: any) => t.type.name),
      abilities: data.abilities.map((a: any) => a.ability.name),
      stats: {
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        speed: data.stats[5].base_stat,
      },
      poids: data.weight / 10,
      taille: data.height / 10,
      cries: data.cries?.latest,
    })
  }

  return pokemons
}
