/* ======================
  TYPES
====================== */

export interface Pokemon {
  id: number
  name: string
  image: string
  type: string[]
  abilities: string[]
  stats: {
    hp: number
    attack: number
    defense: number
    speed: number
  }
  cries?: string // cri du pokemon (URL)
}

/* ======================
  VARIABLES
====================== */

const app = document.querySelector<HTMLDivElement>('#app')!
let allPokemons: Pokemon[] = []
let filteredPokemons: Pokemon[] = []

/* ======================
  API
====================== */

export async function fetchPokemons(limit = 151): Promise<Pokemon[]> {
  const pokemons: Pokemon[] = []

  for (let i = 1; i <= limit; i++) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
    const data = await response.json()

    pokemons.push({
      id: data.id,
      name: data.name,
      image: data.sprites.front_default,
      type: data.types.map((typeInfo: any) => typeInfo.type.name),
      abilities: data.abilities.map((abilityInfo: any) => abilityInfo.ability.name),
      stats: {
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        speed: data.stats[5].base_stat,
      },
      cries: data.cries?.latest,
    })
  }

  return pokemons
}

/* ======================
  LISTE
====================== */

export async function initPokemonList() {
  app.innerHTML = `<p>⚙️ Chargement du Pokédex...</p>`
  allPokemons = await fetchPokemons()
  filteredPokemons = allPokemons
  renderPokemonList(allPokemons)
}

function renderPokemonList(pokemons: Pokemon[]) {
  app.innerHTML = `
    <h1>POKÉDEX</h1>

    <input
      id="search"
      type="text"
      placeholder="🔎 Rechercher un Pokémon..."
    />

    <div class="pokemon-list">
      ${pokemons
        .sort((a, b) => a.name.localeCompare(b.name)) // classer les pokémons par ordre alphabétique.
        .map(pokemon => `
          <div class="pokemon-card" data-id="${pokemon.id}">
            <img src="${pokemon.image}" />
            <h2>${pokemon.name}</h2>
          </div>
        `)
        .join('')}
    </div>
  `

  setupSearch()
  setupCardsClick()
}

/* ======================
  SEARCH
====================== */

function setupSearch() {
  const input = document.querySelector<HTMLInputElement>('#search')!

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase()
    filteredPokemons = allPokemons.filter(pokemon =>
      pokemon.name.toLowerCase().includes(query)
    )
    renderPokemonList(filteredPokemons)
  })
}

/* ======================
  DETAIL
====================== */

function renderPokemonDetail(pokemon: Pokemon) {
  app.innerHTML = `
    <button id="back">← Retour</button>

    <h2>${pokemon.name}</h2>
    <img src="${pokemon.image}" />

    <p><strong>ID :</strong> ${pokemon.id}</p>
    <p><strong>Type :</strong> ${pokemon.type.join(', ')}</p>
    <p><strong>Abilities :</strong> ${pokemon.abilities.join(', ')}</p>

    <ul>
      <li><strong>HP :</strong> ${pokemon.stats.hp}</li>
      <li><strong>Attack :</strong> ${pokemon.stats.attack}</li>
      <li><strong>Defense :</strong> ${pokemon.stats.defense}</li>
      <li><strong>Speed :</strong> ${pokemon.stats.speed}</li>
    </ul>

    ${pokemon.cries ? `<button id="cry">🎙️ CRIER</button>` : ''}
  `

  document.querySelector('#back')!.addEventListener('click', () => {
    renderPokemonList(allPokemons)
  })

  if (pokemon.cries) {
    document.querySelector('#cry')!.addEventListener('click', () => {
      new Audio(pokemon.cries!).play()
    })
  }
}

/* ======================
  EVENTS
====================== */

function setupCardsClick() {
  document.querySelectorAll('.pokemon-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = Number(card.getAttribute('data-id'))
      const pokemon = allPokemons.find(pokemon => pokemon.id === id)
      if (pokemon) renderPokemonDetail(pokemon)
    })
  })
}
