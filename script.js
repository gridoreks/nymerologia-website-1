// Конфигурация каруселей
const CAROUSEL_CONFIG = {
    certificates: {
        pattern: 'certificate',
        maxFiles: 50,
        extensions: ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']
    },
    bracelets: {
        pattern: 'bracelet',
        maxFiles: 50,
        extensions: ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']
    },
    reviews: {
        pattern: 'review',
        maxFiles: 50,
        extensions: ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']
    }
};

// Объекты каруселей
let carousels = {
    certificates: null,
    bracelets: null,
    reviews: null
};

// Проверка существования изображения
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Поиск доступных изображений для карусели
async function findAvailableImages(type) {
    const config = CAROUSEL_CONFIG[type];
    const images = [];
    
    console.log(`Поиск изображений для: ${type}`);
    
    // Проверяем файлы от 1 до maxFiles
    for (let i = 1; i <= config.maxFiles; i++) {
        let found = false;
        
        // Проверяем все возможные расширения
        for (const ext of config.extensions) {
            const imageName = `${config.pattern}${i}${ext}`;
            const imageUrl = `Images/${imageName}`;
            
            try {
                const exists = await checkImageExists(imageUrl);
                if (exists) {
                    images.push({
                        name: imageName,
                        url: imageUrl,
                        index: i
                    });
                    console.log(`✓ Найден файл: ${imageName}`);
                    found = true;
                    break; // Нашли с этим расширением, переходим к следующему номеру
                }
            } catch (error) {
                console.warn(`Ошибка при проверке файла ${imageName}:`, error);
            }
        }
        
        // Если после проверки всех расширений файл не найден, останавливаем поиск
        // (предполагаем, что файлы идут по порядку без пропусков)
        if (!found && i > 1) {
            console.log(`Файл ${config.pattern}${i} не найден, прекращаем поиск`);
            break;
        }
    }
    
    console.log(`Для ${type} найдено ${images.length} изображений`);
    return images;
}

// Создание карусели
async function createCarousel(type, images) {
    const carouselElement = document.getElementById(`${type}-carousel`);
    const innerElement = document.getElementById(`${type}-inner`);
    const controlsElement = document.getElementById(`${type}-controls`);
    const loadingElement = document.getElementById(`${type}-loading`);
    
    if (!carouselElement || !innerElement) {
        console.error(`Не найден элемент карусели: ${type}`);
        return null;
    }
    
    // Очищаем содержимое
    innerElement.innerHTML = '';
    if (controlsElement) controlsElement.innerHTML = '';
    
    // Если нет изображений, показываем сообщение
    if (!images || images.length === 0) {
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div class="no-images-message">
                    <i class="fas fa-image"></i>
                    <h3>Изображения скоро будут добавлены</h3>
                    <p>${type === 'certificates' ? 'Сертификаты' : 
                        type === 'bracelets' ? 'Браслеты' : 'Отзывы'} 
                        появятся здесь в ближайшее время</p>
                </div>
            `;
        }
        return null;
    }
    
    // Скрываем индикатор загрузки и показываем карусель
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    carouselElement.style.display = 'block';
    
    // Создаем слайды
    images.forEach((image, index) => {
        const slide = document.createElement('div');
        
        if (type === 'certificates') {
            slide.className = 'certificate-slide';
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = `Сертификат ${index + 1}`;
            img.className = 'certificate-image';
            img.loading = 'lazy';
            
            img.onerror = function() {
                console.error(`Ошибка загрузки изображения: ${image.url}`);
                this.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = `
                    text-align: center;
                    padding: 2rem;
                    color: #999;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                `;
                errorDiv.innerHTML = `
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Изображение не загружено</p>
                `;
                slide.appendChild(errorDiv);
            };
            
            slide.appendChild(img);
        } 
        else if (type === 'bracelets') {
            slide.className = 'bracelets-slide';
            
            const card = document.createElement('div');
            card.className = 'bracelet-card';
            
            const imageContainer = document.createElement('div');
            imageContainer.className = 'bracelet-image';
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = `Браслет ${index + 1}`;
            img.loading = 'lazy';
            
            img.onerror = function() {
                console.error(`Ошибка загрузки изображения: ${image.url}`);
                this.style.display = 'none';
                imageContainer.innerHTML = `
                    <div style="text-align: center; color: #999; padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Изображение не загружено</p>
                    </div>
                `;
            };
            
            imageContainer.appendChild(img);
            card.appendChild(imageContainer);
            slide.appendChild(card);
        }
        else if (type === 'reviews') {
            slide.className = 'review-slide';
            
            const imageContainer = document.createElement('div');
            imageContainer.className = 'review-image';
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = `Отзыв ${index + 1}`;
            img.loading = 'lazy';
            
            img.onerror = function() {
                console.error(`Ошибка загрузки изображения: ${image.url}`);
                this.style.display = 'none';
                imageContainer.innerHTML = `
                    <div style="text-align: center; color: #999; padding: 2rem; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Изображение не загружено</p>
                    </div>
                `;
            };
            
            imageContainer.appendChild(img);
            slide.appendChild(imageContainer);
        }
        
        innerElement.appendChild(slide);
    });
    
    // Создаем точки навигации
    if (controlsElement && images.length > 1) {
        for (let i = 0; i < images.length; i++) {
            const dot = document.createElement('div');
            dot.className = `${type}-dot`;
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            controlsElement.appendChild(dot);
        }
    }
    
    return {
        element: carouselElement,
        inner: innerElement,
        controls: controlsElement,
        slides: innerElement.children,
        type: type,
        currentSlide: 0,
        totalSlides: images.length
    };
}

// Инициализация карусели (без автопрокрутки)
function initCarousel(carouselData) {
    if (!carouselData || carouselData.totalSlides <= 1) {
        // Скрываем стрелки если только один слайд
        const arrows = carouselData.element.querySelectorAll(`.${carouselData.type}-arrow`);
        arrows.forEach(arrow => arrow.style.display = 'none');
        return;
    }
    
    const { element, inner, controls, slides, type, totalSlides } = carouselData;
    const prevBtn = element.querySelector(`.${type}-arrow.prev`);
    const nextBtn = element.querySelector(`.${type}-arrow.next`);
    
    // Функция обновления карусели
    function updateCarousel() {
        // Перемещаем карусель
        inner.style.transform = `translateX(-${carouselData.currentSlide * 100}%)`;
        
        // Обновляем активную точку
        if (controls) {
            const dots = controls.children;
            for (let i = 0; i < dots.length; i++) {
                dots[i].classList.toggle('active', i === carouselData.currentSlide);
            }
        }
    }
    
    // Переход к конкретному слайду
    function goToSlide(index) {
        if (index < 0) {
            index = totalSlides - 1;
        } else if (index >= totalSlides) {
            index = 0;
        }
        
        carouselData.currentSlide = index;
        updateCarousel();
    }
    
    // Следующий слайд
    function nextSlide() {
        goToSlide(carouselData.currentSlide + 1);
    }
    
    // Предыдущий слайд
    function prevSlide() {
        goToSlide(carouselData.currentSlide - 1);
    }
    
    // Обработчики для стрелок
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
        });
    }
    
    // Обработчики для точек
    if (controls) {
        const dots = controls.children;
        for (let i = 0; i < dots.length; i++) {
            dots[i].addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(i);
            });
        }
    }
    
    // Свайп для мобильных устройств
    let touchStartX = 0;
    let touchEndX = 0;
    
    element.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    
    element.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Свайп влево - следующий слайд
                nextSlide();
            } else {
                // Свайп вправо - предыдущий слайд
                prevSlide();
            }
        }
    }
    
    // Инициализация (без автопрокрутки)
    updateCarousel();
    
    // Сохраняем методы управления
    carouselData.goToSlide = goToSlide;
    carouselData.nextSlide = nextSlide;
    carouselData.prevSlide = prevSlide;
    
    // Сохраняем в глобальный объект
    carousels[type] = carouselData;
    
    return carouselData;
}

// Загрузка и инициализация карусели
async function loadCarousel(type) {
    try {
        console.log(`Загрузка карусели: ${type}`);
        
        const images = await findAvailableImages(type);
        const carouselData = await createCarousel(type, images);
        
        if (carouselData) {
            initCarousel(carouselData);
            console.log(`Карусель ${type} успешно загружена`);
        }
    } catch (error) {
        console.error(`Ошибка загрузки карусели ${type}:`, error);
        const loadingElement = document.getElementById(`${type}-loading`);
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div class="no-images-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Ошибка загрузки</h3>
                    <p>Попробуйте обновить страницу</p>
                </div>
            `;
        }
    }
}

// Инициализация всех каруселей
async function initAllCarousels() {
    console.log('Инициализация каруселей...');
    
    // Загружаем карусели последовательно, чтобы не перегружать сеть
    await loadCarousel('certificates');
    await loadCarousel('bracelets');
    await loadCarousel('reviews');
    
    console.log('Все карусели инициализированы');
}

// Инициализация бургер-меню (выпадающее меню)
function initBurgerMenu() {
    const burger = document.getElementById('burger-menu');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (!burger || !sidebar) return;
    
    burger.addEventListener('click', (e) => {
        e.stopPropagation();
        burger.classList.toggle('active');
        sidebar.classList.toggle('active');
        
        // Показываем/скрываем оверлей только на мобильных
        if (window.innerWidth <= 768 && overlay) {
            overlay.classList.toggle('active');
        }
    });
    
    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        });
    });
    
    // Закрытие меню при клике вне меню
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !burger.contains(e.target)) {
            burger.classList.remove('active');
            sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        }
    });
    
    // Закрытие меню при клике на оверлей
    if (overlay) {
        overlay.addEventListener('click', () => {
            burger.classList.remove('active');
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
}

// Плавная прокрутка
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
}

// Обработчики контактов
function initContactHandlers() {
    // Функция для копирования номера телефона
    function copyPhoneNumber(phoneNumber) {
        const cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/[()]/g, '').trim();
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(cleanNumber)
                .then(() => {
                    showCopyMessage('Номер телефона скопирован!');
                })
                .catch(err => {
                    console.error('Ошибка Clipboard API:', err);
                    fallbackCopy(cleanNumber);
                });
        } else {
            fallbackCopy(cleanNumber);
        }
    }
    
    // Fallback метод копирования
    function fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        
        document.body.appendChild(textArea);
        
        try {
            textArea.select();
            textArea.setSelectionRange(0, 99999);
            const successful = document.execCommand('copy');
            showCopyMessage(successful ? 'Номер телефона скопирован!' : 'Не удалось скопировать номер');
        } catch (err) {
            console.error('Ошибка fallback копирования:', err);
            showCopyMessage('Ошибка при копировании номера');
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    // Показ сообщения о копировании
    function showCopyMessage(text) {
        const existing = document.querySelector('.copy-message');
        if (existing) existing.remove();
        
        const message = document.createElement('div');
        message.className = 'copy-message';
        message.textContent = text;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 2500);
    }
    
    // Обработчики для контактов в основном блоке
    document.querySelectorAll('.clickable-contact-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const type = this.dataset.type;
            const value = this.dataset.value;
            
            if (type === 'phone') {
                copyPhoneNumber(value);
            } else if (type === 'telegram') {
                window.open(value, '_blank', 'noopener,noreferrer');
            }
        });
    });
    
    // Старый обработчик для обратной совместимости
    const phoneElement = document.getElementById('phone-number');
    if (phoneElement) {
        phoneElement.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            copyPhoneNumber(this.textContent.trim());
        });
    }
}

// Создание звездного неба
function createStars() {
    const container = document.getElementById('stars-container');
    if (!container) return;
    
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random() * 3 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 5;
        
        star.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            top: ${top}%;
            animation-delay: ${delay}s;
        `;
        
        container.appendChild(star);
    }
}

// Установка текущего года
function setCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Основная инициализация
async function initializePage() {
    console.log('Инициализация страницы...');
    
    // Устанавливаем текущий год
    setCurrentYear();
    
    // Создаем звезды
    createStars();
    
    // Инициализируем компоненты
    initBurgerMenu();
    initSmoothScroll();
    initContactHandlers();
    
    // Инициализируем карусели
    await initAllCarousels();
    
    console.log('Страница инициализирована');
}

// Запуск при загрузке DOM
document.addEventListener('DOMContentLoaded', initializePage);