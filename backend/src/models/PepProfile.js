import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const PepProfile = sequelize.define(
    'PepProfile',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pep_id: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        comment: 'Format: PEP-KZ-00001',
      },
      name_latin: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name_cyrillic: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      position: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      organization: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      tier: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 4,
        },
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      associates: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      source_urls: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'pep_profiles',
      timestamps: false,
      indexes: [
        {
          fields: ['name_latin'],
        },
      ],
    }
  );

  return PepProfile;
};
