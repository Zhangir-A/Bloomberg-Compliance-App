import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ScreeningRequest = sequelize.define(
    'ScreeningRequest',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      request_id: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
      },
      input_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      input_dob: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      input_nationality: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      match_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      response_ms: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'screening_requests',
      timestamps: false,
    }
  );

  return ScreeningRequest;
};
