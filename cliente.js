async function buscarPrevisaoDetalhada(cidade) {
    const resultadoDiv = document.getElementById('previsao-tempo-resultado');
    resultadoDiv.innerHTML = 'Carregando...';

    try {
        const response = await fetch(`http://localhost:3001/api/previsao/${encodeURIComponent(cidade)}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erro ao buscar previsão.");
        }

        const data = await response.json();
        const previsaoProcessada = processarDadosForecast(data); // Sua função existente
        exibirPrevisaoDetalhada(previsaoProcessada, cidade);    // Sua função existente

    } catch (error) {
        resultadoDiv.innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
    }
        // A URL AGORA APONTA PARA O SEU BACKEND
const response = await fetch(`http://localhost:3001/api/previsao/${cidade}`);
// A API KEY FOI REMOVIDA DAQUI!

}
// Configuração básica
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

// Elementos da UI
const dicasSection = document.getElementById('dicas-section');
const viagensSection = document.getElementById('viagens-section');
const revisaoSection = document.getElementById('revisao-section');

// Funções para consumir os novos endpoints
async function carregarDicasManutencao(tipoVeiculo = null) {
    try {
        const endpoint = tipoVeiculo 
            ? `${backendUrl}/api/dicas-manutencao/${tipoVeiculo}`
            : `${backendUrl}/api/dicas-manutencao`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao carregar dicas');
        }
        
        const data = await response.json();
        exibirDicasManutencao(data.dicas, data.mensagem);
    } catch (error) {
        console.error("Erro ao carregar dicas:", error);
        dicasSection.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

async function carregarProximaRevisao(placa) {
    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${placa}/proxima-revisao`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao buscar revisão');
        }
        
        const data = await response.json();
        exibirProximaRevisao(data);
    } catch (error) {
        console.error("Erro ao carregar revisão:", error);
        revisaoSection.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

async function carregarViagensPopulares(limite = null) {
    try {
        const endpoint = limite 
            ? `${backendUrl}/api/viagens-populares?limite=${limite}`
            : `${backendUrl}/api/viagens-populares`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar viagens');
        }
        
        const viagens = await response.json();
        exibirViagensPopulares(viagens);
    } catch (error) {
        console.error("Erro ao carregar viagens:", error);
        viagensSection.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

// Funções para exibir os dados na UI
function exibirDicasManutencao(dicas, titulo) {
    let html = `<h3>${titulo}</h3><ul class="list-group">`;
    
    dicas.forEach(dica => {
        html += `
            <li class="list-group-item ${getPriorityClass(dica.prioridade)}">
                <strong>${dica.id}.</strong> ${dica.dica}
                <span class="badge ${getPriorityBadge(dica.prioridade)}">${dica.prioridade}</span>
            </li>
        `;
    });
    
    html += `</ul>`;
    dicasSection.innerHTML = html;
}

function exibirProximaRevisao(data) {
    revisaoSection.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Próxima Revisão</h5>
                <p class="card-text"><strong>Veículo:</strong> ${data.modelo} (${data.placa})</p>
                <p class="card-text"><strong>Data:</strong> ${new Date(data.proximaRevisao).toLocaleDateString()}</p>
                <p class="card-text ${data.diasRestantes < 15 ? 'text-danger' : 'text-success'}">
                    <strong>Dias restantes:</strong> ${Math.max(0, data.diasRestantes)}
                </p>
            </div>
        </div>
    `;
}

function exibirViagensPopulares(viagens) {
    let html = `<h3>Viagens Populares</h3><div class="row">`;
    
    viagens.forEach(viagem => {
        html += `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${viagem.destino}</h5>
                        <p class="card-text">Distância: ${viagem.distancia}km</p>
                        <p class="card-text">Melhor época: ${viagem.melhorEpoca}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    viagensSection.innerHTML = html;
}

// Funções auxiliares
function getPriorityClass(prioridade) {
    const classes = {
        alta: 'list-group-item-danger',
        media: 'list-group-item-warning',
        baixa: 'list-group-item-success'
    };
    return classes[prioridade] || '';
}

function getPriorityBadge(prioridade) {
    const badges = {
        alta: 'bg-danger',
        media: 'bg-warning',
        baixa: 'bg-success'
    };
    return badges[prioridade] || 'bg-secondary';
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carrega dados iniciais
    carregarDicasManutencao();
    carregarViagensPopulares(3);
    
    // Se houver um veículo padrão, carrega sua revisão
    if (veiculos.length > 0) {
        carregarProximaRevisao(veiculos[0].placa);
    }
    
    // Configura eventos
    document.getElementById('btn-dicas-gerais').addEventListener('click', () => carregarDicasManutencao());
    document.getElementById('btn-dicas-moto').addEventListener('click', () => carregarDicasManutencao('moto'));
    document.getElementById('btn-dicas-carro').addEventListener('click', () => carregarDicasManutencao('carro'));
    document.getElementById('btn-dicas-esportivo').addEventListener('click', () => carregarDicasManutencao('carro_esportivo'));
    
    document.getElementById('btn-todas-viagens').addEventListener('click', () => carregarViagensPopulares());
});
