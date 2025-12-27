// 📝 EXEMPLO DE INTEGRAÇÃO - MonthlyInsightChatModal

// ============================================================================
// PASSO 1: SUBSTITUIR IMPORTAÇÃO
// ============================================================================

// ❌ ANTES (comentado):
// import MonthlyInsightModal from "@/components/MonthlyInsightModal";

// ✅ DEPOIS (novo):
// import MonthlyInsightChatModal from "@/components/MonthlyInsightChatModal";
// (Importação comentada - veja a seção "OPÇÃO AVANÇADA" abaixo)

// ============================================================================
// PASSO 2: USAR NO RETORNO (JSX)
// ============================================================================

// No return() do componente LuaListScreen, procure por:

      <MonthlyInsightModal
        isOpen={isModalOpen}
        moonIndex={selectedMonth?.monthNumber ?? 1}
        moonPhase={selectedMoonPhase}
        moonSignLabel={selectedMoonInfo.signLabel}
        initialInsight={existingInsight}
        lastSavedAt={existingInsightUpdatedAt}
        isLoadingInsight={isLoadingInsight}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleInsightSubmit}
      />

// E SUBSTITUA POR:

      <MonthlyInsightChatModal
        isOpen={isModalOpen}
        moonIndex={selectedMonth?.monthNumber ?? 1}
        moonPhase={selectedMoonPhase}
        moonSignLabel={selectedMoonInfo.signLabel}
        initialInsight={existingInsight}
        lastSavedAt={existingInsightUpdatedAt}
        isLoadingInsight={isLoadingInsight}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleInsightSubmit}
      />

// ✨ É SÓ ISSO! Os props são exatamente os mesmos.

// ============================================================================
// OPÇÃO AVANÇADA: ALTERNAR ENTRE OS DOIS MODOS
// ============================================================================

// Se quiser dar ao usuário a opção de escolher entre chat e formulário:

// 1. Adicione um novo estado no topo do componente:
const [useChatMode, setUseChatMode] = useState(true);

// 2. Importe ambos:
import MonthlyInsightModal from "@/components/MonthlyInsightModal";
import MonthlyInsightChatModal from "@/components/MonthlyInsightChatModal";

// 3. Use um condicional no retorno:
{useChatMode ? (
<MonthlyInsightChatModal
isOpen={isModalOpen}
moonIndex={selectedMonth?.monthNumber ?? 1}
moonPhase={selectedMoonPhase}
moonSignLabel={selectedMoonInfo.signLabel}
initialInsight={existingInsight}
lastSavedAt={existingInsightUpdatedAt}
isLoadingInsight={isLoadingInsight}
onClose={() => setIsModalOpen(false)}
onSubmit={handleInsightSubmit}
/>
) : (
<MonthlyInsightModal
isOpen={isModalOpen}
moonIndex={selectedMonth?.monthNumber ?? 1}
moonPhase={selectedMoonPhase}
moonSignLabel={selectedMoonInfo.signLabel}
initialInsight={existingInsight}
lastSavedAt={existingInsightUpdatedAt}
isLoadingInsight={isLoadingInsight}
onClose={() => setIsModalOpen(false)}
onSubmit={handleInsightSubmit}
/>
)}

// 4. Adicione um botão em algum lugar para alternar:
<button
onClick={() => setUseChatMode(!useChatMode)}
className="..."

> {useChatMode ? '📝 Modo Formulário' : '💬 Modo Chat'}
> </button>

// ============================================================================
// DIFERENÇAS PRINCIPAIS
// ============================================================================

// COMPONENTE ORIGINAL (MonthlyInsightModal)
// ├─ Input: textarea simples
// ├─ Estilo: Modal tradicional
// ├─ Interação: Escrever e salvar
// └─ Salva: Um bloco de texto único

// NOVO COMPONENTE (MonthlyInsightChatModal)
// ├─ Input: conversa em tempo real
// ├─ Estilo: Chat com bolhas de mensagens
// ├─ Interação: Múltiplas mensagens, respostas do sistema
// └─ Salva: Combina todas as mensagens em um bloco

// Os dois salvam exatamente o MESMO formato no banco,
// apenas a experiência de escrita é diferente!

// ============================================================================
// COMO FUNCIONA O NOVO CHAT
// ============================================================================

/\*
Fluxo:

1. Modal abre com saudação da Lua
2. Sistema faz uma pergunta (ex: "O que você gostaria de plantar?")
3. Usuário digita e pressiona Enter ou clica no botão
4. Sua mensagem aparece como bolha azul à direita
5. Sistema responde com encorajamento (bolha cinza à esquerda)
6. Usuário pode enviar mais mensagens (conversa!)
7. Ao clicar "Concluir e Salvar", todas as mensagens são combinadas
8. Salva no banco como um insight único (igual antes)

Exemplo visual:

┌──────────────────────────────────┐
│ 🌕 Lua Cheia - Dezembro │
├──────────────────────────────────┤
│ │
│ 🌙: Bem-vindo à Lua Cheia! │
│ 🌙: O que você colheu este mês? │
│ │
│ Você: │
│ "Realizei X" │
│ │
│ 🌙: Que colheita magnífica! ✨ │
│ │
│ Você: │
│ "E também Y" │
│ │
│ 🌙: Parabéns! 🌟 │
│ │
├──────────────────────────────────┤
│ [Input: Digite mais...] [Enviar] │
│ [✨ Concluir e Salvar] │
└──────────────────────────────────┘

No banco, salva como:
"Realizei X

E também Y"
\*/

// ============================================================================
// CUSTOMIZAÇÕES
// ============================================================================

// 1. MUDAR EMOJIS DAS FASES
// Em MonthlyInsightChatModal.tsx, procure por:

const moonPhaseLabels: Record<string, string> = {
luaNova: '🌑 Lua Nova',
luaCrescente: '🌓 Lua Crescente',
luaCheia: '🌕 Lua Cheia',
luaMinguante: '🌗 Lua Minguante',
};

// E mude os emojis como quiser!

// 2. MUDAR RESPOSTAS DO SISTEMA
// Procure por:

const systemResponses: Record<string, string[]> = {
luaNova: [
'Que intenções poderosas! 🌱',
'Essas sementes do seu coração estão plantadas. ✨',
'Você está abrindo caminhos para o novo. 🌙',
],
// ... mais fases
};

// Adicione suas próprias respostas!

// 3. MUDAR CORES
// Procure por 'bg-indigo-500/40' no chat e mude para outro Tailwind color
// Opções: purple, blue, emerald, rose, amber, etc.

// ============================================================================
// PERGUNTAS FREQUENTES
// ============================================================================

/\*
P: Os dados salvos são iguais?
R: Sim! Ambos salvam no mesmo formato no banco de dados.

P: Posso usar as duas versões ao mesmo tempo?
R: Sim! Você pode importar as duas e alternar com um estado.

P: Posso adicionar mais fases lunares?
R: Sim! Adicione em moonPhaseLabels e phasePrompts.

P: E se o usuário preferir não usar o chat?
R: Mantenha a importação da versão original e use um estado
para alternar entre as duas!

P: Preciso mexer no backend?
R: Não! O backend continua exatamente igual.

P: Como funciona a combinação de mensagens?
R: const userMessages = messages.filter((m) => m.role === 'user')
Depois faz: userMessages.join('\n\n')
Cada mensagem em uma linha diferente!
\*/

export {}; // dummy export
