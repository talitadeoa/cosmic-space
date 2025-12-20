import dotenv from "dotenv";
import path from "path";

// Carregar .env.local
const envPath = path.join(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

console.log("📝 Variáveis carregadas:");
console.log("✅ GOOGLE_SA_EMAIL:", process.env.GOOGLE_SA_EMAIL ? "✓" : "✗");
console.log("✅ GOOGLE_SA_KEY:", process.env.GOOGLE_SA_KEY ? `✓ (${process.env.GOOGLE_SA_KEY.substring(0, 50)}...)` : "✗");
console.log("✅ GOOGLE_LUNATIONS_SHEET_ID:", process.env.GOOGLE_LUNATIONS_SHEET_ID || "✗");
console.log("✅ DATABASE_URL:", process.env.DATABASE_URL ? "✓" : "✗");
