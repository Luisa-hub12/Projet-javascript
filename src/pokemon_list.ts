import { fetchPokemons } from './API/API'
import { fetchPokemonById } from './API/API'
import { handleAddToTeam } from './team/gestion'
import { team } from './team/size'
import { renderTeam } from './team/choice'
import { loadTeam } from './team/size'



/* ======================
  TYPES
====================== */

export interface Pokemon { // modal.ts e gidecek
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
  moves: {
  name: string
  type: string
  power: number | null
}[]
}

// Le ? veut dire propriété optionnelle Autrement dit : cette propriété peut exister… ou pas

/* ======================
  VARIABLES GLOBALES
====================== */

const app = document.querySelector<HTMLDivElement>('#app')!

let pokedex: Pokemon[] = [] // tous les pokémons chargés
let allPokemons: Pokemon[] = []
let filteredPokemons: Pokemon[] = []
let currentPokemonIndex: number | null = null


let currentPage = 1
let hasMore = true


/* ======================
  INITIALISATION
====================== */

export async function initPokemonList() 
{
  loadTeam();

  renderStaticStructure()
  document.getElementById('btn-show-team')?.addEventListener('click', () => {
    renderTeam();
});

  showLoading()
  const stopAnimation = animateProgress()

  allPokemons = await fetchPokemons(currentPage)

  allPokemons.forEach(pokemon => {
  if (!pokedex.some(pokedex => pokedex.id === pokemon.id)) {
    pokedex.push(pokemon)
  }
})
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
  const listContainer = document.getElementById('pokemon-list');
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

function renderStaticStructure() 
{
  app.innerHTML = `
    <div class="header-controls">
      <input id="search" type="text" placeholder="🔎 Chercher un Pokémon..." />
    </div>

    <div class="filter-group">
        <select id="filter-type">
          <option value="all">Tous</option> <option value="fire">Fire</option>
          <option value="grass">Grass</option>
          <option value="water">Water</option>
          <option value="electric">Electric</option>
          <option value="poison">Poison</option>
          <option value="bug">Bug</option>
          <option value="normal">Normal</option>
          <option value="flying">Flying</option>
          <option value="ground">Ground</option>
          <option value="ice">Ice</option>
        </select>
      </div>
    </div>

    <button id="btn-show-team">🧢 Voir mon équipe</button>
    <div id="team-container"></div>

    <div id="pokemon-list" class="pokemon-list"></div>
    <div class="pagination">
      <button id="prev-page" disabled>⬅ Précédent</button>
      <button id="next-page">Suivant ➡</button>

      <div class="page-jump">
        <span>Page</span>
        <input type="number" id="page-input" value="1" min="1" max="46" />
        <span>sur <strong id="total-pages">46</strong></span>
      </div>
    
      </div>
    <div id="modal-container"></div>
  `
}

function renderPokemonGrid(pokemons: Pokemon[]) {
  const container = document.getElementById('pokemon-list')
  if (!container) return

  // --- GESTION DU CAS "VIDE" ---
  if (pokemons.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🍃</div>
        <h3>Oups ! Aucun Pokémon trouvé.</h3>
        <p>Il semble que ce Pokémon se cache très bien dans les hautes herbes...</p>
        <button id="btn-reset" class="btn-reset">
          🔄 Réinitialiser les filtres
        </button>
      </div>`

    // On attache l'événement au bouton "Réinitialiser" juste après l'avoir créé
    setTimeout(() => {
      document.getElementById('btn-reset')?.addEventListener('click', () => {
        const searchInput = document.querySelector<HTMLInputElement>('#search')
        const typeSelect = document.querySelector<HTMLSelectElement>('#filter-type')

        // Reset des inputs
        if(searchInput) searchInput.value = ''
        if(typeSelect) typeSelect.value = 'all'

        // Reset des données
        filteredPokemons = [...pokedex]
        renderPokemonGrid(filteredPokemons)
      })
    }, 0)

    return
  }
  // -----------------------------


  // Affiche les cartes de HTML sur l'écran 
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


/* « Cette fonction centralise les écouteurs d’événements et 
combine une recherche textuelle et un filtre par type, avec un fallback API
 si le Pokémon recherché n’est pas encore chargé. » */
 
function setupGlobalListeners() {
  const searchInput = document.querySelector<HTMLInputElement>('#search')
  const typeSelect = document.querySelector<HTMLSelectElement>('#filter-type')

  // Cette fonction combine les deux filtres
  const applyFilters = async () => {
    // 1. On récupère la valeur du texte (minuscule)
    const query = searchInput?.value.toLowerCase() || ''

    // 2. On récupère la valeur du select
    const selectedType = typeSelect?.value || 'all'

      let results = pokedex.filter(pokemon => {
    const matchName = pokemon.name.toLowerCase().includes(query)
    const matchType =
      selectedType === 'all' || pokemon.type.includes(selectedType)

    return matchName && matchType
  })



if (results.length === 0 && query.length > 0 && selectedType === 'all') {
  try {
    const id = Number(query)
    let fetchedPokemon: Pokemon | null = null

    if (!isNaN(id)) {
      fetchedPokemon = await fetchPokemonById(id)
    }

    if (fetchedPokemon) {
      // On évite les doublons
      if (!pokedex.some(p => p.id === fetchedPokemon!.id)) {
        pokedex.push(fetchedPokemon)
      }
      results = [fetchedPokemon]
    }
  } catch {
    // Pokémon inexistant → results reste vide
  }
}

  // Mise à jour de l’affichage
  filteredPokemons = results

    // 4. On redessine la grille avec le résultat combiné
    renderPokemonGrid(filteredPokemons)
  }

  // On attache la MÊME fonction aux deux événements
  searchInput?.addEventListener('input', applyFilters)
  typeSelect?.addEventListener('change', applyFilters)

  setupGlobalKeyboardEvents()
}

/* ======================
  MODALE
====================== */

async function openModal(index: number) {
  if (index < 0 || index >= filteredPokemons.length) return

  currentPokemonIndex = index
  const pokemon = filteredPokemons[index]

  let previousEvolution: Pokemon | null = null

  if (pokemon.evolutionFrom) {
    previousEvolution =
      pokedex.find(p => p.id === pokemon.evolutionFrom) ?? null

    // fallback : on va le chercher si absent
    if (!previousEvolution) {
      try {
        previousEvolution = await fetchPokemonById(pokemon.evolutionFrom)
        pokedex.push(previousEvolution)
      } catch (e) {
        console.error('Erreur chargement évolution précédente', e)
      }
    }
  }



  // 2. Récupération sécurisée des évolutions suivantes
  // Le changement ici : (p): p is Pokemon => !!p permet de garantir à TypeScript que p n'est pas null
  let nextEvolutions = pokedex.filter(
    p => p.evolutionFrom === pokemon.id
  )



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
        <button id="add-to-team">➕ Ajouter à l’équipe</button>
        </div>

      ${index < filteredPokemons.length - 1 ? `<button class="nav-arrow nav-next">❯</button>` : ''}
    </div>
  `


  const btn = document.querySelector('#add-to-team') as HTMLButtonElement

  if (btn) {
    const alreadyInTeam = team.pokemons.some(p => p.id === pokemon.id)

    btn.disabled = alreadyInTeam
  if (alreadyInTeam) {
    btn.textContent = '✔ Déjà dans l’équipe'
  }

  btn.addEventListener('click', () => {
    handleAddToTeam(pokemon)
    btn.disabled = true
    btn.textContent = '✔ Ajouté à l’équipe'
  })
}





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
    card.addEventListener('click', async () => {
      const id = Number(card.getAttribute('data-id'))

      // On cherche d'abord dans la liste filtrée
      let targetPokemon = pokedex.find(p => p.id === id)

      if (!targetPokemon) {
        try {
          targetPokemon = await fetchPokemonById(id)
          pokedex.push(targetPokemon)
        } catch (e) {
          console.error('Erreur de chargement évolution', e)
          return
        }
      }
      

    filteredPokemons = [targetPokemon]
    renderPokemonGrid(filteredPokemons)
    openModal(0)
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


//burdan silmeye
//Buraya kadar silinebilir



/* ======================
  EVENTS
====================== */

// rend les cartes Pokémon cliquable.

/* setupCardsClick = souris 🖱️
setupGlobalKeyboardEvents = clavier ⌨️ */

function setupPagination() {
  const prevBtn = document.getElementById('prev-page') as HTMLButtonElement
  const nextBtn = document.getElementById('next-page') as HTMLButtonElement

  if (!prevBtn || !nextBtn) return

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

      newPokemons.forEach(pokemon => {
        if (!pokedex.some(p => p.id === pokemon.id)) {
          pokedex.push(pokemon)
        }
      })

      filteredPokemons = [...allPokemons]
      renderPokemonGrid(filteredPokemons)

      prevBtn.disabled = currentPage === 1
      nextBtn.disabled = !hasMore

      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 200)
  }
}

function setupCardsClick() {
  document.querySelectorAll('.pokemon-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = Number(card.getAttribute('data-id')) // Récupère l’ID du Pokémon stocké dans le HTML : data-id="25" → id = 25
      const index = filteredPokemons.findIndex(pokemon => pokemon.id === id) // cherche ou se trouve le pokemon dans la liste
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

