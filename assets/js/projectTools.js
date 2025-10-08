import { showPopup } from "../app";


export function initProjectEvents(projectNode) {
    const currentDeleteProjectBtn = projectNode.querySelector('.show-delete-project-popup-btn');
    const deleteProjectPopup = document.getElementById('delete-project-popup');

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