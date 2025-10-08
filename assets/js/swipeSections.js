import Hammer from 'hammerjs';

export function initSwipeSections() {
    const swipeElements = document.querySelectorAll('.swipe-item');

    swipeElements.forEach((el) => {
        if (el.dataset.swipeInitialized == 'true') {
            return;
        }

        const hiddenAction = el.nextElementSibling;

        // Créer une instance Hammer
        const hammer = new Hammer(el);

        // Définir le sens du swipe détecté
        hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });

        hammer.on('swipeleft', () => {
            // Ajouter une classe d'animation
            swipeElements.forEach(element => {
                element.classList.remove('swiped-left');
                const hiddenAction = element.nextElementSibling;

                if (hiddenAction) {
                    hiddenAction.classList.remove('visible');
                }
            })
            el.classList.add('swiped-left');
            
            // Afficher l'action cachée
            if (hiddenAction) {
                hiddenAction.classList.add('visible');
            }
        });

        hammer.on('swiperight', () => {
            // Annuler le swipe
            el.classList.remove('swiped-left');
            
            // Masquer l'action cachée
            if (hiddenAction) {
                hiddenAction.classList.remove('visible');
            }
        });

        el.dataset.swipeInitialized = 'true';
    });
}
