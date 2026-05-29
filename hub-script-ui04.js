/**
 * Quiz Pro Hub - UI-04: Interface de Configuração de Provas Personalizadas
 * Implementação do modal de configuração de simulados personalizados
 */

// ========================================
// UI-04: Estado e Inicialização
// ========================================
const TestConfigUI04 = {
    state: {
        selectedDisciplines: new Map(), // disciplineKey -> { name, count, maxCount, file }
        allDisciplines: [],
        filteredDisciplines: [],
        currentFilter: 'all',
        totalQuestions: 0,
        timerEnabled: false,
        timerMinutes: 60,
        randomOrder: true,
        showResults: true,
        saveTemplate: false,
        templateName: ''
    },

    // ========================================
    // Inicialização
    // ========================================
    init() {
        console.log('📝 UI-04: Configuração de Provas Personalizadas - Inicializando...');
        this.cacheElements();
        this.bindEvents();
        this.loadDisciplines();
    },

    // ========================================
    // Cache de Elementos DOM
    // ========================================
    cacheElements() {
        // Modal
        this.modal = document.getElementById('test-config-modal');
        this.closeBtn = document.getElementById('close-test-config');
        this.cancelBtn = document.getElementById('btn-cancel-config');
        this.startBtn = document.getElementById('btn-start-test');
        
        // Discipline Selector
        this.disciplineSearch = document.getElementById('discipline-search');
        this.disciplinesList = document.getElementById('disciplines-list');
        this.selectedCountEl = document.getElementById('selected-disciplines-count');
        this.filterChips = document.querySelectorAll('.filter-chip');
        
        // Questions Config
        this.questionsConfig = document.getElementById('questions-config');
        this.totalPreviewEl = document.getElementById('total-questions-preview');
        this.distributeBtn = document.getElementById('btn-distribute-questions');
        
        // Advanced Settings
        this.timerEnabledCheckbox = document.getElementById('timer-enabled');
        this.timerConfig = document.getElementById('timer-config');
        this.timerMinutesInput = document.getElementById('timer-minutes');
        this.randomOrderCheckbox = document.getElementById('random-order');
        this.showResultsCheckbox = document.getElementById('show-results');
        this.saveTemplateCheckbox = document.getElementById('save-template');
        this.templateNameInput = document.getElementById('template-name');
        
        // Validation
        this.validationMessage = document.getElementById('validation-message');
        
        // Botão de criar prova no hub
        this.createTestBtn = document.getElementById('btn-create-test');
    },

    // ========================================
    // Bind de Eventos
    // ========================================
    bindEvents() {
        // Abrir modal
        if (this.createTestBtn) {
            this.createTestBtn.addEventListener('click', () => this.openModal());
        }
        
        // Fechar modal
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Fechar ao clicar fora
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }
        
        // Busca de disciplinas
        if (this.disciplineSearch) {
            this.disciplineSearch.addEventListener('input', (e) => this.filterDisciplines(e.target.value));
        }
        
        // Filtros por categoria
        this.filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                this.filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentFilter = chip.dataset.filter;
                this.applyCategoryFilter();
            });
        });
        
        // Distribuir questões igualmente
        if (this.distributeBtn) {
            this.distributeBtn.addEventListener('click', () => this.distributeQuestionsEqually());
        }
        
        // Timer toggle
        if (this.timerEnabledCheckbox) {
            this.timerEnabledCheckbox.addEventListener('change', (e) => {
                this.timerConfig.style.display = e.target.checked ? 'flex' : 'none';
                this.state.timerEnabled = e.target.checked;
            });
        }
        
        // Save template toggle
        if (this.saveTemplateCheckbox) {
            this.saveTemplateCheckbox.addEventListener('change', (e) => {
                this.templateNameInput.style.display = e.target.checked ? 'inline-block' : 'none';
                this.state.saveTemplate = e.target.checked;
            });
        }
        
        // Iniciar simulado
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.startTest());
        }
        
        // MOTOR-02.5: Botões de seleção por categoria
        this.bindCategorySelectButtons();
        
        // MOTOR-02.6: Carregar persistência temporária ao abrir modal
        this.loadTemporarySelections();
    },
    
    // ========================================
    // MOTOR-02.5: Bind de Eventos para Seleção por Categoria
    // ========================================
    bindCategorySelectButtons() {
        // Adicionar botões de seleção rápida no HTML dinamicamente
        if (!this.disciplinesList) return;
        
        // Criar container de ações em lote
        const batchActionsContainer = document.createElement('div');
        batchActionsContainer.className = 'batch-actions';
        batchActionsContainer.innerHTML = `
            <div class="batch-buttons">
                <button class="btn-batch-select" data-action="all" title="Selecionar todas da categoria atual">
                    <i class="fas fa-check-square"></i> Todas
                </button>
                <button class="btn-batch-select" data-action="none" title="Desmarcar todas">
                    <i class="fas fa-square"></i> Nenhuma
                </button>
                <button class="btn-batch-select" data-action="invert" title="Inverter seleção">
                    <i class="fas fa-exchange-alt"></i> Inverter
                </button>
            </div>
        `;
        
        // Inserir antes da lista de disciplinas
        this.disciplinesList.parentNode.insertBefore(batchActionsContainer, this.disciplinesList);
        
        // Bind events nos botões
        batchActionsContainer.querySelectorAll('.btn-batch-select').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.batchSelectDisciplines(action);
            });
        });
    },
    
    // ========================================
    // MOTOR-02.5: Seleção em Lote por Categoria
    // ========================================
    batchSelectDisciplines(action) {
        const visibleDisciplines = this.state.filteredDisciplines.map(d => d.key);
        
        if (action === 'all') {
            // Selecionar todas as disciplinas visíveis
            visibleDisciplines.forEach(key => {
                if (!this.state.selectedDisciplines.has(key)) {
                    this.toggleDiscipline(key, true);
                }
            });
        } else if (action === 'none') {
            // Desmarcar todas as disciplinas visíveis
            visibleDisciplines.forEach(key => {
                if (this.state.selectedDisciplines.has(key)) {
                    this.toggleDiscipline(key, false);
                }
            });
        } else if (action === 'invert') {
            // Inverter seleção das disciplinas visíveis
            visibleDisciplines.forEach(key => {
                const isSelected = this.state.selectedDisciplines.has(key);
                this.toggleDiscipline(key, !isSelected);
            });
        }
        
        // Atualizar UI após seleção em lote
        this.renderDisciplinesList();
        this.calculateTotal();
    },

    // ========================================
    // Carregar Disciplinas
    // ========================================
    async loadDisciplines() {
        try {
            // Carregar catálogo de disciplinas
            const response = await fetch('data/catalog.json');
            const catalog = await response.json();
            
            // Transformar estrutura do catálogo em array de disciplinas
            const disciplinasObj = catalog.disciplinas || {};
            this.state.allDisciplines = Object.entries(disciplinasObj).map(([key, data]) => ({
                key: key,
                name: data.nome || key,
                question_count: data.totalQuestoes || 0,
                topic_count: Object.keys(data.temas || {}).length,
                files: Object.values(data.temas || {}).map(t => t.arquivo),
                category: this.guessCategory(key)
            }));
            
            this.state.filteredDisciplines = [...this.state.allDisciplines];
            
            this.renderDisciplinesList();
        } catch (error) {
            console.error('Erro ao carregar disciplinas:', error);
            this.disciplinesList.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--gray-500);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Erro ao carregar disciplinas</p>
                </div>
            `;
        }
    },

    // ========================================
    // Adivinhar Categoria da Disciplina
    // ========================================
    guessCategory(key) {
        const keyLower = key.toLowerCase();
        
        if (keyLower.includes('história') || keyLower.includes('geografia') || 
            keyLower.includes('filosofia') || keyLower.includes('sociologia') || 
            keyLower.includes('artes') || keyLower.includes('direito')) {
            return 'humanas';
        }
        
        if (keyLower.includes('matemática') || keyLower.includes('física') || 
            keyLower.includes('química') || keyLower.includes('biologia') ||
            keyLower.includes('engenharia')) {
            return 'exatas';
        }
        
        if (keyLower.includes('enfermagem') || keyLower.includes('medicina') || 
            keyLower.includes('saúde')) {
            return 'saude';
        }
        
        if (keyLower.includes('informática') || keyLower.includes('programação') || 
            keyLower.includes('tecnologia')) {
            return 'tecnologia';
        }
        
        return 'outras';
    },

    // ========================================
    // Renderizar Lista de Disciplinas
    // ========================================
    renderDisciplinesList() {
        if (!this.disciplinesList) return;
        
        if (this.state.filteredDisciplines.length === 0) {
            this.disciplinesList.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--gray-500);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Nenhuma disciplina encontrada</p>
                </div>
            `;
            return;
        }
        
        const html = this.state.filteredDisciplines.map(discipline => {
            const isSelected = this.state.selectedDisciplines.has(discipline.key);
            return `
                <div class="discipline-item ${isSelected ? 'selected' : ''}" data-key="${discipline.key}">
                    <input type="checkbox" 
                           class="discipline-checkbox" 
                           data-key="${discipline.key}"
                           ${isSelected ? 'checked' : ''}>
                    <div class="discipline-info">
                        <div class="discipline-name">${discipline.name}</div>
                        <div class="discipline-meta">
                            <span>${discipline.topic_count || 0} tópicos</span>
                            <span class="discipline-count">${discipline.question_count || 0} questões</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        this.disciplinesList.innerHTML = html;
        
        // Bind events nos checkboxes
        this.disciplinesList.querySelectorAll('.discipline-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleDiscipline(e.target.dataset.key, e.target.checked);
            });
        });
        
        // Bind events nos items (clique no item todo seleciona)
        this.disciplinesList.querySelectorAll('.discipline-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') {
                    const checkbox = item.querySelector('.discipline-checkbox');
                    checkbox.checked = !checkbox.checked;
                    this.toggleDiscipline(checkbox.dataset.key, checkbox.checked);
                }
            });
        });
    },

    // ========================================
    // Toggle Seleção de Disciplina
    // ========================================
    toggleDiscipline(key, isChecked) {
        const discipline = this.state.allDisciplines.find(d => d.key === key);
        if (!discipline) return;
        
        if (isChecked) {
            this.state.selectedDisciplines.set(key, {
                name: discipline.name,
                count: Math.min(10, discipline.question_count), // Default: 10 questões ou máximo disponível
                maxCount: discipline.question_count,
                file: discipline.files?.[0] || ''
            });
        } else {
            this.state.selectedDisciplines.delete(key);
        }
        
        // Atualizar UI
        this.updateSelectedCount();
        this.renderQuestionsConfig();
        this.calculateTotal();
        
        // Atualizar visual de seleção
        const item = this.disciplinesList.querySelector(`[data-key="${key}"]`);
        if (item) {
            item.classList.toggle('selected', isChecked);
        }
    },

    // ========================================
    // Atualizar Contador de Selecionados
    // ========================================
    updateSelectedCount() {
        if (this.selectedCountEl) {
            this.selectedCountEl.textContent = this.state.selectedDisciplines.size;
        }
    },

    // ========================================
    // Filtrar Disciplinas por Busca
    // ========================================
    filterDisciplines(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            this.state.filteredDisciplines = [...this.state.allDisciplines];
        } else {
            this.state.filteredDisciplines = this.state.allDisciplines.filter(d => 
                d.name.toLowerCase().includes(term) ||
                (d.category && d.category.toLowerCase().includes(term))
            );
        }
        
        this.applyCategoryFilter();
    },

    // ========================================
    // Aplicar Filtro por Categoria
    // ========================================
    applyCategoryFilter() {
        if (this.currentFilter === 'all') {
            this.state.filteredDisciplines = [...this.state.allDisciplines];
        } else {
            // Filtrar pela categoria mapeada
            this.state.filteredDisciplines = this.state.allDisciplines.filter(d => {
                return d.category === this.currentFilter;
            });
        }
        
        this.renderDisciplinesList();
    },

    // ========================================
    // Renderizar Configuração de Questões
    // ========================================
    renderQuestionsConfig() {
        if (!this.questionsConfig) return;
        
        if (this.state.selectedDisciplines.size === 0) {
            this.questionsConfig.innerHTML = `
                <p class="config-hint">Selecione pelo menos uma disciplina acima para configurar as quantidades</p>
            `;
            return;
        }
        
        const html = Array.from(this.state.selectedDisciplines.entries()).map(([key, data]) => `
            <div class="question-input-group" data-key="${key}">
                <label>${data.name}</label>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="number" 
                           min="1" 
                           max="${data.maxCount}" 
                           value="${data.count}"
                           data-key="${key}">
                    <span class="question-max">/ ${data.maxCount}</span>
                </div>
            </div>
        `).join('');
        
        this.questionsConfig.innerHTML = html;
        
        // Bind events nos inputs
        this.questionsConfig.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const key = e.target.dataset.key;
                const value = parseInt(e.target.value) || 1;
                const data = this.state.selectedDisciplines.get(key);
                if (data) {
                    data.count = Math.min(Math.max(1, value), data.maxCount);
                    this.calculateTotal();
                }
            });
        });
    },

    // ========================================
    // Distribuir Questões Igualmente
    // ========================================
    distributeQuestionsEqually() {
        if (this.state.selectedDisciplines.size === 0) return;
        
        // Perguntar quantidade total desejada
        const totalDesired = prompt('Quantidade total de questões desejada:', '50');
        if (!totalDesired) return;
        
        const total = parseInt(totalDesired) || 50;
        const perDiscipline = Math.floor(total / this.state.selectedDisciplines.size);
        
        // Distribuir
        this.state.selectedDisciplines.forEach((data, key) => {
            data.count = Math.min(perDiscipline, data.maxCount);
        });
        
        // Re-renderizar e atualizar total
        this.renderQuestionsConfig();
        this.calculateTotal();
    },

    // ========================================
    // Calcular Total de Questões
    // ========================================
    calculateTotal() {
        let total = 0;
        this.state.selectedDisciplines.forEach(data => {
            total += data.count;
        });
        this.state.totalQuestions = total;
        
        if (this.totalPreviewEl) {
            this.totalPreviewEl.textContent = total;
        }
    },

    // ========================================
    // Validar Configuração
    // ========================================
    validateConfiguration() {
        if (this.state.selectedDisciplines.size === 0) {
            this.showValidation('⚠️ Selecione pelo menos uma disciplina', false);
            return false;
        }
        
        if (this.state.totalQuestions === 0) {
            this.showValidation('⚠️ O total de questões deve ser maior que zero', false);
            return false;
        }
        
        if (this.state.saveTemplate && !this.state.templateName.trim()) {
            this.showValidation('⚠️ Digite um nome para o modelo', false);
            return false;
        }
        
        this.showValidation('✅ Configuração válida! Pronto para iniciar', true);
        return true;
    },

    // ========================================
    // Mostrar Mensagem de Validação
    // ========================================
    showValidation(message, isSuccess) {
        if (this.validationMessage) {
            this.validationMessage.textContent = message;
            this.validationMessage.className = 'validation-message' + (isSuccess ? ' success' : '');
        }
    },

    // ========================================
    // Iniciar Simulado
    // ========================================
    startTest() {
        if (!this.validateConfiguration()) return;
        
        // Preparar configuração do simulado
        const testConfig = {
            disciplines: Array.from(this.state.selectedDisciplines.entries()).map(([key, data]) => ({
                key,
                name: data.name,
                count: data.count,
                file: data.file
            })),
            totalQuestions: this.state.totalQuestions,
            timer: {
                enabled: this.state.timerEnabled,
                minutes: this.state.timerMinutes
            },
            randomOrder: this.state.randomOrder,
            showResults: this.state.showResults,
            template: {
                save: this.state.saveTemplate,
                name: this.state.templateName
            }
        };
        
        console.log('🚀 Iniciando simulado com configuração:', testConfig);
        
        // Salvar no sessionStorage para a página do quiz
        sessionStorage.setItem('testConfig', JSON.stringify(testConfig));
        
        // Salvar template se solicitado
        if (this.state.saveTemplate) {
            this.saveTemplate(testConfig);
        }
        
        // Redirecionar para a página do quiz
        alert(`🎯 Simulado configurado com sucesso!\n\n📚 ${this.state.selectedDisciplines.size} disciplina(s)\n❓ ${this.state.totalQuestions} questão(ões)\n⏱️ Timer: ${this.state.timerEnabled ? this.state.timerMinutes + ' min' : 'Desativado'}\n\nIniciando simulado...`);
        
        // window.location.href = 'index.html#quiz'; // Descomentar para redirecionar
        this.closeModal();
    },

    // ========================================
    // Salvar Modelo
    // ========================================
    saveTemplate(config) {
        const templates = JSON.parse(localStorage.getItem('testTemplates') || '[]');
        templates.push({
            id: Date.now(),
            name: this.state.templateName,
            config,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('testTemplates', JSON.stringify(templates));
        console.log('💾 Modelo salvo:', this.state.templateName);
    },

    // ========================================
    // Abrir Modal
    // ========================================
    openModal() {
        if (this.modal) {
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevenir scroll
        }
    },

    // ========================================
    // Fechar Modal
    // ========================================
    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.style.overflow = ''; // Restaurar scroll
        }
    },
    
    // ========================================
    // MOTOR-02.6: Persistência Temporária das Seleções
    // ========================================
    saveTemporarySelections() {
        // Salvar seleções atuais no sessionStorage
        const selections = Array.from(this.state.selectedDisciplines.entries()).map(([key, data]) => ({
            key,
            name: data.name,
            count: data.count,
            maxCount: data.maxCount,
            file: data.file
        }));
        
        sessionStorage.setItem('tempDisciplineSelections', JSON.stringify(selections));
        console.log('💾 MOTOR-02.6: Seleções temporárias salvas:', selections.length, 'disciplinas');
    },
    
    loadTemporarySelections() {
        // Carregar seleções do sessionStorage ao abrir o modal
        const saved = sessionStorage.getItem('tempDisciplineSelections');
        if (!saved) return;
        
        try {
            const selections = JSON.parse(saved);
            selections.forEach(sel => {
                this.state.selectedDisciplines.set(sel.key, {
                    name: sel.name,
                    count: sel.count,
                    maxCount: sel.maxCount,
                    file: sel.file
                });
            });
            
            // Atualizar UI com seleções carregadas
            this.updateSelectedCount();
            this.renderQuestionsConfig();
            this.calculateTotal();
            this.renderDisciplinesList();
            
            console.log('📥 MOTOR-02.6: Seleções temporárias carregadas:', selections.length, 'disciplinas');
        } catch (error) {
            console.error('Erro ao carregar seleções temporárias:', error);
        }
    }
};

// ========================================
// Inicializar quando o DOM estiver pronto
// ========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TestConfigUI04.init());
} else {
    TestConfigUI04.init();
}
