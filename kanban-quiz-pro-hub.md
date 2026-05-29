# Kanban de Transformação: Quiz Pro - Estudos Hub Multi-disciplinar

## Visão Geral
Transformar o quiz especializado em NAV Brasil para um hub completo de estudos suportando múltiplas disciplinas com 994 arquivos JSON de questões diversificadas.

## Análise do Estado Atual

### Dados Disponíveis
- **Total de arquivos JSON**: 994 na pasta `simulados_pci/`
- **Disciplinas identificadas**:
  - Testes (268 arquivos)
  - Saúde (213 arquivos)
  - Direito (76 arquivos)
  - Português (72 arquivos)
  - Pedagogia (63 arquivos)
  - Matemática (61 arquivos)
  - Informática (38 arquivos)
  - Legislação (31 arquivos)
  - Geografia (31 arquivos)
  - Administração (23 arquivos)
  - História (15 arquivos)
  - Atualidades (15 arquivos)
  - E outras 18 disciplinas menores

### Estado Atual do Sistema
- ✅ Interface básica funcionando
- ✅ Sistema inicial de seleção de matérias parcialmente implementado
- ❌ Carregamento de questões da pasta `simulados_pci` não implementado
- ❌ Sistema de provas personalizadas não funcional
- ❌ Gestão de tempo por prova não implementada

---

## 📋 Quadro Kanban

### 🔄 Backlog (Pendentes)

#### **EPIC: Reestruturação de Dados**
- [x] CRIAR-01: Catálogo de disciplinas e temas
- [x] CRIAR-02: Parser para extrair metadados dos 994 arquivos JSON
- [ ] CRIAR-03: Sistema de cache para otimizar carregamento
- [ ] CRIAR-04: Validação e padronização dos formatos JSON

#### **EPIC: Interface do Hub**
- [ ] UI-01: Redesign da tela inicial para hub
- [ ] UI-02: Dashboard de disciplinas com visualização de quantidade
- [ ] UI-03: Sistema de navegação por categorias
- [ ] UI-04: Interface de configuração de provas personalizadas
- [ ] UI-05: Layout responsivo para dispositivos móveis

#### **EPIC: Motor de Provas**
- [x] MOTOR-01: Carregamento dinâmico dos JSONs da pasta simulados_pci
- [ ] MOTOR-02: Sistema de seleção multipla de disciplinas
- [ ] MOTOR-03: Algoritmo de amostragem aleatória por disciplina
- [ ] MOTOR-04: Configuração de quantidade por matéria
- [ ] MOTOR-05: Timer global para provas personalizadas

#### **EPIC: Gamificação e Progresso**
- [ ] GAME-01: Sistema de estatísticas por disciplina
- [ ] GAME-02: Histórico de provas realizadas
- [ ] GAME-03: Rankings e conquistas
- [ ] GAME-04: Sistema de revisão de erros
- [ ] GAME-05: Plano de estudos personalizado

---

### 🚧 Em Desenvolvimento

◼ MOTOR-02: Sistema de seleção múltipla de disciplinas                        

---

### ✅ Concluídas

✔ CeIAR-01: Catálogo de disciplinas e temas                                
✔ CRIAR-02: Parser para extrair metadados dos 994 arquivos JSON            
✔ MOTOR-01: Car egamento d nâmico dos JSONs da pasta simulados_pci                              
✔ Teste de estrutura dos arquivos JSON                                     
✔ Validar sistema Quiz Pro Hub em navegador    

---

## 🎯 Métricas de Sucesso

### Critérios de Aceite
1. **Carregamento**: Sistema deve carregar questões dos 994 arquivos em < 3 segundos
2. **Usabilidade**: Usador deve conseguir criar uma prova personalizada em < 1 minuto
3. **Performance**: Interface deve responder em < 500ms
4. **Compatibilidade**: Funcionar em Chrome, Firefox, Safari e Edge
5. **Móvel**: Experiência otimizada para celulares

### KPIs a Acompanhar
- 📊 Tempo de carregamento inicial
- 📈 Número de provas criadas/dia
- 👥 Taxa de conversão (visitas -> provas)
- ⭐ Satisfação do usuário

---

## 🗺️ Roadmap

### Fase 1: Fundação (Sprints 1-2)
**Objetivo**: Sistema básico funcional com múltiplas disciplinas
- CRIAR-01, CRIAR-02, MOTOR-01, MOTOR-02
- Interface mínima para seleção e geração de provas

### Fase 2: Experiência (Sprints 3-4)
**Objetivo**: Melhorar UX e desempenho
- UI-01, UI-02, UI-03, MOTOR-03, MOTOR-04
- Timer global e otimizações de cache

### Fase 3: Engajamento (Sprints 5-6)
**Objetivo**: Gamificar e manter usuários ativos
- GAME-01, GAME-02, GAME-03, GAME-04, GAME-05
- Sistema completo de progresso

### Fase 4: Polimento (Sprint 7)
**Objetivo**: Qualidade e otimização final
- UI-04, UI-05, CRIAR-03, CRIAR-04
- Performance e responsividade

---

## 🛠️ Detalhes Técnicos

### Arquitetura Proposta

```
quiz-pro-hub/
├── index.html              # Novo hub principal
├── js/
│   ├── core/
│   │   ├── question-loader.js    # Carrega JSONs dinamicamente
│   │   ├── exam-engine.js        # Motor de provas
│   │   └── timer-manager.js      # Gestão de tempo
│   ├── ui/
│   │   ├── hub-interface.js      # Interface do hub
│   │   └── exam-config.js        # Configuração de provas
│   └── data/
│       ├── catalog.json          # Catálogo de disciplinas
│       └── user-progress.json    # Progresso do usuário
├── data/
│   ├── catalog.json              # Metadados de todas as disciplinas
│   └── cache/                    # Cache dinâmico
└── simulados_pci/               # Arquivos JSON existentes
```

### Estrutura de Dados Proposta

#### catálogo.json
```json
{
  "disciplines": [
    {
      "id": "matematica",
      "name": "Matemática",
      "totalQuestions": 2500,
      "topics": [
        {"id": "juros-compostos", "name": "Juros Compostos", "count": 150},
        {"id": "progressao-geometrica", "name": "Progressão Geométrica", "count": 120}
      ]
    }
  ],
  "lastUpdated": "2026-05-29T12:00:00Z"
}
```

### Tecnologias Necessárias
- **Frontend**: Vanilla JS (manter sistema atual)
- **Storage**: LocalStorage para progresso
- **Cache**: IndexedDB para performance
- **Build**: Possível uso de Webpack para otimização futura

---

## 🚧 Riscos e Mitigações

### Riscos Identificados
1. **Performance**: 994 arquivos podem sobrecarregar o navegador
   - *Mitigação*: Implementar paginação e cache inteligente
   
2. **Compatibilidade**: Formatos JSON podem variar
   - *Mitigação*: Parser robusto com validação

3. **UX**: Muitas opções podem confundir usuários
   - *Mitigação*: Interface progressiva com defaults inteligentes

4. **Dinamicidade**: Novos arquivos podem ser adicionados
   - *Mitigação*: Sistema de scan automático da pasta

---

## 📅 Próximos Passos

### Imediato (Esta Semana)
1. Validar estrutura dos arquivos JSON
2. Criar protótipo do parser
3. Testar performance de carregamento

### Curto Prazo (Próximas 2 Semanas)
1. Implementar carregamento básico
2. Criar interface de seleção
3. Desenvolver motor de amostragem

### Médio Prazo (Próximo Mês)
1. Sistema completo de provas
2. Timer e validação
3. Primeiras funcionalidades de gamificação

---

## 🙋‍♂️ Responsabilidades

### Desenvolvedor Principal
- Implementação do motor de provas
- Otimização de performance
- Integração dos sistemas

### Designer/UX (se aplicável)
- Novo layout hub
- Fluxos de usuário otimizados
- Testes de usabilidade

### QA (se aplicável)
- Testes com todos os 994 arquivos
- Testes de performance
- Testes de usabilidade

---

*Última atualização: 29/05/2026*
*Status: Planejamento Aprovado*