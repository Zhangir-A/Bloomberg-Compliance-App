import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Ensure environment variables are loaded (idempotent - safe to call multiple times)
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

// Import models
import SanctionsList from './SanctionsList.js';
import PepProfile from './PepProfile.js';
import AdverseMedia from './AdverseMedia.js';
import ScreeningRequest from './ScreeningRequest.js';
import CaseDecision from './CaseDecision.js';

// Initialize models with sequelize instance
const models = {
  SanctionsList: SanctionsList(sequelize),
  PepProfile: PepProfile(sequelize),
  AdverseMedia: AdverseMedia(sequelize),
  ScreeningRequest: ScreeningRequest(sequelize),
  CaseDecision: CaseDecision(sequelize),
};

// Run associations if they exist
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;
