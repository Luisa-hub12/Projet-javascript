import './style.css'

export function setupHomePage(onContinue: () => void) {
  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML = `
    <div class="layout">
      <header class="navbar">
        <div class="logo">LOGO</div> 
        <div class="header-right">
          <button class="lang-btn">LANGUE</button>
          <button id="menu-trigger">MENU</button>
        </div>
      </header>

      <main class="main-content">
        <h1 class="title-pokedex">POKÉDEX</h1>

        <div class="form-container">
          <h2>FORMULAIRE D'INSCRIPTION</h2>
          <p>SE CRÉER UN COMPTE</p>
          <div class="inputs">
            <input type="text" placeholder="Pseudo">
            <input type="password" placeholder="Mot de passe">
          </div>
        </div>

        <button id="continue-btn" class="continue-btn">CONTINUER</button>
      </main>

      <aside id="side-menu" class="side-menu-hidden">
        <nav>
          <ul>
            <li><button id="nav-list">LIST</button></li>
            <li><button id="nav-compte">COMPTE</button></li>
            <li><button id="nav-logout">SE DÉCONNECTER</button></li>
          </ul>
        </nav>
      </aside>
    </div>
  `

  setupMenuLogic()

  document
    .querySelector('#continue-btn')!
    .addEventListener('click', onContinue)
}

/* ======================
  MENU
====================== */

function setupMenuLogic() {
  const menuBtn = document.querySelector('#menu-trigger')!
  const sideMenu = document.querySelector('#side-menu')!

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    sideMenu.classList.toggle('side-menu-visible')
  })

  document.addEventListener('click', () => {
    sideMenu.classList.remove('side-menu-visible')
  })
}
