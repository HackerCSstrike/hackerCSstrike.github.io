// ============================================
// ИНИЦИАЛИЗАЦИЯ И УТИЛИТЫ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initScrollButtons();
    initFormValidation();
    initScrollAnimations();
    initAnalytics();
});

// ============================================
// КНОПКИ ПРОКРУТКИ
// ============================================
function initScrollButtons() {
    const scrollButtons = document.querySelectorAll('[data-action]');
    scrollButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action');
            if (action === 'scroll-to-form') {
                scrollToElement('consultation');
                trackEvent('button_click', { button: 'scroll_to_form' });
            } else if (action === 'scroll-to-about') {
                scrollToElement('targets');
                trackEvent('button_click', { button: 'scroll_to_about' });
            }
        });
    });
}

function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    }
}

// ============================================
// ВАЛИДАЦИЯ ФОРМЫ
// ============================================
function initFormValidation() {
    const form = document.getElementById('consultation-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select');

    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm(this)) {
            submitForm(this);
        }
    });
}

function validateField(field) {
    const fieldName = field.name;
    const fieldValue = field.value.trim();
    const errorElement = document.querySelector(`[data-field="${fieldName}"]`);
    let isValid = true;
    let errorMessage = '';

    if (!fieldValue) {
        isValid = false;
        errorMessage = 'Это поле обязательно';
    }

    if (fieldName === 'name' && fieldValue) {
        if (fieldValue.length < 2) {
            isValid = false;
            errorMessage = 'Имя должно содержать минимум 2 символа';
        }
    }

    if (fieldName === 'contact' && fieldValue) {
        const telegramRegex = /^@[\w]{5,32}$/;
        const vkRegex = /^(https?:\/\/)?(www\.)?vk\.com\/[\w.]+$/;
        const phoneRegex = /^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
        if (!telegramRegex.test(fieldValue) && !vkRegex.test(fieldValue) && !phoneRegex.test(fieldValue)) {
            isValid = false;
            errorMessage = 'Введите корректный контакт (Telegram, VK или телефон)';
        }
    }

    if (isValid) {
        field.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    } else {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    }
    return isValid;
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input, select');
    let isFormValid = true;
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    return isFormValid;
}

function submitForm(form) {
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        grade: formData.get('grade'),
        subject: formData.get('subject'),
        goal: formData.get('goal'),
        contact: formData.get('contact'),
        timestamp: new Date().toISOString()
    };

    trackEvent('form_submit', { grade: data.grade, subject: data.subject, goal: data.goal });

    showFormSuccess(form);
    console.log('Form submitted:', data);
}

function showFormSuccess(form) {
    const successMessage = document.getElementById('form-success');
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.style.display = 'none';
    successMessage.style.display = 'block';
    form.reset();
    setTimeout(() => {
        submitButton.style.display = 'block';
        successMessage.style.display = 'none';
    }, 5000);
}

// ============================================
// АНИМАЦИИ ПРИ ПРОКРУТКЕ
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const cards = document.querySelectorAll(
        '.target-card, .subject-card, .process__step, .advantage-item, .format-card'
    );
    cards.forEach(card => {
        observer.observe(card);
    });
}

// ============================================
// АНАЛИТИКА
// ============================================
function initAnalytics() {
    trackPageView();
    trackLinkClicks();
}

function trackPageView() {
    if (typeof ym !== 'undefined') {
        ym(window.yaMetrikaId, 'hit', window.location.href);
    }
    if (typeof VK !== 'undefined' && VK.Retargeting) {
        VK.Retargeting.Event('PageView');
    }
    console.log('Page view tracked');
}

function trackEvent(eventName, eventData = {}) {
    if (typeof ym !== 'undefined') {
        ym(window.yaMetrikaId, 'reachGoal', eventName, eventData);
    }
    if (typeof VK !== 'undefined' && VK.Retargeting) {
        VK.Retargeting.Event(eventName, eventData);
    }
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    console.log(`Event tracked: ${eventName}`, eventData);
}

function trackLinkClicks() {
    const links = document.querySelectorAll('a[href^="https://t.me/"], a[href^="https://vk.com/"]');
    links.forEach(link => {
        link.addEventListener('click', function() {
            const platform = this.href.includes('t.me') ? 'telegram' : 'vk';
            trackEvent('social_link_click', { platform: platform });
        });
    });
}

// ============================================
// УТИЛИТЫ
// ============================================
async function sendToServer(endpoint, data) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error sending data:', error);
        throw error;
    }
}

function getUrlParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function setUtmParameters() {
    const utmSource = getUrlParameter('utm_source');
    const utmMedium = getUrlParameter('utm_medium');
    const utmCampaign = getUrlParameter('utm_campaign');
    if (utmSource || utmMedium || utmCampaign) {
        console.log('UTM Parameters:', { source: utmSource, medium: utmMedium, campaign: utmCampaign });
        localStorage.setItem('utm_source', utmSource || '');
        localStorage.setItem('utm_medium', utmMedium || '');
        localStorage.setItem('utm_campaign', utmCampaign || '');
    }
}

setUtmParameters();
