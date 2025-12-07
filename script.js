// Массивы с шаблонами имен файлов для каждой карусели
const imagePatterns = {
    certificates: 'certificate',
    bracelets: 'bracelet', 
    reviews: 'review'
};

// Максимальное количество файлов для проверки
const MAX_FILES = 10;

// Функция для проверки существования изображения
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Функция для поиска всех доступных файлов по шаблону
async function findAvailableImages(pattern) {
    const images = [];
    const extensions = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
    
    // Проверяем файлы от 1 до MAX_FILES
    for (let i = 1; i <= MAX_FILES; i++) {
        for (const ext of extensions) {
            const imageName = `${pattern}${i}${ext}`;
            const imageUrl = `Images/${imageName}`;
            
            try {
                const exists = await checkImageExists(imageUrl);
                if (exists) {
                    images.push({
                        name: imageName,
                        url: imageUrl
                    });
                    console.log(`Найден файл: ${imageName}`);
                    break; // Если нашли с одним расширением, переходим к следующему номеру
                }
            } catch (error) {
                console.warn(`Ошибка при проверке файла ${imageName}:`, error);
            }
        }
    }
    
    return images;
}

// Функция для создания карусели
async function createCarousel(type, imagesArray, isBracelet = false) {
    const inner = document.getElementById(`${type}-inner`);
    const controls = document.getElementById(`${type}-controls`);
    const carousel = document.querySelector(`.${type}-carousel`);
    
    if (!inner) {
        console.error(`Элемент ${type}-inner не найден`);
        return null;
    }

    // Очищаем контейнеры
    inner.innerHTML = '';
    if (controls) controls.innerHTML = '';

    // Если изображений нет, показываем сообщение
    if (imagesArray.length === 0) {
        const message = document.createElement('div');
        message.className = 'no-images-message';
        message.innerHTML = `
            <i class="fas fa-image" style="font-size: 3rem; margin-bottom: 1rem; color: #999;"></i>
            <h3 style="color: var(--dark-brown); margin-bottom: 1rem;">Изображения скоро будут добавлены</h3>
            <p style="color: #666;">${type === 'certificates' ? 'Сертификаты' : type === 'bracelets' ? 'Браслеты' : 'Отзывы'} появятся здесь в ближайшее время</p>
        `;
        inner.appendChild(message);
        
        // Скрываем стрелки
        const arrows = carousel.querySelectorAll(`.${type}-arrow`);
        arrows.forEach(arrow => arrow.style.display = 'none');
        
        return null;
    }

    console.log(`Создание карусели ${type} с ${imagesArray.length} изображениями`);

    // Создаем слайды
    imagesArray.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = type === 'certificates' ? 'certificate-slide' : 
                         type === 'bracelets' ? 'bracelets-slide' : 'review-slide';
        
        if (type === 'bracelets') {
            const card = document.createElement('div');
            card.className = 'bracelet-card';
            
            const imageContainer = document.createElement('div');
            imageContainer.className = 'bracelet-image';
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = `${type === 'certificates' ? 'Сертификат' : type === 'bracelets' ? 'Браслет' : 'Отзыв'} ${index + 1}`;
            img.loading = 'lazy';
            img.onerror = function() {
                console.error(`Ошибка загрузки изображения: ${image.url}`);
                this.style.display = 'none';
                imageContainer.innerHTML = `
                    <div style="text-align: center; color: #999;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Изображение не загружено</p>
                    </div>
                `;
            };
            
            imageContainer.appendChild(img);
            card.appendChild(imageContainer);
            slide.appendChild(card);
        } else {
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = `${type === 'certificates' ? 'Сертификат' : 'Отзыв'} ${index + 1}`;
            img.className = type === 'certificates' ? 'certificate-image' : '';
            img.loading = 'lazy';
            img.onerror = function() {
                console.error(`Ошибка загрузки изображения: ${image.url}`);
                this.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.style.textAlign = 'center';
                errorDiv.style.padding = '2rem';
                errorDiv.style.color = '#999';
                errorDiv.innerHTML = `
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Изображение не загружено</p>
                `;
                slide.appendChild(errorDiv);
            };
            
            slide.appendChild(img);
        }
        
        inner.appendChild(slide);
    });

    // Создаем точки управления (только если больше одного изображения)
    if (imagesArray.length > 1 && controls) {
        imagesArray.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = type === 'certificates' ? 'certificate-dot' :
                           type === 'bracelets' ? 'bracelet-dot' : 'review-dot';
            if (index === 0) dot.classList.add('active');
            controls.appendChild(dot);
        });
    }

    return {
        inner,
        controls,
        slides: inner.children,
        type: type
    };
}

// Функция для инициализации карусели
function initCarousel(type, carouselData) {
    if (!carouselData) return null;

    const inner = carouselData.inner;
    const slides = carouselData.slides;
    const dots = carouselData.controls ? carouselData.controls.children : [];
    const carousel = document.querySelector(`.${type}-carousel`);
    const prevBtn = carousel.querySelector(`.${type}-arrow.prev`);
    const nextBtn = carousel.querySelector(`.${type}-arrow.next`);
    
    // Если нет слайдов или только один, скрываем элементы управления
    if (slides.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (carouselData.controls) carouselData.controls.style.display = 'none';
        return null;
    }
    
    let currentSlide = 0;
    const slideCount = slides.length;

    function updateCarousel() {
        inner.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Обновляем активную точку
        Array.from(dots).forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function goToSlide(index) {
        if (slideCount === 0) return;
        
        if (index < 0) index = slideCount - 1;
        if (index >= slideCount) index = 0;
        
        currentSlide = index;
        updateCarousel();
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    // Обработчики для стрелок
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    // Обработчики для точек
    Array.from(dots).forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Добавляем обработчики для свайпа на мобильных
    if (carousel) {
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        carousel.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

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
    }

    // Инициализация
    updateCarousel();

    // Возвращаем методы управления
    return {
        nextSlide,
        prevSlide,
        goToSlide
    };
}

// Создание звездного неба
function createStars() {
    const starsContainer = document.getElementById('stars-container');
    if (!starsContainer) return;

    const starCount = 100;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random() * 3 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 5;
        
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${left}%`;
        star.style.top = `${top}%`;
        star.style.animationDelay = `${delay}s`;
        
        starsContainer.appendChild(star);
    }
}

// Бургер-меню в хедере
function initBurgerMenu() {
    const burgerMenu = document.getElementById('burger-menu');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const sidebarItems = document.querySelectorAll('.sidebar-menu li');

    if (!burgerMenu || !sidebar || !overlay) return;

    burgerMenu.addEventListener('click', () => {
        burgerMenu.classList.toggle('active');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');

        if (sidebar.classList.contains('active')) {
            sidebarItems.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.1}s`;
            });
        }
    });

    overlay.addEventListener('click', () => {
        burgerMenu.classList.remove('active');
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            burgerMenu.classList.remove('active');
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
}

// Плавная прокрутка для навигации
function initSmoothScroll() {
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
}

// Показать/скрыть хедер при скролле
function initScrollBehavior() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');

    if (!header) return;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Скрыть шапку при скролле вниз, показать при скролле вверх
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Копирование номера телефона
function initPhoneCopy() {
    const phoneElement = document.getElementById('phone-number');
    if (!phoneElement) return;

    phoneElement.addEventListener('click', function() {
        const phoneNumber = this.textContent.trim();
        
        // Создаем временный textarea для копирования
        const textArea = document.createElement('textarea');
        textArea.value = phoneNumber;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopyMessage('Номер телефона скопирован!');
            }
        } catch (err) {
            console.error('Ошибка копирования:', err);
        }
        
        document.body.removeChild(textArea);
    });
}

// Показать сообщение о копировании
function showCopyMessage(text) {
    // Удаляем предыдущее сообщение если есть
    const existingMessage = document.querySelector('.copy-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const message = document.createElement('div');
    message.className = 'copy-message';
    message.textContent = text;
    document.body.appendChild(message);

    // Удаляем сообщение через 2.5 секунды
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 2500);
}

// Основная функция инициализации
async function initializePage() {
    console.log('Инициализация страницы...');
    
    // Создаем звезды
    createStars();
    
    // Инициализируем меню и скролл
    initBurgerMenu();
    initSmoothScroll();
    initScrollBehavior();
    initPhoneCopy();
    
    // Ищем и создаем карусели
    try {
        console.log('Поиск изображений для каруселей...');
        
        // Ищем изображения для каждой карусели
        const certificatesImages = await findAvailableImages(imagePatterns.certificates);
        const braceletsImages = await findAvailableImages(imagePatterns.bracelets);
        const reviewsImages = await findAvailableImages(imagePatterns.reviews);
        
        console.log('Найдены изображения:', {
            certificates: certificatesImages.length,
            bracelets: braceletsImages.length,
            reviews: reviewsImages.length
        });
        
        // Создаем карусели
        const certificatesData = await createCarousel('certificates', certificatesImages);
        const braceletsData = await createCarousel('bracelets', braceletsImages, true);
        const reviewsData = await createCarousel('reviews', reviewsImages);
        
        // Инициализируем карусели
        if (certificatesData) {
            initCarousel('certificates', certificatesData);
        }
        
        if (braceletsData) {
            initCarousel('bracelets', braceletsData);
        }
        
        if (reviewsData) {
            initCarousel('reviews', reviewsData);
        }
        
        console.log('Карусели успешно созданы и инициализированы');
        
    } catch (error) {
        console.error('Ошибка при создании каруселей:', error);
        
        // Показываем сообщения об ошибке
        const types = ['certificates', 'bracelets', 'reviews'];
        types.forEach(type => {
            const inner = document.getElementById(`${type}-inner`);
            if (inner) {
                inner.innerHTML = `
                    <div class="no-images-message">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <h3 style="color: var(--dark-brown); margin-bottom: 1rem;">Ошибка загрузки изображений</h3>
                        <p style="color: #666;">Проверьте наличие файлов в папке Images/</p>
                        <small style="color: #999;">Ожидаемые файлы: ${type}1.png, ${type}2.png и т.д.</small>
                    </div>
                `;
            }
            
            // Скрываем стрелки
            const carousel = document.querySelector(`.${type}-carousel`);
            if (carousel) {
                const arrows = carousel.querySelectorAll(`.${type}-arrow`);
                arrows.forEach(arrow => arrow.style.display = 'none');
            }
        });
    }
    
    console.log('Страница успешно инициализирована');
}

// Запускаем инициализацию при загрузке DOM
document.addEventListener('DOMContentLoaded', initializePage);