let  currentPage = 1;
const maxPage = 46;

let prevBtn: HTMLButtonElement;
let nextBtn: HTMLButtonElement;
let pageInput: HTMLInputElement;

//Fonction qui met à jour l'écran
function updateScreen() 
{
    if (pageInput) pageInput.value = currentPage.toString();
    if (prevBtn) prevBtn.disabled = (currentPage === 1);
    if (nextBtn) nextBtn.disabled = (currentPage === maxPage);
}
export function setupPagination(onPageChange: (requestedPage: number) => void) 
{
    prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
    nextBtn = document.getElementById('next-page') as HTMLButtonElement;
    pageInput = document.getElementById('page-input') as HTMLInputElement;

    //Le button de suivant 
    nextBtn.addEventListener('click', () => 
     {
        if (currentPage < maxPage) {
            currentPage++;
            updateScreen();
            onPageChange(currentPage); 
        }
    });

    // Le button de précédent
    prevBtn.addEventListener('click', () => 
    {
        if (currentPage > 1) {
            currentPage--;
            updateScreen();
            onPageChange(currentPage); 
        }
    });

    updateScreen();
}