const { showPopup, hidePopup, sanitizeInput, treatFormAlert, showSuccessAlert, initRadioBtnsEvent } = require("../app");;


const sectionsList = document.getElementById('sections');
const projectId = sectionsList.dataset.projectId;

if (sectionsList) {
    new Sortable(sectionsList, {
        animation: 150,
        handle: '.header', // <-- le drag se fait uniquement via .header
        onEnd: function (evt) {
            const order = Array.from(sectionsList.children)
                .map(el => el.dataset.sectionId);
            order.pop();

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

if (window.innerWidth < 512) {
    const sectionHeaders = sectionsList.querySelectorAll('.header');
    let isLongPress = false;
    let longPressTimer = null;

    // Durée pour considérer un "appui long" (en ms)
    const LONG_PRESS_DURATION = 400;

    sectionHeaders.forEach(header => {
        header.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                isLongPress = true;
                // document.body.classList.add('reorder-mode');
                // désactive le scroll carrousel pendant le mode réorder
                sectionsList.style.scrollSnapType = 'none';
                sectionsList.style.gap = "0px";

                // effet visuel sur les sections
                sectionsList.querySelectorAll('.section').forEach(section => {
                    section.classList.add('zoom-out');
                    // section.style.scale= 0.5;
                    // section.style.marginRight= '-40%';
                    
                });
            }, LONG_PRESS_DURATION);
        });

        header.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
            if (isLongPress) {
                isLongPress = false;
                // quand l’utilisateur relâche : on désactive le mode reorder
                // document.body.classList.remove('reorder-mode');
                sectionsList.style.scrollSnapType = 'x mandatory';
                sectionsList.style.gap = "10px";
                sectionsList.querySelectorAll('.section').forEach(section => {
                    section.classList.remove('zoom-out');
                    section.style.scale = "unset";
                    // section.style.marginRight= '0px';
                    // section.style.minWidth= '100%';
                });
            }
        });

        header.addEventListener('touchmove', (e) => {
            // Si l'utilisateur commence à glisser avant la fin de l'appui long, on annule
            clearTimeout(longPressTimer);
        });
    });

}

const deleteSectionPopup = document.querySelector('#delete-section-popup');
const deleteSectionBtn = deleteSectionPopup.querySelector('.delete-section-btn');
const hideDeleteSectionPopup = deleteSectionPopup.querySelector('.hide-popup-btn');

hideDeleteSectionPopup.addEventListener('click', () => hidePopup(deleteSectionPopup));

deleteSectionBtn.addEventListener('click', function() {
    const currentSectionId = deleteSectionPopup.dataset.sectionId;

    fetch('/delete-section/' + currentSectionId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest', // pour détecter l'AJAX côté Symfony
        },
    })
    .then(response => response.json())
    .then(data => {
        hidePopup(deleteSectionPopup);

        document.querySelector(`[data-section-id="${currentSectionId}"]`).remove();
    })
    .catch(error => console.error("Erreur fetch:", error));
})


initSectionEvents();

function initSectionEvents() {
    const sections = document.querySelectorAll('.section');

    sections.forEach(section => {
        if (section.classList.contains('add-section')) {
            return;
        }
        const header = section.querySelector('.header');
        const showDeleteSectionPopupBtn = header.querySelector('.show-delete-section-popup-btn');
        
        if (section.dataset.initialized === "true") return;

        header.addEventListener('mouseover', function(e) {
            e.preventDefault();
            showDeleteSectionPopupBtn.style.display = "block";

            deleteSectionPopup.dataset.sectionId = section.dataset.sectionId;

        })

        header.addEventListener('mouseout', function() {
            showDeleteSectionPopupBtn.style.display = "none";
        })

        
        showDeleteSectionPopupBtn.addEventListener('click', function()  {
            showPopup(deleteSectionPopup, 'flex');
            deleteSectionPopup.dataset.sectionId = section.dataset.sectionId;
        })

        section.dataset.initialized = "true";
    })
}





const addTaskPopup = document.getElementById('add-task-popup');
const addTaskBtn = addTaskPopup.querySelector('.add-task-btn');
const addTaskInput = addTaskPopup.querySelector('input');
const hideAddTaskPopupBtn = addTaskPopup.querySelector('.close-popup-btn');


// const tasksList = myTasksSection.querySelector(".tasks");

const currentProjectId = document.querySelector('.sections').dataset.projectId;
let currentSectionId;

initShowAddTaskPopupBtns();
function initShowAddTaskPopupBtns() {
    const profilShowAddTaskPopupBtns = document.querySelectorAll(".show-add-task-popup-btn");


    profilShowAddTaskPopupBtns.forEach(btn => {
        if (btn.dataset.initialized === "true") return;

        btn.addEventListener('click', function(e) {
            e.preventDefault();

            
            showPopup(addTaskPopup, 'flex');
    
            currentSectionId =  btn.dataset.sectionId;
    
            addTaskBtn.classList.add('inactive');
        })

        btn.dataset.initialized = "true";
    })
}

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
                addChecklistOnFront(check.content, check.position, check.isDone);
                
            })
        }
        initChecklistEvents();

        if (descriptionInput.dataset.initialized !== "true") {

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

            descriptionInput.dataset.initialized = "true";

        }
        

        
        showPopup(taskPopup, 'flex');

    })
    .catch(error => console.error("Erreur fetch:", error));
}

function initTaskEvent(taskNode) {

    taskNode.addEventListener('click', () => initTaskDataAndShowPopup(taskNode.dataset.taskId));
    
    const sectionHeaders = sectionsList.querySelectorAll('.header');
    let isLongPress = false;
    let longPressTimer = null;

    // Durée pour considérer un "appui long" (en ms)
    const LONG_PRESS_DURATION = 400;
    taskNode.addEventListener('touchstart', (e) => {
        longPressTimer = setTimeout(() => {

            isLongPress = true;
            // document.body.classList.add('reorder-mode');
            // désactive le scroll carrousel pendant le mode réorder
            sectionsList.style.scrollSnapType = 'none';
            sectionsList.style.gap = "0px";

            // effet visuel sur les sections
            sectionsList.querySelectorAll('.section').forEach(section => {
                section.classList.add('zoom-out');
                // section.style.scale= 0.5;
                // section.style.marginRight= '-40%';
                
            });
        }, LONG_PRESS_DURATION);
    });

    taskNode.addEventListener('touchend', () => {
        clearTimeout(longPressTimer);
        if (isLongPress) {
            isLongPress = false;
            // quand l’utilisateur relâche : on désactive le mode reorder
            // document.body.classList.remove('reorder-mode');
            sectionsList.style.scrollSnapType = 'x mandatory';
            sectionsList.style.gap = "10px";
            sectionsList.querySelectorAll('.section').forEach(section => {
                section.classList.remove('zoom-out');
                section.style.scale = "unset";
                // section.style.marginRight= '0px';
                // section.style.minWidth= '100%';
            });
        }
    });

    taskNode.addEventListener('touchmove', (e) => {
        // Si l'utilisateur commence à glisser avant la fin de l'appui long, on annule
        clearTimeout(longPressTimer);
    });
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

    // checklistList.querySelectorAll('.radio-icon').forEach(radio => {
        
    // })

    // checklistList.querySelectorAll('span').forEach(span => {
        
    // })

    checklistList.querySelectorAll('.checklist').forEach(check => {

        if (check.dataset.initialized == 'true') {
            return;
        }

        check.addEventListener('mouseover', function() {
            check.querySelector('.delete-check-btn').style.display = "block";
        })

        check.addEventListener('mouseout', function() {
            check.querySelector('.delete-check-btn').style.display = "none";
        })

        check.querySelector('.delete-check-btn').addEventListener('click', function() {
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

        const span = check.querySelector('span');
        const radio = check.querySelector('.radio-icon');

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

        radio.addEventListener('click', function() {
            let isItemDone = false;
            const currentItemPosition = radio.closest('.checklist').dataset.checklistPosition;

            if (radio.querySelector('.selected').style.display !== "none") {
                radio.nextElementSibling.style.textDecoration = 'line-through';

                // fetch update statut check
                isItemDone = true;
            } else {
                radio.nextElementSibling.style.textDecoration = 'unset';
            }

            fetch(`/task/${taskId}/checklist/update-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    itemPosition : currentItemPosition,
                    isDone : isItemDone
                })
            })
            .then(res => res.json())
            .then(data => {
                // console.log(data.item);
            })
            .catch(err => console.error('Erreur mise à jour statut checklist:', err));
        })

        check.dataset.initialized == 'true'



    })

    
 
}

function addChecklistOnFront(text, position, isDone) {
    let spanDecoration = '';
    let innerRadioStyle = "none";

    if (isDone) {
        spanDecoration = `text-decoration: line-through;"`;
        innerRadioStyle = 'block';
    }
    const checklistHTML = `
        <div class="checklist" data-checklist-position=${position}>
            <div class="left">
                <div class="radio-icon">
                    <div class="selected" style="display:${innerRadioStyle}"></div>
                </div>
                <span style="${spanDecoration}" >${text}</span>
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

        const currentTaskNode = document.querySelector(`[data-task-id="${taskPopup.dataset.taskId}"]`);

        const currentTaskList = currentTaskNode.closest('.tasks-list');

        if (currentTaskList.children.length == 1 ) {
            const emptyListMessage = document.createElement('span');
            emptyListMessage.classList.add(
                'empty-tasks-message',
                'text-center',
                'opacity-50',
                'w-100');
            emptyListMessage.dataset.taskId = "0";

            emptyListMessage.innerText = "Aucune tâche pour cette section";

            currentTaskList.appendChild(emptyListMessage);

        }

        currentTaskNode.remove();

        

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

const showAddSectionPopupBtn = document.getElementById("show-add-section-popup-btn");
const addSectionPopup = document.getElementById("add-section-popup");
const addSectionIconsBtns = addSectionPopup.querySelectorAll('.icon');
const addSectionColorsBtns = addSectionPopup.querySelectorAll('.color');
const addSectionInputs = addSectionPopup.querySelectorAll('input');
const addSectionBtn = addSectionPopup.querySelector('.add-section-btn');
const hideAddSectionPopupBtn = addSectionPopup.querySelector('.close-popup-btn');

showAddSectionPopupBtn.addEventListener('click', () => showPopup(addSectionPopup, 'flex'));

hideAddSectionPopupBtn.addEventListener('click', ()=> hidePopup(addSectionPopup));

addSectionIconsBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        addSectionIconsBtns.forEach(btn => btn.classList.remove('selected'));
        btn.classList.toggle('selected');

        const hiddenInput = addSectionPopup.querySelector('input[name="icon"');

        if (hiddenInput) {
            hiddenInput.value = btn.id;
            hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    })
})

addSectionColorsBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        addSectionColorsBtns.forEach(btn => btn.classList.remove('selected'));
        btn.classList.toggle('selected');

        const hiddenInput = addSectionPopup.querySelector('input[name="color"');

        if (hiddenInput) {
            hiddenInput.value = btn.id;
            hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    })
})

addSectionInputs.forEach(input => {
    input.addEventListener('input', function() {
        let allFilled = true;

        addSectionInputs.forEach(input => {
            if (input.value == "") {
                allFilled = false;
            }
        })

        if (allFilled) {
            addSectionBtn.classList.remove('inactive');
        }

    })
})

addSectionBtn.addEventListener('click', function() {
    const title = addSectionPopup.querySelector('input[name="title"]').value.trim();
    const icon = addSectionPopup.querySelector('input[name="icon"]').value.trim();
    const color = addSectionPopup.querySelector('input[name="color"]').value.trim();

    if (!title || !icon || !color) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    fetch(`/project/${projectId}/add-section`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
            title: title,
            icon: icon,
            color: color,
            projectId: projectId
        })
    })
    .then(res => res.json())
    .then(data => {
            console.log("Nouvelle section créée :", data.section);

            
            const newSectionIconSvg = data.section.icon.svg;
            const newSectionIcon = document.createRange().createContextualFragment(newSectionIconSvg).firstChild;
            newSectionIcon.classList.add('icon');
            newSectionIcon.style.color = data.section.color.textColor;

            const trashIconSvg = data.section.trashIcon.svg;
            const trashIcon = document.createRange().createContextualFragment(trashIconSvg).firstChild;
            trashIcon.classList.add('show-delete-section-popup-btn');
            trashIcon.classList.add('trash-icon');
            trashIcon.style.display = "none";
            

            const sectionHtml = `
                <div data-section-id="${data.section.id}" class="section">
                    <div class="header" style="background-color: ${data.section.color.hex}">
                        <div class="left">
                            ${newSectionIcon.outerHTML}
                            <h2 style="color: ${data.section.color.textColor}">${data.section.title}</h2>
                        </div>
                        ${trashIcon.outerHTML}
                    </div>

                    <div class="tasks">
                        <div class="tasks-list">    
                            <span class="empty-tasks-message text-center opacity-50 w-100" data-task-id="0">
                                Aucune tâche pour cette section
                            </span>
                        </div>
                        
                        <button class="tasks-btn show-add-task-popup-btn btn outline-dotted" data-section-id="${data.section.id}">
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/></svg>
                            Ajouter
                        </button>
                    </div>
                </div>
            `;

            

            
            // sectionsList.insertAdjacentHTML('beforeend', sectionHtml);
            const lastDiv = sectionsList.querySelector(".add-section");
            lastDiv.insertAdjacentHTML("beforebegin", sectionHtml);

            addSectionInputs.forEach(input => input.value = "");

            initShowAddTaskPopupBtns();
            initSectionEvents();
            hidePopup(addSectionPopup);
            
            // 👉 Tu pourrais ici injecter directement la section dans ton DOM
            // par exemple, rajouter un <div class="section">... </div>
            // scroller  vers la nouvelle section ajouté
    })
    .catch(error => console.error("Erreur fetch:", error));
})

