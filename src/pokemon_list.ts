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
  VARIABLES
====================== */

const app = document.querySelector<HTMLDivElement>('#app')!
let allPokemons: Pokemon[] = []
let filteredPokemons: Pokemon[] = []
let currentPokemonIndex: number | null = null; 


/* ======================
  LISTE
====================== */

export async function initPokemonList() {
  app.innerHTML = `<p style="color:#333; font-size:1.5rem; text-align:center; margin-top:50px;">⚙️ Chargement du Pokédex...</p>`
  allPokemons = await fetchPokemons()
  filteredPokemons = allPokemons
  renderPokemonList(allPokemons)
  setupGlobalKeyboardEvents(); // On lance l'écoute du clavier ici
}

function renderPokemonList(pokemons: Pokemon[]) 
{
  const listContainer = document.querySelector('#pokemon-list');

  if (listContainer) 
    {
    listContainer.innerHTML = pokemons
      .map(pokemon => `
        <div class="pokemon-card" data-id="${pokemon.id}">
          <img src="${pokemon.image}" loading="lazy" />
          <h2>${pokemon.name}</h2>
        </div>
      `).join('');
    
    setupCardsClick(); 
    return; 
  }

  app.innerHTML = `
  <div class="header-controls">
    <input id="search" type="text" placeholder="🔎 Chercher un Pokémon..." />
    <button id="advanced-filter" class="filter-button"> FILTRE </button>
  </div>
  <br>

  <div id="fiter-bar" class="fiter-bar">
  <div class="filter-group">
    <label>Type</label>
    <select id="filter-type">
      <option value="">Tous</option>
      <option value"fire">Fire</option>
      <option value="grass">Grass</option>
      <option value="poison">Poison</option>
    </select>
  </div>

  <div class="filter-group">
    <label>Capacité</label>
    <input id="filter-ability" type="text" placeholder="Écrivez ici!"/>
  </div>

  <div class="filter-group">
    <label>Trier par ID</label>
    <select id="filter-sort">
     <!--<option value="asc">Croissant (1-151)</option> -->
     <!--<option value="desc">Décroissant (151-1)</option> -->
    </select>
  </div>

 
    <div id="pokemon-list" class="pokemon-list">
      ${pokemons
        .map(p => `
          <div class="pokemon-card" data-id="${p.id}">
            <img src="${p.image}" loading="lazy" />
            <h2>${p.name}</h2>
          </div>
        `).join('')}
    </div>
    
    <div id="modal-container"></div>
    <div id="pokemon-bottom"></div>
  `;
  
  //setupAdvancedSearch();
  setupSearch();
  setupCardsClick();
}


/* ======================
  SEARCH
====================== */
  
function setupSearch() 
{
  const input = document.querySelector<HTMLInputElement>('#search');
  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase();
    
    filteredPokemons = allPokemons.filter(pokemon =>
      pokemon.name.toLowerCase().includes(query)
    );
    
    renderPokemonList(filteredPokemons);
  });
}

/* ======================
  DETAIL (MODALE)
====================== */

function openModal(index: number) {
  if (index < 0 || index >= filteredPokemons.length) return;

  currentPokemonIndex = index;
  const pokemon = filteredPokemons[index];

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
        
        <h2>${pokemon.name}</h2>

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

        ${pokemon.cries ? `<button id="cry-btn">🔊 Cri du Pokémon</button>` : ''}
      
      <div class="evolutions">
        ${previousEvolution ? `
          <div class="evolution-card" data-id="${previousEvolution.id}">
            <p style="color:#666; font-size:0.7rem;">AVANT</p>
            <img src="${previousEvolution.image}" alt="${previousEvolution.name}" class="evolution-img"/>
            <p>${previousEvolution.name}</p>
          </div>` : ''}

        ${nextEvolutions.map(p => `
          <div class="evolution-card" data-id="${p!.id}">
            <p style="color:#666; font-size:0.7rem;">APRÈS</p>
            <img src="${p!.image}" alt="${p!.name}" class="evolution-img"/>
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

  // 1. Fermer la modale
  document.querySelector('.modal-close')?.addEventListener('click', closeModal);
  document.querySelector('#overlay-bg')?.addEventListener('click', (e) => {
    if (e.target === document.querySelector('#overlay-bg')) closeModal();
  });

  // 2. Navigation Évolution
  const evoCards = document.querySelectorAll('.evolution-card');
  
  evoCards.forEach(card => {
    card.addEventListener('click', () => {
      // Maintenant que le HTML est corrigé, le getAttribute ne renverra plus null ou NaN
      const idStr = card.getAttribute('data-id');
      if (!idStr) return; // Sécurité

      const id = Number(idStr);
      
      let newIndex = filteredPokemons.findIndex(p => p.id === id);

      // Si le pokémon est masqué par le filtre
      if (newIndex === -1) {
        const searchInput = document.querySelector<HTMLInputElement>('#search');
        if (searchInput) searchInput.value = '';

        filteredPokemons = allPokemons;
        renderPokemonList(filteredPokemons);

        newIndex = filteredPokemons.findIndex(p => p.id === id);
      }

      if (newIndex !== -1) {
        openModal(newIndex);
      }
    });
  });

  // 3. Flèches Nav
  document.querySelector('.nav-prev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(index - 1);
  });

  document.querySelector('.nav-next')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(index + 1);
  });

  // 4. Cri
  if (pokemon.cries) {
    document.querySelector('#cry-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      new Audio(pokemon.cries!).play();
    })
  }
}

function renderStat(label: string, value: number) {
  const percent = Math.min(value, 100);
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
      const index = filteredPokemons.findIndex(p => p.id === id);
      if (index !== -1) openModal(index);
    })
  })
}

// NOUVEAU : Gestion des touches du clavier
function setupGlobalKeyboardEvents() {
  window.addEventListener('keydown', (e) => {
    // Si aucune modale n'est ouverte (index est null), on ne fait rien
    if (currentPokemonIndex === null) return;

    if (e.key === 'ArrowLeft') {
      // Flèche Gauche
      if (currentPokemonIndex > 0) {
        openModal(currentPokemonIndex - 1);
      }
    } 
    else if (e.key === 'ArrowRight') {
      // Flèche Droite
      if (currentPokemonIndex < filteredPokemons.length - 1) {
        openModal(currentPokemonIndex + 1);
      }
    }
    else if (e.key === 'Escape') {
      // Touche Echap pour fermer
      document.querySelector('#modal-container')!.innerHTML = '';
      currentPokemonIndex = null;
    }
  });
}