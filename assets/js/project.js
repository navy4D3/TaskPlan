const { showPopup, hidePopup, sanitizeInput, treatFormAlert, showSuccessAlert, initRadioBtnsEvent } = require("../app");

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
                // .then(data => console.log('Sections réordonnées', data));
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
        const descriptionInput = taskPopup.querySelector('.description');
        descriptionInput.value = data.description;
        taskPopup.dataset.taskId = data.id;

        const previousChecks = taskPopup.querySelectorAll('.checklist');

        previousChecks.forEach(check => check.remove());

        if (data.checklist.items !== undefined) {
            data.checklist.items.forEach(check => {
                addChecklistOnFront(check.content, check.position);
                
            })
        }
        initChecklistEvents();

        descriptionInput.addEventListener('blur', function() {
            
            fetch(`/task/${taskId}/update-description`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest', // pour détecter l'AJAX côté Symfony
                },
                body: JSON.stringify({ description: descriptionInput.value })
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data.message)
            })
            .catch(error => console.error("Erreur fetch:", error));
        })

        
        showPopup(taskPopup, 'flex');

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

            addChecklistOnFront(text, data.items[data.items.length - 1].position);
            initChecklistEvents();
    
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

function initChecklistEvents() {
    const taskId = taskPopup.dataset.taskId;

    new Sortable(checklistList, {
        animation: 150,
        filter: '.radio-icon, span',
        // handle: '.checklist', // <-- le drag se fait uniquement via .header
        onEnd: function (evt) {
            const order = Array.from(checklistList.children)
                .map(el => el.dataset.checklistPosition);
            

            // Envoi AJAX vers Symfony pour sauvegarder l'ordre
            fetch(`/task/${taskId}/checklist/reorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ order })
            }).then(res => res.json())
                // .then(data => console.log('Sections réordonnées', data));
        }
    });

    initRadioBtnsEvent();

    checklistList.querySelectorAll('span').forEach(span => {
        span.addEventListener('click',function(e) {
            e.preventDefault();

            const oldValue = span.innerText;
            const checklistDiv = span.closest('.checklist');
            const taskId = taskPopup.dataset.taskId;
            const checklistPosition = checklistDiv.dataset.checklistPosition; 

            const input = document.createElement('input');
            input.type = 'text';
            input.value = oldValue;
            checklistDiv.classList.add('add-checklist-input');
            checklistDiv.classList.remove('checklist');

            span.replaceWith(input);
            input.focus();

            const save = () => {
                const newValue = input.value.trim();
                const newSpan = document.createElement('span');
                newSpan.textContent = newValue || oldValue; // garde l'ancien texte si vide

                // Remplace l'input par le span
                input.replaceWith(newSpan);

                if (newValue && newValue !== oldValue) {
                    // Requête AJAX
                    fetch(`/task/${taskId}/checklist/update-item`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({
                            checklistPosition: checklistPosition,
                            content: newValue
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        console.log("Checklist mise à jour", data);
                        initChecklistEvents();
                    });
                }

                checklistDiv.classList.remove('add-checklist-input');
                checklistDiv.classList.add('checklist');
            };

            input.addEventListener('blur', save);
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    save();
                }
            });

        });
    })

    checklistList.querySelectorAll('.checklist').forEach(check => {
        check.addEventListener('mouseover', function() {
            check.querySelector('.delete-check-btn').style.display = "block";
        })

        check.addEventListener('mouseout', function() {
            check.querySelector('.delete-check-btn').style.display = "none";
        })

    })

    checklistList.querySelectorAll('.delete-check-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = btn.closest('.checklist');
            const itemPosition = item.dataset.checklistPosition;

            fetch(`/task/${taskId}/checklist/remove-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ itemPosition })
            }).then(res => res.json())
            .then(data => {
                item.remove();
            })
            .catch(err => console.error('Erreur suppression checklist:', err));
        })

    })
 
}

function addChecklistOnFront(text, position) {
    const checklistHTML = `
        <div class="checklist" data-checklist-position=${position}>
            <div class="left">
                <div class="radio-icon">
                    <div class="selected" style="display:none"></div>
                </div>
                <span>${text}</span>
            </div>
            <svg class="delete-check-btn" style="display:none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>

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


            const taskId = evt.item.dataset.taskId;

            const oldSectionId = evt.from.closest(".section").dataset.sectionId;
            const oldSection = document.querySelector(`[data-section-id="${oldSectionId}"]`)
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

                const emptyMessage = document.querySelector(`[data-section-id="${newSectionId}"]`).querySelector(".empty-tasks-message");
                
                if (emptyMessage) {
                    emptyMessage.remove();
                }

                if (oldSection.querySelector('.tasks-list').childElementCount == 0) {
                    const emptyMessageHTML = `
                        <span class="empty-tasks-message text-center opacity-50 w-100" data-task-id="0">Aucune tâche pour cette section</span>
                    `;

                    // Insère juste avant l'input
                    oldSection.querySelector('.tasks-list').insertAdjacentHTML("afterbegin", emptyMessageHTML); 
                }
            });

        }
    });
})

