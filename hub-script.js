/**
 * Quiz Pro Hub - UI Redesign Script
 * Implementação da nova tela inicial do Hub
 */

// ========================================
// Inicialização e Estado Global
// ========================================
const HubApp = {
    state: {
        disciplines: [],
        categories: {},
        recentTests: [],
        favorites: [],
        stats: {
            totalDisciplines: 0,
            totalQuestions: 0,
            studyTime: '0h',
            completedTests: 0
        }
    },

    // ========================================
    // Inicialização
    // ========================================
    init() {
        console.log('🎯 Quiz Pro Hub - Inicializando...');
        this.cacheElements();
        this.bindEvents();
        this.loadData();
        this.renderCategories();
        this.updateStats();
    },

    // ========================================
    // Cache de Elementos DOM
    // ========================================
    cacheElements() {
        // Header
        this.mobileMenuBtn = document.getElementById('mobile-menu-toggle');
        this.closeMobileNavBtn = document.getElementById('close-mobile-nav');
        this.mobileNavOverlay = document.getElementById('mobile-nav-overlay');
        this.notificationsBtn = document.getElementById('notifications-btn');
        
        // Search
        this.globalSearchInput = document.getElementById('global-search-input');
        this.searchSuggestions = document.getElementById('search-suggestions');
        
        // Stats
        this.totalDisciplinesEl = document.getElementById('total-disciplines');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.studyTimeEl = document.getElementById('study-time');
        this.completedTestsEl = document.getElementById('completed-tests');
        
        // Categories
        this.categoriesGrid = document.getElementById('categories-grid');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        
        // Quick Access
        this.btnCreateTest = document.getElementById('btn-create-test');
        this.recentTestsContainer = document.getElementById('recent-tests');
        this.favoritesListContainer = document.getElementById('favorites-list');
    },

    // ========================================
    // Bind de Eventos
    // ========================================
    bindEvents() {
        // Menu Mobile
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        if (this.closeMobileNavBtn) {
            this.closeMobileNavBtn.addEventListener('click', () => this.closeMobileMenu());
        }
        
        // Fechar menu ao clicar fora
        if (this.mobileNavOverlay) {
            this.mobileNavOverlay.addEventListener('click', (e) => {
                if (e.target === this.mobileNavOverlay) {
                    this.closeMobileMenu();
                }
            });
        }
        
        // Notificações
        if (this.notificationsBtn) {
            this.notificationsBtn.addEventListener('click', () => this.showNotifications());
        }
        
        // Pesquisa Global
        if (this.globalSearchInput) {
            this.globalSearchInput.addEventListener('input', (e) => this.handleSearch(e));
            this.globalSearchInput.addEventListener('focus', () => this.showSearchSuggestions());
            this.globalSearchInput.addEventListener('blur', () => this.hideSearchSuggestions());
        }
        
        // Filtros de Categoria
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterCategories(e));
        });
        
        // Botão Criar Simulado
        if (this.btnCreateTest) {
            this.btnCreateTest.addEventListener('click', () => this.navigateToCreateTest());
        }
        
        // Navegação suave
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    // Fecha menu mobile se estiver aberto
                    this.closeMobileMenu();
                }
            });
        });
        
        // Links de navegação ativa
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    },

    // ========================================
    // Carregamento de Dados
    // ========================================
    async loadData() {
        try {
            // Carregar catálogo de disciplinas
            const response = await fetch('data/catalog.json');
            const catalog = await response.json();
            
            this.state.disciplines = catalog.disciplines || [];
            this.state.categories = catalog.categories || {};
            this.state.stats.totalDisciplines = this.state.disciplines.length;
            
            // Calcular total de questões
            this.state.stats.totalQuestions = this.state.disciplines.reduce((total, disc) => {
                return total + (disc.questionsCount || 0);
            }, 0);
            
            // Carregar dados do localStorage
            this.loadUserData();
            
            console.log('✅ Dados carregados com sucesso');
            console.log(`📚 ${this.state.stats.totalDisciplines} disciplinas`);
            console.log(`📝 ${this.state.stats.totalQuestions} questões`);
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            // Dados mockados para demonstração
            this.loadMockData();
        }
    },

    loadMockData() {
        // Dados de exemplo caso o catalog.json não exista
        this.state.disciplines = [
            { name: 'Língua Portuguesa', category: 'humanas', questionsCount: 150, icon: '📚' },
            { name: 'Raciocínio Lógico', category: 'exatas', questionsCount: 120, icon: '🔢' },
            { name: 'Informática', category: 'exatas', questionsCount: 98, icon: '💻' },
            { name: 'Direito Constitucional', category: 'direito', questionsCount: 200, icon: '⚖️' },
            { name: 'Legislação', category: 'direito', questionsCount: 180, icon: '📜' },
            { name: 'Ética', category: 'humanas', questionsCount: 75, icon: '✨' },
            { name: 'Matemática Financeira', category: 'exatas', questionsCount: 90, icon: '💰' },
            { name: 'Administração Pública', category: 'admin', questionsCount: 110, icon: '🏛️' }
        ];
        
        this.state.categories = {
            'testes': { name: 'Testes', count: 3, icon: '📋' },
            'saude': { name: 'Saúde', count: 5, icon: '🏥' },
            'direito': { name: 'Direito', count: 8, icon: '⚖️' },
            'exatas': { name: 'Exatas', count: 6, icon: '🔬' },
            'humanas': { name: 'Humanas', count: 7, icon: '📖' },
            'admin': { name: 'Administração', count: 4, icon: '💼' }
        };
        
        this.state.stats.totalDisciplines = this.state.disciplines.length;
        this.state.stats.totalQuestions = this.state.disciplines.reduce((sum, d) => sum + d.questionsCount, 0);
        
        this.loadUserData();
    },

    loadUserData() {
        // Carregar dados do usuário do localStorage
        const userData = JSON.parse(localStorage.getItem('quizProUserData')) || {};
        
        this.state.recentTests = userData.recentTests || [
            { name: 'Português - Crase', date: 'Hoje' },
            { name: 'Matemática - Álgebra', date: 'Ontem' },
            { name: 'Direito Constitucional', date: '2 dias atrás' }
        ];
        
        this.state.favorites = userData.favorites || [
            { name: 'Língua Portuguesa', count: 150, icon: '📚' },
            { name: 'Raciocínio Lógico', count: 120, icon: '🔢' },
            { name: 'Informática', count: 98, icon: '💻' }
        ];
        
        this.state.stats.studyTime = userData.studyTime || '12h';
        this.state.stats.completedTests = userData.completedTests || 5;
        
        this.renderRecentTests();
        this.renderFavorites();
    },

    // ========================================
    // Renderização
    // ========================================
    renderCategories(filter = 'all') {
        if (!this.categoriesGrid) return;
        
        let categoriesToRender = Object.entries(this.state.categories);
        
        if (filter !== 'all') {
            categoriesToRender = categoriesToRender.filter(([key]) => key === filter);
        }
        
        this.categoriesGrid.innerHTML = categoriesToRender.map(([key, category]) => `
            <div class="access-card category-card" data-category="${key}">
                <div class="card-header">
                    <div class="card-icon" style="background: var(--gradient-primary)">
                        <span style="font-size: 1.5rem">${category.icon || '📁'}</span>
                    </div>
                    <h4>${category.name}</h4>
                </div>
                <div class="card-body">
                    <p class="stat-number" style="font-size: 2rem; color: var(--primary-color)">
                        ${category.count || 0}
                    </p>
                    <p class="stat-label">disciplinas</p>
                </div>
                <button class="card-action-btn" onclick="HubApp.viewCategory('${key}')">
                    Ver Disciplinas
                </button>
            </div>
        `).join('');
    },

    renderRecentTests() {
        if (!this.recentTestsContainer) return;
        
        this.recentTestsContainer.innerHTML = this.state.recentTests.map(test => `
            <div class="recent-test-item">
                <span class="test-name">${test.name}</span>
                <span class="test-date">${test.date}</span>
            </div>
        `).join('');
    },

    renderFavorites() {
        if (!this.favoritesListContainer) return;
        
        this.favoritesListContainer.innerHTML = this.state.favorites.map(fav => `
            <div class="favorite-item">
                <span class="favorite-icon">${fav.icon || '📚'}</span>
                <span class="favorite-name">${fav.name}</span>
                <span class="favorite-count">${fav.count} questões</span>
            </div>
        `).join('');
    },

    updateStats() {
        // Animar números
        this.animateNumber(this.totalDisciplinesEl, this.state.stats.totalDisciplines);
        this.animateNumber(this.totalQuestionsEl, this.state.stats.totalQuestions);
        this.studyTimeEl.textContent = this.state.stats.studyTime;
        this.animateNumber(this.completedTestsEl, this.state.stats.completedTests);
    },

    animateNumber(element, target) {
        if (!element) return;
        
        const duration = 1000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString('pt-BR');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString('pt-BR');
            }
        }, 16);
    },

    // ========================================
    // Handlers de Eventos
    // ========================================
    toggleMobileMenu() {
        this.mobileNavOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeMobileMenu() {
        this.mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    handleSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            this.hideSearchSuggestions();
            return;
        }
        
        // Filtrar disciplinas
        const matches = this.state.disciplines.filter(disc => 
            disc.name.toLowerCase().includes(query)
        ).slice(0, 5);
        
        if (matches.length > 0) {
            this.showSearchSuggestions(matches);
        } else {
            this.hideSearchSuggestions();
        }
    },

    showSearchSuggestions(matches = []) {
        if (!this.searchSuggestions) return;
        
        if (matches.length === 0) {
            this.searchSuggestions.classList.remove('active');
            return;
        }
        
        this.searchSuggestions.innerHTML = matches.map(disc => `
            <div class="search-suggestion-item" onclick="HubApp.selectDiscipline('${disc.name}')">
                <i class="fas fa-book"></i>
                <span>${disc.name}</span>
                <small>${disc.questionsCount || 0} questões</small>
            </div>
        `).join('');
        
        this.searchSuggestions.classList.add('active');
    },

    hideSearchSuggestions() {
        if (this.searchSuggestions) {
            setTimeout(() => {
                this.searchSuggestions.classList.remove('active');
            }, 200);
        }
    },

    selectDiscipline(disciplineName) {
        console.log('Selecionando disciplina:', disciplineName);
        // Navegar para página da disciplina ou abrir modal
        alert(`Indo para: ${disciplineName}`);
    },

    filterCategories(e) {
        const filter = e.target.dataset.category;
        
        // Atualizar botões ativos
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Renderizar categorias filtradas
        this.renderCategories(filter);
    },

    showNotifications() {
        alert('🔔 Você tem 3 notificações não lidas:\n\n1. Novo simulado disponível\n2. Atualização de conteúdo\n3. Lembrete de estudo');
    },

    navigateToCreateTest() {
        console.log('Navegando para criação de simulado...');
        // Redirecionar para página de criação de simulado
        // window.location.href = 'index.html#quiz-settings';
        alert('📝 Abrindo configuração de simulado personalizado...');
    },

    viewCategory(categoryKey) {
        console.log('Visualizando categoria:', categoryKey);
        alert(`📁 Mostrando disciplinas de: ${this.state.categories[categoryKey]?.name || categoryKey}`);
    },

    // ========================================
    // Utilitários
    // ========================================
    saveUserData() {
        localStorage.setItem('quizProUserData', JSON.stringify({
            recentTests: this.state.recentTests,
            favorites: this.state.favorites,
            studyTime: this.state.stats.studyTime,
            completedTests: this.state.stats.completedTests
        }));
    }
};

// ========================================
// Inicializar App quando DOM estiver pronto
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    HubApp.init();
});

// Expor globalmente para callbacks inline
window.HubApp = HubApp;
