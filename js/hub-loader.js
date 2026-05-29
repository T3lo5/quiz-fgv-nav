/**
 * Hub Loader - Sistema Dinâmico de Carregamento de Questões
 * Substitui o estático questions.json por carregamento dinâmico dos 994 arquivos
 */

class HubLoader {
    constructor() {
        this.cache = new Map();
        this.catalog = null;
        this.loadingPromises = new Map();
    }

    /**
     * Inicializa o loader carregando o catálogo
     */
    async init() {
        try {
            await this.loadCatalog();
            console.log('📊 Hub Loader inicializado com', this.catalog.totalQuestoes, 'questões');
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar Hub Loader:', error);
            throw error;
        }
    }

    /**
     * Carrega o catálogo gerado
     */
    async loadCatalog() {
        if (this.catalog) return this.catalog;

        try {
            const response = await fetch('./data/catalog.json');
            if (!response.ok) {
                throw new Error(`Erro ao carregar catálogo: ${response.status}`);
            }
            this.catalog = await response.json();
            return this.catalog;
        } catch (error) {
            console.error('Erro ao carregar catálogo:', error);
            throw error;
        }
    }

    /**
     * Obtém lista de disciplinas disponíveis
     */
    getDisciplinas() {
        if (!this.catalog) throw new Error('Catálogo não carregado');

        return Object.entries(this.catalog.disciplinas).map(([key, value]) => ({
            id: key,
            nome: value.nome,
            totalQuestoes: value.totalQuestoes,
            temas: Object.keys(value.temas).length,
            cor: value.cor,
            icon: value.icon
        }));
    }

    /**
     * Obtém temas de uma disciplina
     */
    getTemas(disciplinaId) {
        if (!this.catalog) throw new Error('Catálogo não carregado');

        const disciplina = this.catalog.disciplinas[disciplinaId];
        if (!disciplina) throw new Error(`Disciplina ${disciplinaId} não encontrada`);

        return Object.entries(disciplina.temas).map(([key, value]) => ({
            id: key,
            nome: value.nome,
            questoes: value.questoes,
            arquivo: value.arquivo
        }));
    }

    /**
     * Carrega questões de disciplinas específicas
     * @param {Object} config - Configuração do carregamento
     * @param {string} config.disciplina - ID da disciplina
     * @param {string} config.tema - ID do tema (opcional)
     * @param {number} config.quantidade - Quantidade desejada (opcional)
     * @param {boolean} config.shuffle - Embaralhar resultado (default: true)
     */
    async loadQuestions(config) {
        const { disciplina, tema, quantidade, shuffle = true } = config;

        if (!this.catalog) await this.loadCatalog();

        if (!disciplina) {
            // Carregar de múltiplas disciplinas
            return this.loadMultipleDisciplines(config);
        }

        const disciplinaData = this.catalog.disciplinas[disciplina];
        if (!disciplinaData) {
            throw new Error(`Disciplina ${disciplina} não encontrada`);
        }

        // Se tema especificado, carregar apenas desse tema
        if (tema) {
            return this.loadThemeQuestions(disciplina, tema);
        }

        // Carregar todos os temas da disciplina
        return this.loadDisciplineQuestions(disciplina, quantidade, shuffle);
    }

    /**
     * Carrega questões de um tema específico
     */
    async loadThemeQuestions(disciplinaId, temaId) {
        const cacheKey = `${disciplinaId}/${temaId}`;

        // Verificar cache
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Verificar se já está carregando
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        const temaData = this.catalog.disciplinas[disciplinaId].temas[temaId];
        if (!temaData) {
            throw new Error(`Tema ${temaId} não encontrado em ${disciplinaId}`);
        }

        // Iniciar carregamento
        const loadingPromise = this.fetchQuestions(temaData.arquivo);
        this.loadingPromises.set(cacheKey, loadingPromise);

        try {
            const questions = await loadingPromise;
            this.cache.set(cacheKey, questions);
            return questions;
        } finally {
            this.loadingPromises.delete(cacheKey);
        }
    }

    /**
     * Carrega todas as questões de uma disciplina
     */
    async loadDisciplineQuestions(disciplinaId, quantidade = null, shuffle = true) {
        const cacheKey = disciplinaId;

        if (this.cache.has(cacheKey)) {
            let questions = this.cache.get(cacheKey);
            if (quantidade) {
                questions = this.shuffleArray(questions).slice(0, quantidade);
            }
            return questions;
        }

        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        // Carregar todos os temas da disciplina em paralelo
        const disciplinaData = this.catalog.disciplinas[disciplinaId];
        const temas = Object.keys(disciplinaData.temas);

        const loadingPromise = Promise.all(
            temas.map(tema => this.loadThemeQuestions(disciplinaId, tema))
        ).then(results => {
            const allQuestions = results.flat();

            if (shuffle) {
                this.shuffleArray(allQuestions);
            }

            if (quantidade) {
                return allQuestions.slice(0, quantidade);
            }

            return allQuestions;
        });

        this.loadingPromises.set(cacheKey, loadingPromise);

        try {
            const questions = await loadingPromise;
            this.cache.set(cacheKey, questions);
            return questions;
        } finally {
            this.loadingPromises.delete(cacheKey);
        }
    }

    /**
     * Carrega questões de múltiplas disciplinas
     */
    async loadMultipleDisciplines(config) {
        const { disciplinas, temasPorDisciplina, shuffle = true } = config;

        if (!disciplinas || disciplinas.length === 0) {
            throw new Error('Nenhuma disciplina especificada');
        }

        const allQuestions = [];

        for (let i = 0; i < disciplinas.length; i++) {
            const disciplina = disciplinas[i];
            const quantidade = temasPorDisciplina[i];

            const questions = await this.loadDisciplineQuestions(
                disciplina,
                quantidade,
                false // Não embaralhar ainda
            );

            allQuestions.push(...questions);
        }

        if (shuffle) {
            this.shuffleArray(allQuestions);
        }

        return allQuestions;
    }

    /**
     * Faz fetch do arquivo JSON
     */
    async fetchQuestions(filename) {
        const path = `./simulados_pci/${filename}`;

        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Erro ao carregar ${filename}: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`❌ Erro ao buscar questões de ${filename}:`, error);
            throw error;
        }
    }

    /**
     * Método utilitário para embaralhar array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Limpa o cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache limpo');
    }

    /**
     * Obtém estatísticas do hub
     */
    getStats() {
        if (!this.catalog) return null;

        return {
            totalQuestoes: this.catalog.totalQuestoes,
            totalArquivos: this.catalog.totalArquivos,
            totalDisciplinas: Object.keys(this.catalog.disciplinas).length,
            disciplinasMaisQuestoes: this.catalog.estatisticas.disciplinasMaisQuestoes,
            cacheItens: this.cache.size,
            carregando: this.loadingPromises.size
        };
    }
}

// Criar instância global
window.HubLoader = new HubLoader();