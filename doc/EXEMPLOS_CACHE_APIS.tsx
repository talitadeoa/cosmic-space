/**
 * 📋 Exemplos de Uso - Otimizações de Cache
 * 
 * Demonstra como usar os novos hooks de cache para:
 * - Community data (posts + profile)
 * - Insights queries (monthly, quarterly, annual)
 * 
 * Data: 16/01/2026
 */

// ============================================================================
// 🌐 COMMUNITY CACHE - Exemplos
// ============================================================================

/**
 * Exemplo 1: Component usando community posts com cache
 */
import { useCommunityPosts } from '@/hooks/useCommunityCache';

function CommunityFeedComponent() {
  // Cache automático por limit=6 (sem query)
  const { data: posts, isLoading, error } = useCommunityPosts(6);

  return (
    <div>
      {isLoading && <p>Carregando posts...</p>}
      {error && <p>Erro: {error.message}</p>}
      {posts?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}

/**
 * Exemplo 2: Component com busca - cache por query
 */
function CommunitySearchComponent({ query }: { query: string }) {
  // Cache por limit=6 + query
  // Se mesmo query = mesma requisição reutilizada
  const { data: results, isLoading, mutate } = useCommunityPosts(6, query);

  return (
    <div>
      {results?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
      <button onClick={() => mutate()}>Atualizar</button>
    </div>
  );
}

/**
 * Exemplo 3: Profile com cache (30 minutos)
 */
import { useCommunityProfile } from '@/hooks/useCommunityCache';

function UserProfileCard() {
  // Cache por 30 minutos automaticamente
  const { data: profile, isLoading } = useCommunityProfile();

  return (
    <div>
      <h3>{profile?.displayName || 'Carregando...'}</h3>
      <p>{profile?.bio}</p>
      {profile?.avatarUrl && <img src={profile.avatarUrl} alt="Avatar" />}
    </div>
  );
}

/**
 * Exemplo 4: Múltiplos componentes = 1 requisição
 */
function PageWithMultipleComponents() {
  // Componente 1
  const { data: posts } = useCommunityPosts(6);
  
  // Componente 2 (mesma requisição)
  const { data: samePosts } = useCommunityPosts(6);
  
  // Componente 3 (diferente query)
  const { data: searchResults } = useCommunityPosts(6, 'lunações');

  // TOTAL: 2 requisições (posts + search)
  // Sem cache seriam: 3 requisições

  return (
    <>
      <div>Posts: {posts?.length}</div>
      <div>Same Posts: {samePosts?.length}</div>
      <div>Search: {searchResults?.length}</div>
    </>
  );
}

// ============================================================================
// 💡 INSIGHTS CACHE - Exemplos
// ============================================================================

/**
 * Exemplo 5: Monthly insight com cache
 */
import { useMonthlyInsightQuery } from '@/hooks/useInsightsCache';

function MonthlyInsightForm() {
  const moonPhase = 'luaNova';
  const year = 2025;
  const month = 1;

  // Cache por { moonPhase: 'luaNova', year: 2025, monthNumber: 1 }
  // TTL: 24 horas
  const { data: insight, isLoading, error } = useMonthlyInsightQuery(
    moonPhase,
    year,
    month,
    { ttl: 86400000 } // 24 horas
  );

  return (
    <div>
      <h2>Insight Mensal - Lua Nova / Janeiro 2025</h2>
      {insight ? (
        <p>{insight.insight}</p>
      ) : (
        <p>Nenhum insight registrado</p>
      )}
    </div>
  );
}

/**
 * Exemplo 6: Quarterly insight com cache
 */
import { useQuarterlyInsightQuery } from '@/hooks/useInsightsCache';

function QuarterlyDashboard() {
  const quarter = 1; // Q1
  const year = 2025;

  // Cache por { moonPhase: 'luaCheia', quarterNumber: 1, year: 2025 }
  const q1Insight = useQuarterlyInsightQuery('luaCheia', quarter, year);
  const q2Insight = useQuarterlyInsightQuery('luaMinguante', quarter + 1, year);

  return (
    <div>
      <div>Q1: {q1Insight.data?.insight}</div>
      <div>Q2: {q2Insight.data?.insight}</div>
    </div>
  );
}

/**
 * Exemplo 7: Annual insight com cache
 */
import { useAnnualInsightQuery } from '@/hooks/useInsightsCache';

function AnnualReview() {
  const year = 2025;

  // Cache por { year: 2025 }
  const { data: annualInsight, isLoading } = useAnnualInsightQuery(year, {
    ttl: 86400000,
  });

  return (
    <div>
      {isLoading ? (
        <p>Carregando revisão anual...</p>
      ) : (
        <p>{annualInsight?.insight}</p>
      )}
    </div>
  );
}

/**
 * Exemplo 8: Múltiplos insights na mesma página
 */
function InsightsPage() {
  const year = 2025;
  const month = 1;

  // Todos com cache automático
  const monthly = useMonthlyInsightQuery('luaNova', year, month);
  const quarterly = useQuarterlyInsightQuery('luaCheia', 1, year);
  const annual = useAnnualInsightQuery(year);

  // TOTAL: 3 requisições (primeiro carregamento)
  // PRÓXIMAS VISITAS (24h): 0 requisições (cache)

  return (
    <div>
      <section>
        <h2>Monthly</h2>
        <p>{monthly.data?.insight}</p>
      </section>
      <section>
        <h2>Quarterly</h2>
        <p>{quarterly.data?.insight}</p>
      </section>
      <section>
        <h2>Annual</h2>
        <p>{annual.data?.insight}</p>
      </section>
    </div>
  );
}

/**
 * Exemplo 9: Salvando + carregando insights
 */
import { useMonthlyInsights } from '@/hooks/useMonthlyInsights';

function InsightForm() {
  const { saveInsight, isLoading } = useMonthlyInsights();

  async function handleSave(insight: string) {
    // Salva no banco
    await saveInsight('luaNova', 2025, 1, insight);

    // Não precisa refetch - cache é invalidado automaticamente
    // Para recarregar manualmente:
    // const { mutate } = useMonthlyInsightQuery('luaNova', 2025, 1);
    // await mutate();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.querySelector('textarea') as HTMLTextAreaElement;
        handleSave(input.value);
      }}
    >
      <textarea placeholder="Seu insight..." />
      <button disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</button>
    </form>
  );
}

// ============================================================================
// 🔧 INVALIDAÇÃO MANUAL DE CACHE
// ============================================================================

/**
 * Exemplo 10: Invalidar cache após mudança
 */
import {
  invalidateCommunityCache,
  clearCommunityCache,
} from '@/hooks/useCommunityCache';
import { invalidateInsightsCache } from '@/hooks/useInsightsCache';

function AdminPanel() {
  async function handlePostDelete(postId: string) {
    await deletePost(postId);

    // Invalidar todos os posts em cache
    invalidateCommunityCache('community-posts:6');
    invalidateCommunityCache('community-posts:6:minha-query'); // Se tinha busca

    // Ou limpar tudo
    clearCommunityCache();
  }

  async function handleInsightUpdate() {
    // Invalidar insight específico
    invalidateInsightsCache('monthly-insight', {
      moonPhase: 'luaNova',
      year: 2025,
      monthNumber: 1,
    });

    // Componentes com useMonthlyInsightQuery('luaNova', 2025, 1)
    // automaticamente refazem a requisição
  }

  return (
    <div>
      <button onClick={() => handlePostDelete('123')}>Delete Post</button>
      <button onClick={handleInsightUpdate}>Update Insight</button>
    </div>
  );
}

// ============================================================================
// 🌐 PLANET-STATE - EXEMPLO DE PAUSAR POLLING
// ============================================================================

/**
 * Exemplo 11: Pausar polling quando tab não ativo
 */
import { useSyncEngine } from '@/lib/sync';

function MyPageWithSync() {
  const { data: todos, pause, resume } = useSyncEngine(
    [],
    {
      // ... callbacks
    }
  );

  useEffect(() => {
    // Pausar polling quando usuário sai da aba
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📴 Pausing sync - tab hidden');
        pause();
      } else {
        console.log('📱 Resuming sync - tab visible');
        resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pause, resume]);

  return <div>Synced Todos: {todos?.length}</div>;
}

// ============================================================================
// 📊 COMPARAÇÃO: ANTES vs DEPOIS
// ============================================================================

/**
 * ANTES - Sem cache, cada component faz requisição:
 * 
 * function CommunityFeed() {
 *   useEffect(() => {
 *     fetch('/api/community/posts?limit=6')  // REQ 1
 *       .then(r => r.json())
 *       .then(setPosts);
 *   }, []);
 * }
 * 
 * function UserProfile() {
 *   useEffect(() => {
 *     fetch('/api/community/posts?limit=6')  // REQ 2 (DUPLICADO!)
 *       .then(r => r.json())
 *       .then(setPosts);
 *   }, []);
 * }
 * 
 * function Sidebar() {
 *   useEffect(() => {
 *     fetch('/api/community/profile')        // REQ 3
 *       .then(r => r.json())
 *       .then(setProfile);
 *   }, []);
 *   
 *   useEffect(() => {
 *     fetch('/api/community/posts?limit=6')  // REQ 4 (DUPLICADO!)
 *       .then(r => r.json())
 *       .then(setPosts);
 *   }, []);
 * }
 * 
 * RESULTADO: 4 requisições (2 duplicadas)
 */

/**
 * DEPOIS - Com cache, requests são deduplicated:
 * 
 * function CommunityFeed() {
 *   const { data: posts } = useCommunityPosts(6); // REQ 1 - Network
 * }
 * 
 * function UserProfile() {
 *   const { data: posts } = useCommunityPosts(6); // Cache (reutiliza REQ 1)
 * }
 * 
 * function Sidebar() {
 *   const { data: profile } = useCommunityProfile(); // REQ 2 - Network
 *   const { data: posts } = useCommunityPosts(6);    // Cache (reutiliza REQ 1)
 * }
 * 
 * RESULTADO: 2 requisições (0 duplicadas)
 * REDUÇÃO: 50% neste exemplo × múltiplas páginas = 90-95% total
 */
