import { team, getTeamTypes } from "./size";
import { handleRemoveFromTeam } from "./gestion";

export function renderTeam() {
    const container = document.getElementById('team-container');
    if (!container) return;

    if (team.pokemons.length === 0) {
        container.innerHTML = `<p> ⚠️ Aucune équipe n'a été créée</p>`;
        return;
    }

    const types = getTeamTypes();

    container.innerHTML = `
        <h3>🧢 Équipe Pokémon</h3>

        <div class="team-types">
            <strong>Types présents :</strong> 
            ${types.map(t => 
                `<span class="type-badge type-${t}">${t}</span>`
            ).join(' ')}
        </div>

        <div class="team-grid">
            ${team.pokemons.map(p => `
                <div class="team-card" data-id="${p.id}">
                    
                    <img src="${p.image}" />
                    <strong>${p.name}</strong>

                    <div class="types">
                        ${p.types.map(t => 
                            `<span class="type-badge type-${t}">${t}</span>`
                        ).join('')}
                    </div>

                    <div class="moves">
                        <strong>Attaques :</strong>
                        ${p.moves.map(m => `
                            <div class="move">
                                <span class="type-badge type-${m.type}">
                                    ${m.type}
                                </span>
                                ${m.name}
                                ${m.power ? ` (${m.power})` : ''}
                            </div>
                        `).join('')}
                    </div>

                    <button class="remove-btn" data-id="${p.id}">
                        ❌ Retirer
                    </button>

                </div>
            `).join('')}
        </div>
    `;

    // Gestion suppression
    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-id'));
            handleRemoveFromTeam(id);
        });
    });
}