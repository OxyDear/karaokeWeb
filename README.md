# Онлайн-караоке — ПЗ №1. Middleware и шаблонизаторы

Учебное Express-приложение с шаблонизатором EJS и кастомными middleware.
Ветка репозитория: `pz21`. Тема: сервис онлайн-караоке (каталог песен и текстов).

## Установка и запуск

```bash
npm install
npm start        # обычный запуск
# или
npm run dev       # запуск через nodemon (автоперезапуск при изменениях)
```

Сервер стартует на [http://localhost:3000](http://localhost:3000).

## Структура проекта

```
server.js                     точка входа, подключение middleware и роутов
controllers/songs.controller.js   логика страниц (список, деталка, форма)
data/songs.js                 хранилище песен — обычный массив в памяти
middleware/logger.js          логирование запросов
middleware/auth.js            имитация авторизации (?auth=1)
middleware/errorHandlers.js   обработчики 404 и 500
routes/songs.routes.js        маршруты
views/                        EJS-шаблоны (+ views/partials — шапка/подвал)
public/css/style.css          стили
```

## Маршруты

| Метод | Путь         | Описание                                              |
|-------|--------------|--------------------------------------------------------|
| GET   | `/`          | список песен, фильтр по `?artist=` и `?genre=`         |
| GET   | `/item/:id`  | детальная страница песни (текст, длительность, аудио)  |
| GET   | `/add`       | форма добавления песни (требует `?auth=1`)              |
| POST  | `/add`       | добавление песни в массив, редирект на `/`               |
| GET   | `/login`     | страница-заглушка, объясняющая имитацию авторизации     |

## Имитация авторизации

Реальной системы логина нет. Пользователь считается авторизованным, если
в query-строке присутствует `?auth=1`, например:

```
http://localhost:3000/add?auth=1
```

Без этого параметра переход на `/add` редиректит на `/login`.

## Проверка обработки ошибок

- **404** — откройте несуществующий адрес, например `/item/9999` или `/что-то`.
- **500** — откройте `/item/abc` (нечисловой id намеренно вызывает ошибку,
  которая передаётся в `next(err)` и обрабатывается error-handling middleware).

---

# ЛР №4. Управление состоянием в React-приложении (ветка `24`)

React-клиент (Vite) для предметной области курсового проекта — каталог песен онлайн-караоке.
Находится в папке `client/`, серверный код не затрагивает. Работает автономно: данные хранятся в `localStorage`.

## Запуск

```bash
cd client
npm install
npm run dev      # http://localhost:5173
```

## Структура клиента

```
client/src/
  App.jsx                    корневой компонент
  components/
    SongList.jsx             основной компонент: useState, CRUD, фильтры, document.title
    SongForm.jsx             контролируемая форма добавления/редактирования
    SongItem.jsx             строка списка (React.memo)
    Filters.jsx              поиск, жанр, статус, сортировка
    Stats.jsx                статистика
  hooks/useLocalStorage.js   пользовательский хук: загрузка + автосохранение
  data/initialSongs.js       начальные данные, если localStorage пуст
  utils/format.js            форматирование времени, генерация id
```

## Реализовано

- `useState`: массив песен, поля формы, фильтры/сортировка, id редактируемой песни.
- `useEffect` (в хуке `useLocalStorage`): загрузка при монтировании (`[]`) и сохранение при изменении списка (`[value]`).
- CRUD: добавление, редактирование, удаление, отметка «спето».
- Фильтрация (поиск по названию/исполнителю, жанр, статус) и сортировка (название, исполнитель, длительность).
- Доп. эффекты: debounce-автосохранение 500 мс, имитация загрузки с сервера 1 с, `document.title` с числом песен, статистика.
- Обработка пустого/повреждённого localStorage — инициализация начальными данными.
- Горячие клавиши: Enter — отправка формы, Esc — отмена редактирования.

---

# ЛР №5. Взаимодействие React-приложения с сервером (ветка `25`)

Клиент (`client/`) переведён с `localStorage` на работу с собственным REST API (Node.js + Express + PostgreSQL + JWT).

## Запуск

```bash
# 1. Сервер (корень проекта)
cp .env.example .env          # заполнить DATABASE_URL и JWT_SECRET
npm install                   # появилась новая зависимость cors
npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all   # админ: admin@karaoke.local / admin12345
npm run dev                   # http://localhost:3000

# 2. Клиент
cd client
npm install                   # появилась новая зависимость axios
cp .env.example .env          # VITE_API_URL=http://localhost:3000
npm run dev                   # http://localhost:5173
```

Чтобы увидеть спиннер и состояния загрузки, в `client/.env` задайте `VITE_API_DELAY=1500`.
Чтобы увидеть ошибку «сервер недоступен» — остановите сервер и нажмите «Повторить».

## Что реализовано

| Требование | Где |
|---|---|
| Сервис API на axios, JWT-перехватчик, обработка ошибок | `client/src/api.js` |
| GET списка с индикатором загрузки, ошибкой и кнопкой «Повторить» | `SongList.jsx` |
| POST с оптимистичным обновлением (временный id → настоящий, откат при ошибке) | `SongList.jsx` → `addSong` |
| DELETE с оптимистичным удалением и возвратом при ошибке | `SongList.jsx` → `deleteSong` |
| PUT (редактирование) с оптимистичным обновлением и откатом | `SongList.jsx` → `updateSong` |
| Вход/регистрация, JWT в `localStorage` | `AuthPanel.jsx`, `api.js` |
| **Доп. улучшение:** серверный поиск + debounce 400 мс + отмена устаревших запросов (`AbortController`) | `useDebounce.js`, `SongList.jsx`, `GET /songs?search=` |

## Изменения на сервере

- `cors` middleware (`CORS_ORIGIN` в `.env` — список разрешённых origin, по умолчанию разрешены все).
- `GET /songs?search=` — поиск по названию или исполнителю (`iLike`), комбинируется с `genre`.
- `GET /songs/genres` — список жанров для фильтра.
- `POST /songs/:id/play` — «Спеть»: атомарно увеличивает `playsCount` (нужен JWT, роль любая).

## Права доступа

- Просмотр каталога — без входа. Добавление песен и «Спеть» — любой вошедший пользователь.
- Редактирование и удаление — только `admin` (так настроен сервер; кнопки в UI показываются только админу).

---

# ЛР №6. Интеграция с NoSQL базой данных MongoDB (ветка `26`)

Серверная часть переведена с PostgreSQL + Sequelize на **MongoDB + Mongoose**. API для React-клиента
остался прежним (те же маршруты, в ответах то же поле `id`), добавлены теги и отзывы — вложенные структуры.

## Запуск

```bash
# 1. MongoDB: Atlas (бесплатный кластер M0) или локально (MongoDB Community Edition)
#    В .env укажите MONGO_URI (шаблон — в .env.example). DATABASE_URL больше не нужен.
cp .env.example .env          # если .env ещё нет; иначе просто добавьте в него MONGO_URI

# 2. Сервер (корень проекта)
npm install                   # появился mongoose, убраны sequelize/pg
npm run seed                  # админ admin@karaoke.local / admin12345 + 3 песни (можно запускать повторно)
npm run dev                   # http://localhost:3000

# 3. Клиент (по желанию)
cd client && npm install && npm run dev    # http://localhost:5173
```

Atlas: Database → Create (M0) → Database Access (пользователь + пароль) → Network Access (добавить свой IP
или `0.0.0.0/0` для учёбы) → Connect → Drivers → скопировать строку подключения в `MONGO_URI`
(подставить пароль и имя базы `karaoke` перед `?`).

## Что изменилось

| Файл | Что |
|---|---|
| `db.js` | подключение `mongoose.connect(process.env.MONGO_URI)` |
| `models/song.js` | схема и модель `Song`: вложенный массив `reviews` (subdocument), массив `tags`, индексы, виртуальные поля `averageRating`/`reviewsCount`, метод экземпляра `addReview`, статический `findByTag` |
| `models/user.js` | схема `User` (уникальный индекс по `email`, роль) |
| `models/*Repository.js` | запросы Mongoose вместо Sequelize (`find`, `findByIdAndUpdate`, `$inc`, `$push`, `$pull`, позиционный `$`) |
| `server.js` | те же маршруты `/songs`, + теги и отзывы, обработка ошибок Mongoose, старт после подключения к БД |
| `seed.js` | замена `migrations/` и `seeders/` (в MongoDB миграции схемы не нужны) |
| `utils/objectId.js` | проверка формата ObjectId (вместо `Number(id)`) |
| `client/.../SongList.jsx` | сортировка «по добавлению» работала с числовым id; теперь id — строка ObjectId |

## Маршруты

CRUD песен: `GET /songs` (фильтры `?search=`, `?genre=`, `?artist=`, `?tag=`), `GET /songs/:id`,
`POST /songs`, `PUT /songs/:id` (admin), `DELETE /songs/:id` (admin, возвращает удалённый документ),
`POST /songs/:id/play`, `GET /songs/genres`, `GET /songs/tags`.

Вложенный массив `reviews`:

| Метод | Путь | Операция MongoDB |
|---|---|---|
| GET | `/songs/:id/reviews` | чтение массива |
| POST | `/songs/:id/reviews` | `$push` — добавить отзыв `{ "rating": 5, "comment": "..." }` |
| PUT | `/songs/:id/reviews/:reviewId` | `$set` + позиционный `$` — изменить элемент массива |
| POST | `/songs/:id/reviews/:reviewId/like` | `$inc` + `$` — +1 к `likes` внутри элемента массива |
| DELETE | `/songs/:id/reviews/:reviewId` | `$pull` — удалить элемент |

Отзывы добавляет любой вошедший пользователь; менять и удалять — автор или admin.

## Реляционная и документная модель на примере проекта

PostgreSQL: таблицы `songs`, `reviews` (FK `songId`), `tags`, `song_tags` — песня со всем содержимым собирается через JOIN.
MongoDB: один документ в коллекции `songs`:

```json
{
  "_id": "665f...",
  "title": "Bohemian Rhapsody", "artist": "Queen", "genre": "Rock", "playsCount": 0,
  "tags": ["рок", "классика"],
  "reviews": [
    { "_id": "665f...", "userId": "...", "rating": 5, "comment": "Легенда!", "likes": 2 }
  ]
}
```

Отзывы — часть песни: читаются одним запросом и удаляются вместе с ней (каскад не нужен).
Минус: если отзывов будут тысячи, документ разрастётся (лимит 16 МБ) — тогда их выносят в отдельную коллекцию и используют `populate`.

## Проверка в Postman

1. `POST /auth/login` `{ "email": "admin@karaoke.local", "password": "admin12345" }` → скопировать `token`.
2. Дальше везде заголовок `Authorization: Bearer <token>`.
3. `GET /songs` → взять `id`; `POST /songs/:id/reviews` `{ "rating": 5, "comment": "ок" }`; затем `PUT`/`like`/`DELETE` по `reviewId` из ответа.
4. В Compass / Atlas Data Explorer: база `karaoke`, коллекция `songs` — видно вложенные `reviews` и `tags`.
