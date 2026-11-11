'use strict';

module.exports = (Song) => ({
    // Model.find(filter) возвращает Query — к нему можно цеплять .sort(), .limit() и т.д.
    findAll: (filter = {}) => Song.find(filter).sort({ _id: 1 }),

    findById: (id) => Song.findById(id),

    create: (data) => Song.create(data),

    // findByIdAndUpdate с { new: true } возвращает уже обновлённый документ
    update: (id, data) => Song.findByIdAndUpdate(id, data, { new: true, runValidators: true }),

    // findByIdAndDelete возвращает удалённый документ (или null, если такого нет)
    remove: (id) => Song.findByIdAndDelete(id),

    findGenres: async () => {
        const genres = await Song.distinct('genre');
        return genres.filter(Boolean).sort((a, b) => a.localeCompare(b, 'ru'));
    },

    findTags: async () => {
        const tags = await Song.distinct('tags');
        return tags.filter(Boolean).sort((a, b) => a.localeCompare(b, 'ru'));
    },

    // Атомарный инкремент на стороне БД: { $inc: { playsCount: 1 } }
    incrementPlays: (id) => Song.findByIdAndUpdate(id, { $inc: { playsCount: 1 } }, { new: true }),

    // --- Работа с вложенным массивом reviews ---

    // $push — добавить элемент в конец массива
    addReview: (songId, review) => Song.findByIdAndUpdate(
        songId,
        { $push: { reviews: review } },
        { new: true, runValidators: true }
    ),

    // Позиционный оператор $: обновляет именно тот элемент массива, который нашёл фильтр
    updateReview: (songId, reviewId, { rating, comment }) => Song.findOneAndUpdate(
        { _id: songId, 'reviews._id': reviewId },
        {
            $set: {
                'reviews.$.rating': rating,
                'reviews.$.comment': comment,
                'reviews.$.updatedAt': new Date()
            }
        },
        { new: true, runValidators: true }
    ),

    // Аналог «увеличить количество товара в корзине»: $inc по элементу массива
    likeReview: (songId, reviewId) => Song.findOneAndUpdate(
        { _id: songId, 'reviews._id': reviewId },
        { $inc: { 'reviews.$.likes': 1 } },
        { new: true }
    ),

    // $pull — удалить из массива элемент по условию
    removeReview: (songId, reviewId) => Song.findByIdAndUpdate(
        songId,
        { $pull: { reviews: { _id: reviewId } } },
        { new: true }
    )
});
