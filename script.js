// JavaScript para Quiz FGV Navegação Aérea
(function() {
    // Variáveis globais
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedAnswer = null;
    let timer = null;
    let timeRemaining = 0;
    let quizQuestions = [];
    let userAnswers = [];
    let startTime = null;
    let selectedDisciplines = new Set();
    let questionsPerDiscipline = {};
    let availableDisciplines = [];

    // Elementos DOM
    let welcomeScreen, questionScreen, resultScreen, reviewScreen;
    let startButton, startStudyButton, nextButton, prevButton;
    let restartButton, reviewButton, backButton, backToMenuButton, submitButton;

    // Função para carregar questões do arquivo JSON
    async function loadQuestions() {
        try {
            // Tentar usar o Hub Loader primeiro
            if (window.HubLoader && window.HubLoader.catalog) {
                console.log('🔄 Usando Hub Loader para carregar questões...');

                // Carregar perguntas das disciplinas principais como exemplo
                // TODO: Implementar sistema de seleção de disciplinas
                const disciplinasPrincipais = ['matemática', 'português', 'direito', 'informática'];
                let allQuestionsFromHub = [];

                for (const disciplina of disciplinasPrincipais) {
                    try {
                        const questions = await window.HubLoader.loadQuestions({
                            disciplina: disciplina,
                            quantidade: 50 // Limitar para performance inicial
                        });
                        allQuestionsFromHub.push(...questions);
                        console.log(`✅ Carregadas ${questions.length} questões de ${disciplina}`);
                    } catch (error) {
                        console.warn(`⚠️ Não foi possível carregar ${disciplina}:`, error.message);
                    }
                }

                if (allQuestionsFromHub.length > 0) {
                    questions = allQuestionsFromHub;
                    console.log(`🎯 Total de questões carregadas: ${questions.length}`);
                    return;
                }
            }

            // Fallback para o sistema antigo
            const response = await fetch('questions.json');
            if (!response.ok) {
                throw new Error('Não foi possível carregar as questões');
            }
            const data = await response.json();
            questions = data.questions;
            console.log(`Carregadas ${questions.length} questões do arquivo JSON`);
        } catch (error) {
            console.error('Erro ao carregar questões:', error);
            // Carregar questões fallback em caso de erro
            useFallbackQuestions();
        }
    }

    // Função para usar questões fallback
    function useFallbackQuestions() {
        // Só carregar fallback se não houver questões carregadas
        if (questions.length === 0) {
            console.log('Carregando questões fallback...');
            // Carregar todas as questões do arquivo JSON inline
            loadAllQuestionsInline();
        }
    }

    // Função para carregar todas as questões inline
    function loadAllQuestionsInline() {
        questions = [
            // Questões de Língua Portuguesa
            {
                "id": "FGV_PTNA_001",
                "subject": "Língua Portuguesa",
                "topic": "Reescritura",
                "difficulty": "Fácil",
                "question": "Qual a alternativa que reescreve corretamente a frase: 'Ela disse que viria amanhã'?",
                "alternatives": {
                    "A": "Ela disse que viria amanhã.",
                    "B": "Ela disse que viria amanhã!",
                    "C": "Ela disse que viria amanhã?",
                    "D": "Ela disse que viria amanhã;"
                },
                "answer": "A",
                "explanation": "A frase já está no tempo verbal correto e não precisa de pontuação adicional."
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
                    "D": "Os alunos estude para a prova.",
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
                    "D": "Ela pensou em tudo - ela disse.",
                },
                "answer": "C",
                "explanation": "Os dois pontos indicam explicação do que foi pensado."
            },
            {
                "id": "FGV_PTNA_004",
                "subject": "Língua Portuguesa",
                "topic": "Pontuação",
                "difficulty": "Fácil",
                "question": "Na frase 'A aula, que começou às 8h, terminou às 10h', a vírgula após 'aula' serve para:",
                "alternatives": {
                    "A": "Separar orações coordenadas.",
                    "B": "Isolar o sujeito da oração.",
                    "C": "Separar o sujeito do predicado.",
                    "D": "Isolar um adjunto adverbial."
                },
                "answer": "B",
                "explanation": "A vírgula isola o sujeito ('a aula') do restante da oração."
            },
            {
                "id": "FGV_PTNA_005",
                "subject": "Língua Portuguesa",
                "topic": "Ortografia",
                "difficulty": "Médio",
                "question": "Qual das palavras está escrita corretamente?",
                "alternatives": {
                    "A": "Receber",
                    "B": "Recibir",
                    "C": "Resceber",
                    "D": "Recebo",
                },
                "answer": "A",
                "explanation": "A forma correta é 'receber', com 'cc' após a vogal 'e'."
            },
            {
                "id": "FGV_PTNA_006",
                "subject": "Língua Portuguesa",
                "topic": "Acentuação",
                "difficulty": "Difícil",
                "question": "Qual a palavra NÃO é acentuada por hiato?",
                "alternatives": {
                    "A": "saída",
                    "B": "baú",
                    "C": "herói",
                    "D": "vassoura",
                },
                "answer": "D",
                "explanation": "'Vassoura' não tem hiato pois as vogais não são tônicas."
            },
            {
                "id": "FGV_PTNA_007",
                "subject": "Língua Portuguesa",
                "topic": "Crase",
                "difficulty": "Difícil",
                "question": "Na frase 'Ela passou ____ frente de mim', a forma correta é:",
                "alternatives": {
                    "A": "a",
                    "B": "à",
                    "C": "á",
                    "D": "às",
                },
                "answer": "B",
                "explanation": "Usamos 'à' contração de 'a' + 'a', indicando lugar."
            },
            {
                "id": "FGV_PTNA_008",
                "subject": "Língua Portuguesa",
                "topic": "Pronomes",
                "difficulty": "Médio",
                "question": "Na frase '___ somos todos iguais', o pronome pessoal correto é:",
                "alternatives": {
                    "A": "Nós",
                    "B": "Nos",
                    "C": "A nós",
                    "D": "Conosco",
                },
                "answer": "A",
                "explanation": "'Nós' é o sujeito da oração, sem preposição."
            },
            {
                "id": "FGV_PTNA_009",
                "subject": "Língua Portuguesa",
                "topic": "Preposições",
                "difficulty": "Fácil",
                "question": "Qual a preposição correta na frase: 'Ela estudou ____ matemática'?",
                "alternatives": {
                    "A": "a",
                    "B": "à",
                    "C": "em",
                    "D": "para",
                },
                "answer": "C",
                "explanation": "'Em' indica matéria de estudo."
            },
            {
                "id": "FGV_PTNA_010",
                "subject": "Língua Portuguesa",
                "topic": "Concordância Nominal",
                "difficulty": "Médio",
                "question": "Qual a alternativa com concordância nominal correta?",
                "alternatives": {
                    "A": "O carro são vermelhos.",
                    "B": "O carro é vermelho.",
                    "C": "O carro são vermelho.",
                    "D": "O carro é vermelhos.",
                },
                "answer": "B",
                "explanation": "O sujeito é singular, então o predicado concorda no singular."
            },
            // Questões de Raciocínio Lógico
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
                    "D": "17",
                },
                "answer": "B",
                "explanation": "A sequência segue o padrão de somar os dois números."
            },
            {
                "id": "FGV_LOG_002",
                "subject": "Raciocínio Lógico",
                "topic": "Sequência",
                "difficulty": "Médio",
                "question": "Qual o próximo número na sequência: 2, 6, 18, 54?",
                "alternatives": {
                    "A": "108",
                    "B": "162",
                    "C": "216",
                    "D": "324",
                },
                "answer": "B",
                "explanation": "Cada número é multiplicado por 3 na sequência."
            },
            {
                "id": "FGV_LOG_003",
                "subject": "Raciocínio Lógico",
                "topic": "Lógica",
                "difficulty": "Difícil",
                "question": "Se todos os A são B, e alguns B são C, então:",
                "alternatives": {
                    "A": "Todos A são C.",
                    "B": "Nenhum A é C.",
                    "C": "Alguns A podem ser C.",
                    "D": "Nenhuma das alternativas anteriores.",
                },
                "answer": "D",
                "explanation": "A relação não permite concluir nada sobre A e C."
            },
            {
                "id": "FGV_LOG_004",
                "subject": "Raciocínio Lógico",
                "topic": "Probabilidade",
                "difficulty": "Médio",
                "question": "Uma moeda é jogada 3 vezes. Qual a probabilidade de dar cara em todas as 3 vezes?",
                "alternatives": {
                    "A": "1/8",
                    "B": "1/4",
                    "C": "1/6",
                    "D": "1/2",
                },
                "answer": "A",
                "explanation": "Cada jogada tem 1/2 chance, então (1/2)³ = 1/8."
            },
            {
                "id": "FGV_LOG_005",
                "subject": "Raciocínio Lógico",
                "topic": "Venn",
                "difficulty": "Difícil",
                "question": "Em um grupo de 100 pessoas, 40 gostam de A, 50 gostam de B, e 20 gostam de ambos. Quantos não gostam de nenhum?",
                "alternatives": {
                    "A": "20",
                    "B": "30",
                    "C": "40",
                    "D": "50",
                },
                "answer": "B",
                "explanation": "40 + 50 - 20 = 70 gostam de pelo menos um. 100 - 70 = 30 não gostam de nenhum."
            },
            // Questões de Conhecimentos Gerais
            {
                "id": "FGV_CGE_001",
                "subject": "Conhecimentos Gerais",
                "topic": "Geografia",
                "difficulty": "Fácil",
                "question": "Qual o maior país do mundo por área territorial?",
                "alternatives": {
                    "A": "Estados Unidos",
                    "B": "China",
                    "C": "Canadá",
                    "D": "Rússia"
                },
                "answer": "D",
                "explanation": "A Rússia é o maior país do mundo, com mais de 17 milhões de km²."
            },
            {
                "id": "FGV_CGE_002",
                "subject": "Conhecimentos Gerais",
                "topic": "História",
                "difficulty": "Médio",
                "question": "Quem foi o primeiro presidente do Brasil após a Proclamação da República?",
                "alternatives": {
                    "A": "Deodoro da Fonseca",
                    "B": "Floriano Peixoto",
                    "C": "Prudente de Morais",
                    "D": "Marechal Deodoro"
                },
                "answer": "A",
                "explanation": "Deodoro da Fonseca foi o primeiro presidente do Brasil Republicano."
            },
            {
                "id": "FGV_CGE_003",
                "subject": "Conhecimentos Gerais",
                "topic": "Biologia",
                "difficulty": "Fácil",
                "question": "Qual o órgão responsável pela produção de insulina no corpo humano?",
                "alternatives": {
                    "A": "Fígado",
                    "B": "Pâncreas",
                    "C": "Rim",
                    "D": "Coração"
                },
                "answer": "B",
                "explanation": "O pâncreas produz insulina, hormônio que regula o açúcar no sangue."
            },
            {
                "id": "FGV_CGE_004",
                "subject": "Conhecimentos Gerais",
                "topic": "Química",
                "difficulty": "Médio",
                "question": "Qual o elemento químico com símbolo 'O'?",
                "alternatives": {
                    "A": "Ouro",
                    "B": "Ossígio",
                    "C": "Oxigênio",
                    "D": "Osmio"
                },
                "answer": "C",
                "explanation": "Oxigênio tem símbolo químico 'O' e número atômico 8."
            },
            {
                "id": "FGV_CGE_005",
                "subject": "Conhecimentos Gerais",
                "topic": "Física",
                "difficulty": "Difícil",
                "question": "Qual a unidade de medida da força no Sistema Internacional?",
                "alternatives": {
                    "A": "Watt",
                    "B": "Joule",
                    "C": "Newton",
                    "D": "Pascal"
                },
                "answer": "C",
                "explanation": "Newton é a unidade de força no SI."
            }
        ];
        console.log(`Carregadas ${questions.length} questões inline`);
    }

    // Todas as outras funções virão aqui
    // Verificar se há uma função de embaralhamento
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Função para iniciar timer
    function startTimer() {
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            timeRemaining -= 1000;
            updateTimerDisplay();
            if (timeRemaining <= 0) {
                clearInterval(timer);
                submitQuiz();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Funções de interface serão declaradas abaixo

    // Função para mostrar uma pergunta
    function showQuestion() {
        welcomeScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        reviewScreen.classList.add('hidden');
        questionScreen.classList.remove('hidden');

        const question = quizQuestions[currentQuestionIndex];

        // Atualizar contador
        document.getElementById('question-counter').textContent =
            `Questão ${currentQuestionIndex + 1}/${quizQuestions.length}`;

        // Mostrar pergunta
        document.getElementById('question-text').textContent = question.question;

        // Mostrar alternativas
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        Object.entries(question.alternatives).forEach(([key, value]) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.dataset.answer = key;

            optionElement.innerHTML = `
                <div class="option-label">${key}</div>
                <div class="option-text">${value}</div>
            `;

            optionElement.addEventListener('click', () => selectAnswer(key, optionElement));
            optionsContainer.appendChild(optionElement);
        });

        // Reiniciar estado
        selectedAnswer = null;
        nextButton.disabled = true;
    }

    // Função para selecionar resposta
    function selectAnswer(answer, element) {
        // Remover seleção anterior
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Selecionar nova resposta
        element.classList.add('selected');
        selectedAnswer = answer;
        nextButton.disabled = false;

        // Parar timer se existir
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    // Função para próximo questionário
    function nextQuestion() {
        if (selectedAnswer === null) return;

        const question = quizQuestions[currentQuestionIndex];
        const isCorrect = selectedAnswer === question.answer;

        // Registrar resposta
        userAnswers.push({
            question: question,
            userAnswer: selectedAnswer,
            isCorrect: isCorrect
        });

        if (isCorrect) {
            score++;
        }

        // Mostrar feedback visual
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            const answer = option.dataset.answer;
            if (answer === question.answer) {
                option.classList.add('correct');
            } else if (answer === selectedAnswer && !isCorrect) {
                option.classList.add('incorrect');
            }
        });

        // Desabilitar clique nas opções
        options.forEach(option => {
            option.style.pointerEvents = 'none';
        });

        // Avançar para próxima pergunta ou mostrar resultados
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizQuestions.length) {
                showQuestion();
            } else {
                showResults();
            }
        }, 2000);
    }

    // Função para mostrar resultados
    function showResults() {
        questionScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');

        // Calcular estatísticas
        const percentage = Math.round((score / quizQuestions.length) * 100);
        const timeSpent = Math.round((new Date() - startTime) / 1000);

        // Mostrar resultados
        document.getElementById('correct-count').textContent = `${score} corretas`;
        document.getElementById('total-count').textContent = `de ${quizQuestions.length} questões`;
        document.getElementById('score-percentage').textContent = `${percentage}%`;

        // Mensagem de desempenho
        const performanceMessage = document.getElementById('performance-message');
        if (percentage >= 80) {
            performanceMessage.textContent = 'Excelente performance! Continue assim!';
            performanceMessage.className = 'performance-message excellent';
        } else if (percentage >= 60) {
            performanceMessage.textContent = 'Bom desempenho! Há espaço para melhoria.';
            performanceMessage.className = 'performance-message good';
        } else if (percentage >= 40) {
            performanceMessage.textContent = 'Desempenho mediano. Estude mais!';
            performanceMessage.className = 'performance-message average';
        } else {
            performanceMessage.textContent = 'Precisa melhorar. Revise o conteúdo.';
            performanceMessage.className = 'performance-message poor';
        }

        // Mostrar tempo gasto
        if (timeSpent > 0) {
            const timeElement = document.createElement('div');
            timeElement.className = 'time-spent';
            timeElement.textContent = `Tempo gasto: ${formatTime(timeSpent)}`;
            resultScreen.appendChild(timeElement);
        }
    }

    // Função para mostrar revisão
    function showReview() {
        resultScreen.classList.add('hidden');
        reviewScreen.classList.remove('hidden');

        const reviewContainer = document.getElementById('review-questions');
        reviewContainer.innerHTML = '';

        userAnswers.forEach((answer, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';

            reviewItem.innerHTML = `
                <h4>Questão ${index + 1} - ${answer.question.subject}</h4>
                <div class="question-text">${answer.question.question}</div>
                <div class="options">
                    ${Object.entries(answer.question.alternatives).map(([key, value]) => {
                        let className = 'option';
                        if (key === answer.question.answer) {
                            className += ' correct-answer';
                        }
                        if (key === answer.userAnswer && key !== answer.question.answer) {
                            className += ' user-answer';
                        }
                        return `<div class="${className}">${key}: ${value}</div>`;
                    }).join('')}
                </div>
                <div class="feedback">
                    <strong>Sua resposta:</strong> ${answer.userAnswer}
                    <strong>Resposta correta:</strong> ${answer.question.answer}
                </div>
                ${answer.question.explanation ? `
                    <div class="explanation">
                        <strong>Explicação:</strong> ${answer.question.explanation}
                    </div>
                ` : ''}
            `;

            reviewContainer.appendChild(reviewItem);
        });
    }

    // Função para voltar aos resultados
    function backToResults() {
        reviewScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
    }

    // Função para reiniciar quiz
    function restartQuiz() {
        // Limpar timer
        if (timer) {
            clearInterval(timer);
            timer = null;
        }

        // Voltar para tela inicial
        questionScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        reviewScreen.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');

        // Resetar variáveis
        currentQuestionIndex = 0;
        score = 0;
        selectedAnswer = null;
        userAnswers = [];
    }

    // Função do timer
    function startTimer() {
        const progressBar = document.getElementById('time-progress');

        timer = setInterval(() => {
            timeRemaining -= 1000;
            const progress = (timeRemaining / (parseInt(document.getElementById('timer').value) * 1000)) * 100;
            progressBar.style.width = `${progress}%`;

            if (timeRemaining <= 0) {
                clearInterval(timer);
                nextButton.disabled = false;
                // Auto-responder com a primeira opção ou marcar como não respondida
                if (selectedAnswer === null) {
                    const firstOption = document.querySelector('.option');
                    if (firstOption) {
                        firstOption.click();
                    }
                }
            }
        }, 1000);
    }

    // Funções auxiliares
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    // Função para iniciar o review
    function startReview() {
        hideAllScreens();
        // Iniciar revisão com questões já respondidas
        console.log('Iniciando revisão rápida...');
        // TODO: Implementar sistema de revisão
        alert('Funcionalidade de revisão em desenvolvimento');
        backToMenu();
    }

    // Função para mostrar tela de modo de estudo
    function showStudyModeScreen() {
        console.log('showStudyModeScreen: Iniciando...');
        hideAllScreens();
        const studySettingsEl = document.getElementById('study-settings');
        console.log('showStudyModeScreen: study-settings element:', studySettingsEl);
        if (studySettingsEl) {
            studySettingsEl.classList.remove('hidden');
            console.log('showStudyModeScreen: hidden class removed from study-settings');
        }
        // Apenas carregar questões, não filtrar ainda
        if (typeof window.studyModeFunctions !== 'undefined') {
            console.log('showStudyModeScreen: studyModeFunctions encontrado, executando loadQuestions...');
            window.studyModeFunctions.loadQuestions();
            console.log('showStudyModeScreen: loadQuestions executado');
            // Configurar listeners
            if (typeof window.studyModeFunctions.setupListeners === 'function') {
                window.studyModeFunctions.setupListeners();
                console.log('showStudyModeScreen: setupListeners executado');
            }
            // Não chamar filterQuestions() aqui - será chamado quando clicar no botão
        } else {
            console.error('showStudyModeScreen: studyModeFunctions não encontrado!');
        }
    }

    // Funções de navegação que estavam faltando
    function previousQuestion() {
        if (quizState.currentQuestionIndex > 0) {
            quizState.currentQuestionIndex--;
            displayQuestion();
        }
    }

    function startStudyMode() {
        hideAllScreens();
        document.getElementById('study-settings').classList.remove('hidden');
        if (typeof window.studyModeFunctions !== 'undefined') {
            window.studyModeFunctions.loadQuestions();
            window.studyModeFunctions.filterQuestions();
        }
    }

    function backToMenu() {
        hideAllScreens();
        document.getElementById('welcome-screen').classList.remove('hidden');
    }

    function hideAllScreens() {
        const screens = ['welcome-screen', 'question-screen', 'result-screen', 'review-screen', 'study-settings', 'custom-quiz-container'];
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) screen.classList.add('hidden');
        });
    }

    // Função para iniciar o quiz
    async function startQuiz() {
        console.log('Iniciando quiz...');
        // Verificar se as questões foram carregadas
        if (!questions || questions.length === 0) {
            console.error('Questões não carregadas!');
            alert('Erro: Questões ainda não foram carregadas. Por favor, aguarde um momento e tente novamente.');
            return;
        }

        // Obter configurações
        const examType = document.getElementById('exam-type').value;
        const questionsCount = document.getElementById('questions-count').value;
        const timerOption = document.getElementById('timer').value;
        console.log(`Configurações - Tipo: ${examType}, Quantidade: ${questionsCount}, Timer: ${timerOption}`);

        // Filtrar questões por tipo (se necessário)
        if (examType === 'personalized') {
            // Modo simulado personalizado com múltiplas disciplinas
            await loadPersonalizedQuestions();
        } else {
            // Modo tradicional
            quizQuestions = [...questions];
            console.log(`Total de questões disponíveis: ${quizQuestions.length}`);

            // Limitar número de questões
            if (questionsCount !== 'all') {
                const count = parseInt(questionsCount);
                quizQuestions = shuffleArray(quizQuestions).slice(0, count);
            } else {
                quizQuestions = shuffleArray(quizQuestions);
            }
        }

        // Configurar timer
        timeRemaining = parseInt(timerOption) * 1000; // Converter para milissegundos
        if (timeRemaining > 0) {
            startTimer();
        }

        // Iniciar quiz
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        startTime = new Date();
        showQuestion();
    }

    // Função para inicializar elementos DOM
    function initDOMElements() {
        welcomeScreen = document.getElementById('welcome-screen');
        questionScreen = document.getElementById('question-screen');
        resultScreen = document.getElementById('result-screen');
        reviewScreen = document.getElementById('review-screen');
        startButton = document.getElementById('start-quiz');
        startStudyButton = document.getElementById('start-study');
        nextButton = document.getElementById('next-question');
        prevButton = document.getElementById('prev-question');
        restartButton = document.getElementById('restart-quiz');
        reviewButton = document.getElementById('review-answers');
        backButton = document.getElementById('back-to-results');
        backToMenuButton = document.getElementById('back-to-menu');
        submitButton = document.getElementById('submit-quiz');

        // Configuração inicial - Adicionar event listeners com verificações de existência
        if (startButton) startButton.addEventListener('click', startQuiz);
        if (startStudyButton) startStudyButton.addEventListener('click', startStudyMode);
        if (nextButton) nextButton.addEventListener('click', nextQuestion);
        if (prevButton) prevButton.addEventListener('click', previousQuestion);
        if (restartButton) restartButton.addEventListener('click', restartQuiz);
        if (reviewButton) reviewButton.addEventListener('click', showReview);
        if (backButton) backButton.addEventListener('click', backToResults);
        if (backToMenuButton) backToMenuButton.addEventListener('click', backToMenu);
        if (submitButton) submitButton.addEventListener('click', submitQuiz);

        // Botões de navegação da tela inicial
        const viewResultsBtn = document.getElementById('view-results');
        const viewBookmarksBtn = document.getElementById('view-bookmarks');
        const viewProgressBtn = document.getElementById('view-progress');

        if (viewResultsBtn) viewResultsBtn.addEventListener('click', showResults);
        if (viewBookmarksBtn) viewBookmarksBtn.addEventListener('click', showBookmarks);
        if (viewProgressBtn) viewProgressBtn.addEventListener('click', showProgress);

        // Configura listeners para os botões de modo
        const quizModeBtn = document.getElementById('quiz-mode');
        const studyModeBtn = document.getElementById('study-mode');

        if (quizModeBtn) {
            quizModeBtn.addEventListener('click', () => {
                // Ativa modo quiz
                quizModeBtn.classList.add('active');
               studyModeBtn.classList.remove('active');
                document.getElementById('quiz-settings').classList.remove('hidden');
                document.getElementById('study-settings').classList.add('hidden');
                showWelcomeScreen();
            });
        }

        if (studyModeBtn) {
            studyModeBtn.addEventListener('click', () => {
                // Ativa modo de estudo
                studyModeBtn.classList.add('active');
                quizModeBtn.classList.remove('active');
                document.getElementById('study-settings').classList.remove('hidden');
                document.getElementById('quiz-settings').classList.add('hidden');
                showStudyModeScreen();
            });
        }
    }

    // Funções para as telas adicionais
    function showResults() {
        // Recuperar resultados do localStorage
        const results = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        const resultsContainer = document.getElementById('results-list');

        if (!resultsContainer) return;

        resultsContainer.innerHTML = '';

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>Nenhum resultado encontrado.</p>';
        } else {
            results.forEach((result, index) => {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'result-item';
                resultDiv.innerHTML = `
                    <h3>Quiz de ${new Date(result.date).toLocaleDateString()}</h3>
                    <p>Pontuação: ${result.score}/${result.totalQuestions}</p>
                    <p>Taxa de acerto: ${((result.score / result.totalQuestions) * 100).toFixed(2)}%</p>
                    <p>Tempo: ${result.timeTaken}</p>
                    <hr>
                `;
                resultsContainer.appendChild(resultDiv);
            });
        }

        hideAllScreens();
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) resultsScreen.classList.remove('hidden');

        // Adicionar listener ao botão de voltar
        const backBtn = document.getElementById('back-to-welcome');
        if (backBtn && !backBtn.hasAttribute('data-listener')) {
            backBtn.setAttribute('data-listener', 'true');
            backBtn.addEventListener('click', backToMenu);
        }
    }

    function showBookmarks() {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedQuestions') || '[]');
        const bookmarksContainer = document.getElementById('bookmark-list');

        if (!bookmarksContainer) return;

        bookmarksContainer.innerHTML = '';

        if (bookmarks.length === 0) {
            bookmarksContainer.innerHTML = '<p>Nenhuma questão favoritada.</p>';
        } else {
            bookmarks.forEach((bookmark, index) => {
                const bookmarkDiv = document.createElement('div');
                bookmarkDiv.className = 'bookmark-item';
                bookmarkDiv.innerHTML = `
                    <h3>Questão ${bookmark.questionId}</h3>
                    <p>${bookmark.question}</p>
                    <button onclick="removeBookmark(${index})" class="btn small">Remover</button>
                    <hr>
                `;
                bookmarksContainer.appendChild(bookmarkDiv);
            });
        }

        hideAllScreens();
        const bookmarksScreen = document.getElementById('bookmark-screen');
        if (bookmarksScreen) bookmarksScreen.classList.remove('hidden');

        // Adicionar listener ao botão de voltar
        const backBtn = document.getElementById('back-to-welcome');
        if (backBtn && !backBtn.hasAttribute('data-listener')) {
            backBtn.setAttribute('data-listener', 'true');
            backBtn.addEventListener('click', backToMenu);
        }
    }

    function showProgress() {
        const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        // Atualiza os spans existentes
        const totalAnsweredEl = document.getElementById('total-answered');
        const totalCorrectEl = document.getElementById('total-correct');
        const accuracyRateEl = document.getElementById('accuracy-rate');

        if (!totalAnsweredEl || !totalCorrectEl || !accuracyRateEl) return;

        // Calcular estatísticas
        const totalQuizzes = (progress.totalQuizzes || 0);
        const totalQuestions = (progress.totalQuestions || 0);
        const correctAnswers = (progress.correctAnswers || 0);
        const averageScore = totalQuizzes > 0 ? ((progress.totalScore || 0) / totalQuizzes).toFixed(1) : 0;

        // Atualiza os valores
        if (totalAnsweredEl) totalAnsweredEl.textContent = totalQuestions;
        if (totalCorrectEl) totalCorrectEl.textContent = correctAnswers;
        if (accuracyRateEl) accuracyRateEl.textContent = totalQuestions > 0 ? ((correctAnswers/totalQuestions)*100).toFixed(1) + '%' : '0%';

        hideAllScreens();
        const progressScreen = document.getElementById('progress-screen');
        if (progressScreen) progressScreen.classList.remove('hidden');

        // Adicionar listener ao botão de voltar específico
        const backBtn = document.getElementById('back-to-welcome-progress');
        if (backBtn && !backBtn.hasAttribute('data-listener')) {
            backBtn.setAttribute('data-listener', 'true');
            backBtn.addEventListener('click', backToMenu);
        }
    }

    // Função para o botão de Estudo Focado
    const studyFocusedBtn = document.getElementById('study-focused-btn');
    if (studyFocusedBtn) {
        studyFocusedBtn.addEventListener('click', () => {
            hideAllScreens();
            const studySettings = document.getElementById('study-settings');
            if (studySettings) {
                studySettings.classList.remove('hidden');
                // Inicializar modo de estudo aqui se necessário
            }
        });
    }

    // Tornar funções globais se necessário
    window.previousQuestion = previousQuestion;
    window.startStudyMode = startStudyMode;
    window.backToMenu = backToMenu;
    window.hideAllScreens = hideAllScreens;
    window.showResults = showResults;
    window.showBookmarks = showBookmarks;
    window.showProgress = showProgress;

    // Exportar quiz functions para outros scripts
    window.mainQuizFunctions = {
        questions: questions,
        loadQuestions: loadQuestions,
        startReview: startReview
    };

    // Carregar questões ao iniciar
    console.log('Adicionando listener DOMContentLoaded');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('DOM carregado, iniciando carregamento do Hub...');

            // Inicializar o Hub Loader primeiro
            try {
                await window.HubLoader.init();
                console.log('✅ Hub Loader inicializado');

                // Inicializar elementos DOM
                initDOMElements();

                // Carregar questões usando o novo sistema
                await loadQuestions();
            } catch (error) {
                console.error('❌ Falha ao inicializar Hub Loader:', error);
                console.log('🔄 Usando sistema antigo como fallback...');

                // Fallback para o sistema antigo
                initDOMElements();
                loadQuestions();
            }
        });
    } else {
        console.log('DOM já carregado, iniciando imediatamente...');

        // Inicializar em modo async
        (async () => {
            try {
                await window.HubLoader.init();
                initDOMElements();
                await loadQuestions();
            } catch (error) {
                console.error('❌ Erro no carregamento:', error);
                initDOMElements();
                loadQuestions();
            }
        })();
    }
})();