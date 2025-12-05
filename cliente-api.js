// ============================================================
// ===   CLIENTE FULL-STACK API - GARAGEM INTELIGENTE    ===
// ============================================================

const API_BASE_URL = 'http://localhost:3001/api';

// ============================================================
// ===   FUNÇÕES DE REQUISIÇÃO HTTP   ===
// ============================================================

/**
 * Função genérica para fazer requisições
 */
async function makeRequest(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        showNotification(error.message || 'Erro ao comunicar com servidor', 'error');
        throw error;
    }
}

// ============================================================
// ===   FUNÇÕES PARA VEÍCULOS   ===
// ============================================================

async function getAllVehicles() {
    try {
        const result = await makeRequest('/vehicles');
        return result.data || [];
    } catch (error) {
        return [];
    }
}

async function createVehicle(vehicleData) {
    try {
        const result = await makeRequest('/vehicles', 'POST', vehicleData);
        showNotification('Veículo criado com sucesso!', 'success');
        return result.data;
    } catch (error) {
        showNotification('Erro ao criar veículo', 'error');
        throw error;
    }
}

async function updateVehicle(id, vehicleData) {
    try {
        const result = await makeRequest(`/vehicles/${id}`, 'PUT', vehicleData);
        showNotification('Veículo atualizado com sucesso!', 'success');
        return result.data;
    } catch (error) {
        showNotification('Erro ao atualizar veículo', 'error');
        throw error;
    }
}

async function deleteVehicle(id) {
    try {
        if (!confirm('Tem certeza que deseja deletar este veículo?')) return;
        await makeRequest(`/vehicles/${id}`, 'DELETE');
        showNotification('Veículo deletado com sucesso!', 'success');
        return true;
    } catch (error) {
        showNotification('Erro ao deletar veículo', 'error');
        throw error;
    }
}

// ============================================================
// ===   FUNÇÕES PARA MANUTENÇÕES   ===
// ============================================================

async function getMaintenances(vehicleId) {
    try {
        const result = await makeRequest(`/vehicles/${vehicleId}/maintenances`);
        return result.data || [];
    } catch (error) {
        return [];
    }
}

async function createMaintenance(vehicleId, maintenanceData) {
    try {
        const result = await makeRequest(`/vehicles/${vehicleId}/maintenances`, 'POST', maintenanceData);
        showNotification('Manutenção registrada com sucesso!', 'success');
        return result.data;
    } catch (error) {
        showNotification('Erro ao registrar manutenção', 'error');
        throw error;
    }
}

async function deleteMaintenance(maintenanceId) {
    try {
        if (!confirm('Tem certeza?')) return;
        await makeRequest(`/maintenances/${maintenanceId}`, 'DELETE');
        showNotification('Manutenção deletada!', 'success');
        return true;
    } catch (error) {
        showNotification('Erro ao deletar manutenção', 'error');
        throw error;
    }
}

// ============================================================
// ===   FUNÇÕES PARA AGENDAMENTOS   ===
// ============================================================

async function getAllAppointments() {
    try {
        const result = await makeRequest('/agendamentos');
        return result.data || [];
    } catch (error) {
        return [];
    }
}

async function createAppointment(appointmentData) {
    try {
        const result = await makeRequest('/agendamentos', 'POST', appointmentData);
        showNotification('Agendamento criado com sucesso!', 'success');
        return result.data;
    } catch (error) {
        showNotification('Erro ao criar agendamento', 'error');
        throw error;
    }
}

async function deleteAppointment(appointmentId) {
    try {
        if (!confirm('Cancelar agendamento?')) return;
        await makeRequest(`/agendamentos/${appointmentId}`, 'DELETE');
        showNotification('Agendamento cancelado!', 'success');
        return true;
    } catch (error) {
        showNotification('Erro ao cancelar agendamento', 'error');
        throw error;
    }
}

// ============================================================
// ===   FUNÇÕES PARA DICAS   ===
// ============================================================

async function getMaintenanceTips(vehicleType = null) {
    try {
        const endpoint = vehicleType ? `/dicas-manutencao/${vehicleType}` : '/dicas-manutencao';
        const result = await makeRequest(endpoint);
        return result.data || [];
    } catch (error) {
        return [];
    }
}

// ============================================================
// ===   FUNÇÕES PARA CLIMA   ===
// ============================================================

async function getWeather(city) {
    try {
        const result = await makeRequest(`/weather?city=${encodeURIComponent(city)}`);
        return result.data;
    } catch (error) {
        console.error('Erro ao buscar clima:', error);
        return null;
    }
}

// ============================================================
// ===   FUNÇÕES UTILITÁRIAS   ===
// ============================================================

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease-in-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================================
// ===   RENDERIZAÇÃO   ===
// ============================================================

async function renderVehiclesList() {
    const container = document.getElementById('vehicle-list');
    if (!container) return;

    try {
        const vehicles = await getAllVehicles();
        
        if (vehicles.length === 0) {
            container.innerHTML = '<p>Nenhum veículo cadastrado. <a href="#add-vehicle">Adicionar veículo</a></p>';
            return;
        }

        container.innerHTML = vehicles.map(v => `
            <div class="vehicle-card" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px;">
                <h3>${v.marca} ${v.modelo}</h3>
                <p><strong>Placa:</strong> ${v.placa}</p>
                <p><strong>Tipo:</strong> ${v.tipo}</p>
                <p><strong>Ano:</strong> ${v.ano}</p>
                <div style="margin-top: 10px;">
                    <button onclick="editVehicleForm('${v._id}')" style="background-color: #2196F3; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">Editar</button>
                    <button onclick="deleteVehicle('${v._id}').then(() => renderVehiclesList())" style="background-color: #f44336; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; margin-left: 5px;">Deletar</button>
                    <button onclick="showVehicleMaintenances('${v._id}')" style="background-color: #FF9800; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; margin-left: 5px;">Manutenções</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar veículos</p>';
    }
}

async function showVehicleMaintenances(vehicleId) {
    const container = document.getElementById('maintenance-details') || document.body;
    
    try {
        const vehicle = await makeRequest(`/vehicles/${vehicleId}`);
        const maintenances = await getMaintenances(vehicleId);

        let html = `
            <h3>Manutenções - ${vehicle.data.marca} ${vehicle.data.modelo}</h3>
        `;

        if (maintenances.length === 0) {
            html += '<p>Nenhuma manutenção registrada</p>';
        } else {
            html += maintenances.map(m => `
                <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 4px;">
                    <p><strong>Data:</strong> ${new Date(m.data).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Serviços:</strong> ${m.servicos.join(', ')}</p>
                    <p><strong>Custo:</strong> R$ ${m.custo?.toFixed(2) || '0.00'}</p>
                    <p><strong>Obs:</strong> ${m.observacoes || 'N/A'}</p>
                    <button onclick="deleteMaintenance('${m._id}').then(() => showVehicleMaintenances('${vehicleId}'))" style="background-color: #f44336; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">Deletar</button>
                </div>
            `).join('');
        }

        container.innerHTML = html;
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function renderAppointmentsList() {
    const container = document.getElementById('appointment-list');
    if (!container) return;

    try {
        const appointments = await getAllAppointments();
        
        if (appointments.length === 0) {
            container.innerHTML = '<p>Nenhum agendamento</p>';
            return;
        }

        container.innerHTML = appointments.map(apt => `
            <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 4px;">
                <p><strong>Veículo:</strong> ${apt.veiculo?.marca || 'N/A'} ${apt.veiculo?.modelo || 'N/A'} (${apt.veiculo?.placa || 'N/A'})</p>
                <p><strong>Data:</strong> ${new Date(apt.data).toLocaleDateString('pt-BR')}</p>
                <p><strong>Serviços:</strong> ${apt.servicos?.join(', ') || 'N/A'}</p>
                <p><strong>Status:</strong> <span style="background-color: #2196F3; color: white; padding: 2px 8px; border-radius: 3px;">${apt.status || 'pendente'}</span></p>
                <button onclick="deleteAppointment('${apt._id}').then(() => renderAppointmentsList())" style="background-color: #f44336; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar agendamentos</p>';
    }
}

// ============================================================
// ===   INICIALIZAÇÃO   ===
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Cliente Full-Stack API Carregado');
    console.log(`📡 Conectando a: ${API_BASE_URL}`);
    
    // Carregar dados iniciais
    renderVehiclesList();
    renderAppointmentsList();
});
