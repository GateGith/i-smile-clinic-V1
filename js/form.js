(function() {
    'use strict';

    // === FORM VALIDATION UTILITIES ===
    const Validators = {
        required: (value) => {
            return value.trim().length > 0;
        },

        email: (value) => {
            const emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
            return emailRegex.test(value);
        },

        phone: (value) => {
            const phoneRegex = /^[ds+-()]{8,20}$/;
            return phoneRegex.test(value);
        },

        minLength: (value, min) => {
            return value.trim().length >= min;
        },

        maxLength: (value, max) => {
            return value.trim().length <= max;
        }
    };

    // === FORM HANDLER CLASS ===
    class FormHandler {
        constructor(formElement) {
            this.form = formElement;
            this.statusElement = formElement.querySelector('#formStatus');
            this.submitButton = formElement.querySelector('button[type="submit"]');
            this.isSubmitting = false;
            this.errors = new Map();
            
            this.init();
        }

        init() {
            this.addEventListeners();
            this.addAccessibility();
        }

        addEventListeners() {
            // Form submission
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            // Real-time validation on input
            const inputs = this.form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => {
                    if (this.errors.has(input.name)) {
                        this.clearError(input);
                    }
                });
            });
        }

        addAccessibility() {
            // Add aria attributes
            const inputs = this.form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                if (!input.id) {
                    input.id = `field-${Math.random().toString(36).substr(2, 9)}`;
                }
                
                const label = this.form.querySelector(`label[for="${input.id}"]`);
                if (label && !input.getAttribute('aria-labelledby')) {
                    input.setAttribute('aria-labelledby', label.id || label.htmlFor);
                }
                
                input.setAttribute('aria-invalid', 'false');
                input.setAttribute('aria-describedby', `${input.id}-error`);
            });
        }

        validateField(input) {
            const value = input.value.trim();
            const name = input.name;
            const isRequired = input.hasAttribute('required');
            const type = input.type;
            
            let isValid = true;
            let errorMessage = '';

            // Required validation
            if (isRequired && !Validators.required(value)) {
                isValid = false;
                errorMessage = 'Ce champ est obligatoire';
            }

            // Email validation
            if (isValid && type === 'email' && value) {
                if (!Validators.email(value)) {
                    isValid = false;
                    errorMessage = 'Veuillez entrer une adresse email valide';
                }
            }

            // Phone validation
            if (isValid && type === 'tel' && value) {
                if (!Validators.phone(value)) {
                    isValid = false;
                    errorMessage = 'Veuillez entrer un numéro de téléphone valide';
                }
            }

            // Min length validation
            const minLength = input.getAttribute('minlength');
            if (isValid && minLength && !Validators.minLength(value, parseInt(minLength))) {
                isValid = false;
                errorMessage = `Ce champ doit contenir au moins ${minLength} caractères`;
            }

            // Max length validation
            const maxLength = input.getAttribute('maxlength');
            if (isValid && maxLength && !Validators.maxLength(value, parseInt(maxLength))) {
                isValid = false;
                errorMessage = `Ce champ ne peut pas dépasser ${maxLength} caractères`;
            }

            if (!isValid) {
                this.showError(input, errorMessage);
                return false;
            } else {
                this.clearError(input);
                return true;
            }
        }

        validateForm() {
            const inputs = this.form.querySelectorAll('input, textarea');
            let isValid = true;

            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        showError(input, message) {
            const errorId = `${input.id}-error`;
            
            // Create or update error message
            let errorElement = document.getElementById(errorId);
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.id = errorId;
                errorElement.className = 'field-error';
                errorElement.setAttribute('role', 'alert');
                input.parentNode.appendChild(errorElement);
            }

            errorElement.textContent = message;
            errorElement.style.cssText = `
                color: #dc3545;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                font-weight: 500;
            `;

            // Update input state
            input.setAttribute('aria-invalid', 'true');
            input.style.borderColor = '#dc3545';
            input.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.15)';

            this.errors.set(input.name, { input, message });
        }

        clearError(input) {
            const errorId = `${input.id}-error`;
            const errorElement = document.getElementById(errorId);
            
            if (errorElement) {
                errorElement.remove();
            }

            input.setAttribute('aria-invalid', 'false');
            input.style.borderColor = '';
            input.style.boxShadow = '';

            this.errors.delete(input.name);
        }

        clearAllErrors() {
            const errorElements = this.form.querySelectorAll('.field-error');
            errorElements.forEach(el => el.remove());

            const inputs = this.form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.setAttribute('aria-invalid', 'false');
                input.style.borderColor = '';
                input.style.boxShadow = '';
            });

            this.errors.clear();
        }

        async handleSubmit(e) {
            e.preventDefault();

            if (this.isSubmitting) return;

            // Validate form
            if (!this.validateForm()) {
                this.updateStatus('Veuillez corriger les erreurs ci-dessus', 'error');
                // Focus first invalid field
                const firstError = this.form.querySelector('[aria-invalid="true"]');
                if (firstError) {
                    firstError.focus();
                }
                return;
            }

            // Spam prevention: check honeypot
            const honeypot = this.form.querySelector('input[name="_gotcha"]');
            if (honeypot && honeypot.value) {
                console.warn('Spam detected');
                return;
            }

            // Submit form
            this.isSubmitting = true;
            this.setLoadingState(true);
            this.clearAllErrors();

            try {
                const formData = new FormData(this.form);
                const response = await fetch(this.form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (response.ok) {
                    this.updateStatus('Merci ! Votre message a été envoyé avec succès.', 'success');
                    this.form.reset();
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Une erreur est survenue');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                this.updateStatus(error.message || 'Une erreur est survenue. Veuillez réessayer.', 'error');
            } finally {
                this.isSubmitting = false;
                this.setLoadingState(false);
            }
        }

        setLoadingState(isLoading) {
            if (this.submitButton) {
                this.submitButton.disabled = isLoading;
                this.submitButton.style.opacity = isLoading ? '0.7' : '1';
                this.submitButton.style.cursor = isLoading ? 'not-allowed' : 'pointer';
                
                if (isLoading) {
                    this.submitButton.dataset.originalText = this.submitButton.textContent;
                    this.submitButton.textContent = 'Envoi en cours...';
                } else {
                    this.submitButton.textContent = this.submitButton.dataset.originalText || 'Envoyer';
                }
            }
        }

        updateStatus(message, type) {
            if (!this.statusElement) return;

            this.statusElement.textContent = message;
            this.statusElement.className = 'form-status';
            this.statusElement.setAttribute('role', 'alert');
            this.statusElement.setAttribute('aria-live', 'polite');

            if (type === 'success') {
                this.statusElement.classList.add('success');
                this.statusElement.style.cssText = `
                    background: #d4edda;
                    color: #155724;
                    padding: 12px;
                    border-radius: 8px;
                    margin-top: 16px;
                    font-weight: 500;
                    text-align: center;
                `;
            } else if (type === 'error') {
                this.statusElement.classList.add('error');
                this.statusElement.style.cssText = `
                    background: #f8d7da;
                    color: #721c24;
                    padding: 12px;
                    border-radius: 8px;
                    margin-top: 16px;
                    font-weight: 500;
                    text-align: center;
                `;
            } else {
                this.statusElement.style.cssText = `
                    background: #fff3cd;
                    color: #856404;
                    padding: 12px;
                    border-radius: 8px;
                    margin-top: 16px;
                    font-weight: 500;
                    text-align: center;
                `;
            }

            // Auto-hide success message after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    this.statusElement.textContent = '';
                    this.statusElement.className = 'form-status';
                }, 5000);
            }
        }
    }

    // === INITIALIZE ALL FORMS ===
    function initForms() {
        const forms = document.querySelectorAll('form[action*="formspree"]');
        
        forms.forEach(form => {
            new FormHandler(form);
        });
    }

    // === CONTACT FORM SPECIFIC ===
    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        // Add visual feedback for valid/invalid fields
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('valid', () => {
                input.style.borderColor = '#28a745';
                input.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.15)';
            });

            input.addEventListener('invalid', () => {
                input.style.borderColor = '#dc3545';
                input.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.15)';
            });
        });
    }

    // === SPAM PREVENTION ===
    function initSpamPrevention() {
        // Add honeypot field if not present
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            let honeypot = form.querySelector('input[name="_gotcha"]');
            if (!honeypot) {
                honeypot = document.createElement('input');
                honeypot.type = 'text';
                honeypot.name = '_gotcha';
                honeypot.className = 'form-gotcha';
                honeypot.tabIndex = -1;
                honeypot.autocomplete = 'off';
                honeypot.setAttribute('aria-hidden', 'true');
                honeypot.style.cssText = 'position:absolute;left:-9999px;';
                form.insertBefore(honeypot, form.firstChild);
            }
        });
    }

    // === INITIALIZE ON DOM READY ===
    document.addEventListener('DOMContentLoaded', () => {
        initForms();
        initContactForm();
        initSpamPrevention();
    });

    // Expose classes and functions globally if needed
    window.FormUtils = {
        FormHandler,
        Validators,
        initForms,
        initContactForm,
        initSpamPrevention
    };

})();
