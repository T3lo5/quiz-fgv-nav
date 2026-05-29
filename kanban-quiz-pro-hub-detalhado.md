# Kanban Detalhado: Quiz Pro - Hub Multi-disciplinar

## 📊 Visão Geral do Projeto
Transformar o quiz especializado em um hub completo de estudos com suporte a múltiplas disciplinas e 994 arquivos JSON.

---

## 🎯 Fases do Projeto

### ✅ Fase 1: Fundação (COMPLETA)
**Status**: Concluída  
**Objetivo**: Sistema básico funcional com múltiplas disciplinas

### 🔄 Fase 2: Experiência (EM ANDAMENTO)
**Status**: Em Desenvolvimento  
**Objetivo**: Melhorar UX e desempenho  
**Sprints**: 3-4

### ⏳ Fase 3: Engajamento (PENDENTE)
**Status**: Não iniciada  
**Objetivo**: Gamificar e manter usuários ativos

### ⏳ Fase 4: Polimento (PENDENTE)
**Status**: Não iniciada  
**Objetivo**: Qualidade e otimização final

---

## 📋 Quadro Kanban Detalhado - FASE 2

### 🚧 EM DESENVOLVIMENTO (Fase 2)

#### **EPIC: Interface do Hub - UI Redesign**

##### UI-01: Redesign da Tela Inicial para Hub
- [x] **UI-01.1**: Criar wireframe da nova tela inicial
- [x] **UI-01.2**: Implementar header com logo e navegação principal
- [x] **UI-01.3**: Criar seção de boas-vindas com estatísticas rápidas
- [x] **UI-01.4**: Implementar cards de acesso rápido (últimas provas, matérias favoritas)
- [x] **UI-01.5**: Adicionar barra de pesquisa global de disciplinas
- [x] **UI-01.6**: Implementar rodapé com links e informações
- [x] **UI-01.7**: Testar usabilidade da tela inicial com usuários

##### UI-02: Dashboard de Disciplinas com Visualização de Quantidade ✅
- [x] **UI-02.1**: Criar grid de cards de disciplinas
- [x] **UI-02.2**: Implementar contadores de questões por disciplina
- [x] **UI-02.3**: Adicionar barras de progresso visual (se aplicável)
- [x] **UI-02.4**: Criar sistema de cores/ícones por categoria
- [x] **UI-02.5**: Implementar ordenação (alfabética, quantidade, recentidade)
- [x] **UI-02.6**: Adicionar filtros por área (Exatas, Humanas, Saúde, etc.)
- [x] **UI-02.7**: Criar view detalhada ao clicar em disciplina
- [ ] **UI-02.8**: Implementar lazy loading para performance *(opcional - melhoria futura)*

##### UI-03: Sistema de Navegação por Categorias
- [ ] **UI-03.1**: Mapear hierarquia de categorias e subcategorias
- [ ] **UI-03.2**: Criar menu lateral ou breadcrumbs de navegação
- [ ] **UI-03.3**: Implementar sistema de expansão/recolhimento de categorias
- [ ] **UI-03.4**: Adicionar busca dentro de categorias específicas
- [ ] **UI-03.5**: Criar página de listagem de tópicos por categoria
- [ ] **UI-03.6**: Implementar histórico de navegação
- [ ] **UI-03.7**: Adicionar atalhos de teclado para navegação

##### UI-04: Interface de Configuração de Provas Personalizadas
- [ ] **UI-04.1**: Criar modal/página de configuração de prova
- [ ] **UI-04.2**: Implementar seletor múltiplo de disciplinas (checkbox/search)
- [ ] **UI-04.3**: Adicionar input numérico para quantidade de questões por matéria
- [ ] **UI-04.4**: Criar preview dinâmico do total de questões
- [ ] **UI-04.5**: Implementar configurações de tempo (timer opcional/obrigatório)
- [ ] **UI-04.6**: Adicionar opções de ordem (aleatória, por dificuldade)
- [ ] **UI-04.7**: Criar botão "Salvar configuração como modelo"
- [ ] **UI-04.8**: Implementar validação de configurações (mínimo/máximo)
- [ ] **UI-04.9**: Adicionar tooltip com dicas de configuração

##### UI-05: Layout Responsivo para Dispositivos Móveis
- [ ] **UI-05.1**: Criar breakpoints para tablet (768px)
- [ ] **UI-05.2**: Criar breakpoints para mobile (480px)
- [ ] **UI-05.3**: Adaptar menu de navegação para mobile (hamburger menu)
- [ ] **UI-05.4**: Otimizar grid de disciplinas para telas pequenas
- [ ] **UI-05.5**: Ajustar tamanho de fontes e botões para touch
- [ ] **UI-05.6**: Testar em dispositivos reais (iOS e Android)
- [ ] **UI-05.7**: Implementar gestos de swipe (se aplicável)
- [ ] **UI-05.8**: Otimizar carregamento para conexões móveis

---

#### **EPIC: Motor de Provas - Core Engine**

##### MOTOR-02: Sistema de Seleção Múltipla de Disciplinas *(EM ANDAMENTO)*
- [ ] **MOTOR-02.1**: Criar estrutura de dados para seleção múltipla
- [ ] **MOTOR-02.2**: Implementar UI de checkboxes com search
- [ ] **MOTOR-02.3**: Adicionar contador visual de disciplinas selecionadas
- [ ] **MOTOR-02.4**: Criar função para validar seleções
- [ ] **MOTOR-02.5**: Implementar "Selecionar todas" por categoria
- [ ] **MOTOR-02.6**: Adicionar persistência temporária das seleções
- [x] **MOTOR-02.7**: Integrar com motor de geração de provas

##### MOTOR-03: Algoritmo de Amostragem Aleatória por Disciplina
- [ ] **MOTOR-03.1**: Criar função de randomização (Fisher-Yates shuffle)
- [ ] **MOTOR-03.2**: Implementar seleção aleatória por disciplina individual
- [ ] **MOTOR-03.3**: Garantir que não haja repetição de questões
- [ ] **MOTOR-03.4**: Tratar caso onde quantidade solicitada > disponível
- [ ] **MOTOR-03.5**: Adicionar seed opcional para reprodutibilidade
- [ ] **MOTOR-03.6**: Criar logs de amostragem para debug
- [ ] **MOTOR-03.7**: Testar distribuição estatística da aleatoriedade
- [ ] **MOTOR-03.8**: Otimizar performance para grandes volumes

##### MOTOR-04: Configuração de Quantidade por Matéria
- [ ] **MOTOR-04.1**: Criar inputs dinâmicos por disciplina selecionada
- [ ] **MOTOR-04.2**: Implementar valor padrão inteligente (baseado em histórico)
- [ ] **MOTOR-04.3**: Adicionar limites mínimo e máximo por matéria
- [ ] **MOTOR-04.4**: Criar cálculo dinâmico do total geral
- [ ] **MOTOR-04.5**: Implementar distribuição automática igualitária
- [ ] **MOTOR-04.6**: Adicionar opção "Usar todas as questões disponíveis"
- [ ] **MOTOR-04.7**: Validar compatibilidade com banco de questões
- [ ] **MOTOR-04.8**: Salvar preferências no LocalStorage

##### MOTOR-05: Timer Global para Provas Personalizadas
- [ ] **MOTOR-05.1**: Criar componente de timer countdown
- [ ] **MOTOR-05.2**: Implementar configurações de tempo personalizável
- [ ] **MOTOR-05.3**: Adicionar alerta sonoro/visual para 5min finais
- [ ] **MOTOR-05.4**: Criar função de pause/resume (opcional)
- [ ] **MOTOR-05.5**: Implementar auto-submit ao zerar timer
- [ ] **MOTOR-05.6**: Mostrar tempo médio por questão
- [ ] **MOTOR-05.7**: Persistir timer em caso de refresh (session storage)
- [ ] **MOTOR-05.8**: Testar precisão do timer em diferentes browsers

---

#### **EPIC: Performance e Cache**

##### CRIAR-03: Sistema de Cache para Otimizar Carregamento
- [ ] **CRIAR-03.1**: Implementar IndexedDB para armazenamento local
- [ ] **CRIAR-03.2**: Criar estratégia de cache por disciplina
- [ ] **CRIAR-03.3**: Implementar invalidation de cache (time-based)
- [ ] **CRIAR-03.4**: Adicionar prefetch de disciplinas frequentes
- [ ] **CRIAR-03.5**: Criar fallback para quando cache falhar
- [ ] **CRIAR-03.6**: Implementar compressão de dados em cache
- [ ] **CRIAR-03.7**: Monitorar uso de espaço em disco
- [ ] **CRIAR-03.8**: Criar UI para limpar cache manualmente

##### CRIAR-04: Validação e Padronização dos Formatos JSON
- [ ] **CRIAR-04.1**: Criar schema JSON padrão para questões
- [ ] **CRIAR-04.2**: Implementar validador de schema
- [ ] **CRIAR-04.3**: Criar script de normalização de formatos divergentes
- [ ] **CRIAR-04.4**: Adicionar tratamento de campos ausentes
- [ ] **CRIAR-04.5**: Implementar encoding correto (UTF-8)
- [ ] **CRIAR-04.6**: Validar integridade de todos os 994 arquivos
- [ ] **CRIAR-04.7**: Gerar relatório de arquivos problemáticos
- [ ] **CRIAR-04.8**: Criar documentação do formato esperado

---

### ✅ CONCLUÍDAS (Fase 1 e Anteriores)

#### EPIC: Reestruturação de Dados
- [x] **CRIAR-01**: Catálogo de disciplinas e temas
  - [x] Mapear todas as 994 arquivos JSON
  - [x] Extrair metadados (disciplina, tópico, quantidade)
  - [x] Gerar arquivo catalog.json consolidado
  
- [x] **CRIAR-02**: Parser para extrair metadados dos 994 arquivos JSON
  - [x] Criar script de parsing automático
  - [x] Tratar formatos variados
  - [x] Validar extração com amostragem

#### EPIC: Motor de Provas
- [x] **MOTOR-01**: Carregamento dinâmico dos JSONs da pasta simulados_pci
  - [x] Implementar fetch dinâmico de arquivos
  - [x] Criar loader com feedback visual
  - [x] Tratar erros de carregamento
  
- [x] **MOTOR-02** (parcial): Sistema de seleção múltipla de disciplinas
  - [x] Estrutura básica implementada
  - [ ] Refinamentos em andamento (ver EM DESENVOLVIMENTO)

#### Validações
- [x] Teste de estrutura dos arquivos JSON
- [x] Validar sistema Quiz Pro Hub em navegador

---

## 📊 Métricas de Sucesso - Critérios de Aceite

### Performance
- [ ] **PERF-01**: Carregar questões dos 994 arquivos em < 3 segundos
- [ ] **PERF-02**: Interface responde em < 500ms
- [ ] **PERF-03**: Cache hit rate > 80%
- [ ] **PERF-04**: Memory usage < 100MB em uso normal

### Usabilidade
- [ ] **UX-01**: Criar prova personalizada em < 1 minuto
- [ ] **UX-02**: Encontrar disciplina em < 10 segundos
- [ ] **UX-03**: Taxa de erro em configurações < 5%
- [ ] **UX-04**: Score SUS > 80 em testes de usabilidade

### Compatibilidade
- [ ] **COMP-01**: Funcionar em Chrome (últimas 2 versões)
- [ ] **COMP-02**: Funcionar em Firefox (últimas 2 versões)
- [ ] **COMP-03**: Funcionar em Safari (últimas 2 versões)
- [ ] **COMP-04**: Funcionar em Edge (últimas 2 versões)
- [ ] **COMP-05**: Experiência mobile otimizada (responsive)

---

## 🗺️ Roadmap Detalhado - Fase 2

### Sprint 3 (1-2 semanas)
**Foco**: UI Redesign e Navegação

| Semana | Tasks Prioritárias |
|--------|-------------------|
| 1 | UI-01.1 a UI-01.7, UI-02.1 a UI-02.4 |
| 2 | UI-02.5 a UI-02.8, UI-03.1 a UI-03.7 |

**Entregáveis**:
- Nova tela inicial completa
- Dashboard de disciplinas funcional
- Navegação por categorias implementada

### Sprint 4 (1-2 semanas)
**Foco**: Motor de Provas e Configurações

| Semana | Tasks Prioritárias |
|--------|-------------------|
| 1 | MOTOR-02 (completo), MOTOR-03.1 a MOTOR-03.5, UI-04.1 a UI-04.5 |
| 2 | MOTOR-03.6 a MOTOR-03.8, MOTOR-04 completo, MOTOR-05 completo |

**Entregáveis**:
- Sistema de seleção múltipla refinado
- Algoritmo de amostragem funcionando
- Configuração de provas personalizadas
- Timer global implementado

### Sprint 4.5 (Buffer - 3-5 dias)
**Foco**: Performance e Validação

| Prioridade | Tasks |
|------------|-------|
| Alta | CRIAR-03.1 a CRIAR-03.4, CRIAR-04.1 a CRIAR-04.4 |
| Média | UI-05 (responsividade), testes de performance |

**Entregáveis**:
- Sistema de cache básico
- Validação de JSONs
- Layout responsivo

---

## 🔧 Dependências entre Tasks

```
UI-01 → UI-02 → UI-03
   ↓       ↓       ↓
UI-04 ← MOTOR-02 → MOTOR-03 → MOTOR-04 → MOTOR-05
   ↓                                   ↓
UI-05 ←───────────────────────────────┘
         ↓
      CRIAR-03 (Cache)
         ↓
      CRIAR-04 (Validação)
```

**Dependências Críticas**:
- MOTOR-02 deve estar completo antes de MOTOR-03
- UI-04 depende de MOTOR-02 para funcionar
- MOTOR-05 depende de MOTOR-03 e MOTOR-04
- CRIAR-03 pode ser feito em paralelo mas é pré-requisito para performance ideal

---

## 🎯 Definição de Pronto (DoD)

Para cada task ser considerada **PRONTA**:

### Código
- [ ] Código implementado e funcional
- [ ] Segue padrões do projeto (ESLint, Prettier)
- [ ] Comentários em partes complexas
- [ ] Tratamento de erros implementado

### Testes
- [ ] Testado em pelo menos 3 browsers
- [ ] Testado em mobile e desktop
- [ ] Casos de borda considerados
- [ ] Performance dentro dos critérios

### Documentação
- [ ] README atualizado (se aplicável)
- [ ] Funções documentadas (JSDoc)
- [ ] Mudanças registradas no changelog

### Integração
- [ ] Merge realizado sem conflitos
- [ ] Funcionalidade integrada ao fluxo principal
- [ ] Sem regressões identificadas

---

## 📈 KPIs de Acompanhamento

### Diário
- [ ] Tempo de carregamento inicial
- [ ] Erros no console
- [ ] Issues abertas/fechadas

### Semanal
- [ ] Número de provas criadas
- [ ] Disciplinas mais acessadas
- [ ] Feedback de usuários (se disponível)

### Por Sprint
- [ ] Velocity (tasks completadas)
- [ ] Bug rate
- [ ] Code coverage (se aplicável)

---

## 🚨 Riscos e Mitigações - Fase 2

### Risco Alto
| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Performance com 994 arquivos | Alto | Média | Cache agressivo + paginação |
| Complexidade da UI confunde usuário | Alto | Média | Testes de usabilidade iterativos |

### Risco Médio
| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Timer impreciso em alguns browsers | Médio | Baixa | Usar requestAnimationFrame + fallback |
| Cache ocupa muito espaço | Médio | Média | Limitar tamanho + LRU eviction |

### Risco Baixo
| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Formatos JSON inconsistentes | Baixo | Baixa | Parser robusto + validação |

---

## 👥 Responsabilidades - Fase 2

### Desenvolvedor Frontend
- [ ] Implementação de todas as UI tasks
- [ ] Integração com motor de provas
- [ ] Otimização de performance frontend
- [ ] Responsividade e cross-browser

### Desenvolvedor Backend/Core
- [ ] MOTOR-03, MOTOR-04, MOTOR-05
- [ ] CRIAR-03 (cache system)
- [ ] CRIAR-04 (validação)
- [ ] Estrutura de dados otimizada

### QA / Tester
- [ ] Testes de usabilidade
- [ ] Testes de performance
- [ ] Validação em múltiplos dispositivos
- [ ] Report de bugs

---

## 📝 Checklist de Revisão - Fase 2

### Antes de iniciar Sprint 3
- [ ] Review das tasks concluídas da Fase 1
- [ ] Ambiente de desenvolvimento configurado
- [ ] Branch strategy definida
- [ ] Ferramentas de profiling prontas

### Durante Sprint 3-4
- [ ] Daily standup (ou check-in)
- [ ] Code review para cada PR
- [ ] Testes contínuos
- [ ] Atualização do kanban

### Ao finalizar Fase 2
- [ ] Todos os critérios de aceite atendidos
- [ ] KPIs dentro das metas
- [ ] Documentação atualizada
- [ ] Plano para Fase 3 definido
- [ ] Retrospectiva realizada

---

## 🔗 Links Úteis

- [Arquivo original do kanban](./kanban-quiz-pro-hub.md)
- [Catálogo de disciplinas](./data/catalog.json)
- [Pasta de questões](./simulados_pci/)
- [README do projeto](./README.md)

---

*Última atualização: 29/05/2026*  
*Fase atual: 2 - Experiência*  
*Status: Em Desenvolvimento*
