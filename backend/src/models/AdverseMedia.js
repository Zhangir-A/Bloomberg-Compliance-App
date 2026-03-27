import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AdverseMedia = sequelize.define(
    'AdverseMedia',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      alert_id: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      source: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      headline: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      summary: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      entities: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'adverse_media',
      timestamps: false,
    }
  );

  return AdverseMedia;
};
