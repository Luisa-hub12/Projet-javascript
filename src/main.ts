import './style.css'
import { setupHomePage } from './home_page'
import { initPokemonList } from './pokemon_list'

/* ======================
  INIT GLOBAL
====================== */

setupHomePage(() => {
  initPokemonList()
})
