import type { Pokemon } from "../pokemon_list";
import { addToTeam, removeFromTeam } from "./size";
import { renderTeam } from "./choice";

export function handleAddToTeam(pokemon: Pokemon) {
    const success = addToTeam(pokemon)

    if (!success) {
        alert('⚔️ Équipe pleine ou Pokémon déjà présent')
        return
    }

    renderTeam()
}

export function handleRemoveFromTeam(id: number) {
    removeFromTeam(id) 
    renderTeam()
}
