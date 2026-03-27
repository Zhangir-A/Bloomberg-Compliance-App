import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import models from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Import PEP data from CSV file
 * Usage: node src/scripts/import-pep.js <path-to-csv>
 *
 * Example:
 * node src/scripts/import-pep.js data/pep_kz_initial.csv
 */

async function importPEP() {
  try {
    const filePath = process.argv[2];

    if (!filePath) {
      console.error('Usage: node import-pep.js <csv-file>');
      console.error('Example: node import-pep.js data/pep_kz_initial.csv');
      process.exit(1);
    }

    console.log(`📥 Importing PEP profiles from ${filePath}...`);

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
    let created = 0;
    let updated = 0;

    for (const row of records) {
      // Parse associates and source_urls if they're JSON strings
      let associates = null;
      let sourceUrls = null;

      if (row.associates && row.associates.trim()) {
        try {
          associates = JSON.parse(row.associates);
        } catch (e) {
          // If not valid JSON, store as null
          associates = null;
        }
      }

      if (row.source_urls && row.source_urls.trim()) {
        try {
          sourceUrls = JSON.parse(row.source_urls);
        } catch (e) {
          // Try splitting by comma if it's a simple string
          sourceUrls = row.source_urls.split(',').map(url => url.trim());
        }
      }

      const pepData = {
        pep_id: row.pep_id,
        name_latin: row.name_latin,
        name_cyrillic: row.name_cyrillic || null,
        position: row.position || null,
        organization: row.organization || null,
        tier: row.tier ? parseInt(row.tier) : null,
        start_date: row.start_date || null,
        end_date: row.end_date || null,
        is_active: row.is_active === 'TRUE' || row.is_active === 'true' || row.is_active === '1',
        associates: associates,
        source_urls: sourceUrls,
      };

      // Upsert record
      const [record, isNew] = await models.PepProfile.findOrCreate({
        where: { pep_id: row.pep_id },
        defaults: pepData,
      });

      if (!isNew) {
        await record.update(pepData);
        updated++;
      } else {
        created++;
      }
    }

    console.log(`✓ Import complete: ${created} created, ${updated} updated`);

    // Display summary
    const total = await models.PepProfile.count();
    const byTier = await models.PepProfile.findAll({
      attributes: ['tier'],
      raw: true,
    });

    const tiers = {};
    byTier.forEach(row => {
      const tier = row.tier || 'Unknown';
      tiers[tier] = (tiers[tier] || 0) + 1;
    });

    console.log(`\n📊 PEP Database Summary:`);
    console.log(`  Total records: ${total}`);
    Object.entries(tiers).forEach(([tier, count]) => {
      console.log(`  Tier ${tier}: ${count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

importPEP();
