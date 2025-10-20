(function() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const notesInput = document.getElementById('notes');
    
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const notesError = document.getElementById('notesError');
    const formStatus = document.getElementById('formStatus');

    function validateName(value) {
        value = value.trim();
        
        if (!value) {
            return 'Имя обязательно для заполнения';
        }
        
        if (value.length < 2) {
            return 'Имя должно содержать минимум 2 символа';
        }
        
        if (value.length > 50) {
            return 'Имя слишком длинное (макс. 50 символов)';
        }
        
        return '';
    }

    function validateEmail(value) {
        value = value.trim();
        
        if (!value) {
            return 'Email обязателен для заполнения';
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(value)) {
            return 'Введите корректный email адрес';
        }
        
        if (value.length > 100) {
            return 'Email слишком длинный';
        }
        
        return '';
    }

    function validateNotes(value) {
        value = value.trim();
        
        if (!value) {
            return 'Сообщение обязательно для заполнения';
        }
        
        if (value.length < 10) {
            return 'Сообщение должно содержать минимум 10 символов';
        }
        
        if (value.length > 1000) {
            return 'Сообщение слишком длинное (макс. 1000 символов)';
        }
        
        return '';
    }

    function showError(element, message) {
        element.textContent = message;
        element.style.display = message ? 'block' : 'none';
        element.previousElementSibling.classList.toggle('form__input--error', !!message);
    }

    function clearError(element) {
        showError(element, '');
    }

    nameInput.addEventListener('blur', function() {
        const error = validateName(this.value);
        showError(nameError, error);
    });

    emailInput.addEventListener('blur', function() {
        const error = validateEmail(this.value);
        showError(emailError, error);
    });

    notesInput.addEventListener('blur', function() {
        const error = validateNotes(this.value);
        showError(notesError, error);
    });

    nameInput.addEventListener('input', function() {
        if (nameError.textContent) {
            clearError(nameError);
        }
    });

    emailInput.addEventListener('input', function() {
        if (emailError.textContent) {
            clearError(emailError);
        }
    });

    notesInput.addEventListener('input', function() {
        if (notesError.textContent) {
            clearError(notesError);
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const nameErrorMsg = validateName(nameInput.value);
        const emailErrorMsg = validateEmail(emailInput.value);
        const notesErrorMsg = validateNotes(notesInput.value);

        showError(nameError, nameErrorMsg);
        showError(emailError, emailErrorMsg);
        showError(notesError, notesErrorMsg);

        if (nameErrorMsg || emailErrorMsg || notesErrorMsg) {
            formStatus.textContent = 'Пожалуйста, исправьте ошибки в форме';
            formStatus.className = 'form__status form__status--error';
            formStatus.style.display = 'block';
            return;
        }

        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            notes: notesInput.value.trim(),
            timestamp: new Date().toISOString()
        };

        submitForm(formData);
    });

    function submitForm(data) {
        const submitBtn = form.querySelector('.button--submit');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        formStatus.textContent = 'Отправка сообщения...';
        formStatus.className = 'form__status';
        formStatus.style.display = 'block';

        setTimeout(function() {
            console.log('Form submission:', data);
            
            formStatus.textContent = '✓ Сообщение отправлено! Мяу, спасибо за обращение!';
            formStatus.className = 'form__status form__status--success';
            
            form.reset();
            
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            setTimeout(function() {
                formStatus.style.display = 'none';
            }, 5000);
        }, 2000);
    }
})();