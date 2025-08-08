document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3001/api'; // Certifique-se que a porta está correta

    // Elementos do DOM
    const vehicleList = document.getElementById('vehicle-list');
    const btnAddVehicle = document.getElementById('btn-add-vehicle');
    const vehicleModal = document.getElementById('vehicle-modal');
    const closeModalBtn = vehicleModal.querySelector('.close-modal-btn');
    const vehicleForm = document.getElementById('vehicle-form');
    const modalTitle = document.getElementById('modal-title');

    // Mapeamento de tipos para imagens (exemplo)
    const vehicleImages = {
        CARRO: 'placeholder-car.png',
        MOTO: 'placeholder-moto.png',
        CARRO_ESPORTIVO: 'placeholder-sport.png',
        DEFAULT: 'placeholder-default.png'
    };
    
    // --- FUNÇÕES ---

    // Função para buscar e renderizar veículos
    const fetchAndRenderVehicles = async () => {
        try {
            const response = await fetch(`${API_URL}/veiculos`);
            if (!response.ok) throw new Error('Falha ao buscar veículos.');
            const vehicles = await response.json();
            
            vehicleList.innerHTML = ''; // Limpa a lista antes de renderizar
            if(vehicles.length === 0){
                vehicleList.innerHTML = '<p>Nenhum veículo cadastrado ainda.</p>';
            }

            vehicles.forEach(vehicle => {
                const proximaRevisao = new Date(vehicle.proximaRevisao);
                const dataFormatada = proximaRevisao.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

                const card = document.createElement('div');
                card.className = 'vehicle-card';
                card.dataset.id = vehicle._id; // Armazena o ID do veículo
                
                // Adiciona todos os dados como atributos para fácil acesso na edição
                Object.keys(vehicle).forEach(key => {
                    card.dataset[key] = vehicle[key];
                });

                card.innerHTML = `
                    <img src="${vehicleImages[vehicle.tipo] || vehicleImages.DEFAULT}" alt="${vehicle.modelo}">
                    <h3>${vehicle.modelo}</h3>
                    <p><strong>Placa:</strong> ${vehicle.placa}</p>
                    <p><strong>Ano:</strong> ${vehicle.ano}</p>
                    <p><strong>Tipo:</strong> ${vehicle.tipo.replace('_', ' ')}</p>
                    <p><strong>Próxima Revisão:</strong> ${dataFormatada}</p>
                    <div class="vehicle-card-actions">
                        <button class="btn-edit button-secondary">Editar</button>
                        <button class="btn-delete button-danger">Remover</button>
                    </div>
                `;
                vehicleList.appendChild(card);
            });
        } catch (error) {
            console.error('Erro:', error);
            vehicleList.innerHTML = '<p class="error-message">Não foi possível carregar os veículos.</p>';
        }
    };

    // Abre o modal
    const openModal = () => vehicleModal.style.display = 'block';
    // Fecha o modal
    const closeModal = () => vehicleModal.style.display = 'none';

    // Prepara o modal para ADICIONAR um veículo
    const setupAddModal = () => {
        modalTitle.textContent = 'Adicionar Novo Veículo';
        vehicleForm.reset();
        document.getElementById('vehicle-id').value = '';
        openModal();
    };

    // Prepara o modal para EDITAR um veículo
    const setupEditModal = (card) => {
        modalTitle.textContent = 'Editar Veículo';
        vehicleForm.reset();
        
        // Formata a data para o input type="date" (YYYY-MM-DD)
        const date = new Date(card.dataset.proximarevisao);
        const formattedDate = date.toISOString().split('T')[0];

        // Preenche o formulário com os dados do card
        document.getElementById('vehicle-id').value = card.dataset.id;
        document.getElementById('placa').value = card.dataset.placa;
        document.getElementById('modelo').value = card.dataset.modelo;
        document.getElementById('ano').value = card.dataset.ano;
        document.getElementById('tipo').value = card.dataset.tipo;
        document.getElementById('proximaRevisao').value = formattedDate;
        
        openModal();
    };
    
    // Deleta um veículo
    const deleteVehicle = async (id) => {
        if (!confirm('Tem certeza que deseja remover este veículo?')) return;
        
        try {
            const response = await fetch(`${API_URL}/veiculos/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao remover veículo.');
            
            alert('Veículo removido com sucesso!');
            fetchAndRenderVehicles(); // Atualiza a lista
        } catch(error) {
            console.error('Erro ao deletar:', error);
            alert('Ocorreu um erro ao remover o veículo.');
        }
    };
    

    // --- EVENT LISTENERS ---

    // Botão para abrir o modal de ADICIONAR
    btnAddVehicle.addEventListener('click', setupAddModal);

    // Botões de fechar modal
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === vehicleModal) closeModal();
    });

    // Submissão do formulário (Criação ou Edição)
    vehicleForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = document.getElementById('vehicle-id').value;
        const vehicleData = {
            placa: document.getElementById('placa').value.toUpperCase(),
            modelo: document.getElementById('modelo').value,
            ano: document.getElementById('ano').value,
            tipo: document.getElementById('tipo').value,
            proximaRevisao: document.getElementById('proximaRevisao').value,
        };

        const isEditing = !!id;
        const url = isEditing ? `${API_URL}/veiculos/${id}` : `${API_URL}/veiculos`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehicleData),
            });

            const result = await response.json();

            if (!response.ok) {
                 // Usa a mensagem de erro do servidor
                throw new Error(result.message || `Falha ao ${isEditing ? 'atualizar' : 'criar'} veículo.`);
            }

            alert(`Veículo ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
            closeModal();
            fetchAndRenderVehicles(); // Atualiza a lista
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert(`Erro: ${error.message}`);
        }
    });
    
    // Listener para os botões de EDITAR e DELETAR (delegação de evento)
    vehicleList.addEventListener('click', (event) => {
        const target = event.target;
        const card = target.closest('.vehicle-card');
        
        if (!card) return;

        if (target.classList.contains('btn-edit')) {
            setupEditModal(card);
        } else if (target.classList.contains('btn-delete')) {
            deleteVehicle(card.dataset.id);
        }
    });

    // Carregamento inicial
    fetchAndRenderVehicles();
});

document.addEventListener('DOMContentLoaded', () => {
    // URL base da sua API
    const API_URL = 'http://localhost:3001/api';

    // --- Seletores do DOM ---
    const vehicleList = document.getElementById('vehicle-list');
    const addVehicleBtn = document.getElementById('add-vehicle-btn');
    const vehicleModal = document.getElementById('vehicle-modal');
    const closeModalBtn = vehicleModal.querySelector('.close-modal-btn');
    const vehicleForm = document.getElementById('vehicle-form');
    const modalTitle = document.getElementById('modal-title');
    const vehicleIdInput = document.getElementById('vehicle-id');

    // --- Funções ---

    /**
     * READ: Busca todos os veículos da API e os renderiza na tela.
     */
    const fetchAndRenderVehicles = async () => {
        try {
            const response = await fetch(`${API_URL}/veiculos`);
            if (!response.ok) throw new Error('Falha ao carregar veículos.');
            
            const vehicles = await response.json();
            vehicleList.innerHTML = ''; // Limpa a lista atual

            if (vehicles.length === 0) {
                vehicleList.innerHTML = '<p>Nenhum veículo cadastrado. Clique em "Adicionar Veículo" para começar.</p>';
                return;
            }

            vehicles.forEach(vehicle => {
                const card = createVehicleCard(vehicle);
                vehicleList.appendChild(card);
            });
        } catch (error) {
            vehicleList.innerHTML = `<p class="error-message">${error.message}</p>`;
        }
    };

    /**
     * Cria o HTML de um card de veículo.
     * @param {object} vehicle - O objeto do veículo vindo da API.
     * @returns {HTMLElement} O elemento do card.
     */
    const createVehicleCard = (vehicle) => {
        const card = document.createElement('div');
        card.className = 'vehicle-card';
        card.dataset.id = vehicle._id; // Guarda o ID do MongoDB no elemento

        // Formata a data para exibição
        const proximaRevisao = new Date(vehicle.proximaRevisao).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

        card.innerHTML = `
            <h3>${vehicle.modelo}</h3>
            <p><strong>Placa:</strong> ${vehicle.placa}</p>
            <p><strong>Tipo:</strong> ${vehicle.tipo.replace('_', ' ')}</p>
            <p><strong>Ano:</strong> ${vehicle.ano}</p>
            <p><strong>Próxima Revisão:</strong> ${proximaRevisao}</p>
            <div class="vehicle-card-actions">
                <button class="button-secondary edit-btn">Editar</button>
                <button class="button-danger delete-btn">Deletar</button>
            </div>
        `;

        // Adiciona os event listeners para os botões do card
        card.querySelector('.edit-btn').addEventListener('click', () => openEditModal(vehicle));
        card.querySelector('.delete-btn').addEventListener('click', () => deleteVehicle(vehicle._id));

        return card;
    };
    
    /**
     * DELETE: Deleta um veículo pelo seu ID.
     * @param {string} id - O ID do veículo a ser deletado.
     */
    const deleteVehicle = async (id) => {
        if (!confirm('Tem certeza de que deseja deletar este veículo?')) return;

        try {
            const response = await fetch(`${API_URL}/veiculos/${id}`, { method: 'DELETE' });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao deletar o veículo.');
            }
            
            alert('Veículo deletado com sucesso!');
            fetchAndRenderVehicles(); // Atualiza a lista
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    // --- Funções do Modal ---

    const openModal = () => vehicleModal.style.display = 'block';
    const closeModal = () => vehicleModal.style.display = 'none';

    // Abre o modal para ADICIONAR um novo veículo
    const openAddModal = () => {
        modalTitle.textContent = 'Adicionar Novo Veículo';
        vehicleForm.reset();
        vehicleIdInput.value = ''; // Garante que o ID está limpo
        openModal();
    };

    // Abre o modal para EDITAR um veículo existente
    const openEditModal = (vehicle) => {
        modalTitle.textContent = 'Editar Veículo';
        vehicleForm.reset();
        
        // Preenche o formulário com os dados do veículo
        vehicleIdInput.value = vehicle._id;
        document.getElementById('placa').value = vehicle.placa;
        document.getElementById('modelo').value = vehicle.modelo;
        document.getElementById('ano').value = vehicle.ano;
        document.getElementById('tipo').value = vehicle.tipo;
        // Formata a data para o input type="date" (YYYY-MM-DD)
        document.getElementById('proximaRevisao').value = new Date(vehicle.proximaRevisao).toISOString().split('T')[0];
        
        openModal();
    };

    // --- Event Listeners ---

    // Botão para abrir o modal de adicionar
    addVehicleBtn.addEventListener('click', openAddModal);

    // Botões para fechar o modal
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === vehicleModal) closeModal();
    });

    // Submissão do formulário (CREATE ou UPDATE)
    vehicleForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = vehicleIdInput.value;
        const isEditing = !!id;

        const formData = new FormData(vehicleForm);
        const vehicleData = Object.fromEntries(formData.entries());

        const url = isEditing ? `${API_URL}/veiculos/${id}` : `${API_URL}/veiculos`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehicleData),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Ocorreu um erro.');
            }

            alert(`Veículo ${isEditing ? 'atualizado' : 'salvo'} com sucesso!`);
            closeModal();
            fetchAndRenderVehicles();
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    });

    // Carregamento inicial dos veículos
    fetchAndRenderVehicles();
});