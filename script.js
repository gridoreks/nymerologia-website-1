// Массивы с шаблонами имен файлов для каждой карусели
const imagePatterns = {
    certificates: 'certificate',
    bracelets: 'bracelet', 
    reviews: 'review'
};

// Максимальное количество файлов для проверки - УВЕЛИЧЕНО ДО 50
const MAX_FILES = 50;

// Кэш для проверенных изображений
const imageCache = new Map();

// Функция для проверки существования изображения с кэшированием
function checkImageExists(url) {
    return new Promise((resolve) => {
        // Проверяем кэш
        if (imageCache.has(url)) {
            resolve(imageCache.get(url));
            return;
        }
        
        const img = new Image();
        img.onload = () => {
            imageCache.set(url, true);
            resolve(true);
        };
        img.onerror = () => {
            imageCache.set(url, false);
            resolve(false);
        };
        img.src = url;
        
        // Таймаут для медленных соединений
        setTimeout(() => {
            if (!img.complete) {
                img.src = '';
                imageCache.set(url, false);
                resolve(false);
            }
        }, 2000);
    });
}

// Функция для параллельной проверки изображений
async function findAvailableImages(pattern) {
    const images = [];
    const extensions = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
    
    // Создаем массив промисов для параллельной проверки
    const promises = [];
    
    for (let i = 1; i <= MAX_FILES; i++) {
        for (const ext of extensions) {
            const imageName = `${pattern}${i}${ext}`;
            const imageUrl = `Images/${imageName}`;
            
            promises.push(
                checkImageExists(imageUrl).then(exists => {
                    if (exists) {
                        images.push({
                            name: imageName,
                            url: imageUrl,
                            index: i
                        });
                        console.log(`Найден файл: ${imageName}`);
                    }
                    return exists;
                }).catch(error => {
                    console.warn(`Ошибка при проверке файла ${imageName}:`, error);
                    return false;
                })
            );
        }
    }
    
    // Ждем завершения всех проверок
    await Promise.all(promises);
    
    // Сортируем по индексу для правильного порядка
    images.sort((a, b) => a.index - b.index);
    
    console.log(`Для шаблона ${pattern} найдено ${images.length} изображений`);
    return images;
}

// Функция для создания карусели с оптимизированной загрузкой
async function createCarousel(type, imagesArray, isBracelet = false) {
    const inner = document.getElementById(`${type}-inner`);
    const controls = document.getElementById(`${type}-controls`);
    const carousel = document.getElementById(`${type}-carousel`);
    const loading = document.getElementById(`${type}-loading`);
    
    if (!inner) {
        console.error(`Элемент ${type}-inner не найден`);
        return null;
    }

    // Очищаем контейнеры
    inner.innerHTML = '';
    if (controls) controls.innerHTML = '';

    // Если изображений нет, показываем сообщение
    if (imagesArray.length === 0) {
        if (loading) {
            loading.innerHTML = `
                <div class="no-images-message">
                    <i class="fas fa-image" style="font-size: 3rem; margin-bottom: 1rem; color: #999;"></i>
                    <h3 style="color: var(--dark-brown); margin-bottom: 1rem;">Изображения скоро будут добавлены</h3>
                    <p style="color: #666;">${type === 'certificates' ? 'Сертификаты' : type === 'bracelets' ? 'Браслеты' : 'Отзывы'} появятся здесь в ближайшее время</p>
                </div>
            `;
        }
        
        return null;
    }

    console.log(`Создание карусели ${type} с ${imagesArray.length} изображениями`);

    // Скрываем индикатор загрузки и показываем карусель
    if (loading) {
        loading.style.display = 'none';
    }
    if (carousel) {
        carousel.style.display = 'block';
    }

    // Создаем слайды с ленивой загрузкой
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
            img.loading = 'lazy';
            img.decoding = 'async';
            img.src = image.url;
            img.alt = `${type === 'certificates' ? 'Сертификат' : type === 'bracelets' ? 'Браслет' : 'Отзыв'} ${index + 1}`;
            
            // Предзагрузка следующего изображения
            if (index < imagesArray.length - 1) {
                const nextImage = new Image();
                nextImage.src = imagesArray[index + 1].url;
            }
            
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
        } else {
            const imageContainer = document.createElement('div');
            imageContainer.className = type === 'reviews' ? 'review-image' : '';
            
            const img = document.createElement('img');
            img.loading = 'lazy';
            img.decoding = 'async';
            img.src = image.url;
            img.alt = `${type === 'certificates' ? 'Сертификат' : 'Отзыв'} ${index + 1}`;
            
            if (type === 'certificates') {
                img.className = 'certificate-image';
            }
            
            // Предзагрузка следующего изображения
            if (index < imagesArray.length - 1) {
                const nextImage = new Image();
                nextImage.src = imagesArray[index + 1].url;
            }
            
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
                imageContainer.appendChild(errorDiv);
            };
            
            imageContainer.appendChild(img);
            slide.appendChild(imageContainer);
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
    let isAnimating = false;
    const animationDuration = 500;

    function updateCarousel() {
        if (isAnimating) return;
        
        inner.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Обновляем активную точку
        Array.from(dots).forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        
        // Предзагружаем следующее и предыдущее изображения
        preloadAdjacentImages();
    }

    function preloadAdjacentImages() {
        const nextIndex = (currentSlide + 1) % slideCount;
        const prevIndex = (currentSlide - 1 + slideCount) % slideCount;
        
        // Предзагружаем изображения для плавного перехода
        [nextIndex, prevIndex].forEach(index => {
            const slide = slides[index];
            const images = slide.querySelectorAll('img[data-src]');
            images.forEach(img => {
                if (img.dataset.src && !img.src) {
                    img.src = img.dataset.src;
                    delete img.dataset.src;
                }
            });
        });
    }

    function goToSlide(index) {
        if (slideCount === 0 || isAnimating) return;
        
        if (index < 0) index = slideCount - 1;
        if (index >= slideCount) index = 0;
        
        isAnimating = true;
        currentSlide = index;
        updateCarousel();
        
        setTimeout(() => {
            isAnimating = false;
        }, animationDuration);
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
        let isSwiping = false;

        carousel.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            isSwiping = true;
        }, { passive: true });

        carousel.addEventListener('touchmove', e => {
            if (!isSwiping) return;
            e.preventDefault();
        }, { passive: false });

        carousel.addEventListener('touchend', e => {
            if (!isSwiping) return;
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            isSwiping = false;
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
    }

    // Автопрокрутка (опционально)
    let autoScrollInterval = null;
    
    function startAutoScroll() {
        if (slideCount > 1) {
            autoScrollInterval = setInterval(() => {
                nextSlide();
            }, 5000);
        }
    }
    
    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }
    
    // Останавливаем автопрокрутку при наведении
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoScroll);
        carousel.addEventListener('mouseleave', startAutoScroll);
        carousel.addEventListener('touchstart', stopAutoScroll);
    }
    
    // Инициализация
    updateCarousel();
    startAutoScroll();

    // Возвращаем методы управления
    return {
        nextSlide,
        prevSlide,
        goToSlide,
        stopAutoScroll,
        startAutoScroll
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

// Копирование номера телефона и открытие ссылок
function initContactClickHandlers() {
    // Обработчик для элементов контактов в основном разделе
    document.querySelectorAll('.clickable-contact-item').forEach(item => {
        item.addEventListener('click', function() {
            const type = this.dataset.type;
            const value = this.dataset.value;
            
            if (type === 'phone') {
                copyPhoneNumber(value);
            } else if (type === 'telegram') {
                window.open(value, '_blank');
            }
        });
    });
    
    // Обработчик для элементов контактов в футере
    document.querySelectorAll('.clickable-footer-item').forEach(item => {
        item.addEventListener('click', function() {
            const type = this.dataset.type;
            const value = this.dataset.value;
            
            if (type === 'phone') {
                copyPhoneNumber(value);
            } else if (type === 'telegram') {
                window.open(value, '_blank');
            }
        });
    });
    
    // Старый обработчик для обратной совместимости
    const phoneElement = document.getElementById('phone-number');
    if (phoneElement) {
        phoneElement.addEventListener('click', function() {
            const phoneNumber = this.textContent.trim();
            copyPhoneNumber(phoneNumber);
        });
    }
}

// Копирование номера телефона
function copyPhoneNumber(phoneNumber) {
    // Используем современный Clipboard API если доступен
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(phoneNumber)
            .then(() => {
                showCopyMessage('Номер телефона скопирован!');
            })
            .catch(err => {
                console.error('Ошибка копирования через Clipboard API:', err);
                // Fallback для старых браузеров
                fallbackCopy(phoneNumber);
            });
    } else {
        // Fallback для старых браузеров
        fallbackCopy(phoneNumber);
    }
}

// Fallback метод копирования
function fallbackCopy(phoneNumber) {
    const textArea = document.createElement('textarea');
    textArea.value = phoneNumber;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyMessage('Номер телефона скопирован!');
        } else {
            showCopyMessage('Не удалось скопировать номер');
        }
    } catch (err) {
        console.error('Ошибка копирования:', err);
        showCopyMessage('Ошибка при копировании номера');
    }
    
    document.body.removeChild(textArea);
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

// Обновление года в футере
function updateCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Основная функция инициализации с оптимизированной загрузкой
async function initializePage() {
    console.log('Инициализация страницы...');
    
    // Обновляем год в футере
    updateCurrentYear();
    
    // Создаем звезды
    createStars();
    
    // Инициализируем меню и скролл
    initBurgerMenu();
    initSmoothScroll();
    initScrollBehavior();
    initContactClickHandlers();
    
    // Загружаем карусели параллельно для ускорения
    try {
        console.log('Параллельный поиск изображений для каруселей...');
        
        // Запускаем поиск изображений для всех каруселей одновременно
        const [certificatesImages, braceletsImages, reviewsImages] = await Promise.all([
            findAvailableImages(imagePatterns.certificates),
            findAvailableImages(imagePatterns.bracelets),
            findAvailableImages(imagePatterns.reviews)
        ]);
        
        console.log('Найдены изображения:', {
            certificates: certificatesImages.length,
            bracelets: braceletsImages.length,
            reviews: reviewsImages.length
        });
        
        // Создаем карусели последовательно, но уже с загруженными данными
        const certificatesData = await createCarousel('certificates', certificatesImages);
        const braceletsData = await createCarousel('bracelets', braceletsImages, true);
        const reviewsData = await createCarousel('reviews', reviewsImages);
        
        // Инициализируем карусели
        const carousels = [];
        if (certificatesData) {
            carousels.push(initCarousel('certificates', certificatesData));
        }
        
        if (braceletsData) {
            carousels.push(initCarousel('bracelets', braceletsData));
        }
        
        if (reviewsData) {
            carousels.push(initCarousel('reviews', reviewsData));
        }
        
        console.log(`${carousels.length} каруселей успешно созданы и инициализированы`);
        
        // Оптимизация для мобильных устройств
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                console.log('Медленное соединение, отключаем автопрокрутку каруселей');
                carousels.forEach(carousel => {
                    if (carousel && carousel.stopAutoScroll) {
                        carousel.stopAutoScroll();
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('Ошибка при создании каруселей:', error);
        
        // Показываем сообщения об ошибке
        const types = ['certificates', 'bracelets', 'reviews'];
        types.forEach(type => {
            const loading = document.getElementById(`${type}-loading`);
            if (loading) {
                loading.innerHTML = `
                    <div class="no-images-message">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <h3 style="color: var(--dark-brown); margin-bottom: 1rem;">Ошибка загрузки изображений</h3>
                        <p style="color: #666;">Проверьте наличие файлов в папке Images/</p>
                        <small style="color: #999;">Ожидаемые файлы: ${type}1.png, ${type}2.png и т.д. (до ${type}50.png)</small>
                    </div>
                `;
            }
            
            // Скрываем стрелки
            const carousel = document.getElementById(`${type}-carousel`);
            if (carousel) {
                const arrows = carousel.querySelectorAll(`.${type}-arrow`);
                arrows.forEach(arrow => arrow.style.display = 'none');
            }
        });
    }
    
    // Ленивая загрузка изображений ниже области просмотра
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        delete img.dataset.src;
                    }
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    console.log('Страница успешно инициализирована');
}

// Запускаем инициализацию при загрузке DOM
document.addEventListener('DOMContentLoaded', initializePage);

// Предзагрузка критически важных ресурсов
if (document.readyState === 'loading') {
    document.addEventListener('readystatechange', function() {
        if (document.readyState === 'interactive') {
            // Начинаем загрузку фоновых изображений заранее
            const preloadImages = ['logo.png', 'about_me.png'];
            preloadImages.forEach(image => {
                const img = new Image();
                img.src = `Images/${image}`;
            });
        }
    });
}