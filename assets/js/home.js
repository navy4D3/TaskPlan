

const cguCheckIcon =  document.getElementById('cgu-check-icon');
const cguUncheckIcon =  document.getElementById('cgu-uncheck-icon');
const cguCheckboxInput = document.getElementById('registration_form_agreeTerms');
const emailInputRegister = document.getElementById('registration_form_email');
const passwordInputRegister = document.getElementById('registration_form_password_first');
const confirmPasswordInput = document.getElementById('registration_form_password_second');

const registerForm = document.querySelector('.register-form');
const submitRegisterFormBtn = registerForm.querySelector('.submit');

const loginForm = document.getElementById('login-form');

const queryString = window.location.search;

// Crée un objet URLSearchParams
const loginError = document.getElementById('login-error');

const loginLabel = document.getElementById('login-label');
const registerLabel = document.getElementById('register-label');

if (loginError) {
    loginForm.style.display = "flex";
    registerForm.style.display = "none";

    registerLabel.classList.remove('selected');
    loginLabel.classList.add('selected');
}

if (cguUncheckIcon) {
    cguUncheckIcon.addEventListener('click', function() {
        
        cguUncheckIcon.style.display="none";
        cguCheckIcon.style.display="block";
        cguCheckboxInput.checked =  true;
        submitRegisterFormBtn.classList.remove('inactive');

        // checkRegisterFormValidity(registerForm,passwordInputRegister, confirmPasswordInput, emailInputRegister, cguCheckboxInput);
        
    })
    cguCheckIcon.addEventListener('click', function() {
        
        cguCheckIcon.style.display="none";
        cguUncheckIcon.style.display="block";
        cguCheckboxInput.checked =  false;
        submitRegisterFormBtn.classList.add('inactive');
        // checkRegisterFormValidity(registerForm,passwordInputRegister, confirmPasswordInput, emailInputRegister, cguCheckboxInput);

    })
}



loginLabel.addEventListener('click', function() {
    registerForm.style.display = "none";
    loginForm.style.display = "flex";

    if (window.innerWidth < 512) {
        loginForm.style.borderRadius = "20px";
    } else {
        // loginForm.style.borderRadius = "30px 0px 30px 30px";
    }
    
    registerLabel.classList.remove('selected');
    loginLabel.classList.add('selected');
    
})

registerLabel.addEventListener('click', function() {
    registerForm.style.display = "flex";
    loginForm.style.display = "none";

    if (window.innerWidth < 512) {
        loginForm.style.borderRadius = "20px";
    } else {
        // registerForm.style.borderRadius = "0px 30px 30px 30px";
    }
    
    registerLabel.classList.add('selected');
    loginLabel.classList.remove('selected');
    
})

const boostProductivityBtn = document.getElementById("boost-productivity-btn");

boostProductivityBtn.addEventListener('click', function() {
    
    document.querySelector('.register-login-section').scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
})






