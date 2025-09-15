
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
