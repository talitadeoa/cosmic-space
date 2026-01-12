# 🔄 Diagramas de Máquina de Estados dos Componentes

Este documento contém os diagramas de máquina de estados dos principais componentes do projeto cosmic-space.

---

## 1. AuthChatFlow - Fluxo de Autenticação

O componente `AuthChatFlow` implementa um fluxo conversacional para login e cadastro.

### 1.1 Máquina de Estados Principal

```mermaid
stateDiagram-v2
    [*] --> Mode: Inicialização

    state "Mode Selection" as Mode {
        [*] --> WaitingInput
        WaitingInput --> Login: "entrar" / "login"
        WaitingInput --> Signup: "criar conta" / "signup"
        WaitingInput --> WaitingInput: input inválido
    }

    state "Login Flow" as Login {
        [*] --> Email_L
        Email_L --> Password_L: email válido
        Email_L --> Email_L: email inválido
        Password_L --> Submitting_L: senha válida
        Password_L --> Password_L: senha curta
        Submitting_L --> Success: auth OK
        Submitting_L --> Email_L: auth falhou
    }

    state "Signup Flow" as Signup {
        [*] --> FirstName
        FirstName --> LastName: nome válido (≥2 chars)
        FirstName --> FirstName: nome curto
        LastName --> BirthDate: sobrenome válido
        LastName --> LastName: sobrenome curto
        BirthDate --> Gender: data válida (dd/mm/aaaa)
        BirthDate --> BirthDate: formato inválido
        Gender --> Email_S: gênero reconhecido
        Gender --> Gender: gênero não reconhecido
        Email_S --> Password_S: email válido
        Email_S --> Email_S: email inválido
        Password_S --> Submitting_S: senha válida
        Password_S --> Password_S: senha curta
        Submitting_S --> Success: auth OK
        Submitting_S --> FirstName: auth falhou (reset)
    }

    Success --> [*]: onAuthenticated()
```

### 1.2 Estados do Step (AuthStep)

```mermaid
stateDiagram-v2
    [*] --> mode
    
    mode --> email: Login selecionado
    mode --> firstName: Signup selecionado
    
    firstName --> lastName
    lastName --> birthDate
    birthDate --> gender
    gender --> email
    
    email --> password
    password --> [*]: Autenticação bem-sucedida
    
    note right of mode: Escolha inicial do usuário
    note right of gender: Sugestões disponíveis:\n- feminino\n- masculino\n- outro\n- prefiro não informar
```

### 1.3 Estados de Submissão

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Submitting: submitAuth()
    Submitting --> Success: result.ok === true
    Submitting --> Error: result.ok === false
    
    Error --> Idle: resetFlow()
    Success --> Authenticated: onAuthenticated()
    
    state Submitting {
        [*] --> Calling
        Calling --> Validating
        Validating --> Responding
    }
```

---

## 2. EmotionalInput - Seletor de Emoções

O componente `EmotionalInput` permite ao usuário selecionar e registrar emoções.

### 2.1 Máquina de Estados Principal

```mermaid
stateDiagram-v2
    [*] --> Loading: Componente monta
    
    Loading --> Idle: localStorage carregado
    Loading --> IdleEmpty: sem dados salvos
    
    state IdleEmpty {
        [*] --> NoEmotionSelected
    }
    
    state Idle {
        [*] --> EmotionLoaded
        EmotionLoaded --> Hovering: mouse enter
        Hovering --> EmotionLoaded: mouse leave
    }
    
    Idle --> Selecting: click em emoji
    IdleEmpty --> Selecting: click em emoji
    
    Selecting --> Saving: emoção selecionada
    
    state Saving {
        [*] --> SaveToStorage
        SaveToStorage --> UpdateHistory
        UpdateHistory --> ShowFeedback
    }
    
    Saving --> FeedbackVisible: salvo com sucesso
    FeedbackVisible --> Idle: timeout 2.5s
    
    note right of FeedbackVisible: "✓ Emoção registrada\ncom sucesso!"
```

### 2.2 Estados de Interação

```mermaid
stateDiagram-v2
    [*] --> Default
    
    Default --> Hovered: onMouseEnter
    Hovered --> Default: onMouseLeave
    
    Default --> Selected: onClick
    Hovered --> Selected: onClick
    
    Selected --> JustSaved: localStorage.setItem()
    JustSaved --> Selected: timeout 2.5s
    
    state Hovered {
        [*] --> ShowTooltip
    }
    
    state JustSaved {
        [*] --> ShowCheckmark
        ShowCheckmark --> ShowSuccessBanner
    }
```

---

## 3. MenstrualTracker - Rastreador Menstrual

O componente `MenstrualTracker` permite registrar e visualizar dados menstruais.

### 3.1 Máquina de Estados Principal

```mermaid
stateDiagram-v2
    [*] --> Disabled: isEnabled === false
    [*] --> Loading: isEnabled === true
    
    Disabled --> [*]: return null
    
    Loading --> Ready: localStorage carregado
    
    state Ready {
        [*] --> FormClosed
        FormClosed --> FormOpen: click "Registrar"
        FormOpen --> FormClosed: click "Cancelar" / "✕"
        FormOpen --> Submitting: submit form
        Submitting --> FormClosed: sucesso
    }
    
    note right of Ready: Exibe botão e histórico
```

### 3.2 Estados do Formulário

```mermaid
stateDiagram-v2
    [*] --> DateSelection
    
    DateSelection --> FlowIntensity: data selecionada
    FlowIntensity --> SymptomSelection: intensidade selecionada
    SymptomSelection --> NotesInput: sintomas selecionados
    NotesInput --> ReadyToSubmit: notas inseridas (opcional)
    
    ReadyToSubmit --> Processing: click "Registrar"
    Processing --> Success: record salvo
    Success --> [*]: form resetado
    
    state FlowIntensity {
        [*] --> Moderate
        Moderate --> Light: seleção
        Moderate --> Heavy: seleção
        Light --> Moderate: seleção
        Heavy --> Moderate: seleção
    }
    
    state SymptomSelection {
        [*] --> NoSymptoms
        NoSymptoms --> HasSymptoms: toggle sintoma
        HasSymptoms --> NoSymptoms: deselect todos
        HasSymptoms --> HasSymptoms: toggle sintoma
    }
```

### 3.3 Dados Lunares (side effect)

```mermaid
stateDiagram-v2
    [*] --> NoMoonData
    
    NoMoonData --> FetchingMoonData: selectedDate muda
    FetchingMoonData --> MoonDataLoaded: getLunarPhaseAndSign()
    MoonDataLoaded --> FetchingMoonData: selectedDate muda
    
    note right of MoonDataLoaded: Exibe:\n- Fase Lunar\n- Signo Zodiacal
```

---

## 4. LunarCalendarWidget - Calendário Lunar

O componente `LunarCalendarWidget` exibe um calendário com informações lunares.

### 4.1 Máquina de Estados de Navegação

```mermaid
stateDiagram-v2
    [*] --> DisplayingMonth
    
    state DisplayingMonth {
        [*] --> Stable
        Stable --> Animating: onPrevMonth / onNextMonth
        Animating --> Stable: timeout 150ms
    }
    
    DisplayingMonth --> DisplayingMonth: navegação
    
    state "Month Navigation" as Nav {
        [*] --> CurrentMonth
        CurrentMonth --> PreviousMonth: handlePrevMonth()
        CurrentMonth --> NextMonth: handleNextMonth()
        CurrentMonth --> Today: handleToday()
        PreviousMonth --> CurrentMonth
        NextMonth --> CurrentMonth
    }
```

### 4.2 Estados de Seleção de Data

```mermaid
stateDiagram-v2
    [*] --> NoSelection: selectedDate undefined
    [*] --> HasSelection: selectedDate provided
    
    NoSelection --> TodaySelected: fallback para hoje
    HasSelection --> NewSelection: onSelectDate(date)
    TodaySelected --> NewSelection: onSelectDate(date)
    NewSelection --> HasSelection: atualiza selectedDate
    
    state HasSelection {
        [*] --> DisplayingLunarData
        DisplayingLunarData --> FetchingNewData: data muda
        FetchingNewData --> DisplayingLunarData: dados carregados
    }
```

### 4.3 Estados de Animação

```mermaid
stateDiagram-v2
    [*] --> Static
    
    Static --> AnimatingOut: navegação iniciada
    AnimatingOut --> Updating: timeout 150ms
    Updating --> AnimatingIn: mês atualizado
    AnimatingIn --> Static: animação completa
    
    note right of AnimatingOut: isAnimating = true\nCSS transition
    note right of Static: isAnimating = false
```

---

## 5. TodoPanel - Painel de Tarefas

O componente de tarefas usa um reducer para gerenciar estado complexo.

### 5.1 Máquina de Estados Principal (Reducer)

```mermaid
stateDiagram-v2
    [*] --> Viewing
    
    state Viewing {
        [*] --> ListView
        ListView --> GroupedByPhase: groupByPhase = true
        GroupedByPhase --> ListView: groupByPhase = false
    }
    
    Viewing --> Editing: SET_EDIT_MODE(true)
    Editing --> Viewing: SET_EDIT_MODE(false)
    
    Viewing --> SelectionMode: SET_SELECTION_MODE(true)
    SelectionMode --> Viewing: SET_SELECTION_MODE(false)
    SelectionMode --> Viewing: CLEAR_SELECTION
    
    state Editing {
        [*] --> NoItemEditing
        NoItemEditing --> ItemEditing: START_EDITING
        ItemEditing --> NoItemEditing: CANCEL_EDITING
        ItemEditing --> ItemUpdated: save changes
        ItemUpdated --> NoItemEditing
    }
```

### 5.2 Estados de Seleção em Lote

```mermaid
stateDiagram-v2
    [*] --> NoSelection
    
    NoSelection --> SelectionMode: SET_SELECTION_MODE(true)
    
    state SelectionMode {
        [*] --> Empty
        Empty --> HasItems: TOGGLE_SELECT
        HasItems --> Empty: deselect último
        HasItems --> HasItems: TOGGLE_SELECT
        HasItems --> AllSelected: SELECT_ALL
        AllSelected --> HasItems: TOGGLE_SELECT
    }
    
    SelectionMode --> NoSelection: CLEAR_SELECTION
    
    state "Batch Actions" as Batch {
        HasItems --> BatchDelete: onBatchDelete
        HasItems --> BatchAssignPhase: onBatchAssignPhase
        HasItems --> BatchAssignIsland: onBatchAssignIsland
    }
    
    Batch --> NoSelection: ação executada
```

### 5.3 Estados de Edição de Item

```mermaid
stateDiagram-v2
    [*] --> NotEditing
    
    NotEditing --> EditingItem: START_EDITING(todoId, text, category, dueDate)
    
    state EditingItem {
        [*] --> EditingText
        EditingText --> EditingCategory: UPDATE_EDITING
        EditingCategory --> EditingDueDate: UPDATE_EDITING
        EditingDueDate --> EditingText: UPDATE_EDITING
    }
    
    EditingItem --> NotEditing: CANCEL_EDITING
    EditingItem --> Saving: onUpdate(todoId, updates)
    Saving --> NotEditing: sucesso
```

### 5.4 Estados de Paginação

```mermaid
stateDiagram-v2
    [*] --> Page0
    
    Page0 --> PageN: SET_PAGE(n)
    PageN --> Page0: SET_PAGE(0)
    PageN --> PageN: SET_PAGE(m)
    
    note right of PageN: currentPage controla\nquais todos são exibidos
```

### 5.5 Estados das Fases Expandidas

```mermaid
stateDiagram-v2
    [*] --> AllExpanded
    
    state AllExpanded {
        luaNova --> luaNova: TOGGLE_PHASE_EXPANDED
        luaCrescente --> luaCrescente: TOGGLE_PHASE_EXPANDED
        luaCheia --> luaCheia: TOGGLE_PHASE_EXPANDED
        luaMinguante --> luaMinguante: TOGGLE_PHASE_EXPANDED
        semFase --> semFase: TOGGLE_PHASE_EXPANDED
    }
    
    note right of AllExpanded: Cada fase pode ser\nexpandida/colapsada\nindependentemente
```

---

## 6. AuthGate - Portão de Autenticação

O componente `AuthGate` controla acesso a conteúdo protegido.

### 6.1 Máquina de Estados

```mermaid
stateDiagram-v2
    [*] --> Checking
    
    Checking --> Authenticated: isAuthenticated === true
    Checking --> NotAuthenticated: isAuthenticated === false
    
    Authenticated --> RenderChildren: renderiza children
    NotAuthenticated --> ShowAuthFlow: renderiza AuthChatFlow
    
    ShowAuthFlow --> Authenticated: onAuthenticated()
    
    state ShowAuthFlow {
        [*] --> DisplayingSpaceBackground
        DisplayingSpaceBackground --> DisplayingInputWindow
        DisplayingInputWindow --> WaitingUserAuth
    }
```

---

## 7. Sync Components - Componentes de Sincronização

### 7.1 AutoSyncLunar (padrão genérico)

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Syncing: autoSync === true
    Syncing --> Success: dados sincronizados
    Syncing --> Error: falha na sync
    
    Success --> Idle: aguarda próximo ciclo
    Error --> Idle: retry / timeout
    
    note right of Syncing: Sincroniza dados lunares\ncom backend
```

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| `[*]` | Estado inicial ou final |
| `-->` | Transição de estado |
| `state X { }` | Estado composto (nested) |
| `: evento / ação` | Gatilho da transição |
| `note` | Comentário/documentação |

---

## Resumo dos Componentes

| Componente | Estados Principais | Complexidade |
|------------|-------------------|--------------|
| AuthChatFlow | 7 steps + 2 modos | Alta |
| EmotionalInput | 4 estados + feedback | Média |
| MenstrualTracker | 3 estados + form | Média |
| LunarCalendarWidget | Navegação + seleção | Média |
| TodoPanel (Reducer) | 6 actions principais | Alta |
| AuthGate | 2 estados binários | Baixa |

---

*Documento gerado automaticamente para documentação do projeto cosmic-space.*
