import type { Pokemon } from "../pokemon_list"; // Assure-toi que le chemin est bon
import {
  team,
  addToTeam,
  removeFromTeam,
  getTeamTypes,
  getTeamWeaknesses,
  saveNamedTeam,
  loadNamedTeam,
  getSavedTeamNames,
  deleteNamedTeam,
  clearCurrentTeam
} from "./size";

/* ---------------------
   LOGIQUE D'AJOUT (Vient de l'ancien gestion.ts)
---------------------- */
export function handleAddToTeam(pokemon: Pokemon) {
  const success = addToTeam(pokemon);
  if (!success) {
    alert('⚔️ Équipe pleine ou Pokémon déjà présent');
    return;
  }
  // On met à jour l'affichage après l'ajout
  renderTeam(); 
}

/* ---------------------
   UPDATE SELECT DES ÉQUIPES
---------------------- */
export function updateSavedTeamsSelect() {
  const select = document.getElementById("saved-teams") as HTMLSelectElement;
  if (!select) return;

  const currentValue = select.value;

  select.innerHTML =
    `<option value="">Charger une équipe</option>` +
    getSavedTeamNames()
      .map((name) => `<option value="${name}">${name}</option>`)
      .join("");

  if (currentValue && getSavedTeamNames().includes(currentValue)) {
    select.value = currentValue;
  }
}

/* ---------------------
   RENDER CONTENU DE L'ÉQUIPE
---------------------- */
export function renderTeamContent() {
  const container = document.getElementById("team-content");
  if (!container) return;

  const types = getTeamTypes();
  const weaknesses = getTeamWeaknesses();

  container.innerHTML = `
    ${
      team.pokemons.length > 0
        ? `
      <div class="team-types">
        <strong>Types :</strong>
        ${types
          .map((t) => `<span class="type-badge type-${t}">${t}</span>`)
          .join(" ")}
      </div>

      <div class="team-weaknesses">
        <strong>Faiblesses :</strong>
        ${
          weaknesses.length > 0
            ? weaknesses
                .map(
                  (w) =>
                    `<span class="type-badge type-${w.type}">${w.type} x${w.count}</span>`
                )
                .join(" ")
            : "<span>Aucune faiblesse majeure</span>"
        }
      </div>

      <div class="team-grid">
        ${team.pokemons
          .map(
            (p) => `
          <div class="team-card">
            <img src="${p.image}" />
            <strong>${p.name}</strong>

            <div class="types">
              ${p.types
                .map((t) => `<span class="type-badge type-${t}">${t}</span>`)
                .join(" ")}
            </div>

            <div class="moves">
              <strong>Attaques :</strong>
              ${p.moves
                .map(
                  (m) => `
                <div class="move">
                  <span class="type-badge type-${m.type}">${m.type}</span>
                  ${m.name}${m.power ? ` (${m.power})` : ""}
                </div>
              `
                )
                .join("")}
            </div>

            <button class="remove-btn" data-id="${p.id}">
              ❌ Retirer
            </button>
          </div>
        `
          )
          .join("")}
      </div>
      `
        : `<p>⚠️ Aucune équipe n'a été créée</p>`
    }
  `;

  /* ---------------------
     EVENT : RETIRER POKÉMON
     (Directement ici pour éviter les problèmes d'import)
  ---------------------- */
  container.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-id"));
      removeFromTeam(id); // Appel direct à size.ts

      renderTeamContent(); // On rafraichit la zone de l'équipe
      updateSavedTeamsSelect();
    });
  });
}

/* ---------------------
   INIT EVENTS (UNE SEULE FOIS)
---------------------- */
let eventsInitialized = false;

export function initTeamEvents() {
  if (eventsInitialized) return;

  // Vérification que les boutons existent avant d'attacher les events
  const saveBtn = document.getElementById("save-team-btn");
  if(!saveBtn) return; // Si le DOM n'est pas prêt, on arrête et on attend le prochain appel

  eventsInitialized = true;

  /* ---- SAUVEGARDER ---- */
  document.getElementById("save-team-btn")?.addEventListener("click", () => {
    const input = document.getElementById("team-name") as HTMLInputElement;
    const name = input.value.trim();

    if (!name) return alert("Donne un nom à ton équipe !");
    saveNamedTeam(name);
    alert(`Équipe "${name}" sauvegardée !`);
    updateSavedTeamsSelect();
  });

  /* ---- CHARGER ---- */
  document.getElementById("saved-teams")?.addEventListener("change", (e) => {
    const select = e.target as HTMLSelectElement;
    if (!select.value) return;

    loadNamedTeam(select.value);
    renderTeamContent();
  });

  /* ---- SUPPRIMER ---- */
  document.getElementById("delete-team-btn")?.addEventListener("click", () => {
    const select = document.getElementById("saved-teams") as HTMLSelectElement;
    const teamName = select.value;

    if (!teamName) return alert("Choisis une équipe à supprimer !");
    if (!confirm(`Supprimer l'équipe "${teamName}" ?`)) return;

    deleteNamedTeam(teamName);
    clearCurrentTeam();

    renderTeamContent();
    updateSavedTeamsSelect();
  });

  /* ---- VIDER ---- */
  document.getElementById("clear-team")?.addEventListener("click", () => {
    if(confirm("Vider l'équipe actuelle ?")) {
        clearCurrentTeam();
        renderTeamContent();
        updateSavedTeamsSelect();
    }
  });

  /* ---- VOIR MON ÉQUIPE ---- */
  document.getElementById("btn-show-team")?.addEventListener("click", () => {
    document.getElementById("team-content")?.scrollIntoView({
      behavior: "smooth"
    });
  });
}

/* ---------------------
   RENDER GLOBAL
---------------------- */
export function renderTeam() {
  // On tente d'initialiser les boutons (ça ne marchera que si le DOM est prêt)
  initTeamEvents();       
  updateSavedTeamsSelect();
  renderTeamContent();    
}