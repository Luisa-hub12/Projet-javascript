import './style.css'
import './main'
import './pokemon_list'
import './counter'



export function setupHomePage(onContinue: () => void) {
  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML = `
    <div class="layout">
      <header class="navbar">
        <div class="logo">
        <img src="image.png" alt="Pokemon Logo"/> 
        <br>
        </div> 
        <div class="header">
          <button class="lang-btn">FR</button>
          <button id="menu-trigger">MENU</button>
        </div>
      </header>

      <main class="main-content">
      <br>
        <h1 class="title-pokedex">POKÉDEX</h1>
      </main>
      <aside id="side-menu" class="side-menu-hidden">
        <nav>
            <button id="nav-list">LISTE</button>
            <button id="counter">COMPTER</button>
        </nav>
      </aside>
    </div>
  `

  setupMenuLogic()

  document
    .querySelector('#nav-list')!
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
