'use strict';

module.exports = (sequelize, DataTypes) => {
    const Song = sequelize.define('Song', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        title: { type: DataTypes.STRING, allowNull: false },
        artist: { type: DataTypes.STRING, allowNull: false },
        genre: { type: DataTypes.STRING, allowNull: true },
        duration: { type: DataTypes.INTEGER, allowNull: true },
        lyrics: { type: DataTypes.TEXT, allowNull: false },
        audioUrl: { type: DataTypes.STRING, allowNull: false },
        playsCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
    }, {
        tableName: '"Songs"'
    });

    return Song;
};
