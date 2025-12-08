// Módulo de Autenticação - Compatível com Test User Module (SEM BD)
(function() {
    // Elementos DOM do módulo
    let authModal;
    let modalClose;
    let authTabs;
    let loginForm;
    let registerForm;
    let loginFeedback;
    let registerFeedback;
    let loginBtn;
    let logoutBtn;
    let profileLink;
    let startPlayingBtn;
    let profileName;
    let profileEmail;
    let memberSince;
    let profileMathScore;
    let profileColorTime;
    let profilePuzzleMoves;
    let profileRankPosition;
    let mathBestScore;
    let colorBestTime;
    let puzzleBestMoves;
    
    // Inicializar módulo
    function init() {
        console.log('Inicializando módulo de Autenticação...');
        
        // Obter referências aos elementos DOM
        authModal = document.getElementById('authModal');
        modalClose = document.getElementById('modalClose');
        authTabs = document.querySelectorAll('.auth-tab');
        loginForm = document.getElementById('loginForm');
        registerForm = document.getElementById('registerForm');
        loginFeedback = document.getElementById('loginFeedback');
        registerFeedback = document.getElementById('registerFeedback');
        loginBtn = document.getElementById('loginBtn');
        logoutBtn = document.getElementById('logoutBtn');
        profileLink = document.getElementById('profileLink');
        startPlayingBtn = document.getElementById('startPlayingBtn');
        
        // Elementos do perfil
        profileName = document.getElementById('profileName');
        profileEmail = document.getElementById('profileEmail');
        memberSince = document.getElementById('memberSince');
        profileMathScore = document.getElementById('profileMathScore');
        profileColorTime = document.getElementById('profileColorTime');
        profilePuzzleMoves = document.getElementById('profilePuzzleMoves');
        profileRankPosition = document.getElementById('profileRankPosition');
        
        // Elementos dos cards de jogos
        mathBestScore = document.getElementById('mathBestScore');
        colorBestTime = document.getElementById('colorBestTime');
        puzzleBestMoves = document.getElementById('puzzleBestMoves');
        
        // Configurar eventos
        setupEventListeners();
        
        console.log('Módulo de Autenticação inicializado');
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Botão de login
        if (loginBtn) {
            loginBtn.addEventListener('click', showAuthModal);
        }
        
        // Fechar modal
        if (modalClose) {
            modalClose.addEventListener('click', hideAuthModal);
        }
        
        // Fechar modal ao clicar fora
        if (authModal) {
            authModal.addEventListener('click', function(e) {
                if (e.target === authModal) {
                    hideAuthModal();
                }
            });
        }
        
        // Tabs de autenticação
        if (authTabs && authTabs.length > 0) {
            authTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabName = this.getAttribute('data-tab');
                    showAuthTab(tabName);
                });
            });
        }
        
        // Formulário de login
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        // Formulário de cadastro
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        // Botão de logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        // Navegação para perfil
        if (profileLink) {
            profileLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Atualizar referência do usuário
                const user = window.currentUser || DB.getCurrentUser();
                const guestMode = window.isGuestMode || false;
                
                console.log('Clicou no perfil:', { user, guestMode });
                
                if (user || guestMode) {
                    // Usar a função global showSection
                    if (typeof showSection === 'function') {
                        showSection('profile');
                    }
                } else {
                    showAuthModal();
                }
            });
        }
        
        // Botão "Começar a Jogar"
        if (startPlayingBtn) {
            startPlayingBtn.addEventListener('click', function() {
                if (window.currentUser) {
                    showSection('games');
                } else {
                    showAuthModal();
                }
            });
        }
    }
    
    // Mostrar modal de autenticação
    function showAuthModal() {
        if (authModal) {
            authModal.classList.remove('hidden');
            if (loginForm) loginForm.reset();
            if (registerForm) registerForm.reset();
            if (loginFeedback) loginFeedback.textContent = '';
            if (registerFeedback) registerFeedback.textContent = '';
            showAuthTab('login');
        }
    }
    
    // Esconder modal de autenticação
    function hideAuthModal() {
        if (authModal) {
            authModal.classList.add('hidden');
        }
    }
    
    // Mostrar tab específica
    function showAuthTab(tabName) {
        authTabs.forEach(tab => {
            if (tab && tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else if (tab) {
                tab.classList.remove('active');
            }
        });
        
        if (tabName === 'login') {
            if (loginForm) loginForm.classList.remove('hidden');
            if (registerForm) registerForm.classList.add('hidden');
        } else {
            if (loginForm) loginForm.classList.add('hidden');
            if (registerForm) registerForm.classList.remove('hidden');
        }
    }
    
    // CORREÇÃO AQUI: Nova função para mostrar mensagem de sucesso formatada
    function showLoginSuccessMessage(message = 'Login realizado com sucesso!', isTestUser = false) {
        if (loginFeedback) {
            if (isTestUser) {
                loginFeedback.innerHTML = `
                    <div class="test-user-info">
                        <strong><i class="fas fa-user-check"></i> Usuário de Teste Detectado</strong><br>
                        <small>Usando login direto (SEM BD)</small>
                    </div>
                `;
            } else {
                loginFeedback.innerHTML = `
                    <div class="login-success">
                        <strong><i class="fas fa-check-circle"></i> ${message}</strong><br>
                        <small>Redirecionando para os jogos...</small>
                    </div>
                `;
            }
            loginFeedback.style.color = '#155724';
            loginFeedback.style.backgroundColor = '#d4edda';
            loginFeedback.style.borderLeft = '4px solid #06D6A0';
            loginFeedback.style.padding = '0.8rem';
            loginFeedback.style.borderRadius = '5px';
        }
    }
    
    // Manipular login
    function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Verificar se é usuário teste (email específico)
        if (email === 'exemplo@email.com' && password === '123456') {
            // É usuário teste - usar o módulo de teste
            showLoginSuccessMessage('Usuário de Teste Detectado', true);
            
            setTimeout(() => {
                // Usar o módulo de teste para login
                if (typeof TestUserModule !== 'undefined' && typeof TestUserModule.loginTestUserDirectly === 'function') {
                    TestUserModule.loginTestUserDirectly();
                } else {
                    // Fallback: fazer login manualmente
                    loginTestUserManually();
                }
            }, 1000);
            
            return;
        }
        
        // Login normal com DB
        const result = DB.loginUser(email, password);
        
        if (result.success) {
            // CORREÇÃO AQUI: Usar a nova função formatada
            showLoginSuccessMessage('Login realizado com sucesso!', false);
            
            setTimeout(() => {
                hideAuthModal();
                updateUI();
                showSection('games');
                
                // Mostrar notificação adicional
                if (typeof showNotification === 'function') {
                    showNotification(`🎉 Bem-vindo de volta, ${result.user.name || 'Jogador'}!`, 'success');
                }
            }, 1000);
        } else {
            if (loginFeedback) {
                loginFeedback.innerHTML = `
                    <div class="login-error">
                        <strong><i class="fas fa-exclamation-circle"></i> ${result.message}</strong><br>
                        <small>Verifique seu email e senha</small>
                    </div>
                `;
                loginFeedback.style.color = '#721c24';
                loginFeedback.style.backgroundColor = '#f8d7da';
                loginFeedback.style.borderLeft = '4px solid #e74c3c';
                loginFeedback.style.padding = '0.8rem';
                loginFeedback.style.borderRadius = '5px';
            }
        }
    }
    
    // Login manual para usuário teste (fallback)
    function loginTestUserManually() {
        const testUser = {
            name: 'Jogador Exemplo',
            email: 'exemplo@email.com',
            createdAt: new Date().toISOString(),
            stats: {
                math: { bestScore: 150 },
                color: { bestTime: 45 },
                puzzle: { bestMoves: 25 }
            }
        };
        
        window.currentUser = testUser;
        
        hideAuthModal();
        updateUI();
        showSection('games');
        
        // Mostrar notificação
        if (typeof showNotification === 'function') {
            showNotification('🎮 Login com usuário teste realizado! (SEM BD)', 'success');
        }
    }
    
    // CORREÇÃO AQUI: Nova função para mostrar mensagem de cadastro formatada
    function showRegisterSuccessMessage(message = 'Cadastro realizado com sucesso!') {
        if (registerFeedback) {
            registerFeedback.innerHTML = `
                <div class="register-success">
                    <strong><i class="fas fa-check-circle"></i> ${message}</strong><br>
                    <small>Redirecionando para os jogos...</small>
                </div>
            `;
            registerFeedback.style.color = '#155724';
            registerFeedback.style.backgroundColor = '#d4edda';
            registerFeedback.style.borderLeft = '4px solid #06D6A0';
            registerFeedback.style.padding = '0.8rem';
            registerFeedback.style.borderRadius = '5px';
        }
    }
    
    // Manipular cadastro
    function handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (password !== confirmPassword) {
            if (registerFeedback) {
                registerFeedback.innerHTML = `
                    <div class="login-error">
                        <strong><i class="fas fa-exclamation-circle"></i> As senhas não coincidem!</strong><br>
                        <small>Digite a mesma senha nos dois campos</small>
                    </div>
                `;
                registerFeedback.style.color = '#721c24';
                registerFeedback.style.backgroundColor = '#f8d7da';
                registerFeedback.style.borderLeft = '4px solid #e74c3c';
                registerFeedback.style.padding = '0.8rem';
                registerFeedback.style.borderRadius = '5px';
            }
            return;
        }
        
        if (password.length < 6) {
            if (registerFeedback) {
                registerFeedback.innerHTML = `
                    <div class="login-error">
                        <strong><i class="fas fa-exclamation-circle"></i> A senha deve ter pelo menos 6 caracteres!</strong><br>
                        <small>Use uma senha mais forte</small>
                    </div>
                `;
                registerFeedback.style.color = '#721c24';
                registerFeedback.style.backgroundColor = '#f8d7da';
                registerFeedback.style.borderLeft = '4px solid #e74c3c';
                registerFeedback.style.padding = '0.8rem';
                registerFeedback.style.borderRadius = '5px';
            }
            return;
        }
        
        const userData = { name, email, password };
        const result = DB.registerUser(userData);
        
        if (result.success) {
            // CORREÇÃO AQUI: Usar a nova função formatada
            showRegisterSuccessMessage(result.message);
            
            setTimeout(() => {
                DB.loginUser(email, password);
                hideAuthModal();
                updateUI();
                showSection('games');
                
                // Mostrar notificação de boas-vindas
                if (typeof showNotification === 'function') {
                    showNotification(`🎉 Bem-vindo, ${name}! Seu cadastro foi realizado com sucesso.`, 'success');
                }
            }, 1000);
        } else {
            if (registerFeedback) {
                registerFeedback.innerHTML = `
                    <div class="login-error">
                        <strong><i class="fas fa-exclamation-circle"></i> ${result.message}</strong><br>
                        <small>Tente novamente</small>
                    </div>
                `;
                registerFeedback.style.color = '#721c24';
                registerFeedback.style.backgroundColor = '#f8d7da';
                registerFeedback.style.borderLeft = '4px solid #e74c3c';
                registerFeedback.style.padding = '0.8rem';
                registerFeedback.style.borderRadius = '5px';
            }
        }
    }
    
    // Verificar se é usuário teste
    function isTestUser() {
        return window.currentUser && window.currentUser.email === 'exemplo@email.com';
    }
    
    // Manipular logout (compatível com usuário teste)
    function handleLogout() {
        // Verificar se é usuário teste
        if (isTestUser()) {
            // Usuário teste - limpar da memória
            if (typeof TestUserModule !== 'undefined' && typeof TestUserModule.simulateLogout === 'function') {
                TestUserModule.simulateLogout();
            }
            
            // Limpar variável global
            window.currentUser = null;
            
            // Mostrar mensagem
            if (typeof showNotification === 'function') {
                showNotification('👋 Usuário teste deslogado (dados em memória limpos)', 'info');
            }
        } else {
            // Usuário normal - usar DB
            DB.logoutUser();
        }
        
        updateUI();
        showSection('home');
    }
    
    // Atualizar interface do usuário (compatível com usuário teste)
    function updateUI() {
        // Primeiro verifica usuário teste na memória, depois no DB
        if (window.currentUser) {
            // Usuário está logado (pode ser teste ou normal)
            currentUser = window.currentUser;
            
            // Atualizar botões
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (profileLink) profileLink.classList.remove('hidden');
            
            // Atualizar perfil
            updateProfile();
            
            // Atualizar cards de jogos
            updateGameCards();
        } else {
            // Tentar pegar do DB
            currentUser = DB.getCurrentUser();
            
            if (currentUser) {
                // Usuário normal do DB
                if (loginBtn) loginBtn.classList.add('hidden');
                if (logoutBtn) logoutBtn.classList.remove('hidden');
                if (profileLink) profileLink.classList.remove('hidden');
                
                updateProfile();
                updateGameCards();
            } else {
                // Nenhum usuário logado
                if (loginBtn) loginBtn.classList.remove('hidden');
                if (logoutBtn) logoutBtn.classList.add('hidden');
                if (profileLink) profileLink.classList.add('hidden');
                
                resetProfile();
                resetGameCards();
            }
        }
    }
    
    // Atualizar informações do perfil (compatível com ambos)
    function updateProfile() {
        if (!currentUser) return;
        
        if (profileName) profileName.textContent = currentUser.name;
        if (profileEmail) profileEmail.textContent = currentUser.email;
        
        if (memberSince && currentUser.createdAt) {
            const createdDate = new Date(currentUser.createdAt);
            memberSince.textContent = `Membro desde ${createdDate.toLocaleDateString('pt-BR')}`;
        } else if (memberSince) {
            memberSince.textContent = 'Usuário de teste';
        }
        
        if (profileMathScore) profileMathScore.textContent = currentUser.stats?.math?.bestScore || '0';
        if (profileColorTime) profileColorTime.textContent = currentUser.stats?.color?.bestTime 
            ? `${currentUser.stats.color.bestTime}s` 
            : '-';
        if (profilePuzzleMoves) profilePuzzleMoves.textContent = currentUser.stats?.puzzle?.bestMoves || '-';
        
        if (profileRankPosition && currentUser.email) {
            const rank = DB.getUserRank('math', currentUser.email);
            profileRankPosition.textContent = rank ? `#${rank}` : '-';
        } else if (profileRankPosition) {
            profileRankPosition.textContent = '-';
        }
    }
    
    // Resetar informações do perfil
    function resetProfile() {
        if (profileName) profileName.textContent = 'Visitante';
        if (profileEmail) profileEmail.textContent = 'Faça login para ver seu perfil';
        if (memberSince) memberSince.textContent = '';
        if (profileMathScore) profileMathScore.textContent = '0';
        if (profileColorTime) profileColorTime.textContent = '-';
        if (profilePuzzleMoves) profilePuzzleMoves.textContent = '-';
        if (profileRankPosition) profileRankPosition.textContent = '-';
    }
    
    // Atualizar cards de jogos (compatível com ambos)
    function updateGameCards() {
        if (!currentUser) return;
        
        if (mathBestScore) mathBestScore.textContent = currentUser.stats?.math?.bestScore || '0';
        if (colorBestTime) colorBestTime.textContent = currentUser.stats?.color?.bestTime 
            ? `${currentUser.stats.color.bestTime}s` 
            : '-';
        if (puzzleBestMoves) puzzleBestMoves.textContent = currentUser.stats?.puzzle?.bestMoves || '-';
    }
    
    // Resetar cards de jogos
    function resetGameCards() {
        if (mathBestScore) mathBestScore.textContent = '0';
        if (colorBestTime) colorBestTime.textContent = '-';
        if (puzzleBestMoves) puzzleBestMoves.textContent = '-';
    }
    
    // Tornar funções públicas
    window.AuthModule = {
        init: init,
        showAuthModal: showAuthModal,
        hideAuthModal: hideAuthModal,
        updateUI: updateUI,
        updateProfile: updateProfile,
        updateGameCards: updateGameCards,
        isTestUser: isTestUser,
        showLoginSuccessMessage: showLoginSuccessMessage, // Nova função exportada
        showRegisterSuccessMessage: showRegisterSuccessMessage // Nova função exportada
    };
})();