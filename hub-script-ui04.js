/**
 * Quiz Pro Hub - UI-04: Interface de Configuração de Provas Personalizadas
 * Implementação do modal de configuração de simulados personalizados
 */

// ========================================
// MOTOR-05: Timer Global para Provas Personalizadas
// ========================================
const TestTimer = {
    state: {
        isEnabled: false,
        totalSeconds: 3600,
        remainingSeconds: 3600,
        isRunning: false,
        isPaused: false,
        startTime: null,
        pauseTime: null,
        intervalId: null,
        warningThreshold: 300, // 5 minutos em segundos
        hasWarningPlayed: false
    },

    init(isEnabled, minutes) {
        this.state.isEnabled = isEnabled;
        this.state.totalSeconds = minutes * 60;
        this.state.remainingSeconds = minutes * 60;
        this.state.hasWarningPlayed = false;
        
        console.log(`⏱️ MOTOR-05: Timer inicializado - ${minutes} minutos`);
    },

    start() {
        if (!this.state.isEnabled || this.state.isRunning) return;
        
        this.state.isRunning = true;
        this.state.startTime = Date.now();
        
        // Verificar se há tempo persistido no sessionStorage
        const savedTime = sessionStorage.getItem('testTimerRemaining');
        if (savedTime) {
            this.state.remainingSeconds = parseInt(savedTime, 10);
            console.log('📥 MOTOR-05.7: Tempo restaurado do sessionStorage:', this.state.remainingSeconds, 'segundos');
        }
        
        this.startInterval();
        this.updateDisplay();
        
        console.log('▶️ MOTOR-05: Timer iniciado');
    },

    startInterval() {
        if (this.state.intervalId) clearInterval(this.state.intervalId);
        
        this.state.intervalId = setInterval(() => {
            if (!this.state.isPaused) {
                this.state.remainingSeconds--;
                
                // Persistir tempo restante
                sessionStorage.setItem('testTimerRemaining', this.state.remainingSeconds.toString());
                
                this.updateDisplay();
                this.checkWarning();
                
                if (this.state.remainingSeconds <= 0) {
                    this.autoSubmit();
                }
            }
        }, 1000);
    },

    pause() {
        if (!this.state.isRunning || this.state.isPaused) return;
        
        this.state.isPaused = true;
        this.state.pauseTime = Date.now();
        
        if (this.state.intervalId) clearInterval(this.state.intervalId);
        
        console.log('⏸️ MOTOR-05.4: Timer pausado');
    },

    resume() {
        if (!this.state.isRunning || !this.state.isPaused) return;
        
        this.state.isPaused = false;
        this.startInterval();
        
        console.log('▶️ MOTOR-05.4: Timer retomado');
    },

    stop() {
        if (this.state.intervalId) clearInterval(this.state.intervalId);
        this.state.isRunning = false;
        this.state.isPaused = false;
        sessionStorage.removeItem('testTimerRemaining');
        
        console.log('⏹️ MOTOR-05: Timer parado');
    },

    updateDisplay() {
        const timerDisplay = document.getElementById('global-timer-display');
        if (!timerDisplay) return;
        
        const minutes = Math.floor(this.state.remainingSeconds / 60);
        const seconds = this.state.remainingSeconds % 60;
        
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Atualizar tempo médio por questão (MOTOR-05.6)
        this.updateAverageTimePerQuestion();
    },

    updateAverageTimePerQuestion() {
        const elapsedSeconds = this.state.totalSeconds - this.state.remainingSeconds;
        const currentQuestionEl = document.querySelector('.question-counter');
        const questionMatch = currentQuestionEl?.textContent?.match(/(\d+)\/(\d+)/);
        
        if (questionMatch && elapsedSeconds > 0) {
            const currentQuestion = parseInt(questionMatch[1], 10);
            const avgSecondsPerQuestion = elapsedSeconds / currentQuestion;
            const avgMinutes = Math.floor(avgSecondsPerQuestion / 60);
            const avgSeconds = Math.floor(avgSecondsPerQuestion % 60);
            
            let avgDisplay = document.getElementById('avg-time-per-question');
            if (!avgDisplay) {
                avgDisplay = document.createElement('span');
                avgDisplay.id = 'avg-time-per-question';
                avgDisplay.className = 'avg-time-display';
                currentQuestionEl?.parentNode?.appendChild(avgDisplay);
            }
            
            avgDisplay.textContent = `⏱️ Média: ${avgMinutes}m${avgSeconds}s por questão`;
        }
    },

    checkWarning() {
        // MOTOR-05.3: Alerta para 5 minutos finais
        if (this.state.remainingSeconds <= this.state.warningThreshold && !this.state.hasWarningPlayed) {
            this.state.hasWarningPlayed = true;
            this.playWarning();
        }
        
        // Atualizar estilo visual quando estiver perto do fim
        const timerDisplay = document.getElementById('global-timer-display');
        if (timerDisplay) {
            if (this.state.remainingSeconds <= 60) {
                timerDisplay.classList.add('timer-critical');
            } else if (this.state.remainingSeconds <= this.state.warningThreshold) {
                timerDisplay.classList.add('timer-warning');
            } else {
                timerDisplay.classList.remove('timer-warning', 'timer-critical');
            }
        }
    },

    playWarning() {
        console.log('⚠️ MOTOR-05.3: Alerta de 5 minutos finais!');
        
        // Alerta visual
        const timerDisplay = document.getElementById('global-timer-display');
        if (timerDisplay) {
            timerDisplay.classList.add('timer-flash');
            setTimeout(() => timerDisplay.classList.remove('timer-flash'), 2000);
        }
        
        // Alerta sonoro (se suportado pelo browser)
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            
            // Tocar 3 bipes
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 800;
                osc2.type = 'sine';
                gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.5);
            }, 600);
            
            setTimeout(() => {
                const osc3 = audioContext.createOscillator();
                const gain3 = audioContext.createGain();
                osc3.connect(gain3);
                gain3.connect(audioContext.destination);
                osc3.frequency.value = 800;
                osc3.type = 'sine';
                gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                osc3.start(audioContext.currentTime);
                osc3.stop(audioContext.currentTime + 0.5);
            }, 1200);
        } catch (e) {
            console.warn('MOTOR-05.3: Não foi possível tocar alerta sonoro:', e);
        }
        
        // Notificação visual adicional
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⏰ Atenção!', {
                body: 'Faltam 5 minutos para o término do simulado!',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f59e0b"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
            });
        }
    },

    autoSubmit() {
        console.log('🚨 MOTOR-05.5: Auto-submit triggered!');
        
        // Notificar usuário
        alert('⏰ Tempo esgotado! Seu simulado será enviado automaticamente.');
        
        // Parar timer
        this.stop();
        
        // Disparar evento de submit
        const submitEvent = new CustomEvent('test-auto-submit', { detail: { reason: 'timeout' } });
        window.dispatchEvent(submitEvent);
        
        // Chamar função de submit se existir no escopo global
        if (typeof window.submitTest === 'function') {
            window.submitTest();
        }
    },

    getElapsedTime() {
        return this.state.totalSeconds - this.state.remainingSeconds;
    },

    getRemainingTime() {
        return this.state.remainingSeconds;
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};

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
            // MOTOR-04.2: Valor padrão inteligente baseado em histórico
            const defaultCount = this.getSmartDefaultCount(discipline.question_count);
            
            this.state.selectedDisciplines.set(key, {
                name: discipline.name,
                count: defaultCount,
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
    // MOTOR-04.2: Valor Padrão Inteligente
    // ========================================
    getSmartDefaultCount(maxCount) {
        // MOTOR-04.8: Carregar preferências do LocalStorage
        const preferences = JSON.parse(localStorage.getItem('questionPreferences') || '{}');
        const defaultPerSubject = preferences.defaultPerSubject || 10;
        
        // Usar preferência do usuário ou calcular baseado no histórico
        // Se há muitas questões disponíveis, sugerir mais; se poucas, usar todas
        if (maxCount <= 10) {
            return maxCount; // Usa todas se tiver 10 ou menos
        } else if (maxCount <= 50) {
            return Math.min(20, maxCount); // Sugere 20 para bancos médios
        } else {
            // Para bancos grandes, usa a preferência do usuário ou padrão de 10-20
            return Math.min(defaultPerSubject, maxCount);
        }
    },

    // ========================================
    // MOTOR-04.6: Opção "Usar Todas as Questões"
    // ========================================
    useAllQuestions(key) {
        const data = this.state.selectedDisciplines.get(key);
        if (data) {
            data.count = data.maxCount;
            this.renderQuestionsConfig();
            this.calculateTotal();
            // Salvar preferência
            this.savePreferences();
        }
    },

    // ========================================
    // MOTOR-04.8: Salvar Preferências no LocalStorage
    // ========================================
    savePreferences() {
        const preferences = {
            defaultPerSubject: 10, // Pode ser customizado via UI futura
            lastUsedCounts: {}
        };
        
        // Salvar contagens usadas recentemente
        this.state.selectedDisciplines.forEach((data, key) => {
            preferences.lastUsedCounts[key] = data.count;
        });
        
        localStorage.setItem('questionPreferences', JSON.stringify(preferences));
        console.log('💾 MOTOR-04.8: Preferências salvas:', preferences);
    },

    // ========================================
    // MOTOR-04.8: Carregar Preferências do LocalStorage
    // ========================================
    loadPreferences() {
        const preferences = JSON.parse(localStorage.getItem('questionPreferences') || '{}');
        return preferences;
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
                <div class="question-header">
                    <label>${data.name}</label>
                    <button class="btn-use-all" data-key="${key}" title="Usar todas as questões disponíveis">
                        <i class="fas fa-layer-group"></i> Todas (${data.maxCount})
                    </button>
                </div>
                <div class="question-input-row">
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
                    // MOTOR-04.8: Salvar preferências ao alterar
                    this.savePreferences();
                }
            });
        });
        
        // MOTOR-04.6: Bind events nos botões "Usar todas"
        this.questionsConfig.querySelectorAll('.btn-use-all').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const key = e.currentTarget.dataset.key;
                this.useAllQuestions(key);
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
        
        // MOTOR-04.5: Distribuição automática igualitária
        this.state.selectedDisciplines.forEach((data, key) => {
            data.count = Math.min(perDiscipline, data.maxCount);
        });
        
        // Re-renderizar e atualizar total
        this.renderQuestionsConfig();
        this.calculateTotal();
        
        // MOTOR-04.8: Salvar preferências após distribuição
        this.savePreferences();
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
        
        // MOTOR-04.3: Validar limites mínimo e máximo por matéria
        let hasInvalidCount = false;
        this.state.selectedDisciplines.forEach((data, key) => {
            if (data.count < 1 || data.count > data.maxCount) {
                hasInvalidCount = true;
            }
        });
        
        if (hasInvalidCount) {
            this.showValidation('⚠️ Verifique as quantidades: devem estar entre 1 e o máximo disponível', false);
            return false;
        }
        
        // MOTOR-04.7: Validar compatibilidade com banco de questões
        const validation = this.validateQuestionBankCompatibility();
        if (!validation.valid) {
            this.showValidation(`⚠️ ${validation.message}`, false);
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
    // MOTOR-04.7: Validar Compatibilidade com Banco de Questões
    // ========================================
    validateQuestionBankCompatibility() {
        // Verificar se há questões suficientes em cada disciplina selecionada
        for (const [key, data] of this.state.selectedDisciplines.entries()) {
            if (data.count > data.maxCount) {
                return {
                    valid: false,
                    message: `A disciplina "${data.name}" não possui questões suficientes (${data.maxCount} disponíveis)`
                };
            }
        }
        return { valid: true, message: 'Banco de questões compatível' };
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
