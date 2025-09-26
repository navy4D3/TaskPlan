const { showPopup, hidePopup, sanitizeInput, treatFormAlert, showSuccessAlert } = require("../app");

const sectionsContainer = document.getElementById('sections-list');

if (sectionsContainer) {
    new Sortable(sectionsContainer, {
        animation: 150,
        handle: '.header', // <-- le drag se fait uniquement via .header
        onEnd: function (evt) {
            const order = Array.from(sectionsContainer.children)
                .map(el => el.dataset.sectionId);

            // Envoi AJAX vers Symfony pour sauvegarder l'ordre
            fetch('/sections/reorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ order })
            }).then(res => res.json())
                .then(data => console.log('Sections réordonnées', data));
        }
    });
}


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

            const currentSection = document.querySelector(`[data-section-id="${currentSectionId}"]`);
            const currentTaskList = currentSection.querySelector(".tasks-list");
            const emptyTasksMessage = currentSection.querySelector('.empty-tasks-message');

            if (emptyTasksMessage) {
                emptyTasksMessage.remove();
            }

            const taskDiv = document.createElement('span');
            taskDiv.classList.add('task');
            taskDiv.dataset.taskId = data.task.id;
            taskDiv.textContent = data.task.title;

            // Ajout au conteneur
            currentTaskList.insertBefore(taskDiv, currentTaskList.lastElementChild);

            initTaskEvent(taskDiv);

            hidePopup(addTaskPopup);
            addTaskInput.value = "";


        } else {
            alert("Erreur : " + data.message);
        }
    })
    .catch(error => console.error("Erreur fetch:", error));
    
})

const tasks = document.querySelectorAll('.task');
const taskPopup = document.querySelector(".task-popup");
const closeTaskPopupBtn = taskPopup.querySelector('.close-popup-btn');
const deleteTaskBtn = taskPopup.querySelector('.delete-task-btn');

closeTaskPopupBtn.addEventListener('click', () => hidePopup(taskPopup));
deleteTaskBtn.addEventListener('click', () => deleteTask(taskPopup.dataset.taskId));

tasks.forEach(task => {
    initTaskEvent(task);
})

function initTaskDataAndShowPopup(taskId) {
    fetch('/task/get-data/' + taskId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest', // pour détecter l'AJAX côté Symfony
        },
    })
    .then(response => response.json())
    .then(data => {
        taskPopup.querySelector('.title').innerHTML = data.title;
        taskPopup.querySelector('.description').value = data.description;
        taskPopup.dataset.taskId = data.id;

        const previousChecks = taskPopup.querySelectorAll('.checklist');

        previousChecks.forEach(check => check.remove());
        console.log(data.checklist.items);

        if (data.checklist.items !== undefined) {
            data.checklist.items.forEach(check => {
                console.log(check.content);
                addChecklistOnFront(check.content);
            })
        }
        
        showPopup(taskPopup, 'flex');

        // const taskChecklists = data.checklists;

        // if (taskChecklists.length > 0) {
        //     taskChecklists.forEach(checklist => {
        //         addChecklistOnFront(checklist.text);
        //     })
        // }


    })
    .catch(error => console.error("Erreur fetch:", error));
}

function initTaskEvent(taskNode) {
    taskNode.addEventListener('click', () => initTaskDataAndShowPopup(taskNode.dataset.taskId));
    
}


const checklistList = taskPopup.querySelector('.checklist-list');
const addChecklistBtn = taskPopup.querySelector(".add-checklist-btn");
const addChecklistInput = taskPopup.querySelector(".add-checklist-input");

addChecklistBtn.addEventListener('click', function() {
    // addChecklistLabel.style.display = "none";
    addChecklistInput.style.display = "flex";
    addChecklistInput.querySelector('input').focus();
})

addChecklistInput.addEventListener('keydown', function(event) {
    
    const currentTaskId = parseInt(taskPopup.dataset.taskId);

    if (event.key === 'Enter') {
        event.preventDefault(); // Empêche un éventuel submit de formulaire
        
        // Récupère le texte de l'input
        const text = addChecklistInput.querySelector('input').value.trim();
        if (text === "") return; // Ne rien faire si vide

        fetch(`/task/${currentTaskId}/checklist/add/${text}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest', // pour détecter l'AJAX côté Symfony
            },
        })
        .then(response => response.json())
        .then(data => {


            addChecklistOnFront(text);
    
        })
        .catch(error => console.error("Erreur fetch:", error));

        


        // Crée le bloc checklist
        
    }
})

document.addEventListener('click', function(event) {
    
    // Vérifie que le clic n'est PAS à l'intérieur du bloc
    if (addChecklistInput && !addChecklistInput.contains(event.target) && !addChecklistBtn.contains(event.target)) {
        addChecklistInput.style.display = 'none';
    }
});

function addChecklistOnFront(text) {
    const checklistHTML = `
        <div class="checklist">
            <div class="radio-icon">
                <div class="selected" style="display:none"></div>
            </div>
            <span>${text}</span>
        </div>
    `;

    // Insère juste avant l'input
    addChecklistInput.insertAdjacentHTML("beforebegin", checklistHTML);

    // Vide l'input après ajout

    // addChecklistInput.style.display = "none";
    addChecklistInput.querySelector('input').value = "";
}



function deleteTask(taskId) {
    fetch('/delete-task/' + taskId, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erreur ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        showSuccessAlert('Tache supprimée');

        hidePopup(taskPopup);

        document.querySelector(`[data-task-id="${taskPopup.dataset.taskId}"]`).remove();

    })
    .catch(error => {
        console.error("Erreur lors de la suppression :", error);
    });
}

document.querySelectorAll('.tasks-list').forEach(list => {
    new Sortable(list, {
        group: "shared-tasks", //permet le drag entre plusieurs sections
        animation: 150,
        onEnd: function (evt) {
            // const order = Array.from(evt.to.children).map(el => el.dataset.taskId);
    
            // fetch('/reorder-tasks', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ order })
            //   });

            const taskId = evt.item.dataset.taskId;
            const newSectionId = evt.to.closest(".section").dataset.sectionId;

            // ordre des tâches dans la nouvelle section
            const order = Array.from(evt.to.children).map(el => el.dataset.taskId);

            fetch("/task/move", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId: taskId,
                    newSectionId: newSectionId,
                    order: order
                })
            })
            .then(res => res.json())
            .then(data => {
                console.log("Task moved:", data);
            });

        }
    });
})

