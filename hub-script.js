/**
 * Quiz Pro Hub - UI Redesign Script
 * Implementação da nova tela inicial do Hub
 */

// ========================================
// CRIAR-03: Sistema de Cache para Otimizar Carregamento
// ========================================

/**
 * CacheManager - Gerencia cache usando IndexedDB
 * Implementa CRIAR-03.1 a CRIAR-03.8
 */
const CacheManager = {
    DB_NAME: 'QuizProHubCache',
    DB_VERSION: 1,
    STORES: {
        DISCIPLINES: 'disciplines',
        QUESTIONS: 'questions',
        METADATA: 'metadata'
    },
    CACHE_TTL: 7 * 24 * 60 * 60 * 1000, // 7 dias em milissegundos
    MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB limite
    
    db: null,
    
    /**
     * CRIAR-03.1: Inicializar IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            
            request.onerror = () => {
                console.warn('⚠️ IndexedDB não disponível, usando fallback para localStorage');
                resolve(null);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ IndexedDB inicializado com sucesso');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store para metadados das disciplinas
                if (!db.objectStoreNames.contains(this.STORES.DISCIPLINES)) {
                    const disciplinesStore = db.createObjectStore(this.STORES.DISCIPLINES, { keyPath: 'id' });
                    disciplinesStore.createIndex('name', 'name', { unique: false });
                    disciplinesStore.createIndex('category', 'category', { unique: false });
                    disciplinesStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
                }
                
                // Store para questões (armazenamento por disciplina)
                if (!db.objectStoreNames.contains(this.STORES.QUESTIONS)) {
                    const questionsStore = db.createObjectStore(this.STORES.QUESTIONS, { keyPath: 'disciplineId' });
                    questionsStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
                }
                
                // Store para metadados gerais
                if (!db.objectStoreNames.contains(this.STORES.METADATA)) {
                    db.createObjectStore(this.STORES.METADATA, { keyPath: 'key' });
                }
            };
        });
    },
    
    /**
     * CRIAR-03.2: Estratégia de cache por disciplina
     */
    async cacheDiscipline(disciplineData) {
        if (!this.db) return this.cacheInLocalStorage('disc_' + disciplineData.id, disciplineData);
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORES.DISCIPLINES], 'readwrite');
            const store = transaction.objectStore(this.STORES.DISCIPLINES);
            
            const dataToCache = {
                ...disciplineData,
                lastAccessed: Date.now(),
                cachedAt: Date.now()
            };
            
            const request = store.put(dataToCache);
            
            request.onsuccess = () => {
                console.log(`✅ Disciplina "${disciplineData.name}" cacheada`);
                resolve(true);
            };
            
            request.onerror = () => {
                console.error('❌ Erro ao cachear disciplina:', request.error);
                reject(request.error);
            };
        });
    },
    
    /**
     * CRIAR-03.2: Buscar disciplina do cache
     */
    async getCachedDiscipline(disciplineId) {
        if (!this.db) return this.getCachedFromLocalStorage('disc_' + disciplineId);
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORES.DISCIPLINES], 'readonly');
            const store = transaction.objectStore(this.STORES.DISCIPLINES);
            const request = store.get(disciplineId);
            
            request.onsuccess = () => {
                const data = request.result;
                
                // CRIAR-03.3: Verificar validade do cache (time-based invalidation)
                if (data && (Date.now() - data.cachedAt) < this.CACHE_TTL) {
                    // Atualizar lastAccessed
                    this.updateAccessTime(disciplineId);
                    resolve(data);
                } else if (data) {
                    // Cache expirado, remover
                    this.removeCachedDiscipline(disciplineId);
                    resolve(null);
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    },
    
    /**
     * CRIAR-03.2: Cache de questões por disciplina
     */
    async cacheQuestions(disciplineId, questions) {
        if (!this.db) return this.cacheInLocalStorage('questions_' + disciplineId, questions);
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORES.QUESTIONS], 'readwrite');
            const store = transaction.objectStore(this.STORES.QUESTIONS);
            
            // CRIAR-03.6: Compressão simples (JSON stringify)
            const dataToCache = {
                disciplineId: disciplineId,
                questions: questions,
                count: questions.length,
                lastUpdated: Date.now(),
                compressed: true
            };
            
            const request = store.put(dataToCache);
            
            request.onsuccess = () => {
                console.log(`✅ ${questions.length} questões cacheadas para disciplina ${disciplineId}`);
                
                // CRIAR-03.7: Monitorar uso de espaço
                this.checkCacheSize();
                resolve(true);
            };
            
            request.onerror = () => {
                console.error('❌ Erro ao cachear questões:', request.error);
                reject(request.error);
            };
        });
    },
    
    /**
     * CRIAR-03.2: Buscar questões do cache
     */
    async getCachedQuestions(disciplineId) {
        if (!this.db) return this.getCachedFromLocalStorage('questions_' + disciplineId);
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORES.QUESTIONS], 'readonly');
            const store = transaction.objectStore(this.STORES.QUESTIONS);
            const request = store.get(disciplineId);
            
            request.onsuccess = () => {
                const data = request.result;
                
                // CRIAR-03.3: Validar cache (24 horas para questões)
                if (data && (Date.now() - data.lastUpdated) < (24 * 60 * 60 * 1000)) {
                    resolve(data.questions);
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    },
    
    /**
     * CRIAR-03.3: Atualizar tempo de acesso
     */
    async updateAccessTime(disciplineId) {
        if (!this.db) return;
        
        const transaction = this.db.transaction([this.STORES.DISCIPLINES], 'readwrite');
        const store = transaction.objectStore(this.STORES.DISCIPLINES);
        
        const getRequest = store.get(disciplineId);
        getRequest.onsuccess = () => {
            const data = getRequest.result;
            if (data) {
                data.lastAccessed = Date.now();
                store.put(data);
            }
        };
    },
    
    /**
     * CRIAR-03.3: Remover disciplina do cache
     */
    async removeCachedDiscipline(disciplineId) {
        if (!this.db) return this.removeFromLocalStorage('disc_' + disciplineId);
        
        return new Promise((resolve) => {
            const transaction = this.db.transaction([this.STORES.DISCIPLINES], 'readwrite');
            const store = transaction.objectStore(this.STORES.DISCIPLINES);
            store.delete(disciplineId);
            transaction.oncomplete = () => resolve(true);
        });
    },
    
    /**
     * CRIAR-03.4: Prefetch de disciplinas frequentes
     */
    async prefetchFrequentDisciplines(disciplines) {
        const frequentIds = this.getFrequentDisciplineIds();
        
        for (const disc of disciplines) {
            if (frequentIds.includes(disc.id) || disc.isFavorite) {
                try {
                    await this.cacheDiscipline(disc);
                    console.log(`📥 Prefetch: ${disc.name}`);
                } catch (error) {
                    console.warn(`⚠️ Falha no prefetch de ${disc.name}:`, error);
                }
            }
        }
    },
    
    /**
     * CRIAR-03.4: Obter IDs de disciplinas frequentes do localStorage
     */
    getFrequentDisciplineIds() {
        const frequent = localStorage.getItem('quizpro_frequent_disciplines');
        return frequent ? JSON.parse(frequent) : [];
    },
    
    /**
     * CRIAR-03.5: Fallback para localStorage quando IndexedDB falha
     */
    cacheInLocalStorage(key, data) {
        try {
            const serialized = JSON.stringify({
                data: data,
                cachedAt: Date.now(),
                ttl: this.CACHE_TTL
            });
            
            // Verificar limite de espaço (5MB típico para localStorage)
            const currentSize = localStorage.length;
            if (currentSize > 100) {
                // Limpar itens antigos se estiver cheio
                this.cleanLocalStorage();
            }
            
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('❌ Erro ao cachear em localStorage:', error);
            return false;
        }
    },
    
    /**
     * CRIAR-03.5: Obter do localStorage
     */
    getCachedFromLocalStorage(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            
            const parsed = JSON.parse(item);
            
            // Verificar validade
            if (Date.now() - parsed.cachedAt < parsed.ttl) {
                return parsed.data;
            } else {
                localStorage.removeItem(key);
                return null;
            }
        } catch (error) {
            console.error('❌ Erro ao ler cache do localStorage:', error);
            return null;
        }
    },
    
    /**
     * CRIAR-03.5: Remover do localStorage
     */
    removeFromLocalStorage(key) {
        localStorage.removeItem(key);
    },
    
    /**
     * CRIAR-03.5: Limpar localStorage antigo
     */
    cleanLocalStorage() {
        const now = Date.now();
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('disc_') || key.startsWith('questions_')) {
                try {
                    const item = localStorage.getItem(key);
                    const parsed = JSON.parse(item);
                    
                    if (now - parsed.cachedAt > this.CACHE_TTL) {
                        keysToRemove.push(key);
                    }
                } catch (e) {
                    keysToRemove.push(key);
                }
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`🧹 Limpou ${keysToRemove.length} itens antigos do localStorage`);
    },
    
    /**
     * CRIAR-03.6: Compressão de dados (simples - pode ser estendido com LZString)
     */
    compressData(data) {
        // Implementação básica - em produção usar biblioteca como LZString
        return JSON.stringify(data);
    },
    
    decompressData(compressed) {
        try {
            return JSON.parse(compressed);
        } catch (e) {
            return compressed;
        }
    },
    
    /**
     * CRIAR-03.7: Monitorar uso de espaço em disco
     */
    async checkCacheSize() {
        if (!this.db) return;
        
        return new Promise((resolve) => {
            const transaction = this.db.transaction([this.STORES.QUESTIONS, this.STORES.DISCIPLINES], 'readonly');
            let totalSize = 0;
            
            [this.STORES.QUESTIONS, this.STORES.DISCIPLINES].forEach(storeName => {
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                
                request.onsuccess = () => {
                    const data = request.result;
                    const size = new Blob([JSON.stringify(data)]).size;
                    totalSize += size;
                };
            });
            
            transaction.oncomplete = () => {
                const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
                console.log(`💾 Uso do cache: ${sizeMB}MB / ${this.MAX_CACHE_SIZE / (1024 * 1024)}MB`);
                
                // Se exceder limite, limpar cache antigo
                if (totalSize > this.MAX_CACHE_SIZE) {
                    this.cleanupOldCache();
                }
                
                resolve(totalSize);
            };
        });
    },
    
    /**
     * CRIAR-03.7: Limpar cache antigo (LRU - Least Recently Used)
     */
    async cleanupOldCache() {
        if (!this.db) return;
        
        console.log('🧹 Limpando cache antigo (LRU)...');
        
        const transaction = this.db.transaction([this.STORES.DISCIPLINES], 'readwrite');
        const store = transaction.objectStore(this.STORES.DISCIPLINES);
        const index = store.index('lastAccessed');
        
        const request = index.getAll();
        request.onsuccess = () => {
            const items = request.result;
            // Ordenar por lastAccessed e remover os mais antigos
            items.sort((a, b) => a.lastAccessed - b.lastAccessed);
            
            // Remover 20% dos itens mais antigos
            const toRemove = Math.floor(items.length * 0.2);
            for (let i = 0; i < toRemove; i++) {
                store.delete(items[i].id);
            }
            
            console.log(`🗑️ Removidos ${toRemove} itens antigos do cache`);
        };
    },
    
    /**
     * CRIAR-03.8: Limpar cache manualmente via UI
     */
    async clearCache() {
        if (!this.db) {
            localStorage.clear();
            console.log('✅ Cache localStorage limpo');
            return true;
        }
        
        return new Promise((resolve) => {
            const transaction = this.db.transaction(
                [this.STORES.DISCIPLINES, this.STORES.QUESTIONS, this.STORES.METADATA],
                'readwrite'
            );
            
            transaction.objectStore(this.STORES.DISCIPLINES).clear();
            transaction.objectStore(this.STORES.QUESTIONS).clear();
            transaction.objectStore(this.STORES.METADATA).clear();
            
            transaction.oncomplete = () => {
                console.log('✅ Cache completo limpo');
                resolve(true);
            };
        });
    },
    
    /**
     * CRIAR-03.8: Obter estatísticas do cache
     */
    async getCacheStats() {
        if (!this.db) {
            return {
                disciplines: 0,
                questions: 0,
                size: '0 MB',
                hitRate: 0
            };
        }
        
        return new Promise((resolve) => {
            const stats = {
                disciplines: 0,
                questions: 0,
                size: '0 MB',
                hitRate: 0
            };
            
            const transaction = this.db.transaction(
                [this.STORES.DISCIPLINES, this.STORES.QUESTIONS],
                'readonly'
            );
            
            // Contar disciplinas
            const discStore = transaction.objectStore(this.STORES.DISCIPLINES);
            discStore.count().onsuccess = (e) => {
                stats.disciplines = e.target.result;
            };
            
            // Contar questões
            const questStore = transaction.objectStore(this.STORES.QUESTIONS);
            questStore.count().onsuccess = (e) => {
                stats.questions = e.target.result;
            };
            
            transaction.oncomplete = () => {
                // Calcular hit rate do localStorage
                const cacheHits = parseInt(localStorage.getItem('quizpro_cache_hits') || '0');
                const cacheMisses = parseInt(localStorage.getItem('quizpro_cache_misses') || '0');
                const total = cacheHits + cacheMisses;
                stats.hitRate = total > 0 ? Math.round((cacheHits / total) * 100) : 0;
                
                resolve(stats);
            };
        });
    },
    
    /**
     * Track cache hit/miss para métricas
     */
    trackCacheHit(hit) {
        const key = hit ? 'quizpro_cache_hits' : 'quizpro_cache_misses';
        const current = parseInt(localStorage.getItem(key) || '0');
        localStorage.setItem(key, current + 1);
    }
};

// ========================================
// Inicialização e Estado Global
// ========================================
const HubApp = {
    // ========================================
    // Estado Global - UI-03
    // ========================================
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
        },
        // UI-03: Navegação por categorias
        navigationHistory: [],
        currentCategory: null,
        expandedCategories: [],
        // CRIAR-03: Cache stats
        cacheStats: {
            enabled: false,
            hitRate: 0
        }
    },
    
    // ========================================
    // Inicialização
    // ========================================
    async init() {
        console.log('🎯 Quiz Pro Hub - Inicializando...');
        
        // CRIAR-03: Inicializar sistema de cache primeiro
        await CacheManager.init();
        this.state.cacheStats.enabled = !!CacheManager.db;
        
        this.cacheElements();
        this.bindEvents();
        this.loadData();
        this.renderCategories();
        this.updateStats();
        // UI-03: Inicializar sistema de navegação
        this.initCategoryNavigation();
        
        // CRIAR-03: Mostrar stats do cache
        this.showCacheStats();
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
        
        // Dashboard de Disciplinas - UI-02
        this.disciplinesGrid = document.getElementById('disciplines-grid');
        this.sortSelect = document.getElementById('sort-select');
        this.viewBtns = document.querySelectorAll('.view-btn');
        this.areaFilterBtns = document.querySelectorAll('.area-filter-btn');
        this.loadingIndicator = document.getElementById('disciplines-loading');
        
        // UI-03: Sistema de Navegação por Categorias
        this.categorySidebar = document.getElementById('category-sidebar');
        this.sidebarOverlay = document.getElementById('sidebar-overlay');
        this.sidebarCloseBtn = document.getElementById('sidebar-close-btn');
        this.btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
        this.categoryTree = document.getElementById('category-tree');
        this.breadcrumbsContainer = document.getElementById('breadcrumbs-container');
        this.categorySearchInput = document.getElementById('category-search-input');
        this.searchCategoryBtn = document.getElementById('search-category-btn');
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
        
        // Dashboard de Disciplinas - UI-02 Events
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => this.sortDisciplines(e));
        }
        
        this.viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleViewMode(e));
        });
        
        this.areaFilterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterByArea(e));
        });
        
        // CRIAR-03.8: Evento para limpar cache manualmente
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.clearCache());
        }
    },

    // ========================================
    // Carregamento de Dados
    // ========================================
    async loadData() {
        try {
            // CRIAR-03: Tentar carregar catálogo do cache primeiro
            const cachedCatalog = await CacheManager.getCachedDiscipline('catalog');
            
            if (cachedCatalog && !cachedCatalog.expired) {
                console.log('📦 Cache hit: catalog.json');
                CacheManager.trackCacheHit(true);
                
                this.state.disciplines = cachedCatalog.disciplines || [];
                this.state.categories = cachedCatalog.categories || {};
                this.state.stats.totalDisciplines = this.state.disciplines.length;
                this.state.stats.totalQuestions = cachedCatalog.totalQuestions || 0;
                
                console.log('✅ Dados carregados do cache');
            } else {
                CacheManager.trackCacheHit(false);
                
                // Carregar catálogo de disciplinas
                const response = await fetch('data/catalog.json');
                const catalog = await response.json();
                
                // Converter o formato do catalog.json para o formato esperado
                const disciplinesArray = [];
                const categoriesMap = {};
                let totalQuestions = 0;
                
                const iconsMap = {
                    'administração': '🏛️',
                    'artes': '🎨',
                    'atualidades': '📰',
                    'biblioteconomia': '📚',
                    'biologia': '🧬',
                    'contabilidade': '💰',
                    'direito': '⚖️',
                    'educação': '📖',
                    'enfermagem': '🩺',
                    'engenharia': '🏗️',
                    'filosofia': '🤔',
                    'física': '⚡',
                    'geografia': '🌍',
                    'história': '📜',
                    'informática': '💻',
                    'matemática': '🔢',
                    'português': '📝',
                    'química': '🧪',
                    'sociologia': '👥'
                };
                
                const areasMap = {
                    'administração': 'administracao',
                    'artes': 'humanas',
                    'atualidades': 'humanas',
                    'biblioteconomia': 'humanas',
                    'biologia': 'saude',
                    'contabilidade': 'exatas',
                    'direito': 'direito',
                    'educação': 'humanas',
                    'enfermagem': 'saude',
                    'engenharia': 'exatas',
                    'filosofia': 'humanas',
                    'física': 'exatas',
                    'geografia': 'humanas',
                    'história': 'humanas',
                    'informática': 'tecnologia',
                    'matemática': 'exatas',
                    'português': 'humanas',
                    'química': 'exatas',
                    'sociologia': 'humanas'
                };
                
                for (const [key, disciplina] of Object.entries(catalog.disciplinas || {})) {
                    const questionsCount = disciplina.totalQuestoes || 0;
                    totalQuestions += questionsCount;
                    
                    disciplinesArray.push({
                        id: key,
                        name: disciplina.nome || key,
                        area: areasMap[key] || 'outras',
                        questionsCount: questionsCount,
                        icon: iconsMap[key] || disciplina.icon || '📁',
                        progress: Math.floor(Math.random() * 80),
                        temas: disciplina.temas || {},
                        arquivos: disciplina.arquivos || []
                    });
                    
                    categoriesMap[key] = {
                        name: disciplina.nome || key,
                        count: disciplina.arquivos ? disciplina.arquivos.length : 0,
                        icon: iconsMap[key] || '📁'
                    };
                }
                
                this.state.disciplines = disciplinesArray;
                this.state.categories = categoriesMap;
                this.state.stats.totalDisciplines = disciplinesArray.length;
                this.state.stats.totalQuestions = totalQuestions;
                
                // CRIAR-03.2: Cachear catálogo
                await CacheManager.cacheDiscipline({
                    id: 'catalog',
                    name: 'Catálogo Geral',
                    disciplines: this.state.disciplines,
                    categories: this.state.categories,
                    totalQuestions: totalQuestions,
                    cachedAt: Date.now()
                });
                
                console.log('✅ Dados carregados da rede e cacheados');
            }
            
            // Carregar dados do localStorage
            this.loadUserData();
            
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
            { name: 'Língua Portuguesa', area: 'humanas', questionsCount: 150, icon: '📚', progress: 75 },
            { name: 'Raciocínio Lógico', area: 'exatas', questionsCount: 120, icon: '🔢', progress: 60 },
            { name: 'Informática', area: 'tecnologia', questionsCount: 98, icon: '💻', progress: 45 },
            { name: 'Direito Constitucional', area: 'direito', questionsCount: 200, icon: '⚖️', progress: 30 },
            { name: 'Legislação', area: 'direito', questionsCount: 180, icon: '📜', progress: 55 },
            { name: 'Ética', area: 'humanas', questionsCount: 75, icon: '✨', progress: 80 },
            { name: 'Matemática Financeira', area: 'exatas', questionsCount: 90, icon: '💰', progress: 40 },
            { name: 'Administração Pública', area: 'administracao', questionsCount: 110, icon: '🏛️', progress: 65 },
            { name: 'Enfermagem', area: 'saude', questionsCount: 250, icon: '🩺', progress: 20 },
            { name: 'Geografia', area: 'humanas', questionsCount: 130, icon: '🌍', progress: 50 }
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
        this.renderDisciplinesDashboard();
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
    
    /**
     * CRIAR-03.8: Mostrar estatísticas do cache na UI
     */
    async showCacheStats() {
        const stats = await CacheManager.getCacheStats();
        this.state.cacheStats.hitRate = stats.hitRate;
        
        console.log('📊 Estatísticas do Cache:');
        console.log(`   - Disciplinas cacheadas: ${stats.disciplines}`);
        console.log(`   - Questões cacheadas: ${stats.questions}`);
        console.log(`   - Cache Hit Rate: ${stats.hitRate}%`);
        console.log(`   - Cache habilitado: ${this.state.cacheStats.enabled ? '✅' : '⚠️ (localStorage fallback)'}`);
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
    
    /**
     * CRIAR-03.8: Limpar cache manualmente via UI
     */
    async clearCache() {
        const confirmed = confirm('Tem certeza que deseja limpar todo o cache? Isso pode tornar o carregamento mais lento na próxima vez.');
        
        if (!confirmed) return;
        
        console.log('🧹 Limpando cache...');
        await CacheManager.clearCache();
        
        alert('✅ Cache limpo com sucesso! O aplicativo será recarregado.');
        location.reload();
    },

    viewCategory(categoryKey) {
        console.log('Visualizando categoria:', categoryKey);
        const category = this.state.categories[categoryKey];
        
        if (category) {
            // Filtrar disciplinas desta categoria
            const filteredDisciplines = this.state.disciplines.filter(d => d.id === categoryKey || d.area === categoryKey);
            
            if (filteredDisciplines.length > 0) {
                this.renderDisciplinesDashboard(filteredDisciplines);
                
                // Atualizar breadcrumbs
                this.updateBreadcrumbs([{ name: 'Início', level: 0 }, { name: category.name, level: 1 }]);
                
                // Scroll para o dashboard
                document.getElementById('disciplinas-dashboard')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert(`📁 ${category.name}\n\nNenhuma disciplina encontrada nesta categoria.`);
            }
        }
    },

    updateBreadcrumbs(items) {
        const container = document.getElementById('breadcrumbs-container');
        if (!container) return;
        
        container.innerHTML = items.map((item, index) => `
            <span class="breadcrumb-item" data-level="${item.level}">
                ${index === 0 ? '<i class="fas fa-home"></i>' : ''} ${item.name}
                ${index < items.length - 1 ? '<i class="fas fa-chevron-right"></i>' : ''}
            </span>
        `).join('');
    },

    // ========================================
    // Dashboard de Disciplinas - UI-02
    // ========================================
    
    /**
     * Renderiza o dashboard de disciplinas com grid de cards
     * UI-02.1: Criar grid de cards de disciplinas
     * UI-02.2: Implementar contadores de questões por disciplina
     * UI-02.3: Adicionar barras de progresso visual
     * UI-02.4: Criar sistema de cores/ícones por categoria
     */
    renderDisciplinesDashboard(filteredDisciplines = null) {
        if (!this.disciplinesGrid) return;
        
        const disciplines = filteredDisciplines || this.state.disciplines;
        
        if (disciplines.length === 0) {
            this.disciplinesGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                    <p style="color: var(--gray-500); font-size: 1.1rem;">Nenhuma disciplina encontrada</p>
                </div>
            `;
            return;
        }
        
        // Mapeamento de áreas para nomes amigáveis
        const areaNames = {
            'administracao': 'Administração',
            'humanas': 'Humanas',
            'exatas': 'Exatas',
            'saude': 'Saúde',
            'direito': 'Direito',
            'tecnologia': 'Tecnologia',
            'outras': 'Outras'
        };
        
        this.disciplinesGrid.innerHTML = disciplines.map(disc => {
            const areaName = areaNames[disc.area] || disc.area;
            return `
            <div class="discipline-card" data-area="${disc.area}" onclick="HubApp.viewDiscipline('${disc.id || disc.name}')">
                <div class="discipline-card-header">
                    <div class="discipline-icon ${disc.area}">
                        ${disc.icon || '📚'}
                    </div>
                    <div class="discipline-info">
                        <h4 class="discipline-name">${disc.name}</h4>
                        <span class="discipline-category">${areaName}</span>
                    </div>
                </div>`;
        }).join('');
                
                <div class="discipline-stats">
                    <div class="stat-item">
                        <span class="stat-value">${disc.questionsCount.toLocaleString('pt-BR')}</span>
                        <span class="stat-label-sm">Questões</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${Math.floor(disc.questionsCount / 10)}</span>
                        <span class="stat-label-sm">Testes</span>
                    </div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Progresso</span>
                        <span>${disc.progress || 0}%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${disc.progress || 0}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Esconder loading
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.remove('active');
        }
    },

    /**
     * UI-02.5: Implementar ordenação (alfabética, quantidade, recentidade)
     */
    sortDisciplines(e) {
        const sortBy = e.target.value;
        let sortedDisciplines = [...this.state.disciplines];
        
        switch(sortBy) {
            case 'alphabetical':
                sortedDisciplines.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'quantity':
                sortedDisciplines.sort((a, b) => b.questionsCount - a.questionsCount);
                break;
            case 'recent':
                // Simula recentidade baseado no progresso (maior progresso = mais recente)
                sortedDisciplines.sort((a, b) => (b.progress || 0) - (a.progress || 0));
                break;
        }
        
        this.renderDisciplinesDashboard(sortedDisciplines);
    },

    /**
     * Alternar entre visualização grid e lista
     */
    toggleViewMode(e) {
        const view = e.currentTarget.dataset.view;
        
        // Atualizar botões ativos
        this.viewBtns.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Aplicar classe na grid
        if (this.disciplinesGrid) {
            if (view === 'list') {
                this.disciplinesGrid.classList.add('list-view');
            } else {
                this.disciplinesGrid.classList.remove('list-view');
            }
        }
    },

    /**
     * UI-02.6: Adicionar filtros por área (Exatas, Humanas, Saúde, etc.)
     */
    filterByArea(e) {
        const area = e.currentTarget.dataset.area;
        
        // Atualizar botões ativos
        this.areaFilterBtns.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Filtrar disciplinas
        if (area === 'all') {
            this.renderDisciplinesDashboard(this.state.disciplines);
        } else {
            const filtered = this.state.disciplines.filter(disc => disc.area === area);
            this.renderDisciplinesDashboard(filtered);
        }
    },

    /**
     * UI-02.7: Criar view detalhada ao clicar em disciplina
     */
    viewDiscipline(disciplineName) {
        console.log('Visualizando disciplina:', disciplineName);
        const discipline = this.state.disciplines.find(d => d.name === disciplineName || d.id === disciplineName);
        
        if (discipline) {
            // Mostrar detalhes da disciplina com lista de temas/arquivos
            let temasHtml = '';
            if (discipline.temas && Object.keys(discipline.temas).length > 0) {
                temasHtml = '<div style="margin-top: 1rem; text-align: left;"><h4>📑 Temas disponíveis:</h4><ul style="list-style: none; padding: 0;">';
                for (const [temaKey, temaData] of Object.entries(discipline.temas)) {
                    temasHtml += `<li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                        <strong>${temaData.nome || temaKey}</strong>: ${temaData.questoes || 0} questões
                        <button onclick="event.stopPropagation(); HubApp.startQuizFromTema('${discipline.id}', '${temaKey}', '${temaData.arquivo || ''}')" 
                                style="margin-left: 0.5rem; padding: 0.25rem 0.5rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Iniciar
                        </button>
                    </li>`;
                }
                temasHtml += '</ul></div>';
            }
            
            // Modal ou overlay de detalhes
            const modalContent = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;" onclick="this.remove()">
                    <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;" onclick="event.stopPropagation()">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <div>
                                <span style="font-size: 3rem;">${discipline.icon || '📚'}</span>
                                <h2 style="margin: 0.5rem 0 0.25rem 0;">${discipline.name}</h2>
                                <span style="color: #666; font-size: 0.9rem;">${discipline.area}</span>
                            </div>
                            <button onclick="this.closest('[style*=fixed]').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1.5rem 0;">
                            <div style="text-align: center; padding: 1rem; background: #f5f5f5; border-radius: 8px;">
                                <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${discipline.questionsCount.toLocaleString('pt-BR')}</div>
                                <div style="font-size: 0.85rem; color: #666;">Questões</div>
                            </div>
                            <div style="text-align: center; padding: 1rem; background: #f5f5f5; border-radius: 8px;">
                                <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${Math.floor(discipline.questionsCount / 10)}</div>
                                <div style="font-size: 0.85rem; color: #666;">Testes</div>
                            </div>
                            <div style="text-align: center; padding: 1rem; background: #f5f5f5; border-radius: 8px;">
                                <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${discipline.progress || 0}%</div>
                                <div style="font-size: 0.85rem; color: #666;">Progresso</div>
                            </div>
                        </div>
                        
                        ${temasHtml}
                        
                        <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                            <button onclick="HubApp.startQuizFromDiscipline('${discipline.id}')" 
                                    style="flex: 1; padding: 0.75rem 1.5rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                🚀 Iniciar Simulado Geral
                            </button>
                            <button onclick="this.closest('[style*=fixed]').remove()" 
                                    style="padding: 0.75rem 1.5rem; background: #e5e5e5; color: #333; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalContent);
        }
    },

    startQuizFromDiscipline(disciplineId) {
        console.log('Iniciando simulado da disciplina:', disciplineId);
        const discipline = this.state.disciplines.find(d => d.id === disciplineId);
        
        if (discipline && discipline.arquivos && discipline.arquivos.length > 0) {
            alert(`🚀 Iniciando simulado de ${discipline.name}...

Carregando ${discipline.questionsCount} questões.`);
        } else {
            alert('⚠️ Nenhuma questão disponível para esta disciplina.');
        }
    },

    startQuizFromTema(disciplineId, temaKey, arquivo) {
        console.log('Iniciando simulado do tema:', temaKey, 'da disciplina:', disciplineId);
        
        if (arquivo) {
            alert(`🚀 Iniciando simulado: ${temaKey}

Carregando arquivo: ${arquivo}`);
        } else {
            alert('⚠️ Arquivo não encontrado para este tema.');
        }
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
    },

    // ========================================
    // MOTOR-03: Algoritmo de Amostragem Aleatória por Disciplina
    // ========================================

    /**
     * MOTOR-03.1: Implementação do Fisher-Yates Shuffle
     * Embaralha um array de forma eficiente e uniforme
     * @param {Array} array - Array para embaralhar
     * @param {number} [seed] - Seed opcional para reprodutibilidade (MOTOR-03.5)
     * @returns {Array} - Array embaralhado
     */
    fisherYatesShuffle(array, seed = null) {
        const shuffled = [...array];
        let rng = seed !== null ? this.createSeededRandom(seed) : Math.random;
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled;
    },

    /**
     * MOTOR-03.5: Gerador de números pseudo-aleatórios com seed
     * Permite reprodutibilidade dos resultados para debugging e testes
     * @param {number} seed - Valor inicial para o gerador
     * @returns {Function} - Função que gera números aleatórios entre 0 e 1
     */
    createSeededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    },

    /**
     * MOTOR-03.2: Seleção aleatória de questões por disciplina individual
     * Seleciona N questões únicas de uma disciplina específica
     * @param {Array} questions - Array de questões da disciplina
     * @param {number} count - Quantidade de questões a selecionar
     * @param {Object} options - Opções adicionais
     * @param {boolean} [options.allowRepeat=false] - Permitir repetição (padrão: false)
     * @param {number} [options.seed=null] - Seed para reprodutibilidade
     * @returns {Object} - Resultado da amostragem
     */
    selectQuestionsByDiscipline(questions, count, options = {}) {
        const { allowRepeat = false, seed = null, disciplineName = 'Desconhecida' } = options;
        
        // MOTOR-03.6: Log de amostragem para debug
        console.log(`[MOTOR-03] Iniciando amostragem para ${disciplineName}`);
        console.log(`[MOTOR-03] Questões disponíveis: ${questions.length}, Solicitadas: ${count}`);
        
        // Validação de entrada
        if (!Array.isArray(questions) || questions.length === 0) {
            console.warn(`[MOTOR-03] ⚠️ Nenhuma questão disponível para ${disciplineName}`);
            return {
                selected: [],
                totalAvailable: 0,
                requested: count,
                selectedCount: 0,
                warning: 'Nenhuma questão disponível'
            };
        }

        // MOTOR-03.4: Tratar caso onde quantidade solicitada > disponível
        if (count > questions.length) {
            console.warn(`[MOTOR-03] ⚠️ Solicitado ${count} questões, mas apenas ${questions.length} disponíveis em ${disciplineName}`);
            
            if (!allowRepeat) {
                console.log(`[MOTOR-03] Retornando todas as ${questions.length} questões disponíveis`);
                return {
                    selected: this.fisherYatesShuffle(questions, seed),
                    totalAvailable: questions.length,
                    requested: count,
                    selectedCount: questions.length,
                    warning: `Quantidade solicitada (${count}) excede disponível (${questions.length}). Retornando todas as questões.`
                };
            }
        }

        // MOTOR-03.1 & MOTOR-03.3: Randomização sem repetição
        const shuffled = this.fisherYatesShuffle(questions, seed);
        const selected = shuffled.slice(0, Math.min(count, questions.length));

        // MOTOR-03.6: Log de amostragem
        console.log(`[MOTOR-03] ✅ Amostragem concluída: ${selected.length} questões selecionadas`);
        
        // MOTOR-03.7: Estatísticas da distribuição
        const stats = this.calculateSamplingStats(selected, questions, disciplineName);
        
        return {
            selected,
            totalAvailable: questions.length,
            requested: count,
            selectedCount: selected.length,
            success: true,
            statistics: stats
        };
    },

    /**
     * MOTOR-03.7: Calcular estatísticas da amostragem para verificar distribuição
     * @param {Array} selected - Questões selecionadas
     * @param {Array} total - Total de questões disponíveis
     * @param {string} disciplineName - Nome da disciplina
     * @returns {Object} - Estatísticas da amostragem
     */
    calculateSamplingStats(selected, total, disciplineName) {
        const samplingRate = ((selected.length / total.length) * 100).toFixed(2);
        
        // Verificar distribuição de dificuldade (se disponível)
        const difficultyDistribution = {};
        selected.forEach(q => {
            const diff = q.dificuldade || q.difficulty || 'N/A';
            difficultyDistribution[diff] = (difficultyDistribution[diff] || 0) + 1;
        });

        const stats = {
            discipline: disciplineName,
            samplingRate: `${samplingRate}%`,
            selectedCount: selected.length,
            totalCount: total.length,
            difficultyDistribution,
            timestamp: new Date().toISOString()
        };

        console.log(`[MOTOR-03.7] 📊 Estatísticas - ${disciplineName}:`, stats);
        return stats;
    },

    /**
     * MOTOR-03.8: Seleção múltipla de questões de várias disciplinas
     * Otimizado para grandes volumes de dados
     * @param {Object} disciplinesConfig - Configuração das disciplinas
     * @param {Array} disciplinesConfig[].name - Nome da disciplina
     * @param {Array} disciplinesConfig[].questions - Questões da disciplina
     * @param {number} disciplinesConfig[].count - Quantidade desejada
     * @param {Object} options - Opções globais
     * @returns {Object} - Resultado consolidado
     */
    selectQuestionsFromMultipleDisciplines(disciplinesConfig, options = {}) {
        const { seed = null, globalShuffle = true, logDetails = true } = options;
        const startTime = performance.now();
        
        console.log(`[MOTOR-03.8] 🚀 Iniciando seleção múltipla de disciplinas`);
        console.log(`[MOTOR-03.8] Disciplinas configuradas: ${disciplinesConfig.length}`);

        const results = {
            byDiscipline: {},
            allQuestions: [],
            summary: {
                totalRequested: 0,
                totalSelected: 0,
                totalAvailable: 0,
                warnings: []
            },
            performance: {}
        };

        // Processar cada disciplina
        disciplinesConfig.forEach((config, index) => {
            const { name, questions, count } = config;
            results.totalRequested += count;
            
            const result = this.selectQuestionsByDiscipline(questions, count, {
                seed: seed !== null ? seed + index : null,
                disciplineName: name,
                allowRepeat: false
            });

            results.byDiscipline[name] = result;
            results.allQuestions.push(...result.selected);
            results.totalSelected += result.selectedCount;
            results.totalAvailable += result.totalAvailable;
            
            if (result.warning) {
                results.summary.warnings.push({
                    discipline: name,
                    message: result.warning
                });
            }
        });

        // MOTOR-03.8: Embaralhamento global se solicitado
        if (globalShuffle && results.allQuestions.length > 0) {
            console.log(`[MOTOR-03.8] 🔀 Embaralhando questões globalmente...`);
            results.allQuestions = this.fisherYatesShuffle(results.allQuestions, seed);
        }

        // Performance metrics
        const endTime = performance.now();
        results.performance = {
            executionTimeMs: (endTime - startTime).toFixed(2),
            questionsPerSecond: (results.allQuestions.length / ((endTime - startTime) / 1000)).toFixed(2),
            memoryUsage: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize
            } : 'N/A'
        };

        console.log(`[MOTOR-03.8] ✅ Seleção múltipla concluída em ${results.performance.executionTimeMs}ms`);
        console.log(`[MOTOR-03.8] 📈 Total: ${results.totalSelected}/${results.totalRequested} questões`);
        
        if (logDetails) {
            console.log(`[MOTOR-03.8] 📋 Detalhamento por disciplina:`, results.byDiscipline);
        }

        return results;
    },

    /**
     * MOTOR-03: Teste de distribuição estatística da aleatoriedade
     * Verifica se a distribuição das questões selecionadas é uniforme
     * @param {Array} questions - Pool total de questões
     * @param {number} sampleSize - Tamanho da amostra
     * @param {number} iterations - Número de iterações para teste
     * @returns {Object} - Resultados do teste estatístico
     */
    testRandomDistribution(questions, sampleSize, iterations = 1000) {
        console.log(`[MOTOR-03.7] 🧪 Iniciando teste de distribuição aleatória`);
        console.log(`[MOTOR-03.7] Pool: ${questions.length} questões, Amostra: ${sampleSize}, Iterações: ${iterations}`);

        if (questions.length < sampleSize) {
            console.warn('[MOTOR-03.7] ⚠️ Pool menor que amostra solicitada');
            return { error: 'Pool insuficiente' };
        }

        const frequencyMap = new Map();
        
        // Executar múltiplas amostragens
        for (let i = 0; i < iterations; i++) {
            const sample = this.selectQuestionsByDiscipline(questions, sampleSize, { seed: i });
            sample.selected.forEach(q => {
                const id = q.id || JSON.stringify(q);
                frequencyMap.set(id, (frequencyMap.get(id) || 0) + 1);
            });
        }

        // Calcular estatísticas
        const frequencies = Array.from(frequencyMap.values());
        const expectedFrequency = (iterations * sampleSize) / questions.length;
        const mean = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
        const variance = frequencies.reduce((sum, f) => sum + Math.pow(f - expectedFrequency, 2), 0) / frequencies.length;
        const stdDev = Math.sqrt(variance);
        const minFreq = Math.min(...frequencies);
        const maxFreq = Math.max(...frequencies);

        // Chi-square test simplificado
        const chiSquare = frequencies.reduce((sum, f) => sum + Math.pow(f - expectedFrequency, 2) / expectedFrequency, 0);
        const degreesOfFreedom = questions.length - 1;
        const criticalValue = degreesOfFreedom + 3 * Math.sqrt(2 * degreesOfFreedom); // Aproximação para p=0.05

        const results = {
            totalQuestions: questions.length,
            sampleSize,
            iterations,
            expectedFrequency: expectedFrequency.toFixed(2),
            observedMean: mean.toFixed(2),
            standardDeviation: stdDev.toFixed(2),
            minFrequency: minFreq,
            maxFrequency: maxFreq,
            frequencyRange: maxFreq - minFreq,
            chiSquare: chiSquare.toFixed(2),
            criticalValue: criticalValue.toFixed(2),
            isUniform: chiSquare < criticalValue,
            quality: chiSquare < criticalValue ? '✅ Boa distribuição' : '⚠️ Distribuição pode ser melhorada'
        };

        console.log(`[MOTOR-03.7] 📊 Resultados do teste:`, results);
        return results;
    },

    /**
     * MOTOR-03: Carregar questões de arquivo JSON
     * Utility para carregar questões de um arquivo específico
     * @param {string} filePath - Caminho do arquivo JSON
     * @returns {Promise<Array>} - Array de questões
     */
    async loadQuestionsFromFile(filePath) {
        try {
            console.log(`[MOTOR-03] 📂 Carregando questões de: ${filePath}`);
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const questions = await response.json();
            console.log(`[MOTOR-03] ✅ ${questions.length} questões carregadas`);
            return questions;
        } catch (error) {
            console.error(`[MOTOR-03] ❌ Erro ao carregar ${filePath}:`, error);
            return [];
        }
    },

    /**
     * MOTOR-03: Exportar função utilitária para validação
     * Verifica se não há questões repetidas no resultado
     * @param {Array} questions - Array de questões para validar
     * @returns {Object} - Resultado da validação
     */
    validateNoDuplicates(questions) {
        const ids = new Set();
        const duplicates = [];

        questions.forEach((q, index) => {
            const id = q.id || JSON.stringify(q);
            if (ids.has(id)) {
                duplicates.push({ index, id });
            } else {
                ids.add(id);
            }
        });

        const isValid = duplicates.length === 0;
        console.log(`[MOTOR-03.3] 🔍 Validação: ${isValid ? '✅ Sem duplicatas' : `⚠️ ${duplicates.length} duplicatas encontradas`}`);
        
        return {
            isValid,
            totalQuestions: questions.length,
            uniqueQuestions: ids.size,
            duplicates: duplicates.length,
            duplicateDetails: duplicates
        };
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
