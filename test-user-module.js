// Módulo de Usuário Teste - Versão SEM Banco de Dados
(function() {
    // Configurações do usuário teste (SEM BD)
    const TEST_USER = {
        email: 'exemplo@email.com',
        password: '123456',
        name: 'Jogador Exemplo',
        createdAt: new Date().toISOString(),
        stats: {
            math: { bestScore: 150 },
            color: { bestTime: 45 },
            puzzle: { bestMoves: 25 }
        }
    };
    
    // Pontuações de exemplo para o ranking
    const EXAMPLE_SCORES = {
        math: [
            { userId: TEST_USER.email, userName: TEST_USER.name, score: 150, date: new Date().toISOString() },
            { userId: TEST_USER.email, userName: TEST_USER.name, score: 120, date: new Date(Date.now() - 86400000).toISOString() },
            { userId: TEST_USER.email, userName: TEST_USER.name, score: 90, date: new Date(Date.now() - 172800000).toISOString() },
            { userId: 'outro@jogador.com', userName: 'Outro Jogador', score: 200, date: new Date(Date.now() - 259200000).toISOString() },
            { userId: 'teste@email.com', userName: 'Jogador Teste', score: 180, date: new Date(Date.now() - 345600000).toISOString() }
        ],
        color: [
            { userId: TEST_USER.email, userName: TEST_USER.name, score: 45, date: new Date().toISOString() },
            { userId: TEST_USER.email, userName: TEST_USER.name, score: 60, date: new Date(Date.now() - 86400000).toISOString() },
            { userId: 'outro@jogador.com', userName: 'Outro Jogador', score: 35, date: new Date(Date.now() - 172800000).toISOString() },
            { userId: 'teste@email.com', userName: 'Jogador Teste', score: 50, date: new Date(Date.now() - 259200000).toISOString() }
        ],
        puzzle: [
            { userId: TEST_USER.email, userName: TEST_USER.name, score: 25, date: new Date().toISOString() },
            { userId: TEST_USER.email, userName: TEST_USER.name, score: 30, date: new Date(Date.now() - 86400000).toISOString() },
            { userId: 'outro@jogador.com', userName: 'Outro Jogador', score: 20, date: new Date(Date.now() - 172800000).toISOString() },
            { userId: 'teste@email.com', userName: 'Jogador Teste', score: 28, date: new Date(Date.now() - 259200000).toISOString() }
        ]
    };
    
    // Elementos DOM
    let testUserBtn;
    let loginEmailInput;
    let loginPasswordInput;
    let loginFeedback;
    
    // Inicializar módulo
    function init() {
        console.log('Inicializando módulo de Usuário Teste (SEM BD)...');
        
        // Obter referências aos elementos DOM
        testUserBtn = document.getElementById('testUserBtn');
        loginEmailInput = document.getElementById('loginEmail');
        loginPasswordInput = document.getElementById('loginPassword');
        loginFeedback = document.getElementById('loginFeedback');
        
        // Verificar se elementos foram encontrados
        if (!testUserBtn) {
            console.error('Botão de usuário teste não encontrado!');
            return;
        }
        
        // Configurar evento do botão
        testUserBtn.addEventListener('click', handleTestUserLogin);
        
        // Adicionar pontuações de exemplo ao ranking (SEM BD)
        addExampleScoresToRanking();
        
        console.log('Módulo de Usuário Teste (SEM BD) inicializado com sucesso');
    }
    
    // Adicionar pontuações de exemplo ao ranking SEM usar DB
    function addExampleScoresToRanking() {
        try {
            // Verificar se já existem pontuações no localStorage
            let scores = { math: [], color: [], puzzle: [] };
            
            try {
                const storedScores = localStorage.getItem('scores');
                if (storedScores) {
                    scores = JSON.parse(storedScores);
                }
            } catch (e) {
                console.log('Criando novo armazenamento de pontuações...');
            }
            
            // Adicionar apenas se não houver muitas pontuações
            if (scores.math.length < 3) {
                EXAMPLE_SCORES.math.forEach(score => {
                    // Verificar se já existe
                    const exists = scores.math.some(s => 
                        s.userId === score.userId && s.score === score.score);
                    if (!exists) {
                        scores.math.push(score);
                    }
                });
            }
            
            if (scores.color.length < 3) {
                EXAMPLE_SCORES.color.forEach(score => {
                    const exists = scores.color.some(s => 
                        s.userId === score.userId && s.score === score.score);
                    if (!exists) {
                        scores.color.push(score);
                    }
                });
            }
            
            if (scores.puzzle.length < 3) {
                EXAMPLE_SCORES.puzzle.forEach(score => {
                    const exists = scores.puzzle.some(s => 
                        s.userId === score.userId && s.score === score.score);
                    if (!exists) {
                        scores.puzzle.push(score);
                    }
                });
            }
            
            // Ordenar rankings
            scores.math.sort((a, b) => b.score - a.score);
            scores.color.sort((a, b) => a.score - b.score);
            scores.puzzle.sort((a, b) => a.score - b.score);
            
            // Salvar no localStorage (apenas para ranking)
            localStorage.setItem('scores', JSON.stringify(scores));
            
            console.log('Pontuações de exemplo adicionadas ao ranking');
        } catch (error) {
            console.error('Erro ao adicionar pontuações de exemplo:', error);
        }
    }
    
    // Manipular login com usuário teste (SEM BD)
    function handleTestUserLogin() {
        console.log('Botão de usuário teste clicado (SEM BD)');
        
        // Preencher automaticamente os campos
        if (loginEmailInput && loginPasswordInput) {
            loginEmailInput.value = TEST_USER.email;
            loginPasswordInput.value = TEST_USER.password;
            
            // Mostrar informações do usuário teste
            showTestUserInfo();
            
            // Fazer login automático SEM BD
            loginTestUserDirectly();
        } else {
            console.error('Campos de login não encontrados!');
        }
    }
    
    // Mostrar informações do usuário teste
    function showTestUserInfo() {
        if (loginFeedback) {
            loginFeedback.innerHTML = `
                <div class="test-user-info">
                    <strong><i class="fas fa-user-check"></i> Usuário de Teste (SEM BD)</strong><br>
                    <small>Email: ${TEST_USER.email}</small><br>
                    <small>Senha: ${TEST_USER.password}</small><br>
                    <small><i>Os dados estão apenas em memória</i></small>
                </div>
            `;
            loginFeedback.style.color = '#155724';
            loginFeedback.style.backgroundColor = '#d4edda';
            loginFeedback.style.borderLeft = '4px solid #06D6A0';
            loginFeedback.style.padding = '0.8rem';
            loginFeedback.style.borderRadius = '5px';
            loginFeedback.style.marginTop = '1rem';
            loginFeedback.style.fontSize = '0.9rem';
        }
    }
    
    // Login direto do usuário teste SEM usar DB
    function loginTestUserDirectly() {
        console.log('Fazendo login direto do usuário teste (SEM BD)...');
        
        // Usar a função do AuthModule se disponível para mostrar mensagem de sucesso consistente
        if (typeof AuthModule !== 'undefined' && typeof AuthModule.showLoginSuccessMessage === 'function') {
            AuthModule.showLoginSuccessMessage('Usuário de Teste Detectado', true);
        } else {
            // Fallback: usar função local
            showTestUserInfo();
        }
        
        setTimeout(() => {
            try {
                // Verificar credenciais manualmente (SEM DB)
                if (loginEmailInput.value === TEST_USER.email && 
                    loginPasswordInput.value === TEST_USER.password) {
                    
                    console.log('✅ Login com usuário teste bem-sucedido (SEM BD)');
                    
                    // Criar objeto de usuário SEM senha
                    const userWithoutPassword = {
                        name: TEST_USER.name,
                        email: TEST_USER.email,
                        createdAt: TEST_USER.createdAt,
                        stats: TEST_USER.stats
                    };
                    
                    // Salvar na sessão atual (não no BD)
                    window.currentUser = userWithoutPassword;
                    
                    // Atualizar o currentUser global
                    if (typeof window !== 'undefined') {
                        window.currentUser = userWithoutPassword;
                    }
                    
                    // Mostrar mensagem de sucesso formatada
                    showLoginSuccess();
                    
                    setTimeout(() => {
                        // Fechar modal
                        if (typeof AuthModule !== 'undefined' && typeof AuthModule.hideAuthModal === 'function') {
                            AuthModule.hideAuthModal();
                        } else {
                            const authModal = document.getElementById('authModal');
                            if (authModal) authModal.classList.add('hidden');
                        }
                        
                        // Atualizar interface usando AuthModule se disponível
                        if (typeof AuthModule !== 'undefined' && typeof AuthModule.updateUI === 'function') {
                            AuthModule.updateUI();
                        } else {
                            // Atualizar UI manualmente
                            updateUIManually();
                        }
                        
                        // Mostrar seção de jogos
                        if (typeof showSection === 'function') {
                            showSection('games');
                        }
                        
                        // Mostrar mensagem de boas-vindas
                        showWelcomeMessage(userWithoutPassword);
                    }, 1000);
                } else {
                    console.error('❌ Credenciais incorretas');
                    if (loginFeedback) {
                        loginFeedback.innerHTML = `
                            <div class="login-error">
                                <strong><i class="fas fa-exclamation-circle"></i> Erro: Email ou senha incorretos!</strong><br>
                                <small>Tente novamente</small>
                            </div>
                        `;
                        loginFeedback.style.color = '#721c24';
                        loginFeedback.style.backgroundColor = '#f8d7da';
                        loginFeedback.style.borderLeft = '4px solid #e74c3c';
                        loginFeedback.style.padding = '0.8rem';
                        loginFeedback.style.borderRadius = '5px';
                        loginFeedback.style.marginTop = '1rem';
                    }
                }
            } catch (error) {
                console.error('Erro durante login:', error);
                if (loginFeedback) {
                    loginFeedback.innerHTML = `
                        <div class="login-error">
                            <strong><i class="fas fa-exclamation-circle"></i> Erro: ${error.message}</strong><br>
                            <small>Tente novamente</small>
                        </div>
                    `;
                    loginFeedback.style.color = '#721c24';
                    loginFeedback.style.backgroundColor = '#f8d7da';
                    loginFeedback.style.borderLeft = '4px solid #e74c3c';
                    loginFeedback.style.padding = '0.8rem';
                    loginFeedback.style.borderRadius = '5px';
                    loginFeedback.style.marginTop = '1rem';
                }
            }
        }, 800);
    }
    
    // Atualizar UI manualmente (se AuthModule não estiver disponível)
    function updateUIManually() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const profileLink = document.getElementById('profileLink');
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        
        if (window.currentUser) {
            // Atualizar botões
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (profileLink) profileLink.classList.remove('hidden');
            
            // Atualizar perfil se estiver visível
            if (profileName) profileName.textContent = window.currentUser.name;
            if (profileEmail) profileEmail.textContent = window.currentUser.email;
            
            // Atualizar estatísticas nos cards de jogo
            updateGameCardsManually();
        }
    }
    
    // Atualizar cards de jogo manualmente
    function updateGameCardsManually() {
        if (!window.currentUser) return;
        
        const mathBestScore = document.getElementById('mathBestScore');
        const colorBestTime = document.getElementById('colorBestTime');
        const puzzleBestMoves = document.getElementById('puzzleBestMoves');
        
        if (mathBestScore) mathBestScore.textContent = window.currentUser.stats.math.bestScore || '0';
        if (colorBestTime) colorBestTime.textContent = window.currentUser.stats.color.bestTime 
            ? `${window.currentUser.stats.color.bestTime}s` 
            : '-';
        if (puzzleBestMoves) puzzleBestMoves.textContent = window.currentUser.stats.puzzle.bestMoves || '-';
    }
    
    // Mostrar mensagem de login bem-sucedido
    function showLoginSuccess() {
        if (loginFeedback) {
            loginFeedback.innerHTML = `
                <div class="login-success">
                    <strong><i class="fas fa-check-circle"></i> Login realizado com usuário teste (SEM BD)!</strong><br>
                    <small>Redirecionando para os jogos...</small>
                </div>
            `;
            loginFeedback.style.color = '#155724';
            loginFeedback.style.backgroundColor = '#d4edda';
            loginFeedback.style.borderLeft = '4px solid #06D6A0';
            loginFeedback.style.padding = '0.8rem';
            loginFeedback.style.borderRadius = '5px';
            loginFeedback.style.marginTop = '1rem';
            loginFeedback.style.fontSize = '0.9rem';
        }
    }
    
    // Mostrar mensagem de boas-vindas
    function showWelcomeMessage(user) {
        setTimeout(() => {
            const welcomeMsg = `🎮 Bem-vindo, ${user.name}!\n\n📋 Modo SEM Banco de Dados:\n• Email: ${TEST_USER.email}\n• Senha: ${TEST_USER.password}\n\n⚡ Você está logado apenas nesta sessão\n🏆 As pontuações de exemplo já estão no ranking\n\n⚠️ Seu progresso NÃO será salvo ao recarregar a página.`;
            
            // Usar sistema de notificações se disponível
            if (typeof showNotification === 'function') {
                showNotification('🎉 Login realizado com sucesso! Usuário de teste ativado.', 'success');
                
                // Mostrar mensagem detalhada separadamente
                setTimeout(() => {
                    showNotification('📝 Modo SEM BD: Seus dados estão apenas em memória.', 'info');
                }, 2000);
            } else {
                alert(welcomeMsg);
            }
        }, 500);
    }
    
    // Função para simular logout (para o AuthModule usar)
    function simulateLogout() {
        window.currentUser = null;
        console.log('Usuário teste deslogado (dados em memória limpos)');
    }
    
    // Função para verificar se o usuário atual é o usuário teste
    function isCurrentUserTestUser() {
        return window.currentUser && window.currentUser.email === TEST_USER.email;
    }
    
    // Nova função: atualizar estatísticas do usuário teste
    function updateTestUserStats(game, newScore) {
        if (!window.currentUser || window.currentUser.email !== TEST_USER.email) {
            return;
        }
        
        // Atualizar estatísticas em memória
        if (game === 'math') {
            if (newScore > window.currentUser.stats.math.bestScore) {
                window.currentUser.stats.math.bestScore = newScore;
            }
        } else if (game === 'color') {
            if (!window.currentUser.stats.color.bestTime || newScore < window.currentUser.stats.color.bestTime) {
                window.currentUser.stats.color.bestTime = newScore;
            }
        } else if (game === 'puzzle') {
            if (!window.currentUser.stats.puzzle.bestMoves || newScore < window.currentUser.stats.puzzle.bestMoves) {
                window.currentUser.stats.puzzle.bestMoves = newScore;
            }
        }
        
        // Adicionar ao ranking do localStorage
        const scoreData = {
            userId: window.currentUser.email,
            userName: window.currentUser.name,
            score: newScore,
            date: new Date().toISOString()
        };
        
        // Atualizar ranking local
        try {
            let scores = { math: [], color: [], puzzle: [] };
            const storedScores = localStorage.getItem('scores');
            if (storedScores) {
                scores = JSON.parse(storedScores);
            }
            
            scores[game].push(scoreData);
            
            // Ordenar
            if (game === 'math') {
                scores[game].sort((a, b) => b.score - a.score);
            } else {
                scores[game].sort((a, b) => a.score - b.score);
            }
            
            // Manter top 50
            scores[game] = scores[game].slice(0, 50);
            
            localStorage.setItem('scores', JSON.stringify(scores));
        } catch (error) {
            console.error('Erro ao atualizar ranking:', error);
        }
        
        console.log(`Estatísticas do usuário teste atualizadas: ${game} = ${newScore}`);
    }
    
    // Tornar funções públicas
    window.TestUserModule = {
        init: init,
        loginTestUserDirectly: loginTestUserDirectly,
        simulateLogout: simulateLogout,
        isCurrentUserTestUser: isCurrentUserTestUser,
        updateTestUserStats: updateTestUserStats,
        TEST_USER: TEST_USER // Exportar para debug se necessário
    };
})();