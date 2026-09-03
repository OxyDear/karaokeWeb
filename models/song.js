'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Song extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Одна песня может принадлежать одному плейлисту (связь один-ко-многим)
      Song.belongsTo(models.Playlist, { foreignKey: 'playlistId', as: 'playlist' });
    }
  }
  Song.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Поле "title" обязательно и не должно быть пустым' } }
    },
    artist: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Поле "artist" обязательно и не должно быть пустым' } }
    },
    genre: DataTypes.STRING,
    duration: {
      type: DataTypes.INTEGER,
      validate: { isInt: { msg: 'Поле "duration" должно быть числом (секунды)' } }
    },
    lyrics: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: 'Поле "lyrics" обязательно и не должно быть пустым' } }
    },
    audioUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Поле "audioUrl" обязательно и не должно быть пустым' } }
    },
    playlistId: DataTypes.INTEGER,
    playsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Song',
  });
  return Song;
};