'use strict';

const mongoose = require('mongoose');
const jsonOptions = require('./jsonOptions');

const { Schema } = mongoose;

// Вложенный документ (subdocument): отзыв хранится ВНУТРИ песни, отдельной коллекции нет.
// У каждого элемента массива свой _id — по нему можно обновлять/удалять конкретный отзыв.
const reviewSchema = new Schema({
    userId: { type: String, required: true },
    userEmail: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, default: '' },
    likes: { type: Number, default: 0, min: 0 }
}, {
    timestamps: true,
    toJSON: jsonOptions()
});

const songSchema = new Schema({
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    genre: { type: String, trim: true, default: null },
    duration: { type: Number, min: 0, default: null },
    lyrics: { type: String, required: true },
    audioUrl: { type: String, required: true, trim: true },
    playsCount: { type: Number, default: 0, min: 0 },
    // Массив простых значений: в PostgreSQL для этого понадобились бы таблицы tags и song_tags
    tags: [{ type: String, trim: true, lowercase: true }],
    // Массив вложенных документов
    reviews: [reviewSchema]
}, {
    timestamps: true,
    toJSON: jsonOptions()
});

// Индексы: быстрый поиск по исполнителю и по тегам (индекс по массиву — multikey)
songSchema.index({ artist: 1, title: 1 });
songSchema.index({ tags: 1 });

// Виртуальные поля — считаются на лету и в базе не хранятся
songSchema.virtual('reviewsCount').get(function () {
    return this.reviews.length;
});

songSchema.virtual('averageRating').get(function () {
    if (this.reviews.length === 0) {
        return null;
    }

    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Метод экземпляра: song.addReview({...}) — добавляет отзыв и сохраняет документ
songSchema.methods.addReview = function (review) {
    this.reviews.push(review);
    return this.save();
};

// Статический метод модели: Song.findByTag('рок')
songSchema.statics.findByTag = function (tag) {
    return this.find({ tags: String(tag).trim().toLowerCase() }).sort({ _id: 1 });
};

module.exports = mongoose.model('Song', songSchema);
