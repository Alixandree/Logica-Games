// Sistema de Banco de Dados, UI e Navegação
const DB = {
    init: function() {
        try {
            if (!localStorage.getItem('users')) {
                localStorage.setItem('users', JSON.stringify([]));
            }
            if (!localStorage.getItem('scores')) {
                localStorage.setItem('scores', JSON.stringify({
                    math: [],
                    color: [],
                    puzzle: []
                }));
            }
            if (!localStorage.getItem('currentUser')) {
                localStorage.setItem('currentUser', JSON.stringify(null));
            }
            
            console.log('✅ Banco de dados inicializado');
            return true;
        } catch (error) {
            console.error('❌ Erro no banco de dados:', error);
            try {
                localStorage.clear();
                return this.init();
            } catch (e) {
                console.error('❌ Não foi possível resetar o banco de dados');
                return false;
            }
        }
    },
    
    getUsers: function() {
        return JSON.parse(localStorage.getItem('users'));
    },
    
    saveUsers: function(users) {
        localStorage.setItem('users', JSON.stringify(users));
    },
    
    getScores: function() {
        return JSON.parse(localStorage.getItem('scores'));
    },
    
    saveScores: function(scores) {
        localStorage.setItem('scores', JSON.stringify(scores));
    },
    
    addScore: function(game, scoreData) {
        const scores = this.getScores();
        scores[game].push(scoreData);
        
        if (game === 'math') {
            scores[game].sort((a, b) => b.score - a.score);
        } else {
            scores[game].sort((a, b) => a.score - b.score);
        }
        
        scores[game] = scores[game].slice(0, 50);
        this.saveScores(scores);
    },
    
    registerUser: function(userData) {
        const users = this.getUsers();
        
        if (!SecurityUtils.validateEmail(userData.email)) {
            return { success: false, message: 'Email inválido!' };
        }
        
        const passwordCheck = SecurityUtils.checkPasswordStrength(userData.password);
        if (!passwordCheck.strong) {
            return { success: false, message: passwordCheck.message };
        }
        
        if (users.some(user => user.email === userData.email)) {
            return { success: false, message: 'Este email já está cadastrado!' };
        }
        
        userData.createdAt = new Date().toISOString();
        userData.stats = {
            math: { bestScore: 0 },
            color: { bestTime: null },
            puzzle: { bestMoves: null }
        };
        
        userData.password = SecurityUtils.encodePassword(userData.password);
        users.push(userData);
        this.saveUsers(users);
        
        return { 
            success: true, 
            message: 'Cadastro realizado com sucesso!',
            user: { name: userData.name, email: userData.email }
        };
    },
    
    loginUser: function(email, password) {
        const users = this.getUsers();
        const encodedPassword = SecurityUtils.encodePassword(password);
        const user = users.find(u => u.email === email && u.password === encodedPassword);
        
        if (user) {
            const { password, ...userWithoutPassword } = user;
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            return { success: true, user: userWithoutPassword };
        } else {
            return { success: false, message: 'Email ou senha incorretos!' };
        }
    },
    
    logoutUser: function() {
        localStorage.setItem('currentUser', JSON.stringify(null));
    },
    
    getCurrentUser: function() {
        return JSON.parse(localStorage.getItem('currentUser'));
    },
    
    updateUserStats: function(userId, game, newScore) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.email === userId);
        
        if (userIndex !== -1) {
            const user = users[userIndex];
            
            if (game === 'math') {
                if (newScore > user.stats.math.bestScore) {
                    user.stats.math.bestScore = newScore;
                }
            } else if (game === 'color') {
                if (!user.stats.color.bestTime || newScore < user.stats.color.bestTime) {
                    user.stats.color.bestTime = newScore;
                }
            } else if (game === 'puzzle') {
                if (!user.stats.puzzle.bestMoves || newScore < user.stats.puzzle.bestMoves) {
                    user.stats.puzzle.bestMoves = newScore;
                }
            }
            
            this.saveUsers(users);
            
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.email === userId) {
                currentUser.stats = user.stats;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                return currentUser;
            }
        }
        return null;
    },
    
    getRanking: function(game) {
        const scores = this.getScores();
        return scores[game];
    },
    
    getUserRank: function(game, userId) {
        const ranking = this.getRanking(game);
        const userIndex = ranking.findIndex(score => score.userId === userId);
        return userIndex !== -1 ? userIndex + 1 : null;
    }
};

// Utilitários de Segurança
const SecurityUtils = {
    encodePassword: function(password) {
        const salt = 'logicagames_salt_2024';
        return btoa(password + salt);
    },
    
    checkPasswordStrength: function(password) {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        
        let strength = 0;
        if (password.length >= minLength) strength++;
        if (hasUpperCase) strength++;
        if (hasLowerCase) strength++;
        if (hasNumbers) strength++;
        
        return {
            score: strength,
            strong: strength >= 3,
            message: strength >= 3 ? 'Senha forte' : 'Use pelo menos 6 caracteres com letras maiúsculas, minúsculas e números'
        };
    },
    
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
};

// Inicializar o banco de dados
if (!DB.init()) {
    console.error('Falha crítica na inicialização do banco de dados');
    document.addEventListener('DOMContentLoaded', function() {
        showNotification('Erro ao carregar os dados. Por favor, recarregue a página.', 'error');
    });
}

// ============ SISTEMA DE TEMA CLARO/ESCURO ============

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('i');
    
    // Verificar tema salvo ou preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Aplicar tema inicial
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        enableDarkMode();
    } else {
        enableLightMode();
    }
    
    // Configurar evento do botão
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    if (document.body.classList.contains('dark-mode')) {
        enableLightMode();
    } else {
        enableDarkMode();
    }
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    updateThemeIcon('dark');
    localStorage.setItem('theme', 'dark');
}

function enableLightMode() {
    document.body.classList.remove('dark-mode');
    updateThemeIcon('light');
    localStorage.setItem('theme', 'light');
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeIcon.parentElement.title = 'Alternar para tema claro';
        } else {
            themeIcon.className = 'fas fa-moon';
            themeIcon.parentElement.title = 'Alternar para tema escuro';
        }
    }
}

// Elementos do DOM
const gameSections = {
    mathQuiz: document.getElementById('mathQuiz'),
    colorMatch: document.getElementById('colorMatch'),
    numberPuzzle: document.getElementById('numberPuzzle')
};

const rankingTables = {
    math: document.getElementById('mathRanking'),
    color: document.getElementById('colorRanking'),
    puzzle: document.getElementById('puzzleRanking')
};

// Estado global SIMPLIFICADO
let currentUser = DB.getCurrentUser();
let isGuestMode = false;

// ============ FUNÇÃO PRINCIPAL PARA FINALIZAR JOGOS ============
window.handleGameEnd = function(gameType, score) {
    console.log(`🎮 Jogo ${gameType} terminado com pontuação: ${score}`);
    
    if (!isGuestMode && currentUser && score > 0) {
        const scoreData = {
            userId: currentUser.email,
            userName: currentUser.name,
            score: score,
            date: new Date().toISOString()
        };
        
        DB.addScore(gameType, scoreData);
        const updatedUser = DB.updateUserStats(currentUser.email, gameType, score);
        
        if (updatedUser) {
            currentUser = updatedUser;
            console.log('✅ Usuário atualizado:', currentUser.stats);
        }
        
        // Atualizar UI
        updateGameCards();
        
        // Usuário teste
        if (currentUser.email === 'exemplo@email.com' && typeof TestUserModule !== 'undefined') {
            TestUserModule.updateTestUserStats(gameType, score);
        }
        
        showNotification(`🏆 ${getGameName(gameType)}: ${score} ${getScoreUnit(gameType)}!`, 'success');
    } else if (isGuestMode || !currentUser) {
        showNotification(`🎯 Você fez ${score} ${getScoreUnit(gameType)}! Faça login para salvar.`, 'info');
    }
};

function getGameName(gameType) {
    switch(gameType) {
        case 'math': return 'Quiz Matemático';
        case 'color': return 'Combinador de Cores';
        case 'puzzle': return 'Quebra-Cabeça';
        default: return 'Jogo';
    }
}

function getScoreUnit(gameType) {
    switch(gameType) {
        case 'math': return 'pontos';
        case 'color': return 'segundos';
        case 'puzzle': return 'movimentos';
        default: return '';
    }
}

// ============ FUNÇÃO PARA ATUALIZAR CARTÕES DE JOGOS ============
function updateGameCards() {
    console.log('🔄 Atualizando cartões de jogos...');
    
    const mathBestScore = document.getElementById('mathBestScore');
    const colorBestTime = document.getElementById('colorBestTime');
    const puzzleBestMoves = document.getElementById('puzzleBestMoves');
    
    currentUser = window.currentUser || DB.getCurrentUser();
    
    if (!currentUser && !isGuestMode) {
        if (mathBestScore) mathBestScore.textContent = '0';
        if (colorBestTime) colorBestTime.textContent = '-';
        if (puzzleBestMoves) puzzleBestMoves.textContent = '-';
        return;
    }
    
    if (currentUser) {
        const stats = currentUser.stats || { 
            math: { bestScore: 0 }, 
            color: { bestTime: null }, 
            puzzle: { bestMoves: null } 
        };
        
        if (mathBestScore) mathBestScore.textContent = stats.math.bestScore || '0';
        if (colorBestTime) {
            const bestTime = stats.color.bestTime;
            colorBestTime.textContent = bestTime ? `${bestTime}s` : '-';
        }
        if (puzzleBestMoves) {
            puzzleBestMoves.textContent = stats.puzzle.bestMoves || '-';
        }
        
        console.log('📊 Estatísticas carregadas:', stats);
    }
}

// ============ FUNÇÕES DE AUTENTICAÇÃO E PERFIL ============
function checkAuthForProfile() {
    // Atualizar referência do usuário atual
    currentUser = window.currentUser || DB.getCurrentUser();
    
    console.log('Verificando autenticação para perfil:', {
        currentUser: currentUser,
        isGuestMode: isGuestMode,
        windowCurrentUser: window.currentUser
    });
    
    // Permitir acesso se: usuário logado OU modo visitante
    if (!currentUser && !isGuestMode) {
        console.log('Usuário não autenticado - mostrando modal de login');
        showNotification('🔒 Você precisa estar logado para acessar o perfil!', 'warning');
        if (typeof AuthModule !== 'undefined' && typeof AuthModule.showAuthModal === 'function') {
            AuthModule.showAuthModal();
        }
        return false;
    }
    
    console.log('Usuário autenticado - permitindo acesso ao perfil');
    return true;
}

// ============ FUNÇÕES DO MÓDULO CEP ============

// Carregar seção de endereço
function loadAddressSection(userData = null, isGuest = false) {
    if (typeof CEPModule !== 'undefined') {
        CEPModule.renderAddressSection('addressContent', userData, isGuest);
    } else {
        console.warn('Módulo CEP não carregado');
        // Fallback: mostrar mensagem simples
        const addressContent = document.getElementById('addressContent');
        if (addressContent) {
            addressContent.innerHTML = `
                <div class="address-form">
                    <p style="color: #7f8c8d; text-align: center; padding: 1rem;">
                        <i class="fas fa-info-circle"></i> 
                        Módulo de endereço não disponível.
                    </p>
                </div>
            `;
        }
    }
}

// Função para editar endereço (chamada pelo botão "Editar Endereço")
function editAddress() {
    const currentUser = window.currentUser || DB.getCurrentUser();
    if (currentUser && currentUser.address) {
        // Remover endereço para mostrar formulário
        delete currentUser.address;
        
        // Atualizar localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Atualizar usuário global
        window.currentUser = currentUser;
        
        // Recarregar perfil
        loadProfileData();
        
        showNotification('✏️ Modo de edição de endereço ativado', 'info');
    }
}

function loadProfileData() {
    const profileSection = document.getElementById('profile');
    if (!profileSection) {
        console.error('Seção de perfil não encontrada!');
        return;
    }
    
    // Atualizar referências
    currentUser = window.currentUser || DB.getCurrentUser();
    
    console.log('Carregando perfil:', {
        currentUser: currentUser,
        isGuestMode: isGuestMode,
        hasWindowUser: !!window.currentUser
    });
    
    // VERIFICAÇÃO CORRIGIDA - PRIMEIRO VERIFICA SE ESTÁ LOGADO
    if (currentUser) {
        // USUÁRIO LOGADO - MOSTRAR PERFIL COMPLETO
        const stats = currentUser.stats || { 
            math: { bestScore: 0 }, 
            color: { bestTime: null }, 
            puzzle: { bestMoves: null } 
        };
        
        // Verificar se é usuário teste
        const isTestUser = currentUser.email === 'exemplo@email.com';
        
        profileSection.innerHTML = `
            <div class="profile-container">
                <h2><i class="fas fa-user-circle"></i> Meu Perfil</h2>
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <i class="fas fa-user-circle user-icon" style="font-size: 4rem; color: #4a6fa5;"></i>
                        </div>
                        <div class="profile-info">
                            <h3>${currentUser.name || 'Usuário'}</h3>
                            <p class="profile-email">${currentUser.email}</p>
                            <p class="member-since">Membro desde ${new Date(currentUser.createdAt || Date.now()).toLocaleDateString('pt-BR')}</p>
                            ${isTestUser ? '<span class="test-user-badge">Usuário Teste</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="profile-stats">
                        <h4><i class="fas fa-chart-line"></i> Minhas Estatísticas</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <i class="fas fa-calculator"></i>
                                <span>Quiz Matemático</span>
                                <strong>${stats.math.bestScore || 0} pontos</strong>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-palette"></i>
                                <span>Color Match</span>
                                <strong>${stats.color.bestTime ? stats.color.bestTime + 's' : 'Nenhum'}</strong>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-puzzle-piece"></i>
                                <span>Number Puzzle</span>
                                <strong>${stats.puzzle.bestMoves || 'Nenhum'} movimentos</strong>
                            </div>
                        </div>
                    </div>
                    
                    <!-- SEÇÃO DE ENDEREÇO SIMPLIFICADA -->
                    <div class="profile-address" id="profileAddressSection">
                        <h4><i class="fas fa-map-marker-alt"></i> Endereço</h4>
                        <div id="addressContent">
                            <!-- O conteúdo será carregado pelo módulo CEP -->
                        </div>
                    </div>
                    
                    <div class="profile-actions" style="text-align: center; margin-top: 2rem;">
                        <button onclick="showSection('games')" class="btn btn-primary" style="margin-right: 1rem; margin-bottom: 1rem;">
                            <i class="fas fa-gamepad"></i> Continuar Jogando
                        </button>
                        <button onclick="showSection('ranking')" class="btn btn-secondary" style="margin-right: 1rem; margin-bottom: 1rem;">
                            <i class="fas fa-trophy"></i> Ver Ranking
                        </button>
                        <button onclick="logoutUser()" class="btn btn-logout">
                            <i class="fas fa-sign-out-alt"></i> Sair da Conta
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Carregar seção de endereço após renderizar
        setTimeout(() => {
            loadAddressSection(currentUser, false);
        }, 100);
        
    } else if (isGuestMode) {
        // MODO VISITANTE - MOSTRAR INTERFACE DE VISITANTE
        profileSection.innerHTML = `
            <div class="profile-container">
                <h2><i class="fas fa-user-clock"></i> Modo Visitante</h2>
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <i class="fas fa-user-circle guest-icon" style="font-size: 4rem; color: #6c757d;"></i>
                        </div>
                        <div class="profile-info">
                            <h3>Visitante</h3>
                            <p class="profile-email">Modo temporário</p>
                            <p class="member-since">Sessão atual</p>
                        </div>
                    </div>
                    
                    <div class="profile-stats">
                        <h4><i class="fas fa-chart-line"></i> Informações</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <i class="fas fa-info-circle"></i>
                                <span>Status</span>
                                <strong>Visitante</strong>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>Aviso</span>
                                <strong>Progresso não salvo</strong>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-gamepad"></i>
                                <span>Jogos jogados</span>
                                <strong>Visitante</strong>
                            </div>
                        </div>
                    </div>
                    
                    <!-- SEÇÃO DE ENDEREÇO PARA VISITANTE -->
                    <div class="profile-address" id="profileAddressSection">
                        <h4><i class="fas fa-map-marker-alt"></i> Endereço (Modo Visitante)</h4>
                        <div id="addressContent">
                            <!-- O conteúdo será carregado pelo módulo CEP -->
                        </div>
                    </div>
                    
                    <div class="profile-actions" style="text-align: center; margin-top: 2rem;">
                        <button onclick="showSection('games')" class="btn btn-primary" style="margin-bottom: 1rem;">
                            <i class="fas fa-play-circle"></i> Continuar Jogando
                        </button>
                        <button onclick="showAuthModalIfAvailable()" class="btn btn-secondary">
                            <i class="fas fa-user-plus"></i> Criar Conta
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Carregar seção de endereço para visitante
        setTimeout(() => {
            loadAddressSection(null, true);
        }, 100);
        
    } else {
        // USUÁRIO NÃO LOGADO - MOSTRAR MENSAGEM PARA FAZER LOGIN
        profileSection.innerHTML = `
            <div class="profile-container">
                <h2><i class="fas fa-user-circle"></i> Perfil</h2>
                <div class="profile-card" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-user-lock" style="font-size: 4rem; color: #95a5a6; margin-bottom: 1.5rem;"></i>
                    <h3>Acesso Restrito</h3>
                    <p style="margin-bottom: 2rem; color: #7f8c8d;">
                        Você precisa estar logado para acessar seu perfil.
                    </p>
                    <button onclick="showAuthModalIfAvailable()" class="btn btn-primary" style="padding: 0.8rem 2rem;">
                        <i class="fas fa-sign-in-alt"></i> Fazer Login
                    </button>
                </div>
            </div>
        `;
    }
}

function showAuthModalIfAvailable() {
    if (typeof AuthModule !== 'undefined' && typeof AuthModule.showAuthModal === 'function') {
        AuthModule.showAuthModal();
    }
}

function logoutUser() {
    DB.logoutUser();
    currentUser = null;
    window.currentUser = null;
    isGuestMode = false;
    
    if (typeof AuthModule !== 'undefined' && typeof AuthModule.updateUI === 'function') {
        AuthModule.updateUI();
    } else {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const profileLink = document.getElementById('profileLink');
        
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (profileLink) profileLink.classList.add('hidden');
    }
    
    showNotification('👋 Você saiu da sua conta.', 'info');
    showSection('home');
}

// ============ FUNÇÕES DE NAVEGAÇÃO ============
function showSection(sectionId) {
    console.log(`Mostrando seção: ${sectionId}, Usuário: ${currentUser ? 'Logado' : 'Não logado'}, Guest: ${isGuestMode}`);
    
    // Seção de perfil - verificar autenticação
    if (sectionId === 'profile') {
        // Atualizar referência do usuário antes de verificar
        currentUser = window.currentUser || DB.getCurrentUser();
        
        // Se não estiver logado nem em modo visitante, mostrar login
        if (!currentUser && !isGuestMode) {
            console.log('Redirecionando para login...');
            if (typeof AuthModule !== 'undefined' && typeof AuthModule.showAuthModal === 'function') {
                AuthModule.showAuthModal();
            } else {
                // Fallback
                const authModal = document.getElementById('authModal');
                if (authModal) authModal.classList.remove('hidden');
            }
            return; // Não prossegue para mostrar o perfil
        }
        
        // Se estiver autenticado ou em modo visitante, carregar o perfil
        loadProfileData();
    }
    
    const sections = document.querySelectorAll('.section');
    const targetSection = document.getElementById(sectionId);
    
    if (!targetSection) {
        console.error(`Seção ${sectionId} não encontrada!`);
        showNotification(`Seção não encontrada: ${sectionId}`, 'error');
        return;
    }
    
    sections.forEach(section => {
        if (section) {
            section.classList.remove('active');
            section.classList.add('hidden');
        }
    });
    
    targetSection.classList.add('active');
    targetSection.classList.remove('hidden');
    
    if (sectionId === 'games') {
        const gamesGrid = document.getElementById('gamesGrid');
        if (gamesGrid) gamesGrid.classList.remove('hidden');
        
        Object.values(gameSections).forEach(section => {
            if (section) section.classList.add('hidden');
        });
        
        updateGameCards();
    }
    
    if (sectionId === 'ranking') {
        updateRanking('math');
    }
    
    const navLinksContainer = document.getElementById('navLinks');
    if (navLinksContainer && navLinksContainer.classList.contains('active')) {
        navLinksContainer.classList.remove('active');
    }
}

function showGame(gameId) {
    const gamesGrid = document.getElementById('gamesGrid');
    if (gamesGrid) gamesGrid.classList.add('hidden');
    
    Object.values(gameSections).forEach(section => {
        if (section) section.classList.add('hidden');
    });
    
    const gameSection = gameSections[gameId];
    if (gameSection) {
        gameSection.classList.remove('hidden');
        
        if (typeof GamesModule !== 'undefined' && typeof GamesModule.initGame === 'function') {
            GamesModule.initGame(gameId);
        }
    }
}

function showGameMenu() {
    Object.values(gameSections).forEach(section => {
        if (section) section.classList.add('hidden');
    });
    
    const gamesGrid = document.getElementById('gamesGrid');
    if (gamesGrid) gamesGrid.classList.remove('hidden');
    
    updateGameCards();
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function updateRanking(gameType) {
    const table = rankingTables[gameType];
    if (!table) return;
    
    const tableBody = table.querySelector('tbody');
    if (!tableBody) return;
    
    const ranking = DB.getRanking(gameType);
    
    tableBody.innerHTML = '';
    
    if (ranking.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-trophy" style="font-size: 2rem; color: #ffd166; margin-bottom: 1rem;"></i>
                <p>Nenhuma pontuação registrada ainda!</p>
                <p style="font-size: 0.9rem; color: #7f8c8d; margin-top: 0.5rem;">
                    ${!currentUser && !isGuestMode ? 'Faça login para participar!' : 'Seja o primeiro a jogar!'}
                </p>
            </div>
        `;
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }
    
    ranking.forEach((score, index) => {
        const row = document.createElement('tr');
        
        const positionCell = document.createElement('td');
        positionCell.textContent = `#${index + 1}`;
        row.appendChild(positionCell);
        
        const nameCell = document.createElement('td');
        nameCell.textContent = score.userName || 'Anônimo';
        row.appendChild(nameCell);
        
        const scoreCell = document.createElement('td');
        if (gameType === 'math') {
            scoreCell.textContent = score.score;
        } else if (gameType === 'color') {
            scoreCell.textContent = `${score.score}s`;
        } else {
            scoreCell.textContent = score.score;
        }
        row.appendChild(scoreCell);
        
        const dateCell = document.createElement('td');
        const date = new Date(score.date);
        dateCell.textContent = date.toLocaleDateString('pt-BR');
        row.appendChild(dateCell);
        
        if (currentUser && score.userId === currentUser.email) {
            row.style.backgroundColor = '#e3f2fd';
            row.style.fontWeight = 'bold';
        }
        
        tableBody.appendChild(row);
    });
}

function enterAsGuest() {
    isGuestMode = true;
    currentUser = null;
    window.currentUser = null;
    
    updateGuestUI();
    showNotification('🎮 Modo Visitante ativado! Suas pontuações não serão salvas.', 'info');
    showSection('games');
}

function updateGuestUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileLink = document.getElementById('profileLink');
    
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (profileLink) profileLink.classList.add('hidden');
}

function showNotification(message, type = 'info') {
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(notification => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
        border-left: 4px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
        border-radius: 5px;
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        font-size: 0.95rem;
    `;
    
    document.body.appendChild(notification);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ============ CONFIGURAÇÃO DOS EVENT LISTENERS ============
function setupEventListeners() {
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks && navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                if (sectionId) showSection(sectionId);
            });
        });
    }
    
    const startButtons = document.querySelectorAll('.btn-start');
    if (startButtons && startButtons.length > 0) {
        startButtons.forEach(button => {
            button.addEventListener('click', function() {
                const gameId = this.getAttribute('data-game');
                showSection('games');
                setTimeout(() => showGame(gameId), 50);
            });
        });
    }
    
    const backButtons = document.querySelectorAll('.back-btn');
    if (backButtons && backButtons.length > 0) {
        backButtons.forEach(button => {
            button.addEventListener('click', function() {
                showGameMenu();
            });
        });
    }
    
    const navToggle = document.getElementById('navToggle');
    const navLinksContainer = document.getElementById('navLinks');
    if (navToggle && navLinksContainer) {
        navToggle.addEventListener('click', function() {
            navLinksContainer.classList.toggle('active');
        });
    }
    
    const rankingTabs = document.querySelectorAll('.ranking-tab');
    if (rankingTabs && rankingTabs.length > 0) {
        rankingTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const rankingType = this.getAttribute('data-ranking');
                
                rankingTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                Object.values(rankingTables).forEach(table => table.classList.add('hidden'));
                if (rankingTables[rankingType]) {
                    rankingTables[rankingType].classList.remove('hidden');
                }
                
                updateRanking(rankingType);
            });
        });
    }
    
    const profileLink = document.getElementById('profileLink');
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('profile');
        });
    }
    
    // Botão de alternância de tema
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// ============ INICIALIZAÇÃO ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Site inicializando...');
    
    // Inicializar tema
    initTheme();
    
    // Loader
    const loader = document.createElement('div');
    loader.id = 'siteLoader';
    loader.innerHTML = '<div class="loader-content"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Carregando jogos...</p></div>';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    `;
    document.body.appendChild(loader);
    
    setupEventListeners();
    
    // Atualizar UI inicial
    if (typeof AuthModule !== 'undefined' && typeof AuthModule.updateUI === 'function') {
        AuthModule.updateUI();
    } else {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const profileLink = document.getElementById('profileLink');
        
        if (currentUser) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (profileLink) profileLink.classList.remove('hidden');
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
            if (profileLink) profileLink.classList.add('hidden');
        }
    }
    
    updateGameCards();
    
    // Botão de visitante
    setTimeout(() => {
        if (!document.getElementById('guestBtn')) {
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) {
                const guestBtn = document.createElement('button');
                guestBtn.id = 'guestBtn';
                guestBtn.className = 'btn btn-guest';
                guestBtn.innerHTML = '<i class="fas fa-user-clock"></i> Jogar como Visitante';
                guestBtn.style.cssText = 'width: 100%; margin-top: 0.8rem; background-color: #6c757d; color: white; padding: 0.8rem; font-weight: 600;';
                
                guestBtn.addEventListener('click', function() {
                    if (typeof AuthModule !== 'undefined' && typeof AuthModule.hideAuthModal === 'function') {
                        AuthModule.hideAuthModal();
                    } else {
                        const authModal = document.getElementById('authModal');
                        if (authModal) authModal.classList.add('hidden');
                    }
                    enterAsGuest();
                });
                
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    loginForm.parentNode.insertBefore(guestBtn, loginForm.nextSibling);
                }
            }
        }
    }, 100);
    
    showSection('home');
    
    // Inicializar módulos
    if (typeof TestUserModule !== 'undefined') TestUserModule.init();
    if (typeof AuthModule !== 'undefined') AuthModule.init();
    if (typeof GamesModule !== 'undefined') GamesModule.init();
    // Inicializar módulo CEP se existir
    if (typeof CEPModule !== 'undefined') {
        console.log('📍 Módulo CEP inicializado pelo script principal');
    }
    
    // Remover loader
    setTimeout(() => {
        const loaderElement = document.getElementById('siteLoader');
        if (loaderElement) {
            loaderElement.style.opacity = '0';
            setTimeout(() => loaderElement.remove(), 500);
        }
        console.log('✅ Site inicializado com sucesso!');
        
        if (!currentUser && !isGuestMode) {
            showNotification('👋 Bem-vindo! Use o botão "Usuário Teste" para login rápido ou cadastre-se!', 'info');
        }
    }, 800);
});

// CSS dinâmico para animações
const dynamicStyle = document.createElement('style');
dynamicStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
        color: inherit;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
    }
    .notification-close:hover {
        background-color: rgba(0,0,0,0.1);
    }
    .loader-content {
        text-align: center;
        color: #2c3e50;
    }
    .loader-content i {
        color: #4a6fa5;
        margin-bottom: 1rem;
    }
    .loader-content p {
        margin-top: 1rem;
        font-weight: 500;
        font-size: 1.1rem;
    }
    .btn-guest:hover {
        background-color: #5a6268 !important;
        transform: translateY(-1px);
        transition: all 0.3s ease;
    }
    .test-user-badge {
        display: inline-block;
        background: linear-gradient(135deg, #06D6A0, #05C28F);
        color: white;
        padding: 0.2rem 0.8rem;
        border-radius: 20px;
        font-size: 0.8rem;
        margin-left: 10px;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(6, 214, 160, 0.2);
    }
    
    /* Estilos básicos para o módulo CEP (se o CSS principal não tiver) */
    .profile-address {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #eee;
    }
    
    .profile-address h4 {
        color: #2c3e50;
        font-size: 1.3rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .address-form {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 1.5rem;
    }
    
    .form-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }
    
    .form-row .form-group {
        flex: 1;
        min-width: 150px;
        margin-bottom: 0;
    }
    
    .cep-input-group {
        display: flex;
        gap: 0.5rem;
    }
    
    .cep-input-group input {
        flex: 1;
    }
    
    .btn-small {
        padding: 0.8rem 1rem;
        font-size: 0.9rem;
        white-space: nowrap;
    }
    
    .cep-hint {
        display: block;
        margin-top: 0.3rem;
        color: #7f8c8d;
        font-size: 0.8rem;
    }
    
    .address-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
        flex-wrap: wrap;
    }
    
    .address-feedback {
        margin-top: 1rem;
        padding: 0.8rem;
        border-radius: 5px;
        font-weight: 500;
        text-align: center;
        transition: all 0.3s;
    }
    
    .address-feedback.info {
        background-color = #d1ecf1;
        color: #0c5460;
        border-left: 4px solid #bee5eb;
    }
    
    .address-feedback.success {
        background-color: #d4edda;
        color: #155724;
        border-left: 4px solid #c3e6cb;
    }
    
    .address-feedback.warning {
        background-color: #fff3cd;
        color: #856404;
        border-left: 4px solid #ffeaa7;
    }
    
    .address-feedback.error {
        background-color: #f8d7da;
        color: #721c24;
        border-left: 4px solid #f5c6cb;
    }
    
    .address-saved {
        background-color: #e8f5e9;
        border-radius: 8px;
        padding: 1.5rem;
        margin-top: 1rem;
    }
    
    .address-details {
        color: #555;
        line-height: 1.6;
    }
    
    .address-details p {
        margin-bottom: 0.5rem;
    }
    
    .address-edit-btn {
        margin-top: 1rem;
        background-color: transparent;
        color: #4a6fa5;
        border: 1px solid #4a6fa5;
    }
    
    .address-edit-btn:hover {
        background-color: #4a6fa5;
        color: white;
    }
    
    @media (max-width: 768px) {
        .form-row {
            flex-direction: column;
            gap: 0.8rem;
        }
        
        .form-row .form-group {
            width: 100%;
        }
        
        .cep-input-group {
            flex-direction: column;
        }
        
        .address-actions {
            flex-direction: column;
        }
        
        .address-actions .btn {
            width: 100%;
        }
    }
`;
document.head.appendChild(dynamicStyle);