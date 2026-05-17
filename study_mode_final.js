// JavaScript para Modo de Estudo do Quiz FGV Navegacao Aerea
(function() {
    // Variaveis globais em window para acesso externo
    window.currentQuestions = [];
    window.currentQuestionIndex = 0;
    window.bookmarks = [];
    window.studyProgress = {};
    window.currentMode = 'practice';
    window.selectedSubjects = [];

    // Funcoes principais
    function loadQuestions() {
        // Verificar se script.js já carregou questões e as disponibilizou
        if (typeof window.mainQuizFunctions !== 'undefined' &&
            window.mainQuizFunctions.questions &&
            window.mainQuizFunctions.questions.length > 0) {
            window.allQuestions = window.mainQuizFunctions.questions;
            console.log(`Carregadas ${window.allQuestions.length} questoes do script.js via window.mainQuizFunctions.questions`);
            return;
        }

        // Carregar do arquivo JSON diretamente
        fetch('questions.json')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Arquivo questions.json não encontrado');
            })
            .then(data => {
                window.allQuestions = data.questions || [];
                console.log(`Carregadas ${window.allQuestions.length} questoes do arquivo JSON`);
                if (window.studyModeFunctions) {
                    window.studyModeFunctions.filterQuestions();
                }
            })
            .catch(error => {
                console.log('Erro ao carregar JSON, usando fallback:', error);
                // Usar questões de fallback
                window.allQuestions = [
            // Questoes de Lingua Portuguesa
            {
                "id": "FGV_PTNA_001",
                "subject": "Língua Portuguesa",
                "topic": "Reescritura",
                "difficulty": "Fácil",
                "question": "Qual a alternativa que reescreve corretamente a frase: 'Ela disse que viria amanha'?",
                "alternatives": {
                    "A": "Ela disse que viria amanha.",
                    "B": "Ela disse que viria amanha!",
                    "C": "Ela disse que viria amanha?",
                    "D": "Ela disse que viria amanha;"
                },
                "answer": "A",
                "explanation": "A frase ja esta no tempo verbal correto e nao precisa de pontuacao adicional."
            },
            {
                "id": "FGV_PTNA_002",
                "subject": "Língua Portuguesa",
                "topic": "Concordância Verbal",
                "difficulty": "Médio",
                "question": "Qual a alternativa que apresenta concordância verbal correta?",
                "alternatives": {
                    "A": "Os alunos estuda para a prova.",
                    "B": "Os alunos estudam para a prova.",
                    "C": "Os alunos estudas para a prova.",
                    "D": "Os alunos estude para a prova."
                },
                "answer": "B",
                "explanation": "O verbo 'estudar' concorda com sujeito plural 'os alunos'."
            },
            {
                "id": "FGV_PTNA_003",
                "subject": "Língua Portuguesa",
                "topic": "Pontuação",
                "difficulty": "Difícil",
                "question": "Qual a alternativa que pontua corretamente a frase: 'Ela pensou em tudo ela disse'",
                "alternatives": {
                    "A": "Ela pensou em tudo, ela disse.",
                    "B": "Ela pensou em tudo; ela disse.",
                    "C": "Ela pensou em tudo: ela disse.",
                    "D": "Ela pensou em tudo - ela disse."
                },
                "answer": "C",
                "explanation": "Os dois pontos indicam explicacao do que foi pensado."
            },
            {
                "id": "FGV_PTNA_004",
                "subject": "Língua Portuguesa",
                "topic": "Pontuação",
                "difficulty": "Fácil",
                "question": "Na frase 'A aula, que começou às 8h, terminou às 10h', a virgula após 'aula' serve para:",
                "alternatives": {
                    "A": "Separar oracoes coordenadas.",
                    "B": "Isolar o sujeito da oracao.",
                    "C": "Separar o sujeito do predicado.",
                    "D": "Isolar um adjunto adverbial."
                },
                "answer": "B",
                "explanation": "A virgula isola o sujeito ('a aula') do restante da oracao."
            },
            {
                "id": "FGV_PTNA_005",
                "subject": "Língua Portuguesa",
                "topic": "Ortografia",
                "difficulty": "Médio",
                "question": "Qual das palavras esta escrita corretamente?",
                "alternatives": {
                    "A": "Receber",
                    "B": "Recibir",
                    "C": "Resceber",
                    "D": "Receber"
                },
                "answer": "A",
                "explanation": "A forma correta e 'receber', com 'cc' apos a vogal 'e'."
            },
            // Questoes de Raciocínio Lógico
            {
                "id": "FGV_LOG_001",
                "subject": "Raciocínio Lógico",
                "topic": "Sequência",
                "difficulty": "Fácil",
                "question": "Se 1+2=3 e 3+4=7, qual o resultado de 7+8?",
                "alternatives": {
                    "A": "14",
                    "B": "15",
                    "C": "16",
                    "D": "17"
                },
                "answer": "B",
                "explanation": "A sequencia segue o padrao de somar os dois numeros."
            },
            {
                "id": "FGV_LOG_002",
                "subject": "Raciocínio Lógico",
                "topic": "Sequência",
                "difficulty": "Médio",
                "question": "Qual o proximo numero na sequencia: 2, 6, 18, 54?",
                "alternatives": {
                    "A": "108",
                    "B": "162",
                    "C": "216",
                    "D": "324"
                },
                "answer": "B",
                "explanation": "Cada numero e multiplicado por 3 na sequencia."
            },
            {
                "id": "FGV_LOG_003",
                "subject": "Raciocínio Lógico",
                "topic": "Lógica",
                "difficulty": "Difícil",
                "question": "Se todos os A sao B, e alguns B sao C, entao:",
                "alternatives": {
                    "A": "Todos A sao C.",
                    "B": "Nenhum A e C.",
                    "C": "Alguns A podem ser C.",
                    "D": "Nenhuma das alternativas anteriores."
                },
                "answer": "D",
                "explanation": "A relacao nao permite concluir nada sobre A e C."
            },
            // Questoes de Conhecimentos Gerais
            {
                "id": "FGV_CGE_001",
                "subject": "Conhecimentos Gerais",
                "topic": "Geografia",
                "difficulty": "Fácil",
                "question": "Qual o maior pais do mundo por area territorial?",
                "alternatives": {
                    "A": "Estados Unidos",
                    "B": "China",
                    "C": "Canadá",
                    "D": "Rússia"
                },
                "answer": "D",
                "explanation": "A Rússia e o maior pais do mundo, com mais de 17 milhoes de km²."
            },
            {
                "id": "FGV_CGE_002",
                "subject": "Conhecimentos Gerais",
                "topic": "História",
                "difficulty": "Médio",
                "question": "Quem foi o primeiro presidente do Brasil apos a Proclamacao da Republica?",
                "alternatives": {
                    "A": "Deodoro da Fonseca",
                    "B": "Floriano Peixoto",
                    "C": "Prudente de Morais",
                    "D": "Marechal Deodoro"
                },
                "answer": "A",
                "explanation": "Deodoro da Fonseca foi o primeiro presidente do Brasil Republicano."
            }
            ];
            console.log(`Carregadas ${window.allQuestions.length} questoes inline no modo de estudo`);
            if (window.studyModeFunctions) {
                window.studyModeFunctions.filterQuestions();
            }
        });
    }

    function filterQuestions() {
        console.log('filterQuestions: Iniciando...');
        const modeTypeEl = document.getElementById('study-mode-type');
        console.log('filterQuestions: study-mode-type element:', modeTypeEl);
        const modeType = modeTypeEl ? modeTypeEl.value : 'all';
        console.log('filterQuestions: modeType:', modeType);

        // Por padrão, usar todas as questões
        if (Array.isArray(window.allQuestions)) {
            currentQuestions = [...window.allQuestions];
            window.currentQuestions = currentQuestions; // Exportar para window
        } else {
            console.error('window.allQuestions não é um array!', typeof window.allQuestions);
            currentQuestions = [];
            window.currentQuestions = [];
        }

        // Filtrar por materia se existir o elemento
        const subjectSelect = document.getElementById('study-subject');
        if (subjectSelect) {
            const subject = subjectSelect.value;
            if (subject && subject !== 'all') {
                currentQuestions = window.allQuestions.filter(q => q.subject === subject);
                window.currentQuestions = currentQuestions; // Exportar para window
            }
        }

        // Filtrar por dificuldade se existir o elemento
        const difficultySelect = document.getElementById('study-difficulty');
        if (difficultySelect) {
            const difficulty = difficultySelect.value;
            if (difficulty && difficulty !== 'all') {
                currentQuestions = currentQuestions.filter(q => q.difficulty === difficulty);
                window.currentQuestions = currentQuestions; // Exportar
            }
        }

        // Filtrar por modo de estudo
        if (modeType === 'practice') {
            // Modo normal
        } else if (modeType === 'flashcard') {
            // Modo flashcard
        } else if (modeType === 'review') {
            // Modo revisao
        }

        // Atualizar UI (se os elementos existirem)
        const filteredCount = document.getElementById('filtered-count');
        if (filteredCount) {
            filteredCount.textContent = currentQuestions.length;
        }
        const totalCount = document.getElementById('total-count');
        if (totalCount) {
            totalCount.textContent = window.allQuestions.length;
        }

        // Resetar progresso
        currentQuestionIndex = 0;
        window.currentQuestionIndex = 0; // Exportar

        // Apenas mostrar questão se o elemento existe
        const questionEl = document.getElementById('study-question');
        console.log('filterQuestions: study-question element:', questionEl);
        if (questionEl) {
            // Mostrar tela de estudo e esconder configurações
            const studySettings = document.getElementById('study-settings');
            const studyScreen = document.getElementById('study-screen');
            console.log('filterQuestions: study-settings:', studySettings, 'study-screen:', studyScreen);

            if (studySettings) {
                console.log('filterQuestions: Adicionando hidden a study-settings');
                studySettings.classList.add('hidden');
            }
            if (studyScreen) {
                console.log('filterQuestions: Removendo hidden de study-screen');
                studyScreen.classList.remove('hidden');
            }

            console.log('filterQuestions: Chamando showQuestion');
            showQuestion();
        } else {
            console.log('showQuestion() não chamado - elemento #study-question não encontrado');
        }
    }

    function showQuestion() {
        console.log('showQuestion: currentQuestions', currentQuestions, 'length:', currentQuestions.length);
        if (currentQuestions.length === 0) {
            // Mostrar mensagem usando elemento existente
            const questionArea = document.getElementById('study-question');
            if (questionArea) {
                questionArea.textContent = 'Nenhuma questão encontrada para os filtros selecionados.';
            }
            return;
        }

        const question = currentQuestions[currentQuestionIndex];
        const questionElement = document.getElementById('study-question');

        questionElement.innerHTML = `
            <div class="question-header">
                <span class="question-id">${question.id}</span>
                <span class="question-difficulty">${question.difficulty}</span>
            </div>
            <h3>${question.question}</h3>
            <div class="question-options">
                ${Object.entries(question.alternatives).map(([key, value]) =>
                    `<div class="option" data-option="${key}">
                        <span class="option-label">${key}.</span>
                        <span class="option-text">${value}</span>
                    </div>`
                ).join('')}
            </div>
            <div class="question-controls">
                <button onclick="checkAnswer()">Verificar Resposta</button>
                <button onclick="nextQuestion()">Próxima</button>
                <button onclick="previousQuestion()">Anterior</button>
                <button onclick="bookmarkQuestion()">Marcar</button>
            </div>
        `;

        // Adicionar listeners as opcoes
        questionElement.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', () => {
                questionElement.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
    }

    function checkAnswer() {
        const selectedOption = document.querySelector('.option.selected');
        if (!selectedOption) {
            alert('Por favor, selecione uma alternativa.');
            return;
        }

        const question = currentQuestions[currentQuestionIndex];
        const isCorrect = selectedOption.dataset.option === question.answer;

        // Mostrar feedback
        selectedOption.classList.add(isCorrect ? 'correct' : 'incorrect');

        // Mostrar explicacao
        const explanation = document.createElement('div');
        explanation.className = 'explanation';
        explanation.innerHTML = `
            <h4>Resposta ${isCorrect ? 'Correta!' : 'Incorreta!'}</h4>
            <p>${question.explanation}</p>
        `;
        const questionElement = document.getElementById('study-question');
        if (questionElement) {
            questionElement.appendChild(explanation);
        }

        // Atualizar progresso
        if (!studyProgress[question.id]) {
            studyProgress[question.id] = {
                correct: 0,
                incorrect: 0,
                reviewed: false
            };
        }
        studyProgress[question.id][isCorrect ? 'correct' : 'incorrect']++;
    }

    function nextQuestion() {
        if (currentQuestionIndex < currentQuestions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        }
    }

    function previousQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
        }
    }

    function bookmarkQuestion() {
        const question = currentQuestions[currentQuestionIndex];
        const bookmarked = bookmarks.find(b => b.id === question.id);

        if (bookmarked) {
            bookmarks = bookmarks.filter(b => b.id !== question.id);
            alert('Questao removida dos favoritos.');
        } else {
            bookmarks.push(question);
            alert('Questao adicionada aos favoritos.');
        }
    }

    // Funcoes auxiliares
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Função para configurar listeners
    function setupListeners() {
        const startBtn = document.getElementById('start-study');
        console.log('setupListeners: start-study button:', startBtn);
        if (startBtn) {
            // Adicionar listener múltiplas formas
            startBtn.onclick = function() {
                console.log('Botão start-study clicado via onclick!');
                filterQuestions();
            };

            startBtn.addEventListener('click', function(e) {
                console.log('Botão start-study clicado via addEventListener!', e);
                e.preventDefault();
                e.stopPropagation();
                filterQuestions();
            });

            // Teste imediato
            console.log('Estilo do botão:', getComputedStyle(startBtn).pointerEvents);
            console.log('Elemento pai:', startBtn.parentElement);
            console.log('Form mais próximo:', startBtn.closest('form'));
        } else {
            console.error('Botão start-study não encontrado!');
        }
    }

    // Exportar funcoes globais
    window.bookmarkedQuestions = window.bookmarks;

    window.studyModeFunctions = {
        loadQuestions: loadQuestions,
        filterQuestions: filterQuestions,
        showStudyModeScreen: window.showStudyModeScreen,
        showQuestion: showQuestion,
        checkAnswer: checkAnswer,
        nextQuestion: nextQuestion,
        previousQuestion: previousQuestion,
        bookmarkQuestion: bookmarkQuestion,
        setupListeners: setupListeners
    };
})();