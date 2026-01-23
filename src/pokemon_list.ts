import { fetchPokemons } from './API/API'

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
  poids: number
  taille: number
  cries?: string 
  evolutionFrom?: number
  evolutionTo?: number[]
}

/* ======================
  VARIABLES GLOBALES
====================== */

const app = document.querySelector<HTMLDivElement>('#app')!
let allPokemons: Pokemon[] = []
let filteredPokemons: Pokemon[] = []
let currentPokemonIndex: number | null = null

/* ======================
  INITIALISATION
====================== */

export async function initPokemonList() {
  renderStaticStructure()
  showLoading()

  const currentPage = 1
  allPokemons = await fetchPokemons(currentPage)
  filteredPokemons = [...allPokemons]

  const listContainer = document.getElementById('pokemon-list')
  if (listContainer) listContainer.innerHTML = ''

  renderPokemonGrid(filteredPokemons)
  setupGlobalListeners()
}

function showLoading() {
  const listContainer = document.getElementById('pokemon-list')
  if (listContainer) {
    listContainer.innerHTML = `
      <p style="color:#333; font-size:1.5rem; text-align:center; margin-top:50px;">
        ⚙️ Chargement du Pokédex...
      </p>`
  }
}

/* ======================
  RENDERING
====================== */

function renderStaticStructure() {
  app.innerHTML = `
    <div class="header-controls">
      <input id="search" type="text" placeholder="🔎 Chercher un Pokémon..." />
    </div>

    <div id="pokemon-list" class="pokemon-list"></div>
    <div id="modal-container"></div>
  `
}

function renderPokemonGrid(pokemons: Pokemon[]) {
  const container = document.getElementById('pokemon-list')
  if (!container) return

  if (pokemons.length === 0) {
    container.innerHTML = `
      <p style="text-align:center; width:100%; margin-top:20px;">
        Aucun Pokémon trouvé.
      </p>`
    return
  }

  container.innerHTML = pokemons.map(pokemon => `
    <div class="pokemon-card" data-id="${pokemon.id}">
      <img src="${pokemon.image}" loading="lazy" />
      <h2>${pokemon.name}</h2>
      <div class="types-mini" style="display:flex; gap:5px; justify-content:center;">
        ${pokemon.type
          .map(t => `<span class="type-dot type-${t}"
            style="width:10px; height:10px; border-radius:50%; background:var(--bg-type-${t}, grey); display:inline-block;">
            </span>`)
          .join('')}
      </div>
    </div>
  `).join('')

  setupCardsClick()
}

/* ======================
  RECHERCHE (IDENTIQUE À L’ORIGINE)
====================== */

function setupGlobalListeners() {
  const searchInput = document.querySelector<HTMLInputElement>('#search')

  const handleSearch = () => {
    const query = searchInput?.value.toLowerCase() || ''

    filteredPokemons = allPokemons.filter(pokemon =>
      pokemon.name.toLowerCase().includes(query)
    )

    renderPokemonGrid(filteredPokemons)
  }

  searchInput?.addEventListener('input', handleSearch)

  setupGlobalKeyboardEvents()
}

/* ======================
  MODALE (INCHANGÉE)
====================== */

function openModal(index: number) {
  if (index < 0 || index >= filteredPokemons.length) return

  currentPokemonIndex = index
  const pokemon = filteredPokemons[index]

  // 1. Récupération sécurisée de l'évolution précédente
  const previousEvolution = pokemon.evolutionFrom
    ? allPokemons.find(p => p.id === pokemon.evolutionFrom)
    : null;

  // 2. Récupération sécurisée des évolutions suivantes
  // Le changement ici : (p): p is Pokemon => !!p permet de garantir à TypeScript que p n'est pas null
  const nextEvolutions = pokemon.evolutionTo
    ? pokemon.evolutionTo
        .map(id => allPokemons.find(p => p.id === id))
        .filter((p): p is Pokemon => !!p) 
    : [];

  const modalContainer = document.querySelector('#modal-container')!;

  modalContainer.innerHTML = `
    <div class="modal-overlay" id="overlay-bg">
      
      ${index > 0 ? `<button class="nav-arrow nav-prev">❮</button>` : ''}

      <div class="modal-content type-${pokemon.type[0]}">
        <button class="modal-close">✖</button>

        <div class="modal-header">
          <img src="${pokemon.image}" />
        </div>

        <h2>${pokemon.name} <span style="font-size:0.6em; opacity:0.6">#${pokemon.id}</span></h2>

        <div class="types">
          ${pokemon.type.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}
        </div>

        <div style="display:flex; justify-content:center; gap:20px; margin: 15px 0;">
          <p><strong>Poids:</strong> ${pokemon.poids} kg</p>
          <p><strong>Taille:</strong> ${pokemon.taille} m</p>
        </div>

        <ul class="stats" style="list-style:none; padding:0;">
          ${renderStat('HP', pokemon.stats.hp)}
          ${renderStat('ATK', pokemon.stats.attack)}
          ${renderStat('DEF', pokemon.stats.defense)}
          ${renderStat('VIT', pokemon.stats.speed)}
        </ul>

        ${pokemon.cries ? `<button id="cry-btn">🔊 Cri</button>` : ''}

        <div class="evolutions">
          
          ${previousEvolution ? `
            <div class="evolution-card" data-id="${previousEvolution.id}">
              <span class="evo-badge badge-prev">AVANT</span>
              <img src="${previousEvolution.image}" class="evolution-img"/>
              <p>${previousEvolution.name}</p>
            </div>` : ''}

          ${nextEvolutions.map(p => `
            <div class="evolution-card" data-id="${p.id}">
              <span class="evo-badge badge-next">APRÈS</span>
              <img src="${p.image}" class="evolution-img"/>
              <p>${p.name}</p>
            </div>`).join('')}

        </div>
        </div>

      ${index < filteredPokemons.length - 1 ? `<button class="nav-arrow nav-next">❯</button>` : ''} 
    </div>
  `

  /* --- RESTE DE LA LOGIQUE (CLICK, FERMETURE...) --- */
  
  const closeModal = () => {
    modalContainer.innerHTML = ''
    currentPokemonIndex = null
  }

  document.querySelector('.modal-close')?.addEventListener('click', closeModal)
  document.querySelector('#overlay-bg')?.addEventListener('click', e => {
    if (e.target === document.querySelector('#overlay-bg')) closeModal()
  })

  // Gestion du clic sur les cartes d'évolution
  document.querySelectorAll('.evolution-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = Number(card.getAttribute('data-id'))
      
      // On cherche d'abord dans la liste filtrée
      let newIndex = filteredPokemons.findIndex(p => p.id === id)

      // Si pas trouvé (ex: on a filtré "Pikachu", Raichu n'est pas dans la liste filtrée)
      // On réinitialise le filtre pour afficher tout le monde
      if (newIndex === -1) {
        filteredPokemons = [...allPokemons] // Copie propre
        renderPokemonGrid(filteredPokemons) // Mise à jour de la grille derrière
        newIndex = filteredPokemons.findIndex(p => p.id === id)
        
        // Petit reset de la barre de recherche pour être cohérent
        const searchInput = document.querySelector<HTMLInputElement>('#search')
        if (searchInput) searchInput.value = ''
      }

      if (newIndex !== -1) openModal(newIndex)
    })
  })

  document.querySelector('.nav-prev')?.addEventListener('click', e => {
    e.stopPropagation()
    openModal(index - 1)
  })

  document.querySelector('.nav-next')?.addEventListener('click', e => {
    e.stopPropagation()
    openModal(index + 1)
  })

  if (pokemon.cries) {
    document.querySelector('#cry-btn')?.addEventListener('click', e => {
      e.stopPropagation()
      new Audio(pokemon.cries!).play()
    })
  }
}

function renderStat(label: string, value: number) {
  const percent = Math.min(value, 150) / 1.5
  return `
    <div class="stat-row">
      <strong>${label}</strong>
      <div class="bar-bg">
        <div class="bar-fill" style="width:${percent}%"></div>
      </div>
      <span>${value}</span>
    </div>
  `
}

/* ======================
  EVENTS
====================== */

function setupCardsClick() {
  document.querySelectorAll('.pokemon-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = Number(card.getAttribute('data-id'))
      const index = filteredPokemons.findIndex(p => p.id === id)
      if (index !== -1) openModal(index)
    })
  })
}

function setupGlobalKeyboardEvents() {
  window.addEventListener('keydown', event => {
    if (currentPokemonIndex === null) return

    if (event.key === 'ArrowLeft' && currentPokemonIndex > 0) {
      openModal(currentPokemonIndex - 1)
    } 
    else if (event.key === 'ArrowRight' && currentPokemonIndex < filteredPokemons.length - 1) {
      openModal(currentPokemonIndex + 1)
    }
    else if (event.key === 'Escape') {
      document.querySelector('#modal-container')!.innerHTML = ''
      currentPokemonIndex = null
    }
  })
}
