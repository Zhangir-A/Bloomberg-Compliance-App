import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import models from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Import sanctions data from CSV file
 * Usage: node src/scripts/import-sanctions.js <path-to-csv> <source>
 *
 * Example:
 * node src/scripts/import-sanctions.js data/sanctions_ofac.csv OFAC
 */

async function importSanctions() {
  try {
    const filePath = process.argv[2];
    const source = process.argv[3];

    if (!filePath || !source) {
      console.error('Usage: node import-sanctions.js <csv-file> <source>');
      console.error('Example: node import-sanctions.js data/sanctions_ofac.csv OFAC');
      process.exit(1);
    }

    console.log(`📥 Importing sanctions from ${filePath} (source: ${source})...`);

    // Read CSV file
    const csvPath = path.resolve(filePath);
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`📋 Parsed ${records.length} records from CSV`);

    // Connect to database
    await models.sequelize.authenticate();
    console.log('✓ Database connected');

    // Import records
    const today = new Date().toISOString().split('T')[0];

    const sanctionsData = records.map(row => ({
      name_latin: row.name_latin,
      name_cyrillic: row.name_cyrillic || null,
      list_source: source,
      list_date: row.list_date || today,
      dob: row.dob || null,
      nationality: row.nationality || null,
      raw_data: JSON.stringify(row),
    }));

    // Upsert records (update if exists, insert if new)
    let created = 0;
    let updated = 0;

    for (const data of sanctionsData) {
      const [record, isNew] = await models.SanctionsList.findOrCreate({
        where: {
          name_latin: data.name_latin,
          list_source: data.list_source,
        },
        defaults: data,
      });

      if (!isNew) {
        await record.update(data);
        updated++;
      } else {
        created++;
      }
    }

    console.log(`✓ Import complete: ${created} created, ${updated} updated`);

    // Display summary
    const total = await models.SanctionsList.count();
    const bySource = await models.SanctionsList.findAll({
      attributes: ['list_source'],
      raw: true,
    });

    const sources = {};
    bySource.forEach(row => {
      sources[row.list_source] = (sources[row.list_source] || 0) + 1;
    });

    console.log(`\n📊 Sanctions List Summary:`);
    console.log(`  Total records: ${total}`);
    Object.entries(sources).forEach(([src, count]) => {
      console.log(`  ${src}: ${count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

importSanctions();
