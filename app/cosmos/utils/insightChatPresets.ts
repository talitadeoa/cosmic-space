import {
  MOON_PHASE_EMOJI_LABELS,
  type MoonPhase,
} from "./moonPhases";

export const MONTHLY_INSIGHT_LABELS: Record<MoonPhase, string> = MOON_PHASE_EMOJI_LABELS;

export const MONTHLY_PROMPTS: Record<
  MoonPhase,
  { greeting: string; systemQuestion: string; placeholder: string }
> = {
  luaNova: {
    greeting: "Bem-vindo à Lua Nova de {month}",
    systemQuestion: "O que você gostaria de plantar nesta fase? 🌱",
    placeholder: "Intenções, sementes, inícios que você quer colocar no mundo...",
  },
  luaCrescente: {
    greeting: "Bem-vindo à Lua Crescente de {month}",
    systemQuestion: "Como você está crescendo nesta fase? 📈",
    placeholder: "Ações, crescimento e desenvolvimento que você está vivendo...",
  },
  luaCheia: {
    greeting: "Bem-vindo à Lua Cheia de {month}",
    systemQuestion: "O que você gostaria de colher nesta fase? 🌕",
    placeholder: "Resultados, colheitas e celebrações do que foi plantado...",
  },
  luaMinguante: {
    greeting: "Bem-vindo à Lua Minguante de {month}",
    systemQuestion: "O que você gostaria de liberar nesta fase? 🍂",
    placeholder: "Aprendizados, sombras e padrões que você quer soltar...",
  },
};

export const MONTHLY_RESPONSES: Record<MoonPhase, string[]> = {
  luaNova: [
    "Que intenções poderosas! 🌱 Você está pronto para este novo ciclo.",
    "Excelente! Essas sementes do seu coração estão plantadas. ✨",
    "Que lindo! Você já está abrindo caminhos para o novo. 🌙",
  ],
  luaCrescente: [
    "Seu crescimento é inspirador! Continuamos em movimento. 📈",
    "Ótimo! Você está honrando seu próprio desenvolvimento. 🌟",
    "Que ritmo maravilhoso! Siga este caminho. ✨",
  ],
  luaCheia: [
    "Que colheita magnífica! Você está celebrando o ciclo completo. 🌕",
    "Incrível! Veja tudo que você realizou. ✨",
    "A plenitude é sua! Que beleza neste momento. 🙏",
  ],
  luaMinguante: [
    "Que libertação! Você está honrando o fim do ciclo. 🌙",
    "Profundo! Soltar é tão poderoso quanto plantar. ✨",
    "Excelente insight! Você está trazendo sabedoria para casa. 🍂",
  ],
};

export const MONTHLY_TONES: Record<MoonPhase, "indigo" | "sky" | "amber" | "violet"> = {
  luaNova: "indigo",
  luaCrescente: "sky",
  luaCheia: "amber",
  luaMinguante: "violet",
};

export const QUARTERLY_INFO: Record<
  MoonPhase,
  { name: string; quarter: string; months: string }
> = {
  luaNova: { name: "Lua Nova", quarter: "1º Trimestre", months: "Jan - Mar" },
  luaCrescente: { name: "Lua Crescente", quarter: "2º Trimestre", months: "Abr - Jun" },
  luaCheia: { name: "Lua Cheia", quarter: "3º Trimestre", months: "Jul - Set" },
  luaMinguante: { name: "Lua Minguante", quarter: "4º Trimestre", months: "Out - Dez" },
};

export const QUARTERLY_PROMPTS: Record<
  MoonPhase,
  { greeting: string; question: string; placeholder: string }
> = {
  luaNova: {
    greeting: "Insight do 1º Trimestre",
    question: "O que nasce para você neste trimestre? 🌱",
    placeholder: "Intenções, sementes e direção para os próximos meses...",
  },
  luaCrescente: {
    greeting: "Insight do 2º Trimestre",
    question: "Como seu ritmo cresce neste trimestre? 📈",
    placeholder: "Ações, ajustes e evolução do seu caminho...",
  },
  luaCheia: {
    greeting: "Insight do 3º Trimestre",
    question: "O que floresce no auge do ciclo? 🌕",
    placeholder: "Resultados, conquistas e aprendizados do período...",
  },
  luaMinguante: {
    greeting: "Insight do 4º Trimestre",
    question: "O que pede pausa ou liberação agora? 🍂",
    placeholder: "Encerramentos, limpeza e preparação para o próximo ciclo...",
  },
};

export const QUARTERLY_RESPONSES: Record<MoonPhase, string[]> = {
  luaNova: [
    "Que começo lindo para o trimestre! 🌱",
    "Suas intenções estão bem claras. ✨",
    "Ótima direção para este ciclo. 🌙",
  ],
  luaCrescente: [
    "Seu ritmo está consistente! 📈",
    "Que evolução poderosa! 🌟",
    "Continue expandindo com confiança. ✨",
  ],
  luaCheia: [
    "Quanta realização neste trimestre! 🌕",
    "Colheita linda, celebre! ✨",
    "Seu caminho está iluminado. 🙏",
  ],
  luaMinguante: [
    "Liberar também é crescer. 🌙",
    "Que maturidade para fechar o ciclo. ✨",
    "Excelente fechamento do trimestre. 🍂",
  ],
};

export const RING_ENERGY_PROMPTS: Record<
  MoonPhase,
  { title: string; question: string; placeholder: string }
> = {
  luaNova: {
    title: "Energia da Lua Nova",
    question: "Que ideias, intenções e sementes nascem na Lua Nova?",
    placeholder: "Ideias, intenções, sementes — como esse início vibra em você?",
  },
  luaCrescente: {
    title: "Energia da Lua Crescente",
    question: "Que checklists, rituais e ações pedem espaço agora?",
    placeholder: "Checklists, rituais, planejamento, ação — o que ganha ritmo?",
  },
  luaCheia: {
    title: "Energia da Lua Cheia",
    question: "Quais tesouros e frutos você reconhece na Lua Cheia?",
    placeholder: "Tesouros, recompensas, colheitas — o que transborda?",
  },
  luaMinguante: {
    title: "Energia da Lua Minguante",
    question: "Quais aprendizados e desapegos pedem espaço?",
    placeholder: "Aprendizados, desapegos — o que precisa descansar ou ir?",
  },
};

export const RING_ENERGY_RESPONSES = [
  "Energia registrada com clareza. ✨",
  "Seu corpo falou, e você ouviu. 🌙",
  "Que leitura honesta do momento. 💫",
];

export const buildMonthlyStorageKey = (
  year: number | string,
  monthNumber: number,
  phase: MoonPhase,
) => `insight-mensal-${year}-${monthNumber}-${phase}`;

export const buildQuarterlyStorageKey = (year: number, phase: MoonPhase) =>
  `insight-trimestral-${year}-${phase}`;

export const buildAnnualStorageKey = (year: number) => `insight-anual-${year}`;

export const buildRingEnergyStorageKey = (phase: MoonPhase) =>
  `energia-ring-${phase}`;
