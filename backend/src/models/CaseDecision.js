import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const CaseDecision = sequelize.define(
    'CaseDecision',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      match_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      match_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'PEP, SANCTIONS, ADVERSE_MEDIA',
      },
      decision: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'true_positive, false_positive, needs_review',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      request_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'case_decisions',
      timestamps: false,
    }
  );

  return CaseDecision;
};
