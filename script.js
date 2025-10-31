document.addEventListener('DOMContentLoaded', () => {
    // --- CHAVE DA API (MUITO IMPORTANTE) ---
    const API_KEY = '047d908c8e486447a52e9344fb8b17d4'; // IMPORTANTE: Substitua pela sua chave da OpenWeatherMap

    // --- ELEMENTOS DO DOM: Veículos e Manutenção ---
    const vehicleListDiv = document.getElementById('vehicle-list');
    const addMaintenanceForm = document.getElementById('add-maintenance-form');
    const maintenanceVehicleSelect = document.getElementById('maintenance-vehicle');
    const maintenanceDescriptionInput = document.getElementById('maintenance-description');
    const maintenanceDateInput = document.getElementById('maintenance-date');
    const maintenanceListUl = document.getElementById('maintenance-list');

    // --- ELEMENTOS DO DOM: Previsão Avançada ---
    const cityInput = document.getElementById('city-input');
    const fetchWeatherBtn = document.getElementById('fetch-weather-btn');
    const forecastContainer = document.getElementById('forecast-container');
    const loadingWeatherP = document.getElementById('loading-weather');
    const weatherErrorP = document.getElementById('weather-error');
    const forecastDaysSelector = document.getElementById('forecast-days-selector');
    const tempUnitSelector = document.getElementById('temperature-unit-selector');

    // --- ELEMENTOS DO DOM: Consulta Rápida ---
    const quickCityInput = document.getElementById('quick-city-input');
    const quickFetchWeatherBtn = document.getElementById('quick-fetch-weather-btn');
    const quickWeatherDetailsDiv = document.getElementById('quick-weather-details');
    const quickLoadingWeatherP = document.getElementById('quick-loading-weather');
    const quickWeatherErrorP = document.getElementById('quick-weather-error');
    const quickCityNameH3 = document.getElementById('quick-city-name');
    const quickWeatherIconImg = document.getElementById('quick-weather-icon');
    const quickTemperatureP = document.getElementById('quick-temperature');
    const quickWeatherDescriptionP = document.getElementById('quick-weather-description');
    const quickHumidityP = document.getElementById('quick-humidity');
    const quickWindSpeedP = document.getElementById('quick-wind-speed');

    // --- ELEMENTOS DO DOM: Controles Garagem e Tema ---
    const toggleDoorBtn = document.getElementById('toggle-door-btn');
    const doorStatusSpan = document.getElementById('door-status');
    const toggleLightsBtn = document.getElementById('toggle-lights-btn');
    const lightsStatusSpan = document.getElementById('lights-status');
    const themeSelector = document.getElementById('theme-selector');

    // --- ELEMENTOS DO DOM: Modal Previsão ---
    const dayDetailsModal = document.getElementById('day-details-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const modalDateH3 = document.getElementById('modal-date');
    const modalHumidityP = document.getElementById('modal-humidity');
    const modalWindP = document.getElementById('modal-wind');
    const modalDescriptionP = document.getElementById('modal-description');

    // --- ESTADO DA APLICAÇÃO ---
    let isDoorOpen = false;
    let areLightsOn = false;
    let currentCityForecast = '';
    let currentForecastData = null;
    const TEMP_EXTREME_COLD = 5; // °C
    const TEMP_EXTREME_HOT = 32; // °C

    // Dados mockados de veículos (substitua por dados reais ou de uma API se necessário)
    const vehicles = [
        { id: "esportivo-x", name: "Esportivo X", type: "Esportivo", image: "Imagens/61L1xDiY8mL._AC_UF894,1000_QL80_.jpg", status: "Pronto para uso", nextService: "2024-12-01" },
        { id: "sedan-y", name: "Sedan Y", type: "Normal", image: "Imagens/026f5848-honda-civic-ehev-2022-branco-traseira.jpg", status: "Em manutenção", nextService: "2024-08-15" },
        { id: "caminhao-z", name: "Caminhão Z", type: "Caminhão", image: "Imagens/Ziegler-Z6-6x6-.jpg", status: "Pronto para uso", nextService: "2025-01-20" }
    ];
    let maintenances = JSON.parse(localStorage.getItem('garageMaintenances')) || [];


    // --- FUNÇÕES: VEÍCULOS ---
    const renderVehicles = () => {
        if (!vehicleListDiv) return;
        vehicleListDiv.innerHTML = '';
        maintenanceVehicleSelect.innerHTML = '<option value="">Selecione um veículo</option>';

        vehicles.forEach(vehicle => {
            // Card do Veículo
            const card = document.createElement('div');
            card.classList.add('vehicle-card');
            card.innerHTML = `
                <img src="${vehicle.image}" alt="${vehicle.name}">
                <h3>${vehicle.name}</h3>
                <p><strong>Tipo:</strong> ${vehicle.type}</p>
                <p><strong>Status:</strong> ${vehicle.status}</p>
                <p><strong>Próxima Revisão:</strong> ${new Date(vehicle.nextService + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
            `;
            vehicleListDiv.appendChild(card);

            // Opção para o select de manutenção
            const option = document.createElement('option');
            option.value = vehicle.id;
            option.textContent = vehicle.name;
            maintenanceVehicleSelect.appendChild(option);
        });
    };

    // --- FUNÇÕES: MANUTENÇÃO ---
    const renderMaintenances = () => {
        if (!maintenanceListUl) return;
        maintenanceListUl.innerHTML = '';
        maintenances.sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordena por data

        maintenances.forEach((maint, index) => {
            const vehicle = vehicles.find(v => v.id === maint.vehicleId);
            const vehicleName = vehicle ? vehicle.name : "Veículo Desconhecido";
            const li = document.createElement('li');
            li.classList.add('maintenance-item');
            if (maint.completed) {
                li.classList.add('completed');
            }

            const dateFormatted = new Date(maint.date + 'T00:00:00').toLocaleDateString('pt-BR');

            li.innerHTML = `
                <div>
                    <strong>${vehicleName}:</strong> ${maint.description} - <em>${dateFormatted}</em>
                    ${maint.completed ? ' (Concluído)' : ''}
                </div>
                <div>
                    <button class="complete-btn" data-index="${index}">${maint.completed ? 'Refazer' : 'Concluir'}</button>
                    <button class="delete-btn" data-index="${index}">Excluir</button>
                </div>
            `;
            maintenanceListUl.appendChild(li);
        });

        // Adicionar listeners aos botões de cada item
        document.querySelectorAll('.maintenance-item .complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => toggleMaintenanceStatus(parseInt(e.target.dataset.index)));
        });
        document.querySelectorAll('.maintenance-item .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteMaintenance(parseInt(e.target.dataset.index)));
        });
    };

    const handleAddMaintenance = (event) => {
        event.preventDefault();
        const vehicleId = maintenanceVehicleSelect.value;
        const description = maintenanceDescriptionInput.value.trim();
        const date = maintenanceDateInput.value;

        if (!vehicleId || !description || !date) {
            alert("Por favor, preencha todos os campos do agendamento.");
            return;
        }

        maintenances.push({
            vehicleId,
            description,
            date,
            completed: false,
            id: Date.now().toString() // ID único simples
        });
        localStorage.setItem('garageMaintenances', JSON.stringify(maintenances));
        renderMaintenances();
        addMaintenanceForm.reset();
    };

    const toggleMaintenanceStatus = (index) => {
        if (maintenances[index]) {
            maintenances[index].completed = !maintenances[index].completed;
            localStorage.setItem('garageMaintenances', JSON.stringify(maintenances));
            renderMaintenances();
        }
    };

    const deleteMaintenance = (index) => {
        if (maintenances[index] && confirm("Tem certeza que deseja excluir esta manutenção?")) {
            maintenances.splice(index, 1);
            localStorage.setItem('garageMaintenances', JSON.stringify(maintenances));
            renderMaintenances();
        }
    };


    // --- FUNÇÕES DE UTILIDADE GERAL (Tempo) ---
    const getUnitSymbol = () => (tempUnitSelector.value === 'metric' ? '°C' : '°F');
    const getWindSpeedUnitText = () => (tempUnitSelector.value === 'metric' ? 'km/h' : 'mph');

    // --- LÓGICA DE CONSULTA RÁPIDA DO TEMPO (mantida e adaptada) ---
    const displayQuickWeatherError = (message) => { /* ... */
        quickWeatherErrorP.textContent = message;
        quickWeatherErrorP.style.display = 'block';
        quickWeatherDetailsDiv.style.display = 'none';
        quickLoadingWeatherP.style.display = 'none';
    };
    const clearQuickWeatherError = () => { /* ... */
        quickWeatherErrorP.textContent = '';
        quickWeatherErrorP.style.display = 'none';
    };
    const showQuickLoadingWeather = (isLoading) => { /* ... */
        quickLoadingWeatherP.style.display = isLoading ? 'block' : 'none';
        if (isLoading) {
            quickWeatherDetailsDiv.style.display = 'none';
            clearQuickWeatherError();
        }
    };
    const fetchQuickWeatherData = async () => { /* ... (código da função mantido da versão anterior) ... */
        const city = quickCityInput.value.trim();
        if (!city) {
            displayQuickWeatherError('Por favor, digite o nome de uma cidade.');
            return;
        }
        if (API_KEY === 'b4844eae6f90c04e603ddf90fe2d7485') {
            displayQuickWeatherError('Chave da API não configurada. Obtenha uma em OpenWeatherMap.');
            return;
        }
        showQuickLoadingWeather(true);
        const unit = tempUnitSelector.value;
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}&lang=pt_br`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) { /* ... (tratamento de erro mantido) ... */
                if (response.status === 401) throw new Error('Chave da API inválida ou não autorizada.');
                else if (response.status === 404) throw new Error(`Cidade "${city}" não encontrada.`);
                else throw new Error(`Erro ao buscar dados: ${response.statusText} (código ${response.status})`);
            }
            const data = await response.json();
            updateQuickWeatherUI(data);
        } catch (error) {
            console.error("Erro ao buscar dados do tempo (consulta rápida):", error);
            displayQuickWeatherError(error.message || 'Não foi possível obter os dados do tempo. Verifique sua conexão.');
        } finally {
            showQuickLoadingWeather(false);
        }
    };
    const updateQuickWeatherUI = (data) => { /* ... (código da função mantido da versão anterior) ... */
        clearQuickWeatherError();
        quickCityNameH3.textContent = data.name;
        quickWeatherIconImg.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        quickWeatherIconImg.alt = data.weather[0].description;
        quickTemperatureP.textContent = `${Math.round(data.main.temp)}${getUnitSymbol()}`;
        quickWeatherDescriptionP.textContent = data.weather[0].description;
        quickHumidityP.textContent = `Umidade: ${data.main.humidity}%`;
        let windSpeed = data.wind.speed;
        if (tempUnitSelector.value === 'metric') windSpeed = (windSpeed * 3.6).toFixed(1);
        else windSpeed = windSpeed.toFixed(1);
        quickWindSpeedP.textContent = `Vento: ${windSpeed} ${getWindSpeedUnitText()}`;
        quickWeatherDetailsDiv.style.display = 'block';
    };

    // --- LÓGICA DE PREVISÃO DO TEMPO AVANÇADA (mantida e adaptada) ---
    const displayForecastError = (message) => { /* ... */
        weatherErrorP.textContent = message;
        weatherErrorP.style.display = 'block';
        forecastContainer.innerHTML = '';
        loadingWeatherP.style.display = 'none';
    };
    const clearForecastError = () => { /* ... */
        weatherErrorP.textContent = '';
        weatherErrorP.style.display = 'none';
    };
    const showLoadingForecast = (isLoading) => { /* ... */
        loadingWeatherP.style.display = isLoading ? 'block' : 'none';
        if (isLoading) {
            forecastContainer.innerHTML = '';
            clearForecastError();
        }
    };
    const fetchForecast = async () => { /* ... (código da função mantido da versão anterior) ... */
        const city = cityInput.value.trim();
        if (!city) {
            displayForecastError('Por favor, digite o nome de uma cidade para a previsão.');
            return;
        }
        currentCityForecast = city;
        if (API_KEY === 'SUA_CHAVE_API_AQUI') {
            displayForecastError('Chave da API não configurada. Obtenha uma em OpenWeatherMap.');
            return;
        }
        showLoadingForecast(true);
        const unit = tempUnitSelector.value;
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}&lang=pt_br`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) { /* ... (tratamento de erro mantido) ... */
                if (response.status === 401) throw new Error('Chave da API inválida ou não autorizada.');
                else if (response.status === 404) throw new Error(`Cidade "${city}" não encontrada.`);
                else throw new Error(`Erro ao buscar dados: ${response.statusText} (código ${response.status})`);
            }
            currentForecastData = await response.json();
            processAndRenderForecast(currentForecastData);
            localStorage.setItem('garagemLastForecastCity', city);
        } catch (error) {
            console.error("Erro ao buscar dados da previsão:", error);
            currentForecastData = null;
            displayForecastError(error.message || 'Não foi possível obter os dados da previsão. Verifique sua conexão.');
        } finally {
            showLoadingForecast(false);
        }
    };
    const processAndRenderForecast = (apiData) => { /* ... (código da função mantido da versão anterior) ... */
        if (!apiData || !apiData.list) { displayForecastError('Dados da previsão inválidos.'); return; }
        clearForecastError();
        const dailyData = {};
        apiData.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyData[date]) dailyData[date] = { temps: [], temp_mins: [], temp_maxs: [], humidities: [], winds: [], weatherItems: [], dt_txts: [] };
            dailyData[date].temps.push(item.main.temp);
            dailyData[date].temp_mins.push(item.main.temp_min);
            dailyData[date].temp_maxs.push(item.main.temp_max);
            dailyData[date].humidities.push(item.main.humidity);
            dailyData[date].winds.push(item.wind.speed);
            dailyData[date].weatherItems.push(item.weather[0]);
            dailyData[date].dt_txts.push(item.dt_txt);
        });
        const processedForecasts = Object.keys(dailyData).map(date => {
            const day = dailyData[date];
            const midDayIndex = day.dt_txts.findIndex(dt => dt.includes("12:00:00")) !== -1 ? day.dt_txts.findIndex(dt => dt.includes("12:00:00")) : Math.floor(day.weatherItems.length / 2);
            const mainWeather = day.weatherItems[midDayIndex];
            const tempMin = Math.min(...day.temp_mins);
            const tempMax = Math.max(...day.temp_maxs);
            let maxWind = Math.max(...day.winds);
            if (tempUnitSelector.value === 'metric') maxWind = (maxWind * 3.6);
            return {
                date: new Date(date + "T00:00:00Z"), temp_min: Math.round(tempMin), temp_max: Math.round(tempMax),
                avg_humidity: Math.round(day.humidities.reduce((a, b) => a + b, 0) / day.humidities.length),
                max_wind: maxWind.toFixed(1), description: mainWeather.description, icon: mainWeather.icon,
                isRainy: day.weatherItems.some(w => w.main.toLowerCase().includes('rain') || (w.id >= 500 && w.id < 600)),
                isExtremeCold: tempMin < TEMP_EXTREME_COLD && tempUnitSelector.value === 'metric',
                isExtremeHot: tempMax > TEMP_EXTREME_HOT && tempUnitSelector.value === 'metric',
            };
        }).sort((a,b) => a.date - b.date);
        renderForecastUI(processedForecasts);
    };
    const renderForecastUI = (forecasts) => { /* ... (código da função mantido da versão anterior) ... */
        forecastContainer.innerHTML = '';
        const daysToShow = parseInt(forecastDaysSelector.value);
        const unitSymbol = getUnitSymbol();
        forecasts.slice(0, daysToShow).forEach(dayData => {
            const card = document.createElement('div');
            card.classList.add('forecast-card');
            if (dayData.isRainy) card.classList.add('rainy-day');
            if (dayData.isExtremeCold) card.classList.add('extreme-cold');
            if (dayData.isExtremeHot) card.classList.add('extreme-hot');
            const dateFormatted = dayData.date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
            card.innerHTML = `<h4>${dateFormatted}</h4> <img src="https://openweathermap.org/img/wn/${dayData.icon}@2x.png" alt="${dayData.description}"> <p class="temp">${dayData.temp_min}${unitSymbol} / ${dayData.temp_max}${unitSymbol}</p> <p class="description">${dayData.description}</p>`;
            card.addEventListener('click', () => showDayDetails(dayData));
            forecastContainer.appendChild(card);
        });
    };
    const showDayDetails = (dayData) => { /* ... (código da função mantido da versão anterior) ... */
        modalDateH3.textContent = dayData.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        modalHumidityP.textContent = `Umidade Média: ${dayData.avg_humidity}%`;
        modalWindP.textContent = `Vento Máximo: ${dayData.max_wind} ${getWindSpeedUnitText()}`;
        modalDescriptionP.textContent = `Condição Principal: ${dayData.description}`;
        dayDetailsModal.style.display = 'block';
    };

    // --- LÓGICA DOS CONTROLES DA GARAGEM (mantida) ---
    const toggleDoor = () => { isDoorOpen = !isDoorOpen; doorStatusSpan.textContent = isDoorOpen ? 'Aberto' : 'Fechado'; toggleDoorBtn.textContent = isDoorOpen ? 'Fechar Portão' : 'Abrir Portão'; };
    const toggleLights = () => { areLightsOn = !areLightsOn; lightsStatusSpan.textContent = areLightsOn ? 'Acesas' : 'Apagadas'; toggleLightsBtn.textContent = areLightsOn ? 'Apagar Luzes' : 'Acender Luzes'; };

    // --- LÓGICA DE TEMAS (mantida) ---
    const applyTheme = (themeName) => { document.body.className = ''; document.body.classList.add(`${themeName}-theme`); localStorage.setItem('garagemTheme', themeName); };

    // --- EVENT LISTENERS ---
    // Manutenção
    if (addMaintenanceForm) addMaintenanceForm.addEventListener('submit', handleAddMaintenance);

    // Previsão Avançada
    if (fetchWeatherBtn) fetchWeatherBtn.addEventListener('click', fetchForecast);
    if (cityInput) cityInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') fetchForecast(); });

    // Consulta Rápida
    if (quickFetchWeatherBtn) quickFetchWeatherBtn.addEventListener('click', fetchQuickWeatherData);
    if (quickCityInput) quickCityInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') fetchQuickWeatherData(); });

    // Opções de Previsão e Unidade
    if (forecastDaysSelector) forecastDaysSelector.addEventListener('change', () => { localStorage.setItem('garagemForecastDays', forecastDaysSelector.value); if (currentForecastData) processAndRenderForecast(currentForecastData); });
    if (tempUnitSelector) tempUnitSelector.addEventListener('change', () => {
        localStorage.setItem('garagemTempUnit', tempUnitSelector.value);
        if (currentCityForecast) fetchForecast();
        // Se houver dados na consulta rápida, você pode querer atualizá-los também.
        // Ex: if (quickCityNameH3.textContent) fetchQuickWeatherData();
    });

    // Controles da Garagem e Tema
    if (toggleDoorBtn) toggleDoorBtn.addEventListener('click', toggleDoor);
    if (toggleLightsBtn) toggleLightsBtn.addEventListener('click', toggleLights);
    if (themeSelector) themeSelector.addEventListener('change', (event) => applyTheme(event.target.value));

    // Modal Previsão
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => dayDetailsModal.style.display = 'none');
    window.addEventListener('click', (event) => { if (event.target === dayDetailsModal) dayDetailsModal.style.display = 'none'; });

    // --- INICIALIZAÇÃO ---
    const loadInitialSettings = () => {
        // Tema
        const savedTheme = localStorage.getItem('garagemTheme') || 'light';
        themeSelector.value = savedTheme;
        applyTheme(savedTheme);

        // Previsão
        const savedDays = localStorage.getItem('garagemForecastDays') || '3';
        forecastDaysSelector.value = savedDays;
        const savedUnit = localStorage.getItem('garagemTempUnit') || 'metric';
        tempUnitSelector.value = savedUnit;
        const lastForecastCity = localStorage.getItem('garagemLastForecastCity');
        if (lastForecastCity) {
            cityInput.value = lastForecastCity;
            // fetchForecast(); // Descomente para buscar ao carregar
        }

        // Veículos e Manutenções
        renderVehicles();
        renderMaintenances();
    };

    loadInitialSettings();
});

// Exemplo da função fetchForecast (simplificado para focar na API)
const fetchForecast = async () => {
    const city = cityInput.value.trim();
    const unit = tempUnitSelector.value;
    const API_KEY = 'b4844eae6f90c04e603ddf90fe2d7485'; // Sua chave da API

    // 1. Construir a URL da API
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}&lang=pt_br`;

    showLoadingForecast(true); // Mostrar indicador de carregamento

    try {
        // 2. Fazer a Requisição HTTP (usando Fetch API)
        // 'await' pausa a execução da função 'async' até que a Promise do fetch seja resolvida
        const response = await fetch(apiUrl);

        // 3. Processar a Resposta HTTP
        if (!response.ok) { // 'ok' é true se o status for 200-299
            // Tratamento de erros com base no status code
            if (response.status === 401) throw new Error('Chave da API inválida ou não autorizada.');
            else if (response.status === 404) throw new Error(`Cidade "${city}" não encontrada.`);
            else throw new Error(`Erro ao buscar dados: ${response.statusText} (código ${response.status})`);
        }

        // 4. Converter o corpo da resposta para JSON
        // 'await' pausa até que o corpo seja lido e parseado
        const data = await response.json();

        // 5. Usar os dados (chamar funções para atualizar a UI)
        processAndRenderForecast(data);
        localStorage.setItem('garagemLastForecastCity', city);

    } catch (error) {
        // 6. Tratar Erros (de rede, de parse, ou os que foram lançados acima)
        console.error("Erro ao buscar dados da previsão:", error);
        displayForecastError(error.message || 'Não foi possível obter os dados da previsão. Verifique sua conexão.');
    } finally {
        showLoadingForecast(false); // Esconder indicador de carregamento
    }
};

fetch('047d908c8e486447a52e9344fb8b17d4')

const dataToSend = { name: "Novo Item", value: 100 };
fetch('047d908c8e486447a52e9344fb8b17d4', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json' // Informa ao servidor que você está enviando JSON
    },
    body: JSON.stringify(dataToSend) // Converte objeto JS para string JSON
})
.then(response => response.json())
.then(data => console.log('Sucesso:', data))
.catch(error => console.error('Erro:', error));

// frontend/script.js

// ANTES (consumindo localmente):
// const API_BASE_URL = 'http://localhost:3000/api';

// DEPOIS (consumindo do Render):
const API_BASE_URL = 'https://meu-app-tempo-backend.onrender.com/api'; // <--- SUBSTITUA PELA SUA URL DO RENDER

const cityInput = document.getElementById('cityInput');
const getWeatherButton = document.getElementById('getWeatherButton');
const weatherResultDiv = document.getElementById('weatherResult');

getWeatherButton.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    if (!city) {
        weatherResultDiv.innerHTML = '<p style="color: red;">Por favor, digite o nome de uma cidade.</p>';
        return;
    }

    weatherResultDiv.innerHTML = '<p>Buscando dados...</p>';

    try {
        // Note que a rota completa é API_BASE_URL + /weather
        const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}` }));
            throw new Error(errorData.message || `Erro ao buscar dados: ${response.status}`);
        }

        const data = await response.json();

        weatherResultDiv.innerHTML = `
            <h2>${data.city}</h2>
            <p>Temperatura: ${data.temperature}°C</p>
            <p>Condição: ${data.description}</p>
            <p><img src="http://openweathermap.org/img/wn/${data.icon}@2x.png" alt="${data.description}"></p>
            <p>Umidade: ${data.humidity}%</p>
            <p>Vento: ${data.windSpeed} m/s</p>
        `;

    } catch (error) {
        console.error('Erro no fetch:', error);
        weatherResultDiv.innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
    }
});