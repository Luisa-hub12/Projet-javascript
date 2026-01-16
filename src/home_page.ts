import './style.css'
import { setupCounter } from './counter.ts'

// 
export async function setupHomePage()
{
    const app = document.querySelector<HTMLDivElement>('#app')!;

    app.innerHTML = `
    <div class="layout">
        <header class="navbar">
            <div class="logo">LOGO</div> 
            <div class ="header-right">
                <button class ="lang-btn">LANGUE</button>
                <button id="menu-trigger">MENU</button>
            </div>
        </header>

        <main class="main-content">
            <h1 class="title-pokedex">POKEDEX</h1>

            <div class="form-container">
                <h2>FORMULAIRE D'INSCRIPTION</h2>
                <p>SE CRÉER UN COMPTE</p>
                <div class="inputs">
                    <input type="text" placeholder="Pseudo">
                    <input type="password" placeholder="Mot de passe">
                </div>
            </div>

            <button class="continue-btn">CONTINUER</button>
        </main>

        <aside id="side-menu" class="side-menu-hidden>
            <nav>
                <ul>
                    <li><button id="nav-list">LIST</button></li>
                    <li><button id="nav-compte">COMPTE</button></li>
                    <li><button id="nav-logout">SE DECONNECTER</button></li>
                </ul>
            </nav>
        </aside>
    </div>
`;

setupMenuLogic();


}

// menu.ts
export function setupMenuLogic() {
  const menuBtn = document.querySelector('#menu-trigger')!;
  const sideMenu = document.querySelector('#side-menu')!;

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sideMenu.classList.toggle('side-menu-visible');
  });

  // Fermer si on clique sur le contenu principal
  document.addEventListener('click', () => {
    sideMenu.classList.remove('side-menu-visible');
  });
}
