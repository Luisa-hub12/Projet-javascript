import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'


// Définition du type Pokemon

interface Pokemon {
  id: number
  name: string
  image: string
  type: string[]
  stats: {
    hp: number
    attack: number
    defense: number
    speed: number
  }
  abilities: string[]
  cries?: string // stock le cri du pokemon (optionnel)
}

/* ======================
  VARIABLES GLOBALES
====================== */

const app = document.querySelector<HTMLDivElement>('#app')!
let allPokemons: Pokemon[] = []
let filteredPokemons: Pokemon[] = []

/* ======================
  API POKEAPI
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
  RENDER
====================== */

function renderPokemonList(pokemons: Pokemon[]) {
  app.innerHTML = 
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

<h1>POKÉDEX</h1>

<input
  id="search"
  type="text"
  placeholder="Rechercher un Pokémon par nom..."
/>

<div class="pokemon-list">
  ${pokemons
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(pokemon => `
      <div class="pokemon-card">
        <img src="${pokemon.image}" alt="${pokemon.name}" />
        <h2>${pokemon.name}</h2>
        <p>Type: ${pokemon.type.join(', ')}</p>
        <p>ID: ${pokemon.id}</p>
      </div>
      
    `)
    .join('')}
</div>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);


 }


/* ======================
  EVENT
====================== */


function setupSearch() {
  const searchInput = document.querySelector<HTMLInputElement>('#search')!

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase()
    filteredPokemons = allPokemons.filter(pokemon =>
      pokemon.name.toLowerCase().includes(query)
    )
    renderPokemonList(filteredPokemons)
    setupSearch()
  })
}



/* ======================
  FICHE POKEMON
====================== */

function renderPokemonDetail(pokemon: Pokemon) {
  app.innerHTML = `
    <button id="back"> ← Retour</button>

    <h2>${pokemon.name}</h2>
    <img src="${pokemon.image}" alt="${pokemon.name}" />
    
    <p><strong>ID :</strong> ${pokemon.id}</p>
    <p><strong>Type :</strong> ${pokemon.type.join(', ')}</p>
    <p><strong>Abilities :</strong> ${pokemon.abilities.join(', ')}</p>

    <h3>Stats</h3>
    <ul>
      <li><strong>HP :</strong> ${pokemon.stats.hp}</li>
      <li><strong>Attack :</strong> ${pokemon.stats.attack}</li>
      <li><strong>Defense :</strong> ${pokemon.stats.defense}</li>
      <li><strong>Speed :</strong> ${pokemon.stats.speed}</li>
    </ul>
  
    ${
      pokemon.cries
        ? `<button id="cry">🎙️ CRIER !</button>`
        : ''
    }
  `

  document.querySelector('#back')!.addEventListener('click', () => {
    renderPokemonList(allPokemons)
    setupSearch()
    setupCardsClick()
  })

  if (pokemon.cries) {
    document.querySelector('#cry')!.addEventListener('click', () => {
      const audio = new Audio(pokemon.cries!)
      audio.play()
    })
  }
}



/* ======================
  NAVIGATION
====================== */

function setupCardsClick() {
  document.querySelectorAll('.pokemon-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = Number(card.getAttribute('data-id'))
    const pokemon = allPokemons.find(pokemon => pokemon.id === id)

    if (pokemon) {
      renderPokemonDetail(pokemon)
    }
  })
})
}

/* ======================
  INITIALISATION
====================== */

async function init() {
  app.innerHTML = `<p>Chargement du Pokédex...</p>`
  allPokemons = await fetchPokemons(151)
  filteredPokemons = allPokemons
  renderPokemonList(allPokemons)
  setupSearch()
  setupCardsClick()
}

init()