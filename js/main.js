// ===== БУРГЕР-МЕНЮ =====
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');
const bars = document.querySelectorAll('.bar');

if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        
        // Анімація бургер-іконки (перетворення на хрестик)
        bars.forEach(bar => bar.classList.toggle('active'));
        
        // Блокування прокрутки body коли меню відкрите
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
}

// Закриття меню при кліку на посилання
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        bars.forEach(bar => bar.classList.remove('active'));
        document.body.style.overflow = '';
    });
});

// Закриття меню при кліку поза ним
document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && 
        !navMenu.contains(e.target) && 
        !mobileMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        bars.forEach(bar => bar.classList.remove('active'));
        document.body.style.overflow = '';
    }
});

// ===== ПЛАВНА ПОЯВА ЕЛЕМЕНТІВ ПРИ ПРОКРУЧУВАННІ =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Додаємо спостереження за картками, які ще не з'явилися
document.querySelectorAll('.card').forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
});

// ===== АКТИВНИЙ ПУНКТ МЕНЮ =====
const setActiveLink = () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        link.classList.remove('active');
        
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
};

setActiveLink();

// ===== ПЛАВНИЙ СКРОЛ ДО ЯКОРІВ =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== ДОДАВАННЯ КЛАСУ ПРИ СКРОЛІ ДЛЯ HEADER =====
const header = document.querySelector('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        // Скрол вниз
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        // Скрол вгору
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
});

// ===== ПЕРЕВІРКА ЗАВАНТАЖЕННЯ ЗОБРАЖЕНЬ =====
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        console.error(`Помилка завантаження зображення: ${this.src}`);
        // Можна додати запасне зображення
        this.src = 'https://via.placeholder.com/300x200?text=Image+not+found';
    });
});

// ===== ДОДАВАННЯ РОКУ В КОПІРАЙТ =====
const yearElement = document.querySelector('.footer-bottom p');
if (yearElement) {
    const currentYear = new Date().getFullYear();
    yearElement.innerHTML = yearElement.innerHTML.replace('2025', currentYear);
}

// ===== ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('ArtHub platform initialized successfully!');
    
    // Додавання класу для анімації hero-секції
    document.querySelector('.hero').classList.add('loaded');
});