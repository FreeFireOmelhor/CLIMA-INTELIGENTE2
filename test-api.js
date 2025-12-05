// ============================================================
// ===   TESTE DA API - GARAGEM INTELIGENTE    ===
// ============================================================

/**
 * INSTRUÇÕES DE TESTE
 * 
 * 1. Abra o console do navegador (F12)
 * 2. Copie e cole cada função abaixo
 * 3. Execute e veja os resultados
 */

const API_BASE = 'http://localhost:3001/api';

// ===== TESTE 1: Verificar conexão com servidor =====
async function testServerConnection() {
    console.log('🔍 Testando conexão com servidor...');
    try {
        const response = await fetch('http://localhost:3001/');
        const data = await response.json();
        console.log('✅ Servidor respondeu:', data);
    } catch (error) {
        console.error('❌ Erro ao conectar:', error);
    }
}

// ===== TESTE 2: Listar veículos =====
async function testGetVehicles() {
    console.log('📋 Buscando veículos...');
    try {
        const response = await fetch(`${API_BASE}/vehicles`);
        const data = await response.json();
        console.log('✅ Veículos encontrados:', data);
        return data.data || [];
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// ===== TESTE 3: Criar veículo =====
async function testCreateVehicle() {
    console.log('➕ Criando novo veículo...');
    const vehicleData = {
        marca: 'Toyota',
        modelo: 'Corolla',
        placa: 'ABC1234',
        tipo: 'SEDAN X',
        ano: 2023
    };

    try {
        const response = await fetch(`${API_BASE}/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vehicleData)
        });
        const data = await response.json();
        console.log('✅ Veículo criado:', data);
        return data.data?._id;
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// ===== TESTE 4: Agendar manutenção =====
async function testCreateAppointment(vehicleId) {
    console.log('📅 Agendando manutenção...');
    const appointmentData = {
        veiculo: vehicleId,
        servicos: ['Troca de Óleo', 'Filtro de Ar'],
        data: new Date().toISOString().split('T')[0]
    };

    try {
        const response = await fetch(`${API_BASE}/agendamentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        });
        const data = await response.json();
        console.log('✅ Agendamento criado:', data);
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// ===== TESTE 5: Obter clima =====
async function testGetWeather(city = 'São Paulo') {
    console.log('🌤️ Buscando clima para:', city);
    try {
        const response = await fetch(`${API_BASE}/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        console.log('✅ Dados de clima:', {
            cidade: data.data?.name,
            temperatura: data.data?.main?.temp + '°C',
            descricao: data.data?.weather?.[0]?.description,
            umidade: data.data?.main?.humidity + '%'
        });
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// ===== TESTE 6: Dicas de manutenção =====
async function testGetTips() {
    console.log('💡 Buscando dicas de manutenção...');
    try {
        const response = await fetch(`${API_BASE}/dicas-manutencao`);
        const data = await response.json();
        console.log('✅ Dicas encontradas:', data.data);
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// ===== EXECUTAR TODOS OS TESTES =====
async function runAllTests() {
    console.log('═══════════════════════════════════════════');
    console.log('🧪 INICIANDO SUITE DE TESTES');
    console.log('═══════════════════════════════════════════\n');

    // Teste 1: Conexão
    await testServerConnection();
    console.log('\n---\n');

    // Teste 2: Listar veículos
    const vehicles = await testGetVehicles();
    console.log('\n---\n');

    // Teste 3: Criar veículo
    let newVehicleId = null;
    if (vehicles.length > 0) {
        newVehicleId = vehicles[0]._id;
    } else {
        newVehicleId = await testCreateVehicle();
    }
    console.log('\n---\n');

    // Teste 4: Agendar (se temos veículo)
    if (newVehicleId) {
        await testCreateAppointment(newVehicleId);
    }
    console.log('\n---\n');

    // Teste 5: Clima
    await testGetWeather('São Paulo');
    console.log('\n---\n');

    // Teste 6: Dicas
    await testGetTips();

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ TESTES CONCLUÍDOS');
    console.log('═══════════════════════════════════════════');
}

// ===== EXECUTAR =====
console.log('
 ╔════════════════════════════════════════════════════╗
 ║  🏎️  TESTE DA API - GARAGEM INTELIGENTE           ║
 ║                                                    ║
 ║  Execute no console:                              ║
 ║  testServerConnection()      - Testar servidor   ║
 ║  testGetVehicles()          - Listar veículos    ║
 ║  testCreateVehicle()        - Criar veículo      ║
 ║  testGetWeather('Cidade')   - Buscar clima       ║
 ║  testGetTips()              - Dicas              ║
 ║  runAllTests()              - Executar tudo      ║
 ║                                                    ║
 ╚════════════════════════════════════════════════════╝
');

// Exportar para uso no console
if (typeof window !== 'undefined') {
    window.API_Tests = {
        testServerConnection,
        testGetVehicles,
        testCreateVehicle,
        testCreateAppointment,
        testGetWeather,
        testGetTips,
        runAllTests
    };
}

// Se executado no Node.js, rodar testes automaticamente
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testServerConnection,
        testGetVehicles,
        testCreateVehicle,
        testCreateAppointment,
        testGetWeather,
        testGetTips,
        runAllTests
    };
}
