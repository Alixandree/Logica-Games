// Módulo de Jogos - Versão Otimizada
const GamesModule = (function() {
    // Estado interno dos jogos (isolado do script principal)
    const GameState = {
        math: {
            score: 0,
            timer: 60,
            timerInterval: null,
            currentQuestion: {}
        },
        color: {
            moves: 0,
            pairs: 0,
            time: 0,
            timerInterval: null,
            selectedColors: [],
            matchedPairs: 0,
            colors: []
        },
        puzzle: {
            moves: 0,
            state: [1, 2, 3, 4, 5, 6, 7, 8, 0]
        }
    };
    
    // Inicializar módulo
    function init() {
        console.log('🎮 Módulo de Jogos inicializado');
    }
    
    // Inicializar jogo específico
    function initGame(gameId) {
        // Limpar qualquer estado anterior
        cleanupPreviousGame();
        
        switch(gameId) {
            case 'mathQuiz':
                initMathQuiz();
                break;
            case 'colorMatch':
                initColorMatch();
                break;
            case 'numberPuzzle':
                initNumberPuzzle();
                break;
        }
    }
    
    // Limpar estado do jogo anterior
    function cleanupPreviousGame() {
        // Limpar timers
        if (GameState.math.timerInterval) {
            clearInterval(GameState.math.timerInterval);
            GameState.math.timerInterval = null;
        }
        if (GameState.color.timerInterval) {
            clearInterval(GameState.color.timerInterval);
            GameState.color.timerInterval = null;
        }
        
        // Resetar estados
        GameState.math.score = 0;
        GameState.math.timer = 60;
        GameState.math.currentQuestion = {};
        
        GameState.color.moves = 0;
        GameState.color.pairs = 0;
        GameState.color.time = 0;
        GameState.color.selectedColors = [];
        GameState.color.matchedPairs = 0;
        GameState.color.colors = [];
        
        GameState.puzzle.moves = 0;
        GameState.puzzle.state = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    }
    
    // ============ QUIZ MATEMÁTICO ============
    function initMathQuiz() {
        GameState.math.score = 0;
        GameState.math.timer = 60;
        
        updateMathUI();
        
        // Timer
        GameState.math.timerInterval = setInterval(function() {
            GameState.math.timer--;
            document.getElementById('mathTimer').textContent = GameState.math.timer;
            
            if (GameState.math.timer <= 0) {
                clearInterval(GameState.math.timerInterval);
                handleMathGameEnd();
            }
        }, 1000);
        
        loadMathQuestion();
    }
    
    function updateMathUI() {
        document.getElementById('mathScore').textContent = GameState.math.score;
        document.getElementById('mathTimer').textContent = GameState.math.timer;
        document.getElementById('mathFeedback').textContent = '';
    }
    
    function loadMathQuestion() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operators = ['+', '-', '*'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        
        let correctAnswer, questionText;
        
        switch(operator) {
            case '+':
                correctAnswer = num1 + num2;
                questionText = `${num1} + ${num2} = ?`;
                break;
            case '-':
                correctAnswer = num1 - num2;
                questionText = `${num1} - ${num2} = ?`;
                break;
            case '*':
                correctAnswer = num1 * num2;
                questionText = `${num1} × ${num2} = ?`;
                break;
        }
        
        GameState.math.currentQuestion = {
            question: questionText,
            correctAnswer: correctAnswer,
            options: generateMathOptions(correctAnswer)
        };
        
        document.getElementById('mathQuestion').textContent = GameState.math.currentQuestion.question;
        
        const optionsContainer = document.getElementById('mathOptions');
        optionsContainer.innerHTML = '';
        
        GameState.math.currentQuestion.options.forEach((option) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => checkMathAnswer(option));
            optionsContainer.appendChild(optionElement);
        });
    }
    
    function generateMathOptions(correctAnswer) {
        const options = [correctAnswer];
        
        while (options.length < 4) {
            const offset = Math.floor(Math.random() * 5) + 1;
            const sign = Math.random() < 0.5 ? -1 : 1;
            const wrongAnswer = correctAnswer + (offset * sign);
            
            if (wrongAnswer !== correctAnswer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
                options.push(wrongAnswer);
            }
        }
        
        return shuffleArray(options);
    }
    
    function checkMathAnswer(selectedAnswer) {
        const options = document.querySelectorAll('#mathOptions .option');
        const feedbackElement = document.getElementById('mathFeedback');
        
        // Encontrar opção correta
        let correctOption = null;
        options.forEach(option => {
            if (parseInt(option.textContent) === GameState.math.currentQuestion.correctAnswer) {
                correctOption = option;
            }
        });
        
        // Marcar resposta do usuário
        options.forEach(option => {
            if (parseInt(option.textContent) === selectedAnswer) {
                if (selectedAnswer === GameState.math.currentQuestion.correctAnswer) {
                    option.classList.add('correct');
                    feedbackElement.textContent = 'Correto! +10 pontos';
                    GameState.math.score += 10;
                    document.getElementById('mathScore').textContent = GameState.math.score;
                } else {
                    option.classList.add('wrong');
                    feedbackElement.textContent = `Incorreto! A resposta correta é ${GameState.math.currentQuestion.correctAnswer}`;
                }
            }
        });
        
        // Mostrar resposta correta se errou
        if (correctOption && selectedAnswer !== GameState.math.currentQuestion.correctAnswer) {
            correctOption.classList.add('correct');
        }
        
        // Desabilitar cliques
        options.forEach(option => {
            option.style.pointerEvents = 'none';
        });
        
        // Próxima pergunta ou fim do jogo
        setTimeout(() => {
            if (GameState.math.timer > 0) {
                loadMathQuestion();
                feedbackElement.textContent = '';
            }
        }, 1500);
    }
    
    function handleMathGameEnd() {
        const feedbackElement = document.getElementById('mathFeedback');
        feedbackElement.textContent = `Fim do jogo! Sua pontuação final: ${GameState.math.score}`;
        
        // Bloquear interação
        document.querySelectorAll('#mathOptions .option').forEach(option => {
            option.style.pointerEvents = 'none';
        });
        
        // Notificar script principal
        if (typeof window.handleGameEnd === 'function') {
            window.handleGameEnd('math', GameState.math.score);
        }
    }
    
    // ============ COMBINADOR DE CORES ============
    function initColorMatch() {
        GameState.color.moves = 0;
        GameState.color.pairs = 0;
        GameState.color.time = 0;
        GameState.color.matchedPairs = 0;
        GameState.color.selectedColors = [];
        
        updateColorUI();
        
        // Timer
        GameState.color.timerInterval = setInterval(() => {
            GameState.color.time++;
            document.getElementById('colorTimer').textContent = GameState.color.time;
        }, 1000);
        
        // Criar grid
        const colorList = [
            '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
            '#118AB2', '#073B4C', '#EF476F', '#7209B7'
        ];
        
        GameState.color.colors = [...colorList, ...colorList];
        GameState.color.colors = shuffleArray(GameState.color.colors);
        
        const colorGrid = document.getElementById('colorGrid');
        colorGrid.innerHTML = '';
        
        GameState.color.colors.forEach((color, index) => {
            const colorCell = document.createElement('div');
            colorCell.className = 'color-cell';
            colorCell.dataset.index = index;
            colorCell.dataset.color = color;
            colorCell.style.backgroundColor = '#2c3e50';
            
            colorCell.addEventListener('click', () => selectColorCell(colorCell));
            colorGrid.appendChild(colorCell);
        });
    }
    
    function updateColorUI() {
        document.getElementById('colorMoves').textContent = GameState.color.moves;
        document.getElementById('colorPairs').textContent = `${GameState.color.pairs}/8`;
        document.getElementById('colorTimer').textContent = GameState.color.time;
        document.getElementById('colorFeedback').textContent = 'Encontre os pares de cores iguais!';
    }
    
    function selectColorCell(cell) {
        if (GameState.color.selectedColors.length >= 2 || cell.classList.contains('matched')) {
            return;
        }
        
        // Desselecionar
        if (cell.classList.contains('selected')) {
            cell.classList.remove('selected');
            cell.style.backgroundColor = '#2c3e50';
            GameState.color.selectedColors = GameState.color.selectedColors.filter(
                item => item.index !== parseInt(cell.dataset.index)
            );
            return;
        }
        
        // Selecionar
        cell.classList.add('selected');
        cell.style.backgroundColor = cell.dataset.color;
        GameState.color.selectedColors.push({
            index: parseInt(cell.dataset.index),
            color: cell.dataset.color,
            element: cell
        });
        
        // Verificar par
        if (GameState.color.selectedColors.length === 2) {
            GameState.color.moves++;
            document.getElementById('colorMoves').textContent = GameState.color.moves;
            
            if (GameState.color.selectedColors[0].color === GameState.color.selectedColors[1].color) {
                // Par correto
                setTimeout(() => {
                    GameState.color.selectedColors.forEach(item => {
                        item.element.classList.remove('selected');
                        item.element.classList.add('matched');
                        item.element.style.opacity = '0.5';
                        item.element.style.cursor = 'default';
                    });
                    
                    GameState.color.matchedPairs++;
                    GameState.color.pairs++;
                    
                    document.getElementById('colorPairs').textContent = `${GameState.color.pairs}/8`;
                    document.getElementById('colorFeedback').textContent = 
                        `Par encontrado! ${GameState.color.matchedPairs}/8 pares descobertos.`;
                    
                    GameState.color.selectedColors = [];
                    
                    // Verificar se completou
                    if (GameState.color.matchedPairs === 8) {
                        handleColorGameEnd();
                    }
                }, 500);
            } else {
                // Par incorreto
                setTimeout(() => {
                    GameState.color.selectedColors.forEach(item => {
                        item.element.classList.remove('selected');
                        item.element.style.backgroundColor = '#2c3e50';
                    });
                    
                    document.getElementById('colorFeedback').textContent = 'Tente novamente!';
                    GameState.color.selectedColors = [];
                }, 1000);
            }
        }
    }
    
    function handleColorGameEnd() {
        clearInterval(GameState.color.timerInterval);
        
        const feedback = `Parabéns! Você completou o jogo em ${GameState.color.moves} movimentos e ${GameState.color.time} segundos!`;
        document.getElementById('colorFeedback').textContent = feedback;
        
        // Notificar script principal
        if (typeof window.handleGameEnd === 'function') {
            window.handleGameEnd('color', GameState.color.time);
        }
    }
    
    // ============ QUEBRA-CABEÇA NUMÉRICO ============
    function initNumberPuzzle() {
        GameState.puzzle.moves = 0;
        GameState.puzzle.state = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        
        shufflePuzzle();
        
        updatePuzzleUI();
        renderPuzzle();
    }
    
    function updatePuzzleUI() {
        document.getElementById('puzzleMoves').textContent = GameState.puzzle.moves;
        document.getElementById('puzzleFeedback').textContent = 'Organize os números em ordem crescente!';
    }
    
    function shufflePuzzle() {
        for (let i = 0; i < 100; i++) {
            const emptyIndex = GameState.puzzle.state.indexOf(0);
            const possibleMoves = [];
            
            if (emptyIndex % 3 > 0) possibleMoves.push(emptyIndex - 1);
            if (emptyIndex % 3 < 2) possibleMoves.push(emptyIndex + 1);
            if (emptyIndex >= 3) possibleMoves.push(emptyIndex - 3);
            if (emptyIndex < 6) possibleMoves.push(emptyIndex + 3);
            
            const moveIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            
            GameState.puzzle.state[emptyIndex] = GameState.puzzle.state[moveIndex];
            GameState.puzzle.state[moveIndex] = 0;
        }
    }
    
    function renderPuzzle() {
        const puzzleGrid = document.getElementById('puzzleGrid');
        puzzleGrid.innerHTML = '';
        
        GameState.puzzle.state.forEach((number, index) => {
            const cell = document.createElement('div');
            cell.className = number === 0 ? 'puzzle-cell empty' : 'puzzle-cell';
            cell.textContent = number === 0 ? '' : number;
            cell.dataset.index = index;
            
            if (number !== 0) {
                cell.addEventListener('click', () => movePuzzleCell(index));
            }
            
            puzzleGrid.appendChild(cell);
        });
    }
    
    function movePuzzleCell(clickedIndex) {
        const emptyIndex = GameState.puzzle.state.indexOf(0);
        
        const isAdjacent = 
            (Math.abs(clickedIndex - emptyIndex) === 1 && Math.floor(clickedIndex / 3) === Math.floor(emptyIndex / 3)) ||
            (Math.abs(clickedIndex - emptyIndex) === 3);
        
        if (isAdjacent) {
            GameState.puzzle.state[emptyIndex] = GameState.puzzle.state[clickedIndex];
            GameState.puzzle.state[clickedIndex] = 0;
            
            GameState.puzzle.moves++;
            document.getElementById('puzzleMoves').textContent = GameState.puzzle.moves;
            
            renderPuzzle();
            
            if (isPuzzleSolved()) {
                handlePuzzleGameEnd();
            }
        }
    }
    
    function isPuzzleSolved() {
        for (let i = 0; i < 8; i++) {
            if (GameState.puzzle.state[i] !== i + 1) {
                return false;
            }
        }
        return GameState.puzzle.state[8] === 0;
    }
    
    function handlePuzzleGameEnd() {
        const feedback = `Parabéns! Você resolveu o quebra-cabeça em ${GameState.puzzle.moves} movimentos!`;
        document.getElementById('puzzleFeedback').textContent = feedback;
        
        // Notificar script principal
        if (typeof window.handleGameEnd === 'function') {
            window.handleGameEnd('puzzle', GameState.puzzle.moves);
        }
    }
    
    // Função utilitária para embaralhar arrays
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Interface pública do módulo
    return {
        init: init,
        initGame: initGame
    };
})();