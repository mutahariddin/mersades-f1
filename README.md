# 🏎 Mercedes-AMG F1 Store v3

## Что нового в v3

| Улучшение | Описание |
|---|---|
| **Верификация цен на сервере** | Клиент не может подменить цену — бэкенд сам достаёт цены из БД |
| **Rate limiting** | 10 попыток входа / 15 мин на IP (защита от брутфорса) |
| **Валидация данных** | `express-validator` на всех критичных роутах |
| **Роли пользователей** | `user` / `admin` — разные права доступа |
| **Admin-панель** | `/admin` — статистика, список заказов, смена статусов |
| **Размер в заказе** | Поле `size` теперь сохраняется в Order |
| **Пагинация** | `GET /api/products?page=&limit=` |
| **Поиск по EN+RU** | Раньше поиск работал только по `nameRu` |
| **Новый UI ProductCard** | Hover overlay, wishlist кнопка, анимация добавления |
| **Новый Hero** | Speed lines, статистика команды, секция «Рекомендуем» |
| **`.env` убран из репо** | Используй `.env.example` как шаблон |

---

## 🚀 Запуск

### Backend
```bash
cd backend
npm install
cp .env.example .env      # заполни DB_URI и JWT_SECRET
node src/seed.js          # заполнить БД + создать admin (один раз)
npm run dev               # → http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev               # → http://localhost:5173
```

---

## 👤 Admin-доступ

После `node src/seed.js`:
- Email: `admin@merc-store.com`
- Пароль: `admin123`

Войди → в дропдауне появится **⚙ Админ-панель** → `/admin`

---

## 🔐 Безопасность

- **Rate limiting**: 200 req/15min глобально, 10 req/15min на `/api/auth`
- **Цены**: `POST /api/orders` игнорирует `price` из запроса, берёт из MongoDB
- **Валидация**: email, пароль, имя проверяются через `express-validator`
- **Admin роуты**: защищены `authMiddleware + adminOnly`

---

## 🌐 API

| Метод | URL | Доступ | Описание |
|---|---|---|---|
| POST | /api/auth/register | Public | Регистрация |
| POST | /api/auth/login | Public | Вход |
| GET  | /api/auth/me | Auth | Профиль |
| GET  | /api/products | Public | Каталог + пагинация |
| POST | /api/products | Admin | Создать товар |
| PUT  | /api/products/:id | Admin | Обновить товар |
| DELETE | /api/products/:id | Admin | Удалить товар |
| POST | /api/orders | Public | Создать заказ |
| GET  | /api/orders/my | Auth | Мои заказы |
| GET  | /api/orders | Admin | Все заказы |
| PATCH | /api/orders/:id/status | Admin | Сменить статус |
| GET  | /api/admin/stats | Admin | Статистика дашборда |
| GET  | /api/pilots | Public | Пилоты |

---

## 💳 Stripe (опционально)

1. Зарегистрируйся на [stripe.com](https://stripe.com)
2. Получи тестовые ключи: Dashboard → Developers → API keys
3. Обнови `backend/.env`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
