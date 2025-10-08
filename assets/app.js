import './bootstrap.js';
import './styles/app.scss';


import { initProjectEvents } from './js/projectTools.js';

import { initSwipeSections } from './js/swipeSections';

document.addEventListener('DOMContentLoaded', () => {
    initSwipeSections();
});
/*
 * Welcome to your app's main JavaScript file!
 *
 * This file will be included onto the page via the importmap() Twig function,
 * which should already be in your base.html.twig.
 */


const navbarProjectsBtn = document.getElementById('navbar-projects-btn');

if (navbarProjectsBtn) {
    const navbarProjectsSection = document.getElementById('navbar-projects-section')
    navbarProjectsBtn.addEventListener('click', function() {
        navbarProjectsSection.style.display = "flex";
    })

    const hideNavbarProjectsSectionBtn = navbarProjectsSection.querySelector(".hide-section-btn");

    hideNavbarProjectsSectionBtn.addEventListener('click', () => navbarProjectsSection.style.display = "none");

    // const showAddProjectPopupNavbarBtn = navbarProjectsSection.querySelector('.show-add-project-popup-btn');
    const addProjectPopup = document.getElementById('add-project-popup');
    const addProjectBtn = addProjectPopup.querySelector('.add-project-btn');
    const addProjectInput = addProjectPopup.querySelector('input');
    const hideAddProjectPopupBtn = addProjectPopup.querySelector('.hide-popup-btn');
    const showAddProjectPopupBtns = document.querySelectorAll('.show-add-project-popup-btn');

    // showAddProjectPopupNavbarBtn.addEventListener('click', () => showPopup(addProjectPopup, 'flex'));

    showAddProjectPopupBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showPopup(addProjectPopup, 'flex');
    
            addProjectBtn.classList.add('inactive');
        })
       
    })
    
    hideAddProjectPopupBtn.addEventListener('click', () => {
        hidePopup(addProjectPopup);
        addProjectInput.value = "";
    })
    
    addProjectInput.addEventListener('input', () => {
        addProjectBtn.classList.remove('inactive');
    })

    addProjectBtn.addEventListener('click', function() {
        let title = sanitizeInput(addProjectInput.value);
    
        if (!title) {
            alert("Veuillez entrer un titre de projet valide");
            return;
        }
    
        fetch('/add-project', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest', // pour détecter l'AJAX côté Symfony
            },
            body: JSON.stringify({ title: title })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("Projet créé :", data.project);
                // 👉 ici tu pourrais ajouter dynamiquement le projet à ta liste
    
                const emptyProjectsMessage = document.querySelector('.empty-projects-message')
    
                if (emptyProjectsMessage) {
                    emptyProjectsMessage.style.display = "none";
                }
    
                const currentPath = window.location.pathname;
    
                // if (currentPath.startsWith('/profil')) {
                //     const myProjectsSection = document.querySelector(".my-projects-section");

                //     const profilProjectsList = myProjectsSection.querySelector(".projects");
                //     // console.log('Comportement pour la page profil');
                //     const projectDiv = document.createElement('div');
                //     projectDiv.classList.add('project');
                //     projectDiv.dataset.projectId = data.project.id;
                //     projectDiv.innerHTML = `
                //         <a class="swipe-item" href="project/${data.project.id }}" >${data.project.title }</a>
                //         <svg class="show-delete-project-popup-btn trash-icon" style="opacity:0%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>
                //     `
                //     // projectDiv.href = `/project/${data.project.id}`;
                //     // projectDiv.textContent = data.project.title;
    
                //     // Redirection au clic vers /project/{id}
                //     profilProjectsList.appendChild(projectDiv);
                //     initProjectEvents(projectDiv);
                //     initSwipeSections();
                    
    
                //     hidePopup(addProjectPopup);
                //     addProjectInput.value = "";
                    
                //   } else {
                    
                //   } 

                  window.location.href = "/project/" + data.project.id;
    
            } else {
                alert("Erreur : " + data.message);
            }
        })
        .catch(error => console.error("Erreur fetch:", error));
    
        // clear l'input après l’envoi
        
    })

    


}

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

const blurEffect = document.querySelector('.blur-effect');

if (blurEffect) {
    blurEffect.addEventListener('click', function() {
        const popups = document.querySelectorAll('.popup');

        popups.forEach(popup => popup.addEventListener('click', hidePopup(popup)));
    })
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



export function initRadioBtnsEvent() {
    const radioIcons = document.querySelectorAll('.radio-icon');

    if (radioIcons.length > 0) {
        radioIcons.forEach(radio => {
            if (radio.dataset.initialized !== 'true') {

                radio.addEventListener('click', function(e) {

                    const innerRadio = radio.querySelector('.selected');
    
                    const isHidden = getComputedStyle(innerRadio).display === "none";

                    if (isHidden) {
                        innerRadio.style.display = "flex"; // ou block selon ton besoin
                    } else {
                        innerRadio.style.display = "none";
                    }
                })

                radio.dataset.initialized = 'true';
            }
            
        })
    }
}
