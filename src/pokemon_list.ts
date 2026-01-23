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
let currentPokemonIndex: number | null = null; 


/* ======================
  INITIALISATION
====================== */

export async function initPokemonList() {
  // 1. On dessine l'interface statique (Barre de recherche, filtres...)
  renderStaticStructure();
  
  // 2. On affiche le chargement DANS la liste (pas tout l'écran)
  showLoading()

  // 3. On récupère les données
  const currentPage = 1
  allPokemons = await fetchPokemons(currentPage)
  filteredPokemons = [...allPokemons]; // On fait une copie propre

  // 4. On nettoie le chargement et on affiche la grille
  const listContainer = document.getElementById('pokemon-list');
  if(listContainer) listContainer.innerHTML = ''; 
  
  renderPokemonGrid(filteredPokemons);
  
  // 5. On active les écouteurs d'événements (Recherche, Filtres)
  setupGlobalListeners();
}

function showLoading() {
  const listContainer = document.getElementById('pokemon-list');
  // Sécurité : on vérifie que le conteneur existe
  if (listContainer) {
    listContainer.innerHTML = `
    <p style="color:#333; font-size:1.5rem; text-align:center; margin-top:50px;">
    ⚙️ Chargement du Pokédex...</p>`
  }
}

/* ======================
  RENDERING (AFFICHAGE)
====================== */

// AFFICHE LA STRUCTURE FIXE (Une seule fois au démarrage)
function renderStaticStructure() 
{
  app.innerHTML = `
  <div class="header-controls">
    <input id="search" type="text" placeholder="🔎 Chercher un Pokémon..." />
    </div>
  <br>

  <div id="filter-bar" class="filter-bar" style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
    
    <div class="filter-group">
      <label>Type</label>
      <select id="filter-type">
        <option value="">Tous</option>
        <option value="fire">Feu</option>
        <option value="grass">Plante</option>
        <option value="poison">Poison</option>
      </select>
    </div>

    <div class="filter-group">
      <label>Tri</label>
      <select id="filter-sort">
       <option value="asc">Numéro croissant</option>
       <option value="desc">Numéro décroissant</option>
       <option value="az">A-Z</option>
      </select>
    </div>

  </div>

  <div id="pokemon-list" class="pokemon-list"></div>
  
  <div id="modal-container"></div>
  `;
}

// AFFICHE UNIQUEMENT LES CARTES (Se met à jour quand on filtre)
function renderPokemonGrid(pokemons: Pokemon[]) {
  const container = document.getElementById('pokemon-list');
  if (!container) return;

  if (pokemons.length === 0) {
    container.innerHTML = `<p style="text-align:center; width:100%; margin-top:20px;">Aucun Pokémon trouvé.</p>`;
    return;
  }

  container.innerHTML = pokemons.map(pokemon => `
      <div class="pokemon-card" data-id="${pokemon.id}">
        <img src="${pokemon.image}" loading="lazy" />
        <h2>${pokemon.name}</h2>
        <div class="types-mini" style="display:flex; gap:5px; justify-content:center;">
            ${pokemon.type.map(t => `<span class="type-dot type-${t}" style="width:10px; height:10px; border-radius:50%; background:var(--bg-type-${t}, grey); display:inline-block;"></span>`).join('')}
        </div>
      </div>
    `).join('');
  
  // On réattache le clic sur les nouvelles cartes
  setupCardsClick();
}


/* ======================
  LOGIQUE DES FILTRES
====================== */

function setupGlobalListeners() {
  const searchInput = document.querySelector<HTMLInputElement>('#search');
  const typeSelect = document.querySelector<HTMLSelectElement>('#filter-type');
  const sortSelect = document.querySelector<HTMLSelectElement>('#filter-sort');

  // Fonction centrale de filtrage
  const handleFilters = () => {
    const query = searchInput?.value.toLowerCase() || '';
    const selectedType = typeSelect?.value || '';
    const sortOrder = sortSelect?.value || 'asc';

    // 1. Filtrer
    filteredPokemons = allPokemons.filter(pokemon => {
      const matchName = pokemon.name.toLowerCase().includes(query);
      const matchType = selectedType === '' || pokemon.type.includes(selectedType);
      return matchName && matchType;
    });

    // 2. Trier
    filteredPokemons.sort((a, b) => {
      if (sortOrder === 'asc') return a.id - b.id;
      if (sortOrder === 'desc') return b.id - a.id;
      if (sortOrder === 'az') return a.name.localeCompare(b.name);
      return 0;
    });

    // 3. Afficher le résultat
    renderPokemonGrid(filteredPokemons);
  };

  // On écoute les changements
  searchInput?.addEventListener('input', handleFilters);
  typeSelect?.addEventListener('change', handleFilters);
  sortSelect?.addEventListener('change', handleFilters);

  // Clavier (Flèches) pour la modale
  setupGlobalKeyboardEvents();
}


/* ======================
  DÉTAIL (MODALE)
====================== */

function openModal(index: number) {
  if (index < 0 || index >= filteredPokemons.length) return;

  currentPokemonIndex = index;
  const pokemon = filteredPokemons[index];

  // Recherche dans TOUS les pokemons pour les évolutions (même si masqués par le filtre)
  const previousEvolution = pokemon.evolutionFrom
  ? allPokemons.find(p => p.id === pokemon.evolutionFrom)
  : null;

  const nextEvolutions = pokemon.evolutionTo
  ? pokemon.evolutionTo.map(id => allPokemons.find(p => p.id === id)).filter(Boolean)
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
          ${pokemon.type
            .map(type => `<span class="type-badge type-${type}">${type}</span>`)
            .join('')}
        </div>

        <div style="display:flex; justify-content:center; gap:20px; margin: 15px 0;">
            <p><strong>Poids:</strong> ${pokemon.poids} kg</p>
            <p><strong>Taille:</strong> ${pokemon.taille} m</p>
        </div>

        <ul class="stats" style="list-style:none; padding:0; text-align:left;">
          ${renderStat('HP', pokemon.stats.hp)}
          ${renderStat('ATK', pokemon.stats.attack)}
          ${renderStat('DEF', pokemon.stats.defense)}
          ${renderStat('VIT', pokemon.stats.speed)}
        </ul>

        ${pokemon.cries ? `<button id="cry-btn">🔊 Cri</button>` : ''}
      
        <div class="evolutions">
            ${previousEvolution ? `
            <div class="evolution-card" data-id="${previousEvolution.id}">
                <p style="color:#666; font-size:0.7rem;">AVANT</p>
                <img src="${previousEvolution.image}" class="evolution-img"/>
                <p>${previousEvolution.name}</p>
            </div>` : ''}

            ${nextEvolutions.map(p => `
            <div class="evolution-card" data-id="${p!.id}">
                <p style="color:#666; font-size:0.7rem;">APRÈS</p>
                <img src="${p!.image}" class="evolution-img"/>
                <p>${p!.name}</p>
            </div>`).join('')}
        </div>

      </div>

      ${index < filteredPokemons.length - 1 ? `<button class="nav-arrow nav-next">❯</button>` : ''} 
    </div>
  `;

  // --- GESTION DES ÉVÉNEMENTS ---

  const closeModal = () => {
    modalContainer.innerHTML = '';
    currentPokemonIndex = null;
  };

  document.querySelector('.modal-close')?.addEventListener('click', closeModal);
  document.querySelector('#overlay-bg')?.addEventListener('click', (event) => {
    if (event.target === document.querySelector('#overlay-bg')) closeModal();
  });

  // Navigation Évolution (CORRIGÉE)
  const evoCards = document.querySelectorAll('.evolution-card');
  evoCards.forEach(card => {
    card.addEventListener('click', () => {
      const idStr = card.getAttribute('data-id');
      if (!idStr) return;
      const id = Number(idStr);
      
      // On cherche l'index dans la liste FILTRÉE
      let newIndex = filteredPokemons.findIndex(p => p.id === id);
      
      // Si le pokemon n'est pas dans la liste filtrée (ex: on cherche "feu" mais l'évolution est "vol")
      // On décide ici de réinitialiser la recherche pour le montrer, ou d'alerter l'utilisateur.
      // Option simple : on réinitialise les filtres pour afficher l'évolution
      if (newIndex === -1) {
         // Reset des variables
         filteredPokemons = allPokemons;
         
         // Reset visuel des inputs
         const searchInput = document.querySelector<HTMLInputElement>('#search');
         if(searchInput) searchInput.value = "";
         const typeInput = document.querySelector<HTMLSelectElement>('#filter-type');
         if(typeInput) typeInput.value = "";
         
         // On rafraichit la grille arrière-plan
         renderPokemonGrid(filteredPokemons);
         
         // On trouve le nouvel index
         newIndex = filteredPokemons.findIndex(p => p.id === id);
      }

      if (newIndex !== -1) openModal(newIndex);
    });
  });

  document.querySelector('.nav-prev')?.addEventListener('click', (event) => {
    event.stopPropagation();
    openModal(index - 1);
  });

  document.querySelector('.nav-next')?.addEventListener('click', (event) => {
    event.stopPropagation();
    openModal(index + 1);
  });

  if (pokemon.cries) {
    document.querySelector('#cry-btn')?.addEventListener('click', (event) => {
      event.stopPropagation();
      new Audio(pokemon.cries!).play();
    })
  }
}

function renderStat(label: string, value: number) {
  // Ajustement visuel pour ne pas dépasser 100% de la barre
  const percent = Math.min(value, 150) / 1.5; 
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
  EVENTS (CLIC & CLAVIER)
====================== */

function setupCardsClick() {
  document.querySelectorAll('.pokemon-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = Number(card.getAttribute('data-id'))
      const index = filteredPokemons.findIndex(pokemon => pokemon.id === id);
      if (index !== -1) openModal(index);
    })
  })
}

function setupGlobalKeyboardEvents() {
  window.addEventListener('keydown', (event) => {
    if (currentPokemonIndex === null) return;

    if (event.key === 'ArrowLeft') {
      if (currentPokemonIndex > 0) openModal(currentPokemonIndex - 1);
    } 
    else if (event.key === 'ArrowRight') {
      if (currentPokemonIndex < filteredPokemons.length - 1) openModal(currentPokemonIndex + 1);
    }
    else if (event.key === 'Escape') {
      document.querySelector('#modal-container')!.innerHTML = '';
      currentPokemonIndex = null;
    }
  });
}