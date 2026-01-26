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

let currentPage = 1
let hasMore = true
/* ======================
  INITIALISATION
====================== */

export async function initPokemonList() {
  renderStaticStructure()
  showLoading()
  const stopAnimation = animateProgress()

  const currentPage = 1
  allPokemons = await fetchPokemons(currentPage)
  filteredPokemons = [...allPokemons]

  stopAnimation()

  setTimeout(() => {
    const listContainer = document.getElementById('pokemon-list')
    if (listContainer) listContainer.innerHTML = ''
    renderPokemonGrid(filteredPokemons)
    setupGlobalListeners()
    setupPagination()
  }, 200)
}

function showLoading() {
  const listContainer = document.getElementById('pokemon-list')
  if (listContainer) {
    listContainer.innerHTML = `
      <div class="loading-container">
        <div class="pokeball-spinner"></div>
        <div class="loading-text">
          ⚙️ Chargement du Pokédex... <span id="loading-percent">0%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" id="progress-fill"></div>
        </div>
      </div>
    `
  }
}

// Fonction utilitaire pour animer la barre
function animateProgress() {
  const fill = document.getElementById('progress-fill')
  const percentText = document.getElementById('loading-percent')
  
  let width = 0
  
  // On utilise un intervalle pour monter "faussement" le pourcentage
  const interval = setInterval(() => {
    // Si on est en dessous de 90%, on monte un peu
    // On ralentit plus on approche de 90% pour simuler un chargement complexe
    if (width < 90) {
      const increment = Math.random() * 5 + 1 // Augmente de 1 à 6% aléatoirement
      width = Math.min(width + increment, 90) // On ne dépasse pas 90% tant que c'est pas fini
    }
    
    if (fill) fill.style.width = `${width}%`
    if (percentText) percentText.innerText = `${Math.floor(width)}%`
  }, 100) // Mise à jour toutes les 100ms

  // Cette fonction retourne une fonction de nettoyage qu'on appellera quand le fetch est fini
  return () => {
    clearInterval(interval)
    if (fill) fill.style.width = '100%'
    if (percentText) percentText.innerText = '100%'
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
    <div class="pagination">
      <button id="prev-page" disabled>⬅ Précédent</button>
      <span id="page-indicator">Page 1</span>
      <button id="next-page">Suivant ➡</button>
      
    <div class="filter-group">
        <label>Type</label>
        <select id="filter-type">
          <option value="all">Tous</option> <option value="fire">Fire</option>
          <option value="grass">Grass</option>
          <option value="water">Water</option>
          <option value="electric">Electric</option>
          <option value="poison">Poison</option>
          <option value="bug">Bug</option>
          <option value="normal">Normal</option>
          <option value="flying">Flying</option>
        </select>
      </div>
    </div>
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
  MODALE
====================== */

function openModal(index: number) {
  if (index < 0 || index >= filteredPokemons.length) return

  currentPokemonIndex = index
  const pokemon = filteredPokemons[index]

  // 1. Récupération sécurisée de l'évolution précédente
  const previousEvolution = pokemon.evolutionFrom
    ? allPokemons.find(pokemon => pokemon.id === pokemon.evolutionFrom)
    : null;

  // 2. Récupération sécurisée des évolutions suivantes
  // Le changement ici : (p): p is Pokemon => !!p permet de garantir à TypeScript que p n'est pas null
  const nextEvolutions = pokemon.evolutionTo
    ? pokemon.evolutionTo
        .map(id => allPokemons.find(pokemon => pokemon.id === id))
        .filter((pokemon): pokemon is Pokemon => !!pokemon) 
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
          ${pokemon.type.map(typepoke => `<span class="type-badge type-${typepoke}">${typepoke}</span>`).join('')}
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

          ${nextEvolutions.map(pokemon => `
            <div class="evolution-card" data-id="${pokemon.id}">
              <span class="evo-badge badge-next">APRÈS</span>
              <img src="${pokemon.image}" class="evolution-img"/>
              <p>${pokemon.name}</p>
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
  document.querySelector('#overlay-bg')?.addEventListener('click', event => {
    if (event.target === document.querySelector('#overlay-bg')) closeModal()
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
        newIndex = filteredPokemons.findIndex(pokemon => pokemon.id === id)
        
        // Petit reset de la barre de recherche pour être cohérent
        const searchInput = document.querySelector<HTMLInputElement>('#search')
        if (searchInput) searchInput.value = ''
      }

      if (newIndex !== -1) openModal(newIndex)
    })
  })

  document.querySelector('.nav-prev')?.addEventListener('click', event => {
    event.stopPropagation()
    openModal(index - 1)
  })

  document.querySelector('.nav-next')?.addEventListener('click', event => {
    event.stopPropagation()
    openModal(index + 1)
  })

  if (pokemon.cries) {
    document.querySelector('#cry-btn')?.addEventListener('click', event => {
      event.stopPropagation()
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



function setupPagination() {
  const prevBtn = document.getElementById('prev-page') as HTMLButtonElement
  const nextBtn = document.getElementById('next-page') as HTMLButtonElement
  const indicator = document.getElementById('page-indicator')


  if (!prevBtn || !nextBtn || !indicator) return

  prevBtn.addEventListener('click', async () => {
    if (currentPage === 1) return
    currentPage--
    await updatePage()
  })

  nextBtn.addEventListener('click', async () => {
    if (!hasMore) return
    currentPage++
    await updatePage()
  })

  async function updatePage() {
    showLoading()
    const stopAnimation = animateProgress()

    const newPokemons = await fetchPokemons(currentPage)

    stopAnimation()

    setTimeout(() => {
        hasMore = newPokemons.length > 0
        allPokemons = newPokemons
        filteredPokemons = [...allPokemons]

        renderPokemonGrid(filteredPokemons)
        indicator!.textContent = `Page ${currentPage}`

        prevBtn.disabled = currentPage === 1 
        nextBtn.disabled = !hasMore || newPokemons.length === 0

        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 200)
  


    hasMore = newPokemons.length > 0
    allPokemons = newPokemons
    filteredPokemons = [...allPokemons]

    renderPokemonGrid(filteredPokemons)
    indicator!.textContent = `Page ${currentPage}`

    //griser le boutton précédent si page 1
    prevBtn.disabled = currentPage === 1 

    //griser le boutton suivant si il n'y a plus de résultats.
    nextBtn.disabled = !hasMore || newPokemons.length === 0

    // Remonter en haut de page en douceur
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}


/* ======================
  EVENTS
====================== */

function setupCardsClick() {
  document.querySelectorAll('.pokemon-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = Number(card.getAttribute('data-id'))
      const index = filteredPokemons.findIndex(pokemon => pokemon.id === id)
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

