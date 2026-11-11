'use strict';

// Начальные данные: админ + несколько песен с тегами и отзывами (вложенные структуры).
// Запуск:  npm run seed   (можно повторять — дубликаты не создаются)
require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const connectDB = require('./db');
const Song = require('./models/song');
const User = require('./models/user');

const songs = [
    {
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        genre: 'Rock',
        duration: 355,
        lyrics: 'Текст песни для караоке...',
        audioUrl: 'https://example.com/audio/bohemian-rhapsody.mp3',
        tags: ['рок', 'классика', 'дуэт'],
        reviews: [
            { userId: 'seed', userEmail: 'fan@karaoke.local', rating: 5, comment: 'Легенда!', likes: 2 },
            { userId: 'seed', userEmail: 'singer@karaoke.local', rating: 4, comment: 'Сложно, но весело' }
        ]
    },
    {
        title: 'Shape of You',
        artist: 'Ed Sheeran',
        genre: 'Pop',
        duration: 233,
        lyrics: 'Текст песни для караоке...',
        audioUrl: 'https://example.com/audio/shape-of-you.mp3',
        tags: ['поп', 'хит']
    },
    {
        title: 'Believer',
        artist: 'Imagine Dragons',
        genre: 'Rock',
        duration: 204,
        lyrics: 'Текст песни для караоке...',
        audioUrl: 'https://example.com/audio/believer.mp3',
        tags: ['рок', 'хит']
    }
];

async function seed() {
    await connectDB();

    const email = (process.env.ADMIN_EMAIL || 'admin@karaoke.local').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'admin12345';

    // upsert + $setOnInsert: если админ уже есть, ничего не меняется
    const adminResult = await User.updateOne(
        { email },
        { $setOnInsert: { email, passwordHash: await bcrypt.hash(password, 10), role: 'admin' } },
        { upsert: true }
    );
    console.log(adminResult.upsertedCount ? `Создан админ ${email}` : `Админ ${email} уже существует`);

    if (await Song.estimatedDocumentCount() === 0) {
        await Song.insertMany(songs);
        console.log(`Добавлено песен: ${songs.length}`);
    } else {
        console.log('Песни уже есть — пропускаю');
    }

    await mongoose.disconnect();
}

seed().catch(async (error) => {
    console.error('Ошибка seed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
});
