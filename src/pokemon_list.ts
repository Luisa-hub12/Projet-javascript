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
      poids: data.weight / 10,  // kg
      taille: data.height / 10, // m
      cries: data.cries?.latest,
    })
  }

  return pokemons
}

/* ======================
  LISTE
====================== */

export async function initPokemonList() {
  app.innerHTML = `<p>⚙️ Loading the Pokédex...</p>`
  allPokemons = await fetchPokemons()
  filteredPokemons = allPokemons
  renderPokemonList(allPokemons)
}

function renderPokemonList(pokemons: Pokemon[]) 
{
  const listContainer = document.querySelector('#pokemon-list');

  if (listContainer) 
    {
    listContainer.innerHTML = pokemons
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(pokemon => `
        <div class="pokemon-card" data-id="${pokemon.id}">
          <img src="${pokemon.image}" />
          <h2>${pokemon.name}</h2>
        </div>
      `).join('');
    
    setupCardsClick(); 
    return; 
  }

  app.innerHTML = `
    <h1>POKÉDEX</h1>
    <input id="search" type="text" placeholder="🔎 Find a Pokémon..." />

    <div id="pokemon-list" class="pokemon-list">
      ${pokemons
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(p => `
          <div class="pokemon-card" data-id="${p.id}">
            <img src="${p.image}" />
            <h2>${p.name}</h2>
          </div>
        `).join('')}
    </div>
    <div id="pokemon-bottom"></div>
    <a href="#pokemon-list" class="back-to-top">⬆</a>
    <a href="#pokemon-bottom" class="go-bottom">⬇</a>
  `;

  setupSearch();
  setupCardsClick();
}
  

  setupSearch()
  setupCardsClick()


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
  DETAIL
====================== */

function renderPokemonDetail(pokemon: Pokemon) {
  app.innerHTML = `
    <button id="back">← Return</button>

    <div class="pokemon-infos">
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
      <li><strong>Poid :</strong> ${pokemon.poids} kg</li>
      <li><strong>Taille :</strong> ${pokemon.taille} m</li>
    </ul>
    </div>

    ${pokemon.cries ? `<button id="cry">🎙️ CRY !</button>` : ''}
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

