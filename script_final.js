// JavaScript principal do Quiz FGV Navegacao Aerea
(function() {
    // Variaveis globais
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let selectedCount = 10;
    let selectedSubject = 'all';
    let selectedDifficulty = 'all';
    let selectedGameMode = 'normal';
    let quizStartTime = null;
    let quizTimer = null;

    // Elementos DOM
    const quizSettings = document.getElementById('quiz-settings');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const reviewScreen = document.getElementById('review-screen');
    const startButton = document.getElementById('start-quiz');
    const nextButton = document.getElementById('next-question');
    const restartButton = document.getElementById('restart-quiz');
    const backButton = document.getElementById('back-to-home');
    const reviewButton = document.getElementById('review-mode');
    const questionContainer = document.getElementById('question-container');
    const progressFill = document.getElementById('progress-fill');
    const currentQuestionNum = document.getElementById('current-question-num');
    const totalQuestions = document.getElementById('total-questions');
    const feedback = document.getElementById('feedback');

    // Inicializacao
    document.addEventListener('DOMContentLoaded', function() {
        // Configuracao inicial
        startButton.addEventListener('click', startQuiz);
        nextButton.addEventListener('click', nextQuestion);
        restartButton.addEventListener('click', restartQuiz);
        backButton.addEventListener('click', backToHome);
        reviewButton.addEventListener('click', showReview);

        // Configurar listeners para botoes de quantidade
        document.querySelectorAll('.quiz-option').forEach(button => {
            button.addEventListener('click', function() {
                selectedCount = this.dataset.count;
                if (selectedCount !== 'all') {
                    selectedCount = parseInt(selectedCount);
                }
                document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        // Configurar listeners para selects
        document.getElementById('subject-select').addEventListener('change', function() {
            selectedSubject = this.value;
        });

        document.getElementById('difficulty-select').addEventListener('change', function() {
            selectedDifficulty = this.value;
        });

        document.getElementById('game-mode').addEventListener('change', function() {
            selectedGameMode = this.value;
        });

        // Carregar questoes iniciais
        loadQuestions();
    });

    // Funcoes principais
    function loadQuestions() {
        // Carregar todas as questoes do arquivo gerado
        if (typeof window.allQuestions !== 'undefined' && window.allQuestions.length > 0) {
            questions = window.allQuestions;
            console.log(`Carregadas ${questions.length} questoes do arquivo original`);
        } else {
            // Carregar fallback com as questoes basicas
            questions = [
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

        console.log(`Carregadas ${questions.length} questoes`);

        // Adicionar mais questoes para permitir selecao de ate 30
        const additionalQuestions = [
            // Mais questoes de Lingua Portuguesa
            {
                "id": "FGV_PTNA_006",
                "subject": "Língua Portuguesa",
                "topic": "Acentuação",
                "difficulty": "Difícil",
                "question": "Qual a palavra NAO e acentuada por hiato?",
                "alternatives": {
                    "A": "saída",
                    "B": "baú",
                    "C": "herói",
                    "D": "vassoura"
                },
                "answer": "D",
                "explanation": "'Vassoura' nao tem hiato pois as vogais nao sao tonicas."
            },
            {
                "id": "FGV_PTNA_007",
                "subject": "Língua Portuguesa",
                "topic": "Crase",
                "difficulty": "Difícil",
                "question": "Na frase 'Ela passou ____ frente de mim', a forma correta e:",
                "alternatives": {
                    "A": "a",
                    "B": "à",
                    "C": "á",
                    "D": "às"
                },
                "answer": "B",
                "explanation": "Usamos 'à' contração de 'a' + 'a', indicando lugar."
            },
            {
                "id": "FGV_PTNA_008",
                "subject": "Língua Portuguesa",
                "topic": "Pronomes",
                "difficulty": "Médio",
                "question": "Na frase '___ somos todos iguais', o pronome pessoal correto e:",
                "alternatives": {
                    "A": "Nós",
                    "B": "Nos",
                    "C": "A nós",
                    "D": "Conosco"
                },
                "answer": "A",
                "explanation": "'Nós' e o sujeito da oracao, sem preposicao."
            },
            {
                "id": "FGV_PTNA_009",
                "subject": "Língua Portuguesa",
                "topic": "Preposições",
                "difficulty": "Fácil",
                "question": "Qual a preposicao correta na frase: 'Ela estudou ____ matematica'?",
                "alternatives": {
                    "A": "a",
                    "B": "à",
                    "C": "em",
                    "D": "para"
                },
                "answer": "C",
                "explanation": "'Em' indica materia de estudo."
            },
            {
                "id": "FGV_PTNA_010",
                "subject": "Língua Portuguesa",
                "topic": "Concordância Nominal",
                "difficulty": "Médio",
                "question": "Qual a alternativa com concordância nominal correta?",
                "alternatives": {
                    "A": "O carro sao vermelhos.",
                    "B": "O carro e vermelho.",
                    "C": "O carro sao vermelho.",
                    "D": "O carro e vermelhos."
                },
                "answer": "B",
                "explanation": "O sujeito e singular, entao o predicado concorda no singular."
            },
            // Mais questoes de Raciocínio Lógico
            {
                "id": "FGV_LOG_004",
                "subject": "Raciocínio Lógico",
                "topic": "Probabilidade",
                "difficulty": "Médio",
                "question": "Uma moeda e jogada 3 vezes. Qual a probabilidade de dar cara em todas as 3 vezes?",
                "alternatives": {
                    "A": "1/8",
                    "B": "1/4",
                    "C": "1/6",
                    "D": "1/2"
                },
                "answer": "A",
                "explanation": "Cada jogada tem 1/2 chance, entao (1/2)³ = 1/8."
            },
            {
                "id": "FGV_LOG_005",
                "subject": "Raciocínio Lógico",
                "topic": "Venn",
                "difficulty": "Difícil",
                "question": "Em um grupo de 100 pessoas, 40 gostam de A, 50 gostam de B, e 20 gostam de ambos. Quantos nao gostam de nenhum?",
                "alternatives": {
                    "A": "20",
                    "B": "30",
                    "C": "40",
                    "D": "50"
                },
                "answer": "B",
                "explanation": "40 + 50 - 20 = 70 gostam de pelo menos um. 100 - 70 = 30 nao gostam de nenhum."
            },
            // Mais questoes de Conhecimentos Gerais
            {
                "id": "FGV_CGE_003",
                "subject": "Conhecimentos Gerais",
                "topic": "Biologia",
                "difficulty": "Fácil",
                "question": "Qual o orgao responsavel pela producao de insulina no corpo humano?",
                "alternatives": {
                    "A": "Fígado",
                    "B": "Pâncreas",
                    "C": "Rim",
                    "D": "Coração"
                },
                "answer": "B",
                "explanation": "O pâncreas produz insulina, hormonio que regula o acucar no sangue."
            },
            {
                "id": "FGV_CGE_004",
                "subject": "Conhecimentos Gerais",
                "topic": "Química",
                "difficulty": "Médio",
                "question": "Qual o elemento químico com simbolo 'O'?",
                "alternatives": {
                    "A": "Ouro",
                    "B": "Ossígio",
                    "C": "Oxigênio",
                    "D": "Osmio"
                },
                "answer": "C",
                "explanation": "Oxigênio tem simbolo químico 'O' e numero atomico 8."
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
                "explanation": "Newton e a unidade de força no SI."
            },
            // Questoes adicionais
            {
                "id": "FGV_PTNA_011",
                "subject": "Língua Portuguesa",
                "topic": "Sintaxe",
                "difficulty": "Médio",
                "question": "Na frase 'O livro que comprei ontem e muito interessante', a oracao subordinada e:",
                "alternatives": {
                    "A": "O livro",
                    "B": "que comprei ontem",
                    "C": "e muito interessante",
                    "D": "comprei ontem"
                },
                "answer": "B",
                "explanation": "'Que comprei ontem' e oracao subordinada adjetiva."
            },
            {
                "id": "FGV_LOG_006",
                "subject": "Raciocínio Lógico",
                "topic": "Lógica",
                "difficulty": "Fácil",
                "question": "Se todos os gatos sao mamiferos, e todos os mamiferos sao animais, entao:",
                "alternatives": {
                    "A": "Todos os gatos sao animais.",
                    "B": "Nenhum gato e animal.",
                    "C": "Alguns gatos nao sao animais.",
                    "D": "Nenhuma das alternativas."
                },
                "answer": "A",
                "explanation": "A relacao transitiva permite concluir que todos os gatos sao animais."
            },
            {
                "id": "FGV_CGE_006",
                "subject": "Conhecimentos Gerais",
                "topic": "Geografia",
                "difficulty": "Médio",
                "question": "Qual o menor pais do mundo?",
                "alternatives": {
                    "A": "Vaticano",
                    "B": "Mônaco",
                    "C": "San Marino",
                    "D": "Liechtenstein"
                },
                "answer": "A",
                "explanation": "O Vaticano e o menor pais do mundo, com apenas 0.44 km²."
            },
            {
                "id": "FGV_PTNA_012",
                "subject": "Língua Portuguesa",
                "topic": "Pontuação",
                "difficulty": "Difícil",
                "question": "Na frase 'Ela disse: 'Vou amanha'', os dois pontos servem para:",
                "alternatives": {
                    "A": Separar ideias.",
                    "B": Introduzir direta.",
                    "C": Separar oracoes.",
                    "D": Indir direta."
                },
                "answer": "B",
                "explanation": "Os dois pontos introduzem a fala direta da pessoa."
            },
            {
                "id": "FGV_LOG_007",
                "subject": "Raciocínio Lógico",
                "topic": "Sequência",
                "difficulty": "Médio",
                "question": "Qual o proximo numero na sequencia: 1, 1, 2, 3, 5, 8, ?",
                "alternatives": {
                    "A": "11",
                    "B": "13",
                    "C": "15",
                    "D": "17"
                },
                "answer": "B",
                "explanation": "Sequencia de Fibonacci: cada numero e a soma dos dois anteriores."
            },
            {
                "id": "FGV_CGE_007",
                "subject": "Conhecimentos Gerais",
                "topic": "História",
                "difficulty": "Difícil",
                "question": "Em que ano ocorreu a independencia do Brasil?",
                "alternatives": {
                    "A": "1808",
                    "B": "1822",
                    "C": "1889",
                    "D": "1930"
                },
                "answer": "B",
                "explanation": "O Brasil declarou independencia em 7 de setembro de 1822."
            },
            {
                "id": "FGV_PTNA_013",
                "subject": "Língua Portuguesa",
                "topic": "Ortografia",
                "difficulty": "Fácil",
                "question": "Qual das palavras e escrita com acento agudo?",
                "alternatives": {
                    "A": "aviao",
                    "B": "pao",
                    "C": "cafe",
                    "D": "janeiro"
                },
                "answer": "D",
                "explanation": "'Janeiro' e acentuado por ser proparoxitona."
            },
            {
                "id": "FGV_LOG_008",
                "subject": "Raciocínio Lógico",
                "topic": "Analogia",
                "difficulty": "Difícil",
                "question": "Casa e para morar como carro e para:",
                "alternatives": {
                    "A": "comer",
                    "B": "dormir",
                    "C": "andar",
                    "D": "trabalhar"
                },
                "answer": "C",
                "explanation": "Casa serve para morar, carro serve para andar."
            },
            {
                "id": "FGV_CGE_008",
                "subject": "Conhecimentos Gerais",
                "topic": "Biologia",
                "difficulty": "Médio",
                "question": "Qual o orgao maior do corpo humano?",
                "alternatives": {
                    "A": "Cérebro",
                    "B": "Fígado",
                    "C": "Pele",
                    "D": "Intestino"
                },
                "answer": "C",
                "explanation": "A pele e o maior orgao do corpo humano, cobrindo toda a superficie."
            },
            {
                "id": "FGV_PTNA_014",
                "subject": "Língua Portuguesa",
                "topic": "Concordância Verbal",
                "difficulty": "Fácil",
                "question": "A concordancia verbal correta e:",
                "alternatives": {
                    "A": "Os meninos brinca.",
                    "B": "Os meninos brincam.",
                    "C": "Os meninos brinco.",
                    "D": "Os meninos brinque."
                },
                "answer": "B",
                "explanation": "O verbo 'brincar' concorda com sujeito plural 'os meninos'."
            },
            {
                "id": "FGV_LOG_009",
                "subject": "Raciocínio Lógico",
                "topic": "Logica",
                "difficulty": "Fácil",
                "question": "Se todos A sao B, e nenhum B sao C, entao:",
                "alternatives": {
                    "A": "Todos A sao C.",
                    "B": "Nenhum A e C.",
                    "C": "Alguns A sao C.",
                    "D": "Nenhuma das alternativas."
                },
                "answer": "B",
                "explanation": "Se A esta em B e B nao esta em C, entao A nao esta em C."
            },
            {
                "id": "FGV_CGE_009",
                "subject": "Conhecimentos Gerais",
                "topic": "Astronomia",
                "difficulty": "Médio",
                "question": "Qual o planeta mais proximo do sol?",
                "alternatives": {
                    "A": "Venus",
                    "B": "Terra",
                    "C": "Mercurio",
                    "D": "Marte"
                },
                "answer": "C",
                "explanation": "Mercurio e o planeta mais proximo do sol."
            },
            {
                "id": "FGV_PTNA_015",
                "subject": "Língua Portuguesa",
                "topic": "Pronomes",
                "difficulty": "Difícil",
                "question": "Na frase '___ dei o livro', o pronome oblíquo correto e:",
                "alternatives": {
                    "A": "Eu",
                    "B": "Me",
                    "C": "A mim",
                    "D": "Comigo"
                },
                "answer": "B",
                "explanation": "Me e o pronome oblíquo átono que completa o verbo 'dei'."
            },
            {
                "id": "FGV_LOG_010",
                "subject": "Raciocínio Lógico",
                "topic": "Sequência",
                "difficulty": "Médio",
                "question": "Qual o proximo numero: 2, 4, 8, 16, 32, ?",
                "alternatives": {
                    "A": "48",
                    "B": "56",
                    "C": "64",
                    "D": "72"
                },
                "answer": "C",
                "explanation": "Cada numero e multiplicado por 2 na sequencia."
            },
            {
                "id": "FGV_CGE_010",
                "subject": "Conhecimentos Gerais",
                "topic": "Geografia",
                "difficulty": "Difícil",
                "question": "Qual o pais com mais habitantes do mundo?",
                "alternatives": {
                    "A": "Estados Unidos",
                    "B": "India",
                    "C": "China",
                    "D": "Indonesia"
                },
                "answer": "B",
                "explanation": "India superou a China em 2023 como o pais mais populoso do mundo."
            }
        ];

        // Adicionar as questoes adicionais
        questions = [...questions, ...additionalQuestions];

        console.log(`Carregadas ${questions.length} questoes`);
    }

    function filterQuestions() {
        let filteredQuestions = [...questions];

        // Filtrar por materia
        if (selectedSubject !== 'all') {
            filteredQuestions = filteredQuestions.filter(q => q.subject === selectedSubject);
        }

        // Filtrar por dificuldade
        if (selectedDifficulty !== 'all') {
            filteredQuestions = filteredQuestions.filter(q => q.difficulty === selectedDifficulty);
        }

        // Limitar quantidade
        if (selectedCount !== 'all') {
            filteredQuestions = filteredQuestions.slice(0, selectedCount);
        }

        return filteredQuestions;
    }

    function startQuiz() {
        const filteredQuestions = filterQuestions();

        console.log(`Selecionado: ${selectedCount} questoes`);
        console.log(`Total filtrado: ${filteredQuestions.length} questoes`);

        if (filteredQuestions.length === 0) {
            alert('Nenhuma questao encontrada com os filtros selecionados.');
            return;
        }

        // Embaralhar questoes
        questions = shuffleArray(filteredQuestions);
        currentQuestionIndex = 0;
        userAnswers = [];

        // Iniciar timer
        quizStartTime = new Date();
        startTimer();

        // Mostrar tela de quiz
        hideAllScreens();
        quizScreen.classList.add('active');

        // Exibir primeira questao
        showQuestion();
    }

    function showQuestion() {
        if (currentQuestionIndex >= questions.length) {
            showResults();
            return;
        }

        const question = questions[currentQuestionIndex];

        // Atualizar contador
        currentQuestionNum.textContent = currentQuestionIndex + 1;
        totalQuestions.textContent = questions.length;

        // Atualizar barra de progresso
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressFill.style.width = progress + '%';

        // Criar HTML da questao
        questionContainer.innerHTML = `
            <div class="question-card">
                <div class="question-header">
                    <span class="question-id">${question.id}</span>
                    <span class="question-difficulty">${question.difficulty}</span>
                    <span class="question-subject">${question.subject}</span>
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
                    <button id="submit-answer" class="submit-button">Enviar Resposta</button>
                    <button id="skip-question" class="skip-button">Pular</button>
                </div>
                <div id="feedback" class="feedback" style="display: none;"></div>
            </div>
        `;

        // Adicionar listeners
        questionContainer.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function() {
                questionContainer.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        document.getElementById('submit-answer').addEventListener('click', submitAnswer);
        document.getElementById('skip-question').addEventListener('click', skipQuestion);
    }

    function submitAnswer() {
        const selectedOption = document.querySelector('.option.selected');
        if (!selectedOption) {
            alert('Por favor, selecione uma alternativa.');
            return;
        }

        const question = questions[currentQuestionIndex];
        const isCorrect = selectedOption.dataset.option === question.answer;

        // Registrar resposta
        userAnswers.push({
            questionId: question.id,
            question: question.question,
            selected: selectedOption.dataset.option,
            correct: question.answer,
            isCorrect: isCorrect,
            time: new Date() - quizStartTime
        });

        // Mostrar feedback
        selectedOption.classList.add(isCorrect ? 'correct' : 'incorrect');
        const correctOption = document.querySelector(`[data-option="${question.answer}"]`);
        correctOption.classList.add('correct');

        const feedbackDiv = document.getElementById('feedback');
        feedbackDiv.style.display = 'block';
        feedbackDiv.innerHTML = `
            <h4>${isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta!'}</h4>
            <p>${question.explanation}</p>
        `;

        // Desabilitar botoes
        document.getElementById('submit-answer').disabled = true;
        document.getElementById('skip-question').disabled = true;

        // Avancar automaticamente apos 2 segundos
        setTimeout(() => {
            nextQuestion();
        }, 2000);
    }

    function skipQuestion() {
        // Registrar pular como resposta incorreta
        const question = questions[currentQuestionIndex];
        userAnswers.push({
            questionId: question.id,
            question: question.question,
            selected: null,
            correct: question.answer,
            isCorrect: false,
            time: new Date() - quizStartTime
        });

        nextQuestion();
    }

    function nextQuestion() {
        currentQuestionIndex++;
        showQuestion();
    }

    function showResults() {
        // Parar timer
        clearInterval(quizTimer);

        // Calcular estatisticas
        const correctCount = userAnswers.filter(a => a.isCorrect).length;
        const incorrectCount = userAnswers.length - correctCount;
        const accuracy = ((correctCount / userAnswers.length) * 100).toFixed(1);
        const totalTime = formatTime(new Date() - quizStartTime);

        // Exibir resultados
        hideAllScreens();
        resultsScreen.classList.add('active');

        document.getElementById('correct-count').textContent = correctCount;
        document.getElementById('incorrect-count').textContent = incorrectCount;
        document.getElementById('accuracy').textContent = accuracy + '%';
        document.getElementById('total-time').textContent = totalTime;

        // Mostrar detalhes
        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = userAnswers.map((answer, index) => `
            <div class="result-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <div class="result-header">
                    <span class="result-number">${index + 1}</span>
                    <span class="result-status">${answer.isCorrect ? 'C' : 'E'}</span>
                    <span class="result-id">${answer.questionId}</span>
                </div>
                <div class="result-content">
                    <p>${answer.question}</p>
                    <p>Sua resposta: ${answer.selected || 'Pulada'}</p>
                    <p>Resposta correta: ${answer.correct}</p>
                </div>
            </div>
        `).join('');
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        userAnswers = [];
        startQuiz();
    }

    function backToHome() {
        hideAllScreens();
        quizSettings.classList.add('active');
    }

    function showReview() {
        hideAllScreens();
        reviewScreen.classList.add('active');
        // Carregar sistema de review
        if (typeof initializeReviewSystem === 'function') {
            initializeReviewSystem();
        }
    }

    function hideAllScreens() {
        quizSettings.classList.remove('active');
        quizScreen.classList.remove('active');
        resultsScreen.classList.remove('active');
        reviewScreen.classList.remove('active');
        document.getElementById('study-settings').classList.add('hidden');
    }

    function startTimer() {
        let seconds = 0;
        quizTimer = setInterval(() => {
            seconds++;
            const elapsed = formatTime(seconds * 1000);
            // Atualizar timer na tela (se existir elemento)
        }, 1000);
    }

    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Funcoes de controle de modo
    document.getElementById('quiz-mode').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('study-mode').classList.remove('active');
        hideAllScreens();
        quizSettings.classList.add('active');
    });

    document.getElementById('study-mode').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('quiz-mode').classList.remove('active');
        hideAllScreens();
        document.getElementById('study-settings').classList.remove('hidden');
    });

    // Funcao para mostrar tela de estudo
    function showStudyModeScreen() {
        hideAllScreens();
        document.getElementById('study-settings').classList.remove('hidden');
        // Carregar questoes para o modo de estudo
        if (typeof window.studyModeFunctions !== 'undefined') {
            window.studyModeFunctions.loadQuestions();
            window.studyModeFunctions.filterQuestions();
        }
    }
})();