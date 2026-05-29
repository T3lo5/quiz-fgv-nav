# 📋 Kanban - Implementação da Função startReview() e Sistema de Revisão

## 🎯 Objetivo Principal
Implementar completamente a funcionalidade de revisão de questões (`startReview`) que atualmente está apenas com um placeholder, permitindo que os usuários revisem questões já respondidas de forma estruturada.

---

## 🔍 Análise do Problema Atual

### Estado Atual (Linha 675-682 do script.js)
```javascript
function startReview() {
    hideAllScreens();
    // Iniciar revisão com questões já respondidas
    console.log('Iniciando revisão rápida...');
    // TODO: Implementar sistema de revisão
    alert('Funcionalidade de revisão em desenvolvimento');
    backToMenu();
}
```

### Problemas Identificados
1. ❌ Função `startReview()` não faz nada útil
2. ❌ Não há carregamento de questões para revisão
3. ❌ Não há navegação entre questões de revisão
4. ❌ Não há salvamento de notas ou progresso
5. ❌ Layout quebra ao tentar acessar a tela de revisão
6. ❌ Seleção de matérias não funciona
7. ❌ Início de simulados travado

---

## 📊 Quadro Kanban

### 🏗️ BACKLOG (Tarefas a Fazer)

#### Épico 1: Infraestrutura e Estado Global
- [ ] **Tarefa 1.1**: Criar estado global para review (`reviewState`)
  - Descrição: Objeto para armazenar questões de review, índice atual, notas do usuário
  - Critérios de aceite:
    - `reviewState.questions` - Array de questões
    - `reviewState.currentIndex` - Índice da questão atual
    - `reviewState.notes` - Mapa de notas por questão ID
    - `reviewState.startTime` - Timestamp de início
  - Prioridade: 🔴 Alta
  - Estimativa: 2h

- [ ] **Tarefa 1.2**: Criar funções utilitárias de manipulação de DOM
  - Descrição: Funções para mostrar/esconder telas de review
  - Critérios de aceite:
    - `showReviewScreen()` - Exibe tela de review
    - `hideReviewScreen()` - Esconde tela de review
    - `showReviewComplete()` - Exibe tela de conclusão
  - Prioridade: 🔴 Alta
  - Estimativa: 1h

#### Épico 2: Carregamento e Filtragem de Questões
- [ ] **Tarefa 2.1**: Implementar `loadReviewQuestions()`
  - Descrição: Carregar questões baseadas nos filtros selecionados
  - Critérios de aceite:
    - Lê quantidade do select `#review-questions-count`
    - Lê filtro de questões com gabarito (`#review-completed`)
    - Seleciona questões aleatórias do banco
    - Limita à quantidade solicitada
  - Prioridade: 🔴 Alta
  - Estimativa: 3h

- [ ] **Tarefa 2.2**: Implementar filtros avançados de review
  - Descrição: Permitir filtrar por matéria, dificuldade, tópico
  - Critérios de aceite:
    - Select de matérias disponíveis
    - Select de níveis de dificuldade
    - Busca por palavras-chave
  - Prioridade: 🟡 Média
  - Estimativa: 4h

#### Épico 3: Interface de Review
- [ ] **Tarefa 3.1**: Implementar `displayReviewQuestion()`
  - Descrição: Renderizar questão atual na tela de review
  - Critérios de aceite:
    - Mostra texto da questão
    - Mostra alternativas com destaque para correta/incorreta
    - Mostra explicação
    - Mostra metadados (matéria, dificuldade, tópico)
  - Prioridade: 🔴 Alta
  - Estimativa: 3h

- [ ] **Tarefa 3.2**: Implementar sistema de notas por questão
  - Descrição: Permitir que usuário adicione notas pessoais
  - Critérios de aceite:
    - TextArea para digitar notas
    - Botão "Salvar Nota"
    - Persistência em localStorage
    - Carregar nota existente ao navegar
  - Prioridade: 🟡 Média
  - Estimativa: 2h

- [ ] **Tarefa 3.3**: Implementar barra de progresso
  - Descrição: Mostrar progresso visual da revisão
  - Critérios de aceite:
    - Barra de progresso percentual
    - Contador "X de Y questões"
    - Atualização dinâmica ao navegar
  - Prioridade: 🟢 Baixa
  - Estimativa: 1h

#### Épico 4: Navegação e Controle
- [ ] **Tarefa 4.1**: Implementar `nextReviewQuestion()`
  - Descrição: Navegar para próxima questão
  - Critérios de aceite:
    - Incrementa índice atual
    - Verifica se é última questão
    - Chama `displayReviewQuestion()`
    - Atualiza barra de progresso
  - Prioridade: 🔴 Alta
  - Estimativa: 1h

- [ ] **Tarefa 4.2**: Implementar `prevReviewQuestion()`
  - Descrição: Navegar para questão anterior
  - Critérios de aceite:
    - Decrementa índice atual
    - Verifica se é primeira questão
    - Chama `displayReviewQuestion()`
    - Atualiza barra de progresso
  - Prioridade: 🔴 Alta
  - Estimativa: 1h

- [ ] **Tarefa 4.3**: Implementar `saveReviewSession()`
  - Descrição: Salvar sessão de review completa
  - Critérios de aceite:
    - Salva todas as notas em localStorage
    - Marca questões como "revisadas"
    - Atualiza estatísticas de progresso
    - Exibe tela de conclusão
  - Prioridade: 🟡 Média
  - Estimativa: 2h

#### Épico 5: Tela de Conclusão e Estatísticas
- [ ] **Tarefa 5.1**: Implementar `showReviewComplete()`
  - Descrição: Exibir resumo da sessão de review
  - Critérios de aceite:
    - Total de questões revisadas
    - Tempo gasto na sessão
    - Notas salvas
    - Botões de ação (voltar, revisar novamente)
  - Prioridade: 🟡 Média
  - Estimativa: 2h

- [ ] **Tarefa 5.2**: Implementar estatísticas de review
  - Descrição: Calcular e mostrar métricas
  - Critérios de aceite:
    - Tempo médio por questão
    - Taxa de acertos (se aplicável)
    - Evolução ao longo do tempo
  - Prioridade: 🟢 Baixa
  - Estimativa: 3h

#### Épico 6: Integração e Correção de Bugs
- [ ] **Tarefa 6.1**: Corrigir seleção de matérias
  - Descrição: Habilitar checkboxes de matérias funcionais
  - Critérios de aceite:
    - Click em matéria marca/desmarca
    - Atualiza contadores
    - Habilita botão "Iniciar Simulado"
  - Prioridade: 🔴 Alta
  - Estimativa: 2h

- [ ] **Tarefa 6.2**: Corrigir início de simulados
  - Descrição: Fazer botão "Iniciar Simulado Personalizado" funcionar
  - Critérios de aceite:
    - Valida seleção de matérias
    - Valida configurações de tempo
    - Inicia quiz com parâmetros corretos
  - Prioridade: 🔴 Alta
  - Estimativa: 3h

- [ ] **Tarefa 6.3**: Corrigir layout quebrado no estudo por matéria
  - Descrição: Resolver problemas de CSS/JS na tela de estudo
  - Critérios de aceite:
    - Lista de matérias carrega corretamente
    - Filtros funcionam
    - Botão "Iniciar Estudo" responde
  - Prioridade: 🔴 Alta
  - Estimativa: 4h

- [ ] **Tarefa 6.4**: Integrar `startReview()` com fluxo principal
  - Descrição: Conectar função aos botões e eventos
  - Critérios de aceite:
    - Botão "Revisão Rápida" chama `startReview()`
    - Botão "Iniciar Revisão Rápida" chama `startReview()`
    - Transições entre telas suaves
  - Prioridade: 🔴 Alta
  - Estimativa: 2h

---

### 🔨 IN PROGRESS (Em Andamento)

*Nenhuma tarefa em andamento no momento*

---

### ✅ DONE (Concluído)

- [x] Identificação do problema na função `startReview()`
- [x] Criação deste quadro Kanban
- [x] ~~Placeholder inicial da função~~ (precisa ser substituído por implementação real)
- [x] **Tarefa 1.2**: Criar funções utilitárias de manipulação de DOM (`showReviewScreen`, `hideReviewScreen`, `showReviewComplete`)
- [x] **Tarefa 2.1**: Implementar `loadReviewQuestions()` - Carregar questões baseadas nos filtros selecionados

---

## 🛠️ Plano de Implementação Passo a Passo

### Fase 1: Fundação (Dia 1)
1. Criar estrutura de estado global (`reviewState`)
2. Implementar funções básicas de navegação entre telas
3. Criar função `loadReviewQuestions()` básica

### Fase 2: Interface Principal (Dia 2)
4. Implementar `displayReviewQuestion()`
5. Criar sistema de renderização de alternativas
6. Adicionar exibição de explicação e metadados

### Fase 3: Navegação e Interação (Dia 3)
7. Implementar botões Próximo/Anterior
8. Criar barra de progresso
9. Implementar sistema de notas

### Fase 4: Persistência e Conclusão (Dia 4)
10. Implementar salvamento em localStorage
11. Criar tela de conclusão com estatísticas
12. Integrar com fluxo principal do app

### Fase 5: Correção de Bugs Críticos (Dia 5)
13. Corrigir seleção de matérias
14. Corrigir início de simulados
15. Corrigir layout de estudo por matéria
16. Testes finais e ajustes

---

## 📝 Estrutura de Dados Proposta

```javascript
// Estado Global de Review
const reviewState = {
    questions: [],              // Array de questões para revisar
    currentIndex: 0,            // Índice da questão atual
    totalQuestions: 0,          // Total de questões na sessão
    notes: {},                  // Mapa: { questionId: "nota do usuário" }
    startTime: null,            // Timestamp de início
    endTime: null,              // Timestamp de término
    filters: {                  // Filtros aplicados
        quantity: 10,
        onlyCompleted: true,
        subjects: [],
        difficulties: []
    },
    stats: {                    // Estatísticas da sessão
        timeSpent: 0,
        questionsReviewed: 0,
        notesAdded: 0
    }
};
```

---

## 🧪 Critérios de Aceite Gerais

### Funcionais
- [ ] Usuário consegue selecionar quantidade de questões para review
- [ ] Usuário consegue filtrar por questões já respondidas
- [ ] Tela de review exibe questão, alternativas, explicação e metadados
- [ ] Usuário consegue navegar entre questões (próximo/anterior)
- [ ] Usuário consegue adicionar e salvar notas por questão
- [ ] Barra de progresso atualiza dinamicamente
- [ ] Ao finalizar, usuário vê resumo da sessão
- [ ] Dados são persistidos em localStorage

### Não Funcionais
- [ ] Tempo de carregamento < 2 segundos
- [ ] Navegação entre questões instantânea (< 100ms)
- [ ] Layout responsivo (mobile e desktop)
- [ ] Nenhum erro no console do navegador
- [ ] Compatível com Chrome, Firefox, Edge

### UX/UI
- [ ] Feedback visual ao clicar em alternativas
- [ ] Animações suaves nas transições
- [ ] Mensagens claras de erro/sucesso
- [ ] Acessibilidade (teclado, screen readers)

---

## 🔗 Dependências e Pré-requisitos

### Dependências Internas
- Função `hideAllScreens()` já existe
- Elementos DOM já definidos no HTML
- Arquivo `questions.json` disponível

### Dependências Externas
- Nenhuma biblioteca adicional necessária
- localStorage do navegador

---

## 📊 Métricas de Sucesso

1. **Taxa de Conclusão**: >80% dos usuários completam a revisão iniciada
2. **Tempo Médio de Sessão**: 5-15 minutos por sessão de review
3. **Satisfação**: Notas salvas em >50% das questões revisadas
4. **Performance**: Zero erros no console durante uso normal

---

## 🚀 Próximos Passos Imediatos

1. **Prioritário**: Começar pela Tarefa 1.1 (Criar estado global)
2. **Em seguida**: Tarefa 2.1 (Carregamento de questões)
3. **Paralelo**: Tarefa 6.1-6.3 (Correção de bugs críticos)

---

## 📞 Responsáveis e Revisores

- **Desenvolvedor Principal**: [A definir]
- **Revisor de Código**: [A definir]
- **Tester QA**: [A definir]

---

*Última atualização: $(date)*
*Status: Backlog pronto para iniciar desenvolvimento*
