import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import models from '../models/index.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

/**
 * Import adverse media alerts from CSV file
 * Usage: node src/scripts/import-adverse-media.js <path-to-csv>
 *
 * CSV format:
 * date,source,headline,summary,category,url
 *
 * Example:
 * node src/scripts/import-adverse-media.js data/adverse_media_sample.csv
 */

async function importAdverseMedia() {
  try {
    const filePath = process.argv[2];

    if (!filePath) {
      console.error('Usage: node import-adverse-media.js <csv-file>');
      console.error('Example: node import-adverse-media.js data/adverse_media_sample.csv');
      process.exit(1);
    }

    console.log(`📥 Importing adverse media from ${filePath}...`);

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
      // Parse entities if provided
      let entities = null;
      if (row.entities && row.entities.trim()) {
        try {
          entities = JSON.parse(row.entities);
        } catch (e) {
          entities = null;
        }
      }

      const mediaData = {
        alert_id: row.alert_id || `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: row.date,
        source: row.source,
        headline: row.headline,
        summary: row.summary || null,
        category: row.category || null,
        entities: entities,
        url: row.url || null,
      };

      // Upsert record
      const [record, isNew] = await models.AdverseMedia.findOrCreate({
        where: { alert_id: mediaData.alert_id },
        defaults: mediaData,
      });

      if (!isNew) {
        await record.update(mediaData);
        updated++;
      } else {
        created++;
      }
    }

    console.log(`✓ Import complete: ${created} created, ${updated} updated`);

    // Display summary
    const total = await models.AdverseMedia.count();
    const byCategory = await models.AdverseMedia.findAll({
      attributes: ['category'],
      raw: true,
    });

    const categories = {};
    byCategory.forEach(row => {
      const cat = row.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    console.log(`\n📊 Adverse Media Summary:`);
    console.log(`  Total records: ${total}`);
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

importAdverseMedia();
