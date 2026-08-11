/**
 * Cloudflare Worker — прокси между лендингом (GitHub Pages) и Telegram Bot API.
 *
 * Зачем он нужен:
 * GitHub Pages отдаёт только статические файлы — весь HTML/JS/CSS виден
 * любому посетителю прямо в исходном коде страницы. Если хранить токен бота
 * в этом коде, им сможет воспользоваться кто угодно (слать сообщения от имени
 * бота, спамить в ваш чат и т.д.). Поэтому токен хранится здесь, в секретах
 * Cloudflare Worker, и никогда не попадает в браузер пользователя.
 *
 * Как развернуть — см. WORKER_SETUP.md в корне репозитория.
 */

export default {
  async fetch(request, env) {
    // CORS: разрешаем запросы только с вашего домена GitHub Pages.
    // Замените на реальный адрес вашего сайта.
    const ALLOWED_ORIGIN = 'https://hackercsstrike.github.io';

    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return new Response('Bad request', { status: 400, headers: corsHeaders });
    }

    const { name, grade, subject, goal, contact } = data;

    // Простая валидация — не даём отправить пустые/подозрительно длинные значения.
    const fields = { name, grade, subject, goal, contact };
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value !== 'string' || !value.trim() || value.length > 300) {
        return new Response(`Invalid field: ${key}`, { status: 400, headers: corsHeaders });
      }
    }

    const escape = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

    const text = [
      '📩 <b>Новая заявка</b>',
      `Имя: ${escape(name)}`,
      `Класс: ${escape(grade)}`,
      `Предмет: ${escape(subject)}`,
      `Цель: ${escape(goal)}`,
      `Контакты: ${escape(contact)}`,
    ].join('\n');

    // env.BOT_TOKEN и env.CHAT_ID — секреты, задаются в настройках Worker,
    // а не хранятся в коде.
    const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;

    const tgRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!tgRes.ok) {
      const errText = await tgRes.text();
      console.error('Telegram API error:', errText);
      return new Response('Telegram error', { status: 502, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
