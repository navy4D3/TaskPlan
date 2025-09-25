import './bootstrap.js';
/*
 * Welcome to your app's main JavaScript file!
 *
 * This file will be included onto the page via the importmap() Twig function,
 * which should already be in your base.html.twig.
 */
import './styles/app.scss';

export function showPopup(divToShow, displayType = "block") {
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

export function sanitizeInput(str) {
    // Trim, enlever balises HTML, limiter espaces multiples
    return str
        .trim()
        .replace(/<[^>]*>?/gm, '')   // supprime balises HTML
        .replace(/\s\s+/g, ' ');     // réduit espaces multiples
}

export function treatFormAlert(form, successAlert, jsonData) {
    let errorsContainer = form.querySelector('.errors-container');

    if (jsonData.status == "success") {
        showSuccessAlert(successAlert);

        if (errorsContainer) {
            errorsContainer.remove();
        }
        
    } else {
        
        if (!errorsContainer) {
            errorsContainer = document.createElement("div");
            errorsContainer.classList.add('errors-container');

            form.insertAdjacentElement('afterBegin', errorsContainer);
        }

        let newHtml = '';
        jsonData.errors.forEach(error => {
            newHtml += `
            <div class="alert alert-danger">
                ${error.message}
            </div>
            `
        });
        errorsContainer.innerHTML = newHtml;
    }
}

export function showSuccessAlert(message, duration = 3000) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.role = 'alert';
    alert.innerHTML = `
    ${message}
    
    `;
    // <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>

    // Ajoute l'alerte en haut du body (ou ailleurs selon ton design)
    document.body.prepend(alert);

    // Supprime l'alerte automatiquement après `duration` ms
    setTimeout(() => {
    alert.classList.remove('show'); // déclenche la transition
    alert.classList.add('hide'); // si besoin
    setTimeout(() => alert.remove(), 300); // laisse le temps à la transition de s'effectuer
    }, duration);
}

export function showErrors(alerts) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-error alert-dismissible fade show';
    alert.role = 'alert';


    let message = ""

    alerts.forEach((alert) => {
        message = message + "<br>" + alert.message
    });

    alert.innerHTML = message;
}

const radioIcons = document.querySelectorAll('.radio-icon');

if (radioIcons.length > 0) {
    radioIcons.forEach(radio => {
        radio.addEventListener('click', function() {
            
            const innerRadio = radio.querySelector('.selected');

            if (innerRadio.style.display == "none") {
                innerRadio.style.display = "block";
            } else {
                innerRadio.style.display = "none";
            }
        })
    })
}
