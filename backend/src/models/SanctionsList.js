import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const SanctionsList = sequelize.define(
    'SanctionsList',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name_latin: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name_cyrillic: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      list_source: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'OFAC, EU, UK, UN',
      },
      list_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dob: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      nationality: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      raw_data: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'sanctions_list',
      timestamps: false,
      indexes: [
        {
          fields: ['name_latin'],
        },
      ],
    }
  );

  return SanctionsList;
};
