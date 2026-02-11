export interface Move {
    name: string
    type: string
    power: number | null 
}

export interface TeamPokemon {
    id: number
    name: string
    image: string
    types: string[]
    moves: Move[]
}

export interface Team {
    pokemons: TeamPokemon[]
}