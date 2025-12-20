import * as fs from "fs";
import * as path from "path";
import { saveLunations, type LunationData } from "@/lib/forms";

interface CSVRow {
  data: string;
  fase: string;
  emoji: string;
  signo: string;
  signoEmoji: string;
}

/**
 * Converte data de formato DD/MM/YYYY para YYYY-MM-DD
 */
function convertDateFormat(dateStr: string): string {
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) {
    throw new Error(`Formato de data inválido: ${dateStr}`);
  }

  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * Parser simples de CSV (não requer dependências)
 */
function parseCSV(content: string): CSVRow[] {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error("CSV vazio ou sem dados");
  }

  // Pular header (primeira linha)
  const dataLines = lines.slice(1);

  return dataLines
    .map((line) => {
      // Split por vírgula, mas trata aspas
      const parts: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          parts.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      parts.push(current.trim());

      // Validar que temos pelo menos os 5 primeiros campos
      if (parts.length < 5 || !parts[0].match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        return null;
      }

      return {
        data: parts[0],
        fase: parts[1],
        emoji: parts[2],
        signo: parts[3],
        signoEmoji: parts[4],
      };
    })
    .filter((row): row is CSVRow => row !== null);
}

/**
 * Sincroniza dados do CSV com o banco de dados
 */
async function syncCSVToDatabase() {
  try {
    const csvPath = path.join(process.cwd(), "Calendario - Lunações.csv");

    if (!fs.existsSync(csvPath)) {
      console.error(`❌ Arquivo CSV não encontrado: ${csvPath}`);
      process.exit(1);
    }

    console.log(`📖 Lendo CSV: ${csvPath}`);
    const fileContent = fs.readFileSync(csvPath, "utf-8");

    // Parse do CSV
    const rows = parseCSV(fileContent);

    console.log(`✅ ${rows.length} lunações encontradas no CSV`);

    // Converter para LunationData
    const lunations: LunationData[] = rows.map((row) => ({
      lunation_date: convertDateFormat(row.data),
      moon_phase: row.fase,
      moon_emoji: row.emoji || undefined,
      zodiac_sign: row.signo,
      zodiac_emoji: row.signoEmoji || undefined,
      source: "csv-sync",
    }));

    console.log(`\n📝 Primeiras 3 lunações a sincronizar:`);
    lunations.slice(0, 3).forEach((l) => {
      console.log(
        `  • ${l.lunation_date} - ${l.moon_phase} ${l.moon_emoji} (${l.zodiac_sign} ${l.zodiac_emoji})`
      );
    });

    // Salvar no banco
    console.log(`\n💾 Salvando no banco de dados...`);
    const result = await saveLunations(lunations);

    console.log(
      `\n✅ Sincronização concluída com sucesso!`
    );
    console.log(`   ${result.length} lunações foram salvas/atualizadas`);
  } catch (error) {
    console.error("❌ Erro ao sincronizar:", error);
    process.exit(1);
  }
}

// Executar
syncCSVToDatabase();
