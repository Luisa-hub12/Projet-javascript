let currentPage = 1;
const maxPage = 46;

let prevBtn: HTMLButtonElement;
let nextBtn: HTMLButtonElement;
let pageInput: HTMLInputElement;

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

    // button suivant
    nextBtn?.addEventListener('click', () => 
        {
        if (currentPage < maxPage) 
            {
            currentPage++;
            updateScreen();
            onPageChange(currentPage);
            }
    });

    // button précédent 
    prevBtn?.addEventListener('click', () => 
        {
        if (currentPage > 1) 
            {
            currentPage--;
            updateScreen();
            onPageChange(currentPage);
            }
    });

    //button page-jump
    pageInput?.addEventListener('keypress', (event) => 
        {
        if (event.key === 'Enter') 
            {
            const targetPage = parseInt(pageInput.value);
            if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= maxPage) 
                {
                currentPage = targetPage;
                updateScreen();
                onPageChange(currentPage);
                } 
                else 
                    {
                alert("Veuillez entrer un nombre entre 1 et 46");
                updateScreen();
                    }
             }
    });

    updateScreen();
}