document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DO DOM ---
    const loginPage = document.getElementById('login-page');
    const dashboardPage = document.getElementById('dashboard-page');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-button');

    // Navegação do Dashboard
    const navScheduleBtn = document.getElementById('nav-schedule');
    const navVehiclesBtn = document.getElementById('nav-vehicles'); // NEW
    const navGigaPediaBtn = document.getElementById('nav-giga-pedia');
    const scheduleSection = document.getElementById('schedule-section');
    const vehiclesSection = document.getElementById('vehicles-section'); // NEW
    const gigaPediaSection = document.getElementById('giga-pedia-section');

    // Agendamento
    const vehicleSelect = document.getElementById('vehicle-select');
    const vehicleImage = document.getElementById('vehicle-image');
    // const licensePlateInput = document.getElementById('license-plate'); // No longer needed directly for Agendamento form
    const scheduleDateInput = document.getElementById('schedule-date');
    const submitScheduleBtn = document.getElementById('submit-schedule-button');
    const appointmentsList = document.getElementById('appointments-list');
    const maintenanceHistory = document.getElementById('maintenance-history'); // NEW

    // Gerenciar Máquinas (NEW ELEMENTS)
    const newVehicleBrandInput = document.getElementById('new-vehicle-brand');
    const newVehicleModelInput = document.getElementById('new-vehicle-model');
    const newVehiclePlateInput = document.getElementById('new-vehicle-plate');
    const newVehicleImageUrlInput = document.getElementById('new-vehicle-image-url');
    const addVehicleButton = document.getElementById('add-vehicle-button');
    const myVehiclesList = document.getElementById('my-vehicles-list');

    // Giga-Pédia
    const searchBar = document.getElementById('search-bar');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');

    // --- DADOS SIMULADOS (Giga-Pédia continua sendo local) ---
    const gigaPediaData = {
        "óleo": "Use sempre óleo sintético de alta performance, 5W-30 para motores potentes. O óleo é o sangue do motor, não economize nisso.",
        "pneu": "Pneus de composto macio para aderência máxima. Calibragem: 32 PSI na frente, 30 PSI atrás para melhor tração. Inspecione por danos antes de acelerar forte.",
        "freio": "Barulho nos freios? Podem ser pastilhas gastas. Troque-as. Não brinque com o que te para. Fluido de freio deve ser trocado a cada 2 anos.",
        "motor": "O coração da máquina. Escute-o. Qualquer barulho estranho, investigue. Manutenção preventiva é o segredo da longevidade e da força bruta.",
        "hellcat": "Dodge Challenger Hellcat. Um V8 Supercharged que produz mais de 700 cavalos. Respeite o acelerador ou ele te morderá. Máquina de puro músculo.",
        "h2r": "Kawasaki Ninja H2R. A beast de pista com supercompressor. Não é legalizada para ruas. Aceleração que pode deslocar sua alma. Requer habilidade de um deus."
    };

    // --- FUNÇÕES DE API ---

    // Função genérica para fazer requisições à API
    async function callApi(method, url, data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            if (data) {
                options.body = JSON.stringify(data);
            }
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erro na requisição ${method} ${url}:`, error.message);
            alert(`FALHA NA OPERAÇÃO: ${error.message}`);
            throw error; // Re-throw para que o chamador possa lidar
        }
    }

    // --- VEÍCULOS ---
    async function fetchVehicles() {
        try {
            const vehicles = await callApi('GET', '/api/vehicles');
            populateVehicleSelect(vehicles);
            displayMyVehicles(vehicles);
        } catch (error) {
            console.error("Erro ao buscar veículos:", error);
            myVehiclesList.innerHTML = `<p class="error-message">FALHA AO CARREGAR MÁQUINAS: ${error.message}</p>`;
        }
    }

    function populateVehicleSelect(vehicles) {
        vehicleSelect.innerHTML = '<option value="">Selecione uma máquina</option>';
        vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle._id;
            option.textContent = `${vehicle.marca} ${vehicle.modelo} (${vehicle.placa})`;
            option.dataset.imageUrl = vehicle.imageUrl; // Armazena a URL da imagem no dataset
            vehicleSelect.appendChild(option);
        });
        // Tenta pré-selecionar o primeiro veículo ou define a imagem padrão
        if (vehicles.length > 0) {
            vehicleSelect.value = vehicles[0]._id;
            vehicleImage.src = vehicles[0].imageUrl || 'img/default-vehicle.jpg';
        } else {
            vehicleImage.src = 'img/default-vehicle.jpg';
        }
        // Dispara o evento change para carregar manutenções e agendamentos iniciais
        vehicleSelect.dispatchEvent(new Event('change'));
    }

    function displayMyVehicles(vehicles) {
        myVehiclesList.innerHTML = '';
        if (vehicles.length === 0) {
            myVehiclesList.innerHTML = '<p>NENHUMA MÁQUINA CADASTRADA. ADICIONE UMA!</p>';
            return;
        }
        vehicles.forEach(vehicle => {
            const vehicleCard = document.createElement('div');
            vehicleCard.classList.add('vehicle-card');
            vehicleCard.innerHTML = `
                <p><strong>Marca:</strong> ${vehicle.marca}</p>
                <p><strong>Modelo:</strong> ${vehicle.modelo}</p>
                <p><strong>Placa:</strong> ${vehicle.placa}</p>
                <button class="delete-vehicle-btn" data-id="${vehicle._id}">DELETAR</button>
            `;
            myVehiclesList.appendChild(vehicleCard);
        });

        // Adiciona event listeners para os botões de deletar
        myVehiclesList.querySelectorAll('.delete-vehicle-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const vehicleIdToDelete = e.target.dataset.id;
                if (confirm("TEM CERTEZA QUE DESEJA DELETAR ESTA MÁQUINA E TODOS OS SEUS REGISTROS?")) {
                    try {
                        await callApi('DELETE', `/api/vehicles/${vehicleIdToDelete}`);
                        alert("MÁQUINA DELETADA COM SUCESSO!");
                        fetchVehicles(); // Atualiza a lista de veículos
                    } catch (error) {
                        console.error("Erro ao deletar veículo:", error);
                    }
                }
            });
        });
    }

    // --- MANUTENÇÕES ---
    async function fetchMaintenanceHistory(vehicleId) {
        if (!vehicleId) {
            maintenanceHistory.innerHTML = '<p>Selecione um veículo para ver seu histórico de manutenções.</p>';
            return;
        }
        try {
            const maintenances = await callApi('GET', `/api/vehicles/${vehicleId}/maintenances`);
            displayMaintenanceHistory(maintenances);
        } catch (error) {
            console.error("Erro ao buscar histórico de manutenções:", error);
            maintenanceHistory.innerHTML = `<p class="error-message">FALHA AO CARREGAR HISTÓRICO: ${error.message}</p>`;
        }
    }

    function displayMaintenanceHistory(maintenances) {
        maintenanceHistory.innerHTML = '';
        if (maintenances.length === 0) {
            maintenanceHistory.innerHTML = '<p>NENHUM REGISTRO DE MANUTENÇÃO PARA ESTA MÁQUINA.</p>';
            return;
        }
        maintenances.forEach(maint => {
            const maintCard = document.createElement('div');
            maintCard.classList.add('maintenance-card');
            maintCard.innerHTML = `
                <p><strong>Data:</strong> ${new Date(maint.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                <p><strong>Serviços:</strong> ${maint.servicos.join(', ')}</p>
                <p><strong>Observações:</strong> ${maint.observacoes || 'N/A'}</p>
                <p><strong>Custo:</strong> R$ ${maint.custo ? maint.custo.toFixed(2) : '0.00'}</p>
            `;
            maintenanceHistory.appendChild(maintCard);
        });
    }

    // --- AGENDAMENTOS ---
    async function fetchAppointments() {
        try {
            const appointments = await callApi('GET', '/api/agendamentos');
            displayAppointments(appointments);
        } catch (error) {
            console.error("Erro ao buscar agendamentos:", error);
            appointmentsList.innerHTML = `<p class="error-message">FALHA AO CARREGAR AGENDAMENTOS: ${error.message}</p>`;
        }
    }

    function displayAppointments(appointments) {
        appointmentsList.innerHTML = ''; // Limpa agendamentos anteriores
        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<p>NENHUM AGENDAMENTO FORJADO AINDA.</p>';
            return;
        }
        appointments.forEach(appointment => {
            const appointmentCard = document.createElement('div');
            appointmentCard.classList.add('appointment-card');
            appointmentCard.innerHTML = `
                <div>
                    <p><strong>Máquina:</strong> ${appointment.veiculo.marca} ${appointment.veiculo.modelo} (${appointment.veiculo.placa})</p>
                    <p><strong>Serviços:</strong> ${appointment.servicos.join(', ')}</p>
                    <p><strong>Data:</strong> ${new Date(appointment.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                </div>
                <button class="delete-btn" data-id="${appointment._id}">EXCLUIR</button>
            `;
            appointmentsList.appendChild(appointmentCard);
        });

        // Adiciona event listeners para os botões de exclusão
        appointmentsList.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const appointmentIdToDelete = e.target.dataset.id;
                if (confirm("TEM CERTEZA QUE DESEJA EXCLUIR ESTE AGENDAMENTO?")) {
                    try {
                        await callApi('DELETE', `/api/agendamentos/${appointmentIdToDelete}`);
                        alert("AGENDAMENTO EXCLUÍDO COM SUCESSO!");
                        fetchAppointments(); // Atualiza a lista de agendamentos
                    } catch (error) {
                        console.error("Erro ao deletar agendamento:", error);
                    }
                }
            });
        });
    }


    // --- LÓGICA DE LOGIN ---
    loginForm.addEventListener('submit', async (e) => { // Made async
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            loginPage.classList.remove('active');
            dashboardPage.classList.add('active');
            welcomeMessage.textContent = `BEM-VINDO DE VOLTA, GIGA ${username.toUpperCase()}!`;
            // Carregar dados iniciais do dashboard
            await fetchVehicles(); // Fetch vehicles on login
            await fetchAppointments(); // Fetch appointments on login
        } else {
            alert("UM GIGA PRECISA DE UM NOME. DIGITE ALGO.");
        }
    });

    // --- LÓGICA DE LOGOUT ---
    logoutButton.addEventListener('click', () => {
        dashboardPage.classList.remove('active');
        loginPage.classList.add('active');
        usernameInput.value = ''; // Limpa o campo para o próximo Giga
        vehicleImage.src = 'img/default-vehicle.jpg'; // Reset vehicle image
        vehicleSelect.innerHTML = '<option value="">Selecione uma máquina</option>'; // Clear vehicle options
        appointmentsList.innerHTML = '<p>Buscando agendamentos forjados...</p>'; // Clear appointments
        maintenanceHistory.innerHTML = '<p>Selecione um veículo para ver seu histórico de manutenções.</p>'; // Clear maintenance history
    });

    // --- NAVEGAÇÃO DO DASHBOARD ---
    function activateSection(section) {
        // Desativa todas as seções e botões de navegação
        document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));

        // Ativa a seção e o botão correspondente
        if (section === 'schedule') {
            scheduleSection.classList.add('active');
            navScheduleBtn.classList.add('active');
        } else if (section === 'vehicles') { // NEW
            vehiclesSection.classList.add('active');
            navVehiclesBtn.classList.add('active');
            fetchVehicles(); // Refresh vehicles list when entering this section
        } else if (section === 'giga-pedia') {
            gigaPediaSection.classList.add('active');
            navGigaPediaBtn.classList.add('active');
        }
    }

    navScheduleBtn.addEventListener('click', () => activateSection('schedule'));
    navVehiclesBtn.addEventListener('click', () => activateSection('vehicles')); // NEW
    navGigaPediaBtn.addEventListener('click', () => activateSection('giga-pedia'));


    // --- LÓGICA DE AGENDAMENTO ---
    vehicleSelect.addEventListener('change', () => {
        const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
        const selectedVehicleId = selectedOption.value;
        const imageUrl = selectedOption.dataset.imageUrl;

        vehicleImage.src = imageUrl || 'img/default-vehicle.jpg';

        // Carregar histórico de manutenções para o veículo selecionado
        fetchMaintenanceHistory(selectedVehicleId);
    });

    submitScheduleBtn.addEventListener('click', async () => { // Made async
        const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
        const vehicleId = selectedOption.value;
        const vehicleName = selectedOption.textContent; // Para a mensagem de confirmação
        const date = scheduleDateInput.value;
        const selectedServices = Array.from(document.querySelectorAll('input[name="service"]:checked'))
                                      .map(cb => cb.value);

        if (!vehicleId) {
            alert("SELECIONE UMA MÁQUINA, GUERREIRO!");
            return;
        }

        if (!date || selectedServices.length === 0) {
            alert("PREENCHA TODOS OS CAMPOS, GUERREIRO! DATA E AO MENOS UM SERVIÇO SÃO OBRIGATÓRIOS.");
            return;
        }

        try {
            const newAppointment = await callApi('POST', '/api/agendamentos', {
                vehicleId,
                selectedServices,
                date
            });

            const confirmationMessage = `
                AGENDAMENTO FORJADO!

                MÁQUINA: ${vehicleName}
                SERVIÇOS DE GUERRA: ${newAppointment.servicos.join(', ')}
                DIA DO JULGAMENTO: ${new Date(newAppointment.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}

                ESTAREMOS PRONTOS.
            `;
            alert(confirmationMessage);

            // Limpar campos após agendamento
            // licensePlateInput.value = ''; // No longer exists in the form
            scheduleDateInput.value = '';
            document.querySelectorAll('input[name="service"]:checked').forEach(cb => cb.checked = false);
            fetchAppointments(); // Atualiza a lista de agendamentos
        } catch (error) {
            console.error("Erro ao agendar:", error);
        }
    });

    // --- LÓGICA DE GERENCIAR MÁQUINAS ---
    addVehicleButton.addEventListener('click', async () => {
        const brand = newVehicleBrandInput.value.trim();
        const model = newVehicleModelInput.value.trim();
        const plate = newVehiclePlateInput.value.trim().toUpperCase();
        const imageUrl = newVehicleImageUrlInput.value.trim();

        if (!brand || !model || !plate) {
            alert("MARCA, MODELO E PLACA SÃO OBRIGATÓRIOS PARA CADASTRAR UMA NOVA MÁQUINA!");
            return;
        }

        try {
            await callApi('POST', '/api/vehicles', {
                marca: brand,
                modelo: model,
                placa: plate,
                imageUrl: imageUrl || 'img/default-vehicle.jpg' // Usa imagem padrão se não fornecida
            });
            alert("NOVA MÁQUINA CADASTRADA COM SUCESSO!");
            newVehicleBrandInput.value = '';
            newVehicleModelInput.value = '';
            newVehiclePlateInput.value = '';
            newVehicleImageUrlInput.value = '';
            fetchVehicles(); // Atualiza as listas de veículos
        } catch (error) {
            console.error("Erro ao adicionar veículo:", error);
        }
    });

    // --- LÓGICA DA GIGA-PÉDIA ---
    searchButton.addEventListener('click', () => {
        const query = searchBar.value.trim().toLowerCase();
        let resultFound = false;

        if (!query) {
            searchResults.innerHTML = "DIGITE ALGO PARA ANIQUILAR SUA DÚVIDA.";
            return;
        }

        searchResults.innerHTML = ""; // Limpa resultados anteriores

        for (const key in gigaPediaData) {
            // Check if the query is directly in the key or if the key is in the query
            if (query.includes(key) || key.includes(query)) {
                searchResults.innerHTML = `<strong>${key.toUpperCase()}:</strong><p>${gigaPediaData[key]}</p>`;
                resultFound = true;
                break;
            }
        }

        if (!resultFound) {
            searchResults.innerHTML = "ESSA INFORMAÇÃO É FRACA DEMAIS PARA A GIGA-PÉDIA. TENTE OUTRA COISA MAIS RELEVANTE.";
        }
    });

    // Inicialização - carrega veículos e agendamentos ao carregar a página (se já logado)
    // No seu caso, o login é o gatilho, então essas chamadas devem estar dentro do listener de login
    // Ou você pode adicionar uma verificação de sessão se já estiver implementado.
    // Por enquanto, farei com que o login seja o ponto de entrada principal para carregar dados.
});