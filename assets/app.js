import './bootstrap.js';
/*
 * Welcome to your app's main JavaScript file!
 *
 * This file will be included onto the page via the importmap() Twig function,
 * which should already be in your base.html.twig.
 */
import './styles/app.scss';

export function showPopup(divToShow, displayType) {
    const blurEffect = document.querySelector('.blur-effect');

    blurEffect.style.display = "block";
    divToShow.style.display = displayType;

    const hidePopupBtn = divToShow.querySelector('.hide-btn');

    if (hidePopupBtn) {
        hidePopupBtn.addEventListener('click', function() {
            hidePopup(divToShow);
        })
    }


}
export function hidePopup(divToHide) {
    const blurEffect = document.querySelector('.blur-effect');

    blurEffect.style.display = "none";
    divToHide.style.display = "none";

    
}
