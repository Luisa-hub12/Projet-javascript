import './style.css';
import { setupHomePage } from './home_page';
import { initPokemonList } from './pokemon_list';
import { loadTeam } from './team/size';
import { renderTeam } from './team/choice';

// Charger équipe et afficher au démarrage
loadTeam();
renderTeam();

setupHomePage(() => {
  initPokemonList();
});