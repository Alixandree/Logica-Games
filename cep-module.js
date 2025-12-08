// Módulo de API CEP - Versão Separada e Modular
(function() {
    'use strict';
    
    // Configurações
    const CONFIG = {
        VIA_CEP_API: 'https://viacep.com.br/ws',
        FEEDBACK_TIMEOUT: 5000
    };
    
    // Estado
    let userAddress = null;
    let currentUser = null;
    
    // Elementos DOM
    let elements = {};
    
    // Templates
    let templates = {};
    
    // ============ FUNÇÃO CRÍTICA ============
    // Obter chave de armazenamento única por usuário
    function getUserStorageKey(user = null) {
        const userToCheck = user || currentUser || window.currentUser;
        
        if (userToCheck && userToCheck.email) {
            return `userAddress_${userToCheck.email}`;
        }
        // Para visitantes, usar sessão atual
        else {
            const sessionId = sessionStorage.getItem('guestSessionId') || 
                             `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('guestSessionId', sessionId);
            return `userAddress_${sessionId}`;
        }
    }
    // ========================================
    
    // Inicializar módulo
    function init() {
        console.log('📍 Módulo de CEP inicializado');
        
        // Carregar templates
        loadTemplates();
        
        // Configurar eventos globais
        setupGlobalEvents();
        
        return {
            renderAddressSection: renderAddressSection,
            getUserAddress: () => userAddress,
            getFormattedAddress: getFormattedAddress,
            getUserStorageKey: getUserStorageKey,
            loadUserAddress: loadUserAddress
        };
    }
    
    // Carregar templates do DOM
    function loadTemplates() {
        templates = {
            addressForm: document.getElementById('addressFormTemplate'),
            addressView: document.getElementById('addressViewTemplate'),
            addressGuest: document.getElementById('addressGuestTemplate')
        };
        
        if (!templates.addressForm) {
            console.warn('Templates não encontrados, criando fallback...');
            createFallbackTemplates();
        }
    }
    
    // Criar templates de fallback
    function createFallbackTemplates() {
        templates = {
            addressForm: document.createElement('template'),
            addressView: document.createElement('template'),
            addressGuest: document.createElement('template')
        };
        
        templates.addressForm.innerHTML = `
            <div class="address-form">
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="userCEP"><i class="fas fa-search-location"></i> CEP</label>
                        <div class="cep-input-group">
                            <input type="text" id="userCEP" placeholder="00000-000" maxlength="9">
                            <button type="button" id="searchCEP" class="btn btn-small">
                                <i class="fas fa-search"></i> Buscar
                            </button>
                        </div>
                        <small class="cep-hint">Digite o CEP para buscar o endereço automaticamente</small>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group" style="flex: 3;">
                        <label for="userStreet">Rua/Avenida</label>
                        <input type="text" id="userStreet" placeholder="Nome da rua">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="userNumber">Número</label>
                        <input type="text" id="userNumber" placeholder="123">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="userComplement">Complemento</label>
                        <input type="text" id="userComplement" placeholder="Apto 101">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="userNeighborhood">Bairro</label>
                        <input type="text" id="userNeighborhood" placeholder="Centro">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group" style="flex: 2;">
                        <label for="userCity">Cidade</label>
                        <input type="text" id="userCity" placeholder="Cidade">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="userState">Estado</label>
                        <select id="userState">
                            <option value="">UF</option>
                            <option value="AC">AC</option>
                            <option value="AL">AL</option>
                            <option value="AP">AP</option>
                            <option value="AM">AM</option>
                            <option value="BA">BA</option>
                            <option value="CE">CE</option>
                            <option value="DF">DF</option>
                            <option value="ES">ES</option>
                            <option value="GO">GO</option>
                            <option value="MA">MA</option>
                            <option value="MT">MT</option>
                            <option value="MS">MS</option>
                            <option value="MG">MG</option>
                            <option value="PA">PA</option>
                            <option value="PB">PB</option>
                            <option value="PR">PR</option>
                            <option value="PE">PE</option>
                            <option value="PI">PI</option>
                            <option value="RJ">RJ</option>
                            <option value="RN">RN</option>
                            <option value="RS">RS</option>
                            <option value="RO">RO</option>
                            <option value="RR">RR</option>
                            <option value="SC">SC</option>
                            <option value="SP">SP</option>
                            <option value="SE">SE</option>
                            <option value="TO">TO</option>
                        </select>
                    </div>
                </div>
                
                <div class="address-actions">
                    <button type="button" id="saveAddress" class="btn btn-primary">
                        <i class="fas fa-save"></i> Salvar Endereço
                    </button>
                    <button type="button" id="clearAddress" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Limpar
                    </button>
                </div>
                
                <div id="addressFeedback" class="address-feedback"></div>
            </div>
        `;
        
        templates.addressView.innerHTML = `
            <div class="address-saved">
                <h5><i class="fas fa-check-circle" style="color: #06D6A0;"></i> Endereço Cadastrado</h5>
                <div class="address-details" id="addressDisplay"></div>
                <button type="button" id="editAddress" class="btn address-edit-btn">
                    <i class="fas fa-edit"></i> Editar Endereço
                </button>
            </div>
        `;
        
        templates.addressGuest.innerHTML = `
            <div class="address-form">
                <p style="color: #7f8c8d; text-align: center; padding: 1rem;">
                    <i class="fas fa-info-circle"></i> 
                    Faça login ou cadastre-se para salvar seu endereço permanentemente.
                </p>
                <div class="address-actions" style="justify-content: center;">
                    <button type="button" id="loginToSaveAddress" class="btn btn-primary">
                        <i class="fas fa-user-plus"></i> Criar Conta
                    </button>
                </div>
            </div>
        `;
    }
    
    // Configurar eventos globais
    function setupGlobalEvents() {
        // Observar mudanças no usuário
        observeUserChanges();
    }
    
    // Observar mudanças no usuário
    function observeUserChanges() {
        // Monitorar mudanças no usuário global
        let lastUserEmail = window.currentUser?.email;
        
        setInterval(() => {
            const currentEmail = window.currentUser?.email;
            if (currentEmail !== lastUserEmail) {
                console.log(`👤 Mudança de usuário detectada: ${lastUserEmail} → ${currentEmail}`);
                lastUserEmail = currentEmail;
                
                // Recarregar endereço para o novo usuário
                loadUserAddress();
            }
        }, 1000);
    }
    
    // Carregar endereço do usuário
    function loadUserAddress(user = null) {
        try {
            // Atualizar usuário atual
            currentUser = user || window.currentUser;
            
            // Obter chave única para este usuário
            const storageKey = getUserStorageKey(currentUser);
            
            // Limpar endereço anterior
            userAddress = null;
            
            // Buscar do localStorage
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                userAddress = JSON.parse(saved);
            }
            
            return userAddress;
        } catch (error) {
            console.error('❌ Erro ao carregar endereço:', error);
            userAddress = null;
            return null;
        }
    }
    
    // Renderizar seção de endereço
    function renderAddressSection(containerId, userData = null, isGuest = false) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} não encontrado`);
            return;
        }
        
        // Atualizar usuário atual
        currentUser = userData || window.currentUser;
        
        // CARREGAR ENDEREÇO ESPECÍFICO DESTE USUÁRIO
        loadUserAddress(currentUser);
        
        // Limpar container
        container.innerHTML = '';
        
        // Adicionar título
        const title = document.createElement('h4');
        title.innerHTML = '<i class="fas fa-map-marker-alt"></i> Endereço';
        container.appendChild(title);
        
        // Adicionar conteúdo
        const contentDiv = document.createElement('div');
        contentDiv.id = 'addressContent';
        container.appendChild(contentDiv);
        
        // LÓGICA CORRETA PARA MOSTRAR CONTEÚDO ADEQUADO
        if (isGuest) {
            renderGuestAddress(contentDiv);
        } 
        else if (currentUser && userAddress) {
            renderSavedAddress(contentDiv);
        } 
        else if (currentUser && !userAddress) {
            renderAddressForm(contentDiv);
        } 
        else {
            renderAddressForm(contentDiv);
        }
        
        // Configurar eventos
        setTimeout(() => setupAddressEvents(), 50);
    }
    
    // Renderizar formulário de endereço
    function renderAddressForm(container) {
        if (!templates.addressForm) {
            console.error('Template do formulário não encontrado');
            return;
        }
        
        const clone = templates.addressForm.content.cloneNode(true);
        container.appendChild(clone);
        
        // Preencher com dados existentes se houver
        if (userAddress) {
            fillAddressForm(userAddress);
        }
    }
    
    // Renderizar endereço salvo
    function renderSavedAddress(container) {
        if (!templates.addressView) {
            console.error('Template de visualização não encontrado');
            return;
        }
        
        const clone = templates.addressView.content.cloneNode(true);
        container.appendChild(clone);
        
        // Preencher detalhes do endereço
        const addressDisplay = container.querySelector('#addressDisplay');
        if (addressDisplay && userAddress) {
            addressDisplay.innerHTML = formatAddressForDisplay(userAddress);
        }
    }
    
    // Renderizar endereço para visitante
    function renderGuestAddress(container) {
        if (!templates.addressGuest) {
            console.error('Template de visitante não encontrado');
            return;
        }
        
        const clone = templates.addressGuest.content.cloneNode(true);
        container.appendChild(clone);
    }
    
    // Configurar eventos do endereço
    function setupAddressEvents() {
        elements = {
            cepInput: document.getElementById('userCEP'),
            searchBtn: document.getElementById('searchCEP'),
            streetInput: document.getElementById('userStreet'),
            numberInput: document.getElementById('userNumber'),
            complementInput: document.getElementById('userComplement'),
            neighborhoodInput: document.getElementById('userNeighborhood'),
            cityInput: document.getElementById('userCity'),
            stateSelect: document.getElementById('userState'),
            saveBtn: document.getElementById('saveAddress'),
            clearBtn: document.getElementById('clearAddress'),
            editBtn: document.getElementById('editAddress'),
            loginBtn: document.getElementById('loginToSaveAddress'),
            feedback: document.getElementById('addressFeedback')
        };
        
        if (elements.cepInput) {
            elements.cepInput.addEventListener('input', formatCEP);
            elements.cepInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') searchCEP();
            });
        }
        
        if (elements.searchBtn) {
            elements.searchBtn.addEventListener('click', searchCEP);
        }
        
        if (elements.saveBtn) {
            elements.saveBtn.addEventListener('click', saveAddress);
        }
        
        if (elements.clearBtn) {
            elements.clearBtn.addEventListener('click', clearAddress);
        }
        
        if (elements.editBtn) {
            elements.editBtn.addEventListener('click', () => {
                // Chamar função de edição global
                if (window.editAddress) {
                    window.editAddress();
                } else {
                    // Fallback: recarregar formulário
                    const contentDiv = document.getElementById('addressContent');
                    if (contentDiv) {
                        contentDiv.innerHTML = '';
                        renderAddressForm(contentDiv);
                        setTimeout(() => setupAddressEvents(), 50);
                    }
                }
            });
        }
        
        if (elements.loginBtn) {
            elements.loginBtn.addEventListener('click', () => {
                if (window.AuthModule && window.AuthModule.showAuthModal) {
                    window.AuthModule.showAuthModal();
                } else if (window.showAuthModalIfAvailable) {
                    window.showAuthModalIfAvailable();
                }
            });
        }
    }
    
    // Formatar CEP
    function formatCEP() {
        if (!elements.cepInput) return;
        
        let value = elements.cepInput.value.replace(/\D/g, '');
        
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        
        elements.cepInput.value = value;
    }
    
    // Buscar CEP na API
    async function searchCEP() {
        if (!elements.cepInput || !elements.searchBtn) return;
        
        const cep = elements.cepInput.value.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            showFeedback('⚠️ Digite um CEP válido (8 dígitos)', 'warning');
            elements.cepInput.focus();
            return;
        }
        
        elements.searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        elements.searchBtn.disabled = true;
        showFeedback('🔍 Buscando endereço...', 'info');
        
        try {
            const response = await fetch(`${CONFIG.VIA_CEP_API}/${cep}/json/`);
            
            if (!response.ok) throw new Error('Erro na requisição');
            
            const data = await response.json();
            
            if (data.erro) {
                showFeedback('❌ CEP não encontrado. Verifique e tente novamente.', 'error');
                elements.cepInput.focus();
            } else {
                if (elements.streetInput) elements.streetInput.value = data.logradouro || '';
                if (elements.neighborhoodInput) elements.neighborhoodInput.value = data.bairro || '';
                if (elements.cityInput) elements.cityInput.value = data.localidade || '';
                if (elements.stateSelect) elements.stateSelect.value = data.uf || '';
                
                if (elements.numberInput) elements.numberInput.focus();
                
                showFeedback('✅ Endereço encontrado! Complete o número e complemento.', 'success');
            }
        } catch (error) {
            console.error('❌ Erro na busca do CEP:', error);
            showFeedback('❌ Erro ao buscar CEP. Tente novamente mais tarde.', 'error');
        } finally {
            if (elements.searchBtn) {
                elements.searchBtn.innerHTML = '<i class="fas fa-search"></i> Buscar';
                elements.searchBtn.disabled = false;
            }
        }
    }
    
    // Salvar endereço
    function saveAddress() {
        const address = {
            cep: elements.cepInput ? elements.cepInput.value : '',
            street: elements.streetInput ? elements.streetInput.value : '',
            number: elements.numberInput ? elements.numberInput.value : '',
            complement: elements.complementInput ? elements.complementInput.value : '',
            neighborhood: elements.neighborhoodInput ? elements.neighborhoodInput.value : '',
            city: elements.cityInput ? elements.cityInput.value : '',
            state: elements.stateSelect ? elements.stateSelect.value : '',
            savedAt: new Date().toISOString(),
            savedBy: currentUser?.email || 'unknown'
        };
        
        // Validação
        if (!address.cep || !address.street || !address.number || !address.city || !address.state) {
            showFeedback('⚠️ Preencha pelo menos CEP, Rua, Número, Cidade e Estado', 'warning');
            return;
        }
        
        try {
            // OBTER CHAVE ÚNICA PARA ESTE USUÁRIO
            const storageKey = getUserStorageKey();
            
            // Salvar no localStorage
            localStorage.setItem(storageKey, JSON.stringify(address));
            
            // Atualizar estado
            userAddress = address;
            
            // Atualizar usuário na memória
            if (currentUser) {
                currentUser.address = address;
                if (window.currentUser && window.currentUser.email === currentUser.email) {
                    window.currentUser.address = address;
                }
            }
            
            showFeedback('✅ Endereço salvo com sucesso!', 'success');
            
            // ATUALIZAR A TELA PARA MOSTRAR O ENDEREÇO SALVO
            setTimeout(() => {
                const contentDiv = document.getElementById('addressContent');
                if (contentDiv) {
                    contentDiv.innerHTML = '';
                    renderSavedAddress(contentDiv);
                    setTimeout(() => setupAddressEvents(), 50);
                }
            }, 1500);
            
        } catch (error) {
            console.error('❌ Erro ao salvar endereço:', error);
            showFeedback('❌ Erro ao salvar endereço', 'error');
        }
    }
    
    // Limpar endereço
    function clearAddress() {
        if (!confirm('Tem certeza que deseja limpar o endereço?')) return;
        
        // Limpar campos
        if (elements.cepInput) elements.cepInput.value = '';
        if (elements.streetInput) elements.streetInput.value = '';
        if (elements.numberInput) elements.numberInput.value = '';
        if (elements.complementInput) elements.complementInput.value = '';
        if (elements.neighborhoodInput) elements.neighborhoodInput.value = '';
        if (elements.cityInput) elements.cityInput.value = '';
        if (elements.stateSelect) elements.stateSelect.value = '';
        
        // REMOVER ENDEREÇO DESTE USUÁRIO ESPECÍFICO
        const storageKey = getUserStorageKey();
        localStorage.removeItem(storageKey);
        
        // Limpar estado
        userAddress = null;
        if (currentUser) {
            delete currentUser.address;
            if (window.currentUser && window.currentUser.email === currentUser.email) {
                delete window.currentUser.address;
            }
        }
        
        showFeedback('🗑️ Endereço removido', 'info');
    }
    
    // Preencher formulário com endereço
    function fillAddressForm(address) {
        if (!address || !elements) return;
        
        if (elements.cepInput) elements.cepInput.value = address.cep || '';
        if (elements.streetInput) elements.streetInput.value = address.street || '';
        if (elements.numberInput) elements.numberInput.value = address.number || '';
        if (elements.complementInput) elements.complementInput.value = address.complement || '';
        if (elements.neighborhoodInput) elements.neighborhoodInput.value = address.neighborhood || '';
        if (elements.cityInput) elements.cityInput.value = address.city || '';
        if (elements.stateSelect) elements.stateSelect.value = address.state || '';
    }
    
    // Formatar endereço para exibição
    function formatAddressForDisplay(address) {
        if (!address) return '';
        
        let html = '';
        
        if (address.street) {
            html += `<div class="address-line"><strong>Rua:</strong> ${address.street}, ${address.number || ''}</div>`;
            if (address.complement) html += `<div class="address-line"><strong>Complemento:</strong> ${address.complement}</div>`;
        }
        
        if (address.neighborhood) html += `<div class="address-line"><strong>Bairro:</strong> ${address.neighborhood}</div>`;
        if (address.city && address.state) {
            html += `<div class="address-line"><strong>Cidade/UF:</strong> ${address.city} - ${address.state}</div>`;
        }
        
        if (address.cep) html += `<div class="address-line"><strong>CEP:</strong> ${address.cep}</div>`;
        
        if (address.savedAt) {
            const date = new Date(address.savedAt);
            html += `<div class="address-line"><small><em>Salvo em: ${date.toLocaleDateString('pt-BR')}</em></small></div>`;
        }
        
        return html;
    }
    
    // Obter endereço formatado
    function getFormattedAddress() {
        if (!userAddress) return 'Nenhum endereço cadastrado';
        return formatAddressForDisplay(userAddress);
    }
    
    // Mostrar feedback
    function showFeedback(message, type = 'info') {
        if (!elements.feedback) return;
        
        elements.feedback.textContent = message;
        elements.feedback.className = 'address-feedback';
        elements.feedback.classList.add(type);
        
        if (type !== 'info') {
            setTimeout(() => {
                if (elements.feedback) {
                    elements.feedback.textContent = '';
                    elements.feedback.className = 'address-feedback';
                }
            }, CONFIG.FEEDBACK_TIMEOUT);
        }
    }
    
    // Inicializar e exportar
    window.CEPModule = init();
    
})();