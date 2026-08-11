# Подготовка к ОГЭ и ЕГЭ | Landing Page

Современный, адаптивный landing page для репетитора по математике и информатике. Оптимизирован для конверсии и интеграции с рекламными платформами.

## 🎯 Особенности

- ✅ **Полностью адаптивный** — работает на всех устройствах (mobile-first)
- ✅ **Современный дизайн** — минималистичный EdTech стиль
- ✅ **Быстрая загрузка** — оптимизированный код без тяжелых библиотек
- ✅ **SEO-оптимизирован** — правильная иерархия заголовков, мета-теги
- ✅ **Готов к аналитике** — структура для VK Рекламы, Яндекс Метрики, Google Analytics
- ✅ **Валидация формы** — проверка всех полей перед отправкой
- ✅ **Плавные анимации** — появление элементов при прокрутке
- ✅ **Доступность** — поддержка клавиатурной навигации, respects prefers-reduced-motion

## 📁 Структура проекта

```
tutor-landing/
├── index.html           # Основной HTML файл
├── css/
│   └── styles.css       # Все стили (CSS переменные, адаптивность)
├── js/
│   └── script.js        # JavaScript (валидация, аналитика, анимации)
├── assets/
│   ├── favicon.svg      # Иконка сайта
│   └── illustrations/   # Папка для иллюстраций (опционально)
├── .gitignore           # Git ignore файл
├── README.md            # Этот файл
└── package.json         # Метаданные проекта (опционально)
```

## 🚀 Быстрый старт

### Локальный запуск

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/your-username/tutor-landing.git
cd tutor-landing
```

2. **Откройте в браузере:**

Просто откройте файл `index.html` в браузере

Или используйте локальный сервер:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (если установлен)
npx http-server
```

Откройте в браузере: `http://localhost:8000`

## 🔧 Настройка

### Замена контактов

В файле `index.html` найдите секцию footer и замените:
- `https://t.me/your_username` на ваш Telegram
- `https://vk.com/your_username` на вашу VK страницу

### Подключение аналитики

#### Яндекс Метрика
1. Получите ID счётчика на [metrica.yandex.ru](https://metrica.yandex.ru)
2. В `index.html` найдите комментарий `<!-- Яндекс Метрика -->`
3. Вставьте код счётчика и установите `window.yaMetrikaId`

```javascript
window.yaMetrikaId = 12345678; // Замените на ваш ID
```

#### VK Пиксель
1. Получите код пикселя в [vk.com/ads](https://vk.com/ads)
2. В `index.html` найдите комментарий `<!-- VK Пиксель -->`
3. Вставьте код пикселя

#### Google Analytics
Добавьте в `<head>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Обработка отправки формы

По умолчанию форма показывает сообщение об успехе в браузере. Для отправки на сервер:

1. В `js/script.js` найдите функцию `submitForm()`
2. Раскомментируйте блок с `fetch()` и замените `/api/submit-form` на ваш endpoint
3. Создайте backend для обработки данных

Пример backend (Node.js/Express):

```javascript
app.post('/api/submit-form', (req, res) => {
    const { name, grade, subject, goal, contact } = req.body;
    // Сохраните данные в БД или отправьте на email
    console.log('New lead:', { name, grade, subject, goal, contact });
    res.json({ success: true, message: 'Заявка принята' });
});
```

## 📱 Адаптивность

Сайт протестирован на:
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1440px (Full HD)

Все медиа-запросы находятся в `css/styles.css`.

## 🎨 Кастомизация

### Цвета

В `css/styles.css` найдите `:root` и измените CSS переменные:

```css
:root {
    --color-primary: #6366f1;    /* Основной цвет */
    --color-secondary: #8b5cf6;  /* Вторичный цвет */
    --color-text: #1f2937;       /* Цвет текста */
    /* ... остальные переменные ... */
}
```

### Шрифты

Сайт использует системные шрифты для быстрой загрузки. Для кастомного шрифта:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

body {
    font-family: 'Inter', sans-serif;
}
```

### Иллюстрации

Замените SVG иллюстрацию в hero блоке на свою. Найдите в `index.html`:

```html
<svg class="hero__illustration" viewBox="0 0 400 400" ...>
    <!-- Ваша иллюстрация здесь -->
</svg>
```

## 📊 Отслеживание событий

Все события отслеживаются через функцию `trackEvent()`:

```javascript
// Клик по кнопке
trackEvent('button_click', { button: 'scroll_to_form' });

// Отправка формы
trackEvent('form_submit', { grade: '11', subject: 'math' });

// Клик по социальной сети
trackEvent('social_link_click', { platform: 'telegram' });
```

## 🚀 Публикация

### GitHub Pages

1. Создайте репозиторий на GitHub
2. Загрузите файлы:
```bash
git init
git add .
git commit -m "Initial commit: tutor landing page"
git branch -M main
git remote add origin https://github.com/your-username/tutor-landing.git
git push -u origin main
```

3. Включите GitHub Pages:
   - Перейдите в Settings → Pages
   - Выберите Branch: main
   - Сохраните

Ваш сайт доступен по адресу: `https://your-username.github.io/tutor-landing/`

### Vercel

```bash
# 1. Установите Vercel CLI
npm install -g vercel

# 2. Разверните
vercel
```

Следуйте инструкциям и ваш сайт будет опубликован.

### Netlify

1. Перейдите на [netlify.com](https://netlify.com)
2. Нажмите "New site from Git"
3. Выберите ваш репозиторий
4. Нажмите "Deploy"

Ваш сайт будет доступен по адресу: `https://your-site-name.netlify.app`

## 🔍 SEO

Сайт оптимизирован для поисковых систем:

- ✅ Правильная иерархия заголовков (H1, H2)
- ✅ Мета-описание и ключевые слова
- ✅ Open Graph теги для соцсетей
- ✅ Структурированные данные (schema.org)
- ✅ Быстрая загрузка (нет тяжелых библиотек)
- ✅ Мобильная оптимизация

## 📈 Оптимизация производительности

- Размер: ~50KB (HTML + CSS + JS)
- Загрузка: < 1 сек на 4G
- Lighthouse: 95+ баллов

Для дальнейшей оптимизации:
- Сжимайте изображения (используйте WebP)
- Кэшируйте статические файлы
- Используйте CDN для доставки контента

## 🐛 Решение проблем

### Форма не отправляется
1. Проверьте консоль браузера (F12 → Console)
2. Убедитесь, что все поля заполнены корректно
3. Проверьте, что backend endpoint доступен

### Стили не загружаются
1. Убедитесь, что файл `css/styles.css` находится в правильной папке
2. Проверьте пути в `index.html`
3. Очистите кэш браузера (Ctrl+Shift+Delete)

### Аналитика не работает
1. Проверьте, что код аналитики вставлен правильно
2. Убедитесь, что ID счётчика установлен
3. Проверьте консоль на ошибки

## 📝 Лицензия

MIT License — используйте свободно в личных и коммерческих проектах.

## 💬 Поддержка

Если у вас есть вопросы или проблемы:
1. Проверьте раздел "Решение проблем"
2. Откройте Issue на GitHub
3. Свяжитесь с разработчиком

---

Создано с ❤️ для репетиторов и образовательных проектов
