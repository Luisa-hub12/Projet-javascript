import type { Pokemon } from "../pokemon_list";
import { addToTeam, removeFromTeam } from "./team_store";
import { renderTeam } from "./team_ui";

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
