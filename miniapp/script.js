// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Получаем user_id из URL или Telegram
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id') || tg.initDataUnsafe?.user?.id;

// Глобальные переменные
let currentBalance = 0;
let currentJackpot = 0;
let isPlaying = false;
let currentGame = null;
let currentBetOption = null;

// Коэффициенты для игр
const GAME_COEFFICIENTS = {
    basketball: {
        'goal': 1.8,
        'miss': 0
    },
    dice: {
        'even': 1.8,
        'odd': 1.8,
        'more': 1.8,
        'less': 1.8
    },
    football: {
        'goal': 1.8,
        'miss': 1.3
    }
};

// Настройка Telegram Web App
if (tg) {
    tg.setHeaderColor('#667eea');
    tg.setBackgroundColor('#f5f7fa');
    tg.enableClosingConfirmation();
}

// Загрузка данных
async function loadData() {
    await loadBalance();
    await loadJackpot();
    await loadProfile();
}

// Загрузка баланса
async function loadBalance() {
    try {
        const savedBalance = localStorage.getItem(`balance_${userId}`);
        currentBalance = savedBalance ? parseFloat(savedBalance) : 0;
        updateBalanceDisplay();
    } catch (error) {
        console.error('Ошибка загрузки баланса:', error);
        currentBalance = 0;
        updateBalanceDisplay();
    }
}

// Загрузка джекпота
async function loadJackpot() {
    try {
        const savedJackpot = localStorage.getItem('jackpot');
        currentJackpot = savedJackpot ? parseFloat(savedJackpot) : 0;
        updateJackpotDisplay();
    } catch (error) {
        console.error('Ошибка загрузки джекпота:', error);
    }
}

// Загрузка профиля
async function loadProfile() {
    try {
        const savedStats = localStorage.getItem(`stats_${userId}`);
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            updateProfileDisplay(stats);
        }
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
    }
}

// Обновление отображения баланса
function updateBalanceDisplay() {
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = currentBalance.toFixed(2);
    }
}

// Обновление отображения джекпота
function updateJackpotDisplay() {
    const jackpotElement = document.getElementById('jackpot');
    if (jackpotElement) {
        jackpotElement.textContent = currentJackpot.toFixed(2);
    }
}

// Обновление отображения профиля
function updateProfileDisplay(stats) {
    document.getElementById('profileUsername').textContent = `@${stats.username || 'user'}`;
    document.getElementById('profileId').textContent = userId;
    document.getElementById('statBets').textContent = stats.bets_count || 0;
    document.getElementById('statWins').textContent = stats.wins_count || 0;
    document.getElementById('statDeposits').textContent = `${(stats.total_deposits || 0).toFixed(2)} ₽`;
    document.getElementById('statWithdrawals').textContent = `${(stats.total_withdrawals || 0).toFixed(2)} ₽`;
}

// Навигация
function showPage(page) {
    // Скрываем все страницы
    document.querySelectorAll('.main-content > section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Показываем нужную страницу
    const pageElement = document.getElementById(page);
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }
    
    // Обновляем активную кнопку навигации
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
}

// Выбор игры
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
        const game = card.dataset.game;
        selectGame(game);
    });
});

function selectGame(game) {
    currentGame = game;
    
    // Обновляем интерфейс ставки
    const gameEmoji = document.getElementById('gameEmoji');
    const gameTitle = document.getElementById('gameTitle');
    const betOptions = document.getElementById('betOptions');
    
    const gameData = {
        basketball: { emoji: '🏀', title: 'Баскетбол', options: ['goal', 'miss'] },
        dice: { emoji: '🎲', title: 'Кости', options: ['even', 'odd', 'more', 'less'] },
        football: { emoji: '⚽', title: 'Футбол', options: ['goal', 'miss'] }
    };
    
    const data = gameData[game];
    gameEmoji.textContent = data.emoji;
    gameTitle.textContent = data.title;
    
    // Создаем опции ставок
    betOptions.innerHTML = '';
    data.options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'bet-option';
        optionDiv.dataset.option = option;
        
        const optionName = {
            goal: 'Гол',
            miss: 'Мимо',
            even: 'Четное',
            odd: 'Нечетное',
            more: 'Больше 3',
            less: 'Меньше 4'
        };
        
        const coef = GAME_COEFFICIENTS[game][option];
        
        optionDiv.innerHTML = `
            <span class="bet-option-name">${optionName[option]}</span>
            <span class="bet-option-coef">x${coef}</span>
        `;
        
        optionDiv.addEventListener('click', () => {
            document.querySelectorAll('.bet-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            optionDiv.classList.add('selected');
            currentBetOption = option;
        });
        
        betOptions.appendChild(optionDiv);
    });
    
    showPage('betInterface');
}

// Быстрые ставки
document.querySelectorAll('.quick-bet').forEach(button => {
    button.addEventListener('click', () => {
        const amount = parseFloat(button.dataset.amount);
        document.getElementById('betAmount').value = amount;
    });
});

// Кнопка "Назад" в интерфейсе ставки
document.getElementById('backButton').addEventListener('click', () => {
    showPage('gameSelection');
    currentGame = null;
    currentBetOption = null;
});

// Игра
document.getElementById('playButton').addEventListener('click', async () => {
    if (isPlaying) return;
    
    const betAmount = parseFloat(document.getElementById('betAmount').value);
    
    if (!betAmount || betAmount <= 0) {
        alert('Введите корректную ставку!');
        return;
    }
    
    if (!currentBetOption) {
        alert('Выберите вариант ставки!');
        return;
    }
    
    if (betAmount > currentBalance) {
        alert('Недостаточно средств на балансе!');
        return;
    }
    
    isPlaying = true;
    document.getElementById('playButton').disabled = true;
    
    // Анимация скрытия элементов
    const betInterface = document.getElementById('betInterface');
    betInterface.style.animation = 'fadeOut 0.3s ease-out';
    
    setTimeout(() => {
        betInterface.classList.add('hidden');
        startGameAnimation();
    }, 300);
});

function startGameAnimation() {
    const gameAnimation = document.getElementById('gameAnimation');
    const animatedEmoji = document.getElementById('animatedEmoji');
    
    const gameEmojis = {
        basketball: '🏀',
        dice: '🎲',
        football: '⚽'
    };
    
    animatedEmoji.textContent = gameEmojis[currentGame];
    gameAnimation.classList.remove('hidden');
    
    // Симуляция игры
    setTimeout(() => {
        const result = playGame();
        showResult(result);
    }, 2000);
}

function playGame() {
    // Симуляция результата игры
    // В реальном приложении здесь будет интеграция с Telegram эмодзи-играми
    
    if (currentGame === 'basketball') {
        const won = Math.random() > 0.5;
        return {
            won: won && currentBetOption === 'goal',
            option: currentBetOption
        };
    } else if (currentGame === 'dice') {
        const diceValue = Math.floor(Math.random() * 6) + 1;
        let won = false;
        
        if (currentBetOption === 'even') won = diceValue % 2 === 0;
        else if (currentBetOption === 'odd') won = diceValue % 2 === 1;
        else if (currentBetOption === 'more') won = diceValue > 3;
        else if (currentBetOption === 'less') won = diceValue < 4;
        
        return { won, option: currentBetOption, diceValue };
    } else if (currentGame === 'football') {
        const won = Math.random() > 0.5;
        return {
            won: won && currentBetOption === 'goal',
            option: currentBetOption
        };
    }
    
    return { won: false, option: currentBetOption };
}

function showResult(result) {
    const gameAnimation = document.getElementById('gameAnimation');
    gameAnimation.classList.add('hidden');
    
    const resultCard = document.getElementById('resultCard');
    const resultEmoji = document.getElementById('resultEmoji');
    const resultTitle = document.getElementById('resultTitle');
    const resultAmount = document.getElementById('resultAmount');
    
    const betAmount = parseFloat(document.getElementById('betAmount').value);
    const coefficient = GAME_COEFFICIENTS[currentGame][currentBetOption];
    
    if (result.won) {
        const winAmount = betAmount * coefficient;
        currentBalance -= betAmount;
        currentBalance += winAmount;
        
        resultEmoji.textContent = '🎉';
        resultTitle.textContent = 'Выигрыш!';
        resultAmount.textContent = `+${winAmount.toFixed(2)} ₽`;
        resultAmount.className = 'result-amount win';
        
        // Отправляем результат в бот
        sendResultToBot(betAmount, 'win', coefficient);
    } else {
        currentBalance -= betAmount;
        
        resultEmoji.textContent = '😔';
        resultTitle.textContent = 'Проигрыш';
        resultAmount.textContent = `-${betAmount.toFixed(2)} ₽`;
        resultAmount.className = 'result-amount lose';
        
        // Отправляем результат в бот
        sendResultToBot(betAmount, 'lose', coefficient);
    }
    
    updateBalanceDisplay();
    localStorage.setItem(`balance_${userId}`, currentBalance.toString());
    
    resultCard.classList.remove('hidden');
}

// Кнопка "Продолжить" после результата
document.getElementById('resultButton').addEventListener('click', () => {
    const resultCard = document.getElementById('resultCard');
    resultCard.classList.add('hidden');
    
    // Очищаем форму
    document.getElementById('betAmount').value = '';
    document.querySelectorAll('.bet-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    currentBetOption = null;
    
    // Возвращаемся к интерфейсу ставки
    const betInterface = document.getElementById('betInterface');
    betInterface.style.animation = 'slideIn 0.3s ease-out';
    betInterface.classList.remove('hidden');
    
    isPlaying = false;
    document.getElementById('playButton').disabled = false;
});

// Отправка результата в бот
async function sendResultToBot(betAmount, result, coefficient) {
    try {
        const data = {
            user_id: parseInt(userId),
            action: 'place_bet',
            game_type: currentGame,
            bet_amount: betAmount,
            game_result: result,
            coefficient: coefficient,
            bet_option: currentBetOption
        };
        
        if (tg && tg.sendData) {
            tg.sendData(JSON.stringify(data));
        }
    } catch (error) {
        console.error('Ошибка отправки данных в бот:', error);
    }
}

// Навигация по страницам
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) {
            showPage(page);
        }
    });
});

// Кнопка канала
document.getElementById('channelButton').addEventListener('click', () => {
    const channelUrl = 'https://t.me/your_channel'; // Замените на ваш канал
    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(channelUrl);
    } else {
        window.open(channelUrl, '_blank');
    }
});

// Кнопки "Назад" в профиле и лидерах
document.getElementById('profileBackButton')?.addEventListener('click', () => {
    showPage('gameSelection');
});

document.getElementById('leadersBackButton')?.addEventListener('click', () => {
    showPage('gameSelection');
});

// Пополнение
document.getElementById('depositButton')?.addEventListener('click', () => {
    const cryptobotUrl = `https://t.me/CryptoBot?start=pay_${userId}`;
    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(cryptobotUrl);
    } else {
        window.open(cryptobotUrl, '_blank');
    }
});

// Вывод
document.getElementById('withdrawButton')?.addEventListener('click', () => {
    const amount = prompt('Введите сумму для вывода (минимум 50 ₽):');
    if (!amount) return;
    
    const amountNum = parseFloat(amount);
    if (amountNum < 50) {
        alert('Минимальная сумма вывода: 50 ₽');
        return;
    }
    
    if (amountNum > currentBalance) {
        alert('Недостаточно средств!');
        return;
    }
    
    const walletAddress = prompt('Введите адрес кошелька:');
    if (!walletAddress) return;
    
    // Отправляем заявку на вывод
    const data = {
        user_id: parseInt(userId),
        action: 'withdrawal_request',
        amount: amountNum,
        wallet_address: walletAddress
    };
    
    if (tg && tg.sendData) {
        tg.sendData(JSON.stringify(data));
        alert('Заявка на вывод создана! Ожидайте обработки.');
    }
});

// Реферальная система
document.getElementById('referralButton')?.addEventListener('click', () => {
    const referralCode = `REF${userId}`;
    const referralLink = `https://t.me/your_bot?start=${referralCode}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(referralLink);
        alert('Реферальная ссылка скопирована!');
    } else {
        prompt('Ваша реферальная ссылка:', referralLink);
    }
});

// Загрузка лидеров
async function loadLeaders() {
    try {
        // В реальном приложении здесь будет запрос к API
        const leadersList = document.getElementById('leadersList');
        leadersList.innerHTML = '<p>Загрузка...</p>';
        
        // Симуляция данных
        setTimeout(() => {
            leadersList.innerHTML = `
                <div class="leader-item">
                    <div class="leader-rank">1</div>
                    <div class="leader-info">
                        <div class="leader-username">@player1</div>
                        <div class="leader-wins">Выигрышей: 10</div>
                    </div>
                    <div class="leader-amount">5000.00 ₽</div>
                </div>
            `;
        }, 500);
    } catch (error) {
        console.error('Ошибка загрузки лидеров:', error);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    showPage('gameSelection');
    
    // Загружаем лидеров при открытии страницы
    document.getElementById('leaders')?.addEventListener('transitionend', () => {
        if (!document.getElementById('leaders').classList.contains('hidden')) {
            loadLeaders();
        }
    });
});
