const { showPopup, hidePopup, sanitizeInput, treatFormAlert } = require("../app");

import Hammer from 'hammerjs';
import { initSwipeSections } from './swipeSections';

document.addEventListener('DOMContentLoaded', () => {
    initSwipeSections();
});

const myProjectsBtn = document.getElementById("my-projects-btn");
const myDataBtn = document.getElementById("my-data-btn");
const parametersBtn = document.getElementById("parameters-btn");

const sectionBtns = document.querySelector('.btns').querySelectorAll('li');

sectionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const targettedSection = btn.id.replace(/-btn$/, "") + "-section";

        document.querySelectorAll('.section').forEach(section => {
            section.style.display = "none";
        })

        document.querySelector("." + targettedSection).style.display = "flex";

        sectionBtns.forEach(btn => {
            btn.classList.remove("selected");
        });

        btn.classList.add('selected');
    })
})

const myProjectsSection = document.querySelector(".my-projects-section");
const profilShowAddProjectPopupBtn = myProjectsSection.querySelector(".show-add-project-popup-btn");
const addProjectPopup = document.getElementById('add-project-popup');
const addProjectBtn = addProjectPopup.querySelector('.add-project-btn');
const addProjectInput = addProjectPopup.querySelector('input');
const hideAddProjectPopupBtn = addProjectPopup.querySelector('.hide-popup-btn');

const deleteProjectPopup = document.getElementById('delete-project-popup');
const deleteProjectBtn = deleteProjectPopup.querySelector('.delete-project-btn');
const hidedeleteProjectPopupBtn = deleteProjectPopup.querySelector('.hide-popup-btn');

const projectsList = myProjectsSection.querySelector(".projects");

const projectDivs = document.querySelectorAll('.project');

projectDivs.forEach(project => {
    
    initProjectEvents(project);


})

function initProjectEvents(projectNode) {
    const currentDeleteProjectBtn = projectNode.querySelector('.show-delete-project-popup-btn');

    if (window.innerWidth < 768) {
        currentDeleteProjectBtn.style.opacity = '';
    } else {
        projectNode.addEventListener('mouseover', function() {
        

            currentDeleteProjectBtn.style.opacity = "100%";
        })
        projectNode.addEventListener('mouseout', function() {
    
            currentDeleteProjectBtn.style.opacity = "0%";
        })
    }
    

    currentDeleteProjectBtn.addEventListener('click', function() {
        showPopup(deleteProjectPopup, 'flex');
        deleteProjectPopup.dataset.projectId = projectNode.dataset.projectId;
    })
}

profilShowAddProjectPopupBtn.addEventListener('click', function() {
    showPopup(addProjectPopup, 'flex');

    addProjectBtn.classList.add('inactive');
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

            const projectDiv = document.createElement('div');
            projectDiv.classList.add('project');
            projectDiv.dataset.projectId = data.project.id;
            projectDiv.innerHTML = `
                <a class="swipe-item" href="project/${data.project.id }}" >${data.project.title }</a>
                <svg class="show-delete-project-popup-btn trash-icon" style="opacity:0%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>
            `
            // projectDiv.href = `/project/${data.project.id}`;
            // projectDiv.textContent = data.project.title;

            // Redirection au clic vers /project/{id}
            projectsList.appendChild(projectDiv);
            initProjectEvents(projectDiv);
            initSwipeSections();
            

            hidePopup(addProjectPopup);
            addProjectInput.value = "";


        } else {
            alert("Erreur : " + data.message);
        }
    })
    .catch(error => console.error("Erreur fetch:", error));

    // clear l'input après l’envoi
    
})

hidedeleteProjectPopupBtn.addEventListener('click', () => {
    hidePopup(deleteProjectPopup);
})

deleteProjectBtn.addEventListener('click', function() {
    const projectId = deleteProjectPopup.dataset.projectId;
    const currentProjectDiv = document.querySelector(`[data-project-id="${projectId}"]`);

    fetch('/delete-project/' + projectId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest', // pour détecter l'AJAX côté Symfony
        },
    })
    .then(response => response.json())
    .then(data => {
        currentProjectDiv.remove();

        hidePopup(deleteProjectPopup);
    })
    .catch(error => console.error("Erreur fetch:", error));

    // clear l'input après l’envoi
    
})


const myDataSection = document.querySelector('.my-data-section');
const myDataForm = myDataSection.querySelector('form');

const myDataFormInputs = myDataSection.querySelectorAll('input');
const editDataBtn = document.getElementById('edit-data-btn');

myDataFormInputs.forEach(input => {
    input.addEventListener('input', function() {
        editDataBtn.style.display = "flex"
    })
})

editDataBtn.addEventListener('click', function(){
    const form = new FormData(myDataForm);
    
    fetch('/user/edit-data', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest', // pour détecter l'AJAX côté Symfony
        },
        body: form
    })
    .then(response => response.json())
    .then(data => {
            
        treatFormAlert(myDataForm, 'Données modifiés avec succès', data);

        const initialsDivs = document.querySelectorAll('.initials');
        const completeNameDivs = document.querySelectorAll('.complete-name');

        if (data.status = 'success') {
            initialsDivs.forEach(div => {
                div.innerHTML = data.user.prenom[0] + data.user.nom[0];
                
            })

            completeNameDivs.forEach(div => {
                div.innerHTML = data.user.prenom + ' ' + data.user.nom;
                
            })
        }
        

        editDataBtn.style.display = "none";

    })
    .catch(error => console.error("Erreur fetch:", error));
})

const parametersSection = document.querySelector('.parameters-section');

const showEditPasswordSectionBtn = document.getElementById('show-edit-password-section-btn');
const showEditMailSectionBtn = document.getElementById('show-edit-mail-section-btn');

const editMailSection = document.querySelector('.edit-mail-section');
const editPasswordSection = document.querySelector('.edit-password-section');

parametersBtn.addEventListener('click', function() {
    editMailSection.style.display = "none";
    editPasswordSection.style.display = "none";
})

showEditMailSectionBtn.addEventListener('click', function() {
    parametersSection.style.display = "none";
    editMailSection.style.display = "flex";
})

showEditPasswordSectionBtn.addEventListener('click', function() {
    parametersSection.style.display = "none";
    editPasswordSection.style.display = "flex";
})



// === EDIT MAIL ===
const editMailForm = document.querySelector('.edit-mail-form');
const editPasswordForm = document.querySelector('.edit-password-form');

const editMailFormInputs = editMailForm.querySelectorAll('input');
const editMailBtn = editMailForm.querySelector('.submit');

const editPasswordFormInputs = editPasswordForm.querySelectorAll('input');
const editPasswordBtn = editPasswordForm.querySelector('.submit');

editPasswordFormInputs.forEach(input => {
    input.addEventListener('input', function() {
        if (isAllInputsFilled(editPasswordFormInputs)) {
            editPasswordBtn.classList.remove('inactive');
        } else {
            editPasswordBtn.classList.add('inactive');
        }
    })
    
    
})

function isAllInputsFilled(inputs) {
    let allFilled = true;

    inputs.forEach(input => {
        if (input.value == "") {
            allFilled = false;
        }
    })

    return allFilled;
}

editMailFormInputs.forEach(input => {
    input.addEventListener('input', function() {
        if (isAllInputsFilled(editMailFormInputs)) {
            editMailBtn.classList.remove('inactive');
        } else {
            editMailBtn.classList.add('inactive');
        }
    })
    
})


editMailBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const form = new FormData(editMailForm);

    fetch('/user/edit-mail', {
        method: 'POST',
        body: form,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {

        treatFormAlert(editMailForm, 'Email modifié avec succès', data);

        editMailForm.querySelector('input[type="password"]').value = "";
    })
    .catch(error => console.error("Erreur fetch:", error));
});

// === EDIT PASSWORD ===

editPasswordBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const form = new FormData(editPasswordForm);

    fetch('/user/edit-password', {
        method: 'POST',
        body: form,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        
        treatFormAlert(editPasswordForm, 'Mot de passe modifié avec succès', data);

        editPasswordForm.querySelectorAll('input[type="password"]').forEach(input => input.value = "");
        editPasswordBtn.classList.add('inactive');
    })
    .catch(error => console.error("Erreur fetch:", error));
});


const showDeleteAccountPopupBtn = parametersSection.querySelector(".show-delete-account-popup-btn");
const deleteAccountPopup = document.getElementById('delete-account-popup');
const hideDeleteAccountPopupBtn = deleteAccountPopup.querySelector('.hide-popup-btn');

showDeleteAccountPopupBtn.addEventListener('click', function() {
    showPopup(deleteAccountPopup, 'flex');
})

hideDeleteAccountPopupBtn.addEventListener('click', () => {
    hidePopup(deleteAccountPopup);
})




