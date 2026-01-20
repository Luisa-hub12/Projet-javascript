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
    <input id="search" type="text" placeholder="🔎 Chercher un Pokémon..." />

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

  currentPokemonIndex = index; // On sauvegarde où on est
  const pokemon = filteredPokemons[index];
  const mainType = pokemon.type[0];
  
  const modalContainer = document.querySelector('#modal-container')!;

  modalContainer.innerHTML = `
    <div class="modal-overlay" id="overlay-bg">
      
      ${index > 0 ? `<button class="nav-arrow nav-prev">❮</button>` : ''}

      <div class="modal-content type-${mainType}">
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
      </div>

      ${index < filteredPokemons.length - 1 ? `<button class="nav-arrow nav-next">❯</button>` : ''}

    </div>
  `

  // Fonction pour tout fermer proprement
  const closeModal = () => {
    modalContainer.innerHTML = '';
    currentPokemonIndex = null; // Important : on reset l'index quand on ferme
  };

  document.querySelector('.modal-close')?.addEventListener('click', closeModal);
  
  document.querySelector('#overlay-bg')?.addEventListener('click', (e) => {
    if (e.target === document.querySelector('#overlay-bg')) closeModal();
  });

  document.querySelector('.nav-prev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(index - 1);
  });

  document.querySelector('.nav-next')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(index + 1);
  });

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