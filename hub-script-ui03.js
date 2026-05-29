/**
 * UI-03: Sistema de Navegação por Categorias
 * Implementação complementar para o Quiz Pro Hub
 */

// Adicionar métodos UI-03 ao HubApp
Object.assign(HubApp, {
    // ========================================
    // UI-03: Sistema de Navegação por Categorias
    // ========================================
    
    /**
     * UI-03.1: Mapear hierarquia de categorias e subcategorias
     * UI-03.2: Criar menu lateral ou breadcrumbs de navegação
     */
    initCategoryNavigation() {
        this.renderCategoryTree();
        this.updateBreadcrumbs([{ label: 'Início', icon: 'fa-home', data: null }]);
    },

    /**
     * Renderiza a árvore de categorias no menu lateral
     */
    renderCategoryTree() {
        if (!this.categoryTree) return;
        
        const disciplines = this.state.disciplines;
        
        // Agrupar disciplinas por área
        const areasMap = {};
        disciplines.forEach(disc => {
            const area = disc.area || 'outra';
            if (!areasMap[area]) {
                areasMap[area] = [];
            }
            areasMap[area].push(disc);
        });
        
        // Ícones e nomes das áreas
        const areaConfig = {
            'exatas': { icon: '🔬', name: 'Exatas' },
            'humanas': { icon: '📖', name: 'Humanas' },
            'direito': { icon: '⚖️', name: 'Direito' },
            'saude': { icon: '🏥', name: 'Saúde' },
            'tecnologia': { icon: '💻', name: 'Tecnologia' },
            'administracao': { icon: '💼', name: 'Administração' },
            'linguagens': { icon: '🗣️', name: 'Linguagens' },
            'servicos': { icon: '🛡️', name: 'Serviços' },
            'gestao': { icon: '📊', name: 'Gestão' },
            'meio_ambiente': { icon: '🌱', name: 'Meio Ambiente' },
            'biblioteconomia': { icon: '📚', name: 'Biblioteconomia' },
            'atualidades': { icon: '🌍', name: 'Atualidades' },
            'outra': { icon: '📁', name: 'Outras' }
        };
        
        let html = '<ul class="category-nodes">';
        
        for (const [area, areaDisciplines] of Object.entries(areasMap)) {
            const config = areaConfig[area] || areaConfig['outra'];
            const isExpanded = this.state.expandedCategories.includes(area);
            
            html += `
                <li class="category-node" data-area="${area}">
                    <div class="category-node-content" onclick="HubApp.toggleCategoryExpand('${area}')">
                        <span class="category-node-icon">${config.icon}</span>
                        <span class="category-node-label">${config.name}</span>
                        <span class="category-node-count">${areaDisciplines.length}</span>
                        <span class="category-node-toggle ${isExpanded ? 'expanded' : ''}">
                            <i class="fas fa-chevron-right"></i>
                        </span>
                    </div>
                    <ul class="category-children ${isExpanded ? 'expanded' : ''}" id="children-${area}">
                        ${areaDisciplines.map(disc => `
                            <li class="category-node" data-discipline="${disc.name}">
                                <div class="category-node-content" onclick="HubApp.selectDisciplineFromNav('${disc.name}')">
                                    <span class="category-node-icon">📚</span>
                                    <span class="category-node-label">${disc.name}</span>
                                    <span class="category-node-count">${disc.questionsCount || 0}</span>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </li>
            `;
        }
        
        html += '</ul>';
        this.categoryTree.innerHTML = html;
    },

    /**
     * UI-03.3: Implementar sistema de expansão/recolhimento de categorias
     */
    toggleCategoryExpand(area) {
        const index = this.state.expandedCategories.indexOf(area);
        if (index > -1) {
            this.state.expandedCategories.splice(index, 1);
        } else {
            this.state.expandedCategories.push(area);
        }
        this.renderCategoryTree();
    },

    /**
     * UI-03.6: Implementar histórico de navegação
     */
    updateBreadcrumbs(items) {
        if (!this.breadcrumbsContainer) return;
        
        this.state.navigationHistory = items;
        
        let html = '';
        items.forEach((item, index) => {
            html += `
                <span class="breadcrumb-item ${index === items.length - 1 ? 'active' : ''}" 
                      onclick="HubApp.navigateToBreadcrumb(${index})">
                    <i class="fas ${item.icon || 'fa-folder'}"></i> ${item.label}
                </span>
            `;
        });
        
        this.breadcrumbsContainer.innerHTML = html;
    },

    navigateToBreadcrumb(index) {
        const history = this.state.navigationHistory.slice(0, index + 1);
        this.state.navigationHistory = history;
        this.updateBreadcrumbs(history);
        console.log('Navegando para breadcrumb:', index, history);
    },

    /**
     * Selecionar disciplina da navegação
     */
    selectDisciplineFromNav(disciplineName) {
        console.log('Selecionando disciplina da navegação:', disciplineName);
        
        // Adicionar ao histórico
        this.state.navigationHistory.push({
            label: disciplineName,
            icon: 'fa-book',
            data: { type: 'discipline', name: disciplineName }
        });
        this.updateBreadcrumbs(this.state.navigationHistory);
        
        // Buscar detalhes da disciplina
        const discipline = this.state.disciplines.find(d => d.name === disciplineName);
        if (discipline) {
            this.viewDiscipline(disciplineName);
        }
    },

    /**
     * UI-03.4: Adicionar busca dentro de categorias específicas
     */
    searchInCategory(query) {
        if (!query || query.length < 2) {
            this.renderCategoryTree();
            return;
        }
        
        const filtered = this.state.disciplines.filter(disc => 
            disc.name.toLowerCase().includes(query.toLowerCase())
        );
        
        if (!this.categoryTree) return;
        
        let html = '<ul class="category-nodes">';
        html += `<li class="category-node"><div class="category-node-content" style="cursor: default;">
            <span class="category-node-label">Resultados para "${query}"</span>
            <span class="category-node-count">${filtered.length}</span>
        </div></li>`;
        
        filtered.forEach(disc => {
            html += `
                <li class="category-node" data-discipline="${disc.name}">
                    <div class="category-node-content" onclick="HubApp.selectDisciplineFromNav('${disc.name}')">
                        <span class="category-node-icon">📚</span>
                        <span class="category-node-label">${disc.name}</span>
                        <span class="category-node-count">${disc.questionsCount || 0}</span>
                    </div>
                </li>
            `;
        });
        
        html += '</ul>';
        this.categoryTree.innerHTML = html;
    },

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        if (this.categorySidebar) {
            this.categorySidebar.classList.toggle('active');
        }
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.toggle('active');
        }
    },

    closeSidebar() {
        if (this.categorySidebar) {
            this.categorySidebar.classList.remove('active');
        }
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.remove('active');
        }
    },

    /**
     * UI-03.5: Criar página de listagem de tópicos por categoria
     */
    viewTopicList(area, areaName) {
        console.log('Visualizando tópicos de:', areaName);
        
        // Adicionar ao histórico
        this.state.navigationHistory.push({
            label: areaName,
            icon: 'fa-folder-open',
            data: { type: 'area', name: area }
        });
        this.updateBreadcrumbs(this.state.navigationHistory);
        
        // Filtrar disciplinas da área
        const disciplines = this.state.disciplines.filter(d => d.area === area);
        
        // TODO: Mostrar lista de tópicos/disciplinas
        alert(`📁 ${areaName}\n\n${disciplines.length} disciplinas encontradas`);
    }
});

// Adicionar eventos UI-03 ao bindEvents original
const originalBindEvents = HubApp.bindEvents;
HubApp.bindEvents = function() {
    // Chamar bindEvents original se existir
    if (originalBindEvents) {
        originalBindEvents.call(this);
    }
    
    // UI-03: Eventos do menu lateral
    if (this.btnToggleSidebar) {
        this.btnToggleSidebar.addEventListener('click', () => this.toggleSidebar());
    }
    
    if (this.sidebarCloseBtn) {
        this.sidebarCloseBtn.addEventListener('click', () => this.closeSidebar());
    }
    
    if (this.sidebarOverlay) {
        this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
    }
    
    if (this.categorySearchInput) {
        this.categorySearchInput.addEventListener('input', (e) => {
            this.searchInCategory(e.target.value);
        });
    }
    
    if (this.searchCategoryBtn) {
        this.searchCategoryBtn.addEventListener('click', () => {
            const query = this.categorySearchInput?.value || '';
            this.searchInCategory(query);
        });
    }
};

console.log('✅ UI-03: Sistema de Navegação por Categorias carregado');
