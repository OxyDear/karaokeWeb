'use strict';

const mongoose = require('mongoose');

// Подключение к MongoDB (Atlas или локальный сервер). Строка подключения берётся из .env.
async function connectDB() {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error('Не задана переменная окружения MONGO_URI (добавьте её в .env)');
    }

    await mongoose.connect(uri);
    console.log(`MongoDB connected (база: ${mongoose.connection.name})`);
}

module.exports = connectDB;
