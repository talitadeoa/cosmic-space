#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const DEFAULT_SOURCE = 'csv';

const toNormalizedHeader = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const parseCsv = (input) => {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        const next = input[i + 1];
        if (next === '"') {
          value += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      value += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (char === ',') {
      row.push(value);
      value = '';
      i += 1;
      continue;
    }

    if (char === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
      i += 1;
      continue;
    }

    if (char === '\r') {
      i += 1;
      continue;
    }

    value += char;
    i += 1;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
};

const parseDateToIso = (value) => {
  if (!value) return null;
  const trimmed = value.toString().trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }

  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) return null;

  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${month}-${day}`;
};

const getHeaderIndexes = (headerRow) => {
  const indexes = {};
  headerRow.forEach((value, idx) => {
    const key = toNormalizedHeader(value);
    indexes[key] = idx;
  });

  return {
    data: indexes.data,
    fase: indexes.fasedalua,
    signo: indexes.signo,
  };
};

const readRows = (rows, headerIndexes) => {
  const items = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const dateRaw = row[headerIndexes.data] || '';
    const phaseRaw = row[headerIndexes.fase] || '';
    const signRaw = row[headerIndexes.signo] || '';

    const lunationDate = parseDateToIso(dateRaw);
    const moonPhase = phaseRaw.toString().trim();
    const zodiacSign = signRaw.toString().trim();

    if (!lunationDate || !moonPhase || !zodiacSign) {
      continue;
    }

    items.push({
      lunation_date: lunationDate,
      moon_phase: moonPhase,
      zodiac_sign: zodiacSign,
    });
  }

  return items;
};

const run = async () => {
  const [, , inputPathArg] = process.argv;
  const inputPath = inputPathArg ? path.resolve(process.cwd(), inputPathArg) : null;

  if (!inputPath) {
    console.error('Uso: node scripts/import-lunations-csv.js <caminho-do-csv>');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL não configurada.');
    process.exit(1);
  }

  const content = fs.readFileSync(inputPath, 'utf8');
  const rows = parseCsv(content);

  if (!rows.length) {
    console.error('CSV vazio ou inválido.');
    process.exit(1);
  }

  const headerIndexes = getHeaderIndexes(rows[0]);
  if (
    headerIndexes.data === undefined ||
    headerIndexes.fase === undefined ||
    headerIndexes.signo === undefined
  ) {
    console.error('Cabeçalho inválido. Esperado: Data, FasedaLua, Signo.');
    process.exit(1);
  }

  const entries = readRows(rows, headerIndexes);

  if (!entries.length) {
    console.error('Nenhuma lunação válida encontrada no CSV.');
    process.exit(1);
  }

  const db = neon(process.env.DATABASE_URL);
  let inserted = 0;

  for (const entry of entries) {
    await db`
      INSERT INTO lunations (lunation_date, moon_phase, zodiac_sign, source)
      VALUES (${entry.lunation_date}, ${entry.moon_phase}, ${entry.zodiac_sign}, ${DEFAULT_SOURCE})
      ON CONFLICT (lunation_date) DO UPDATE SET
        moon_phase = EXCLUDED.moon_phase,
        zodiac_sign = EXCLUDED.zodiac_sign,
        updated_at = NOW()
    `;
    inserted += 1;
  }

  console.warn(`Importadas ${inserted} lunações de ${entries.length} linhas.`);
};

run().catch((error) => {
  console.error('Erro ao importar lunações:', error);
  process.exit(1);
});
