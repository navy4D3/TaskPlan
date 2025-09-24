const { showPopup, hidePopup, sanitizeInput, treatFormAlert } = require("../app");

const profilShowAddTaskPopupBtns = document.querySelectorAll(".show-add-task-popup-btn");
const addTaskPopup = document.getElementById('add-task-popup');
const addTaskBtn = addTaskPopup.querySelector('.add-task-btn');
const addTaskInput = addTaskPopup.querySelector('input');
const hideAddTaskPopupBtn = addTaskPopup.querySelector('.hide-popup-btn');

// const tasksList = myTasksSection.querySelector(".tasks");

const currentProjectId = document.querySelector('.sections').dataset.projectId;
let currentSectionId;

profilShowAddTaskPopupBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        showPopup(addTaskPopup, 'flex');

        currentSectionId =  btn.dataset.sectionId;

        addTaskBtn.classList.add('inactive');
    })
})

hideAddTaskPopupBtn.addEventListener('click', () => {
    hidePopup(addTaskPopup);
    addTaskInput.value = "";
})

addTaskInput.addEventListener('input', () => {
    addTaskBtn.classList.remove('inactive');
})

addTaskBtn.addEventListener('click', function() {
    if (!currentSectionId) {
        console.log("Ajouter une tâche pour la section ID :", currentSectionId);
        return; // sécurité
    }
    
    let title = sanitizeInput(addTaskInput.value);

    if (!title) {
        alert("Veuillez entrer un nom de tâche valide");
        return;
    }

    fetch('/add-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest', // pour détecter l'AJAX côté Symfony
        },
        body: JSON.stringify({ 
            title: title, 
            sectionId : currentSectionId,
            projectId : currentProjectId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Tâche créé :", data.task);

            const currentSection = document.getElementById(currentSectionId);
            const currentTaskList = currentSection.querySelector(".tasks-list");
            const emptyTasksMessage = currentSection.querySelector('.empty-tasks-message');

            if (emptyTasksMessage) {
                emptyTasksMessage.style.display = "none";
            }

            const taskDiv = document.createElement('span');
            taskDiv.classList.add('task');
            // taskDiv.href = `/task/${data.task.id}`;
            taskDiv.textContent = data.task.title;

            // Redirection au clic vers /task/{id}
            taskDiv.addEventListener('click', () => {
                //montrer le popup d'ajout de tache
            });

            // Ajout au conteneur
            currentTaskList.insertBefore(taskDiv, currentTaskList.lastElementChild);

            hidePopup(addTaskPopup);
            addTaskInput.value = "";


        } else {
            alert("Erreur : " + data.message);
        }
    })
    .catch(error => console.error("Erreur fetch:", error));
    
})