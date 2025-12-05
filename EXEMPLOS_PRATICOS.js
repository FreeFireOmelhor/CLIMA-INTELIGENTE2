#!/usr/bin/env node

/**
 * EXEMPLOS PRÁTICOS - GARAGEM INTELIGENTE
 * 
 * Este arquivo contém exemplos reais de como usar a API
 */

// ============================================================
// ===   EXEMPLOS DE REQUISIÇÕES   ===
// ============================================================

// Exemplo 1: CRIAR VEÍCULO
const exemplo1_criarVeiculo = {
    endpoint: 'POST /api/vehicles',
    body: {
        marca: 'Nissan',
        modelo: 'Titan Warrior',
        placa: 'TITAN88',
        tipo: 'CAMINHÃO Z',
        ano: 2023
    },
    resposta: {
        success: true,
        message: 'Veículo criado com sucesso',
        data: {
            _id: '507f1f77bcf86cd799439011',
            marca: 'Nissan',
            modelo: 'Titan Warrior',
            placa: 'TITAN88',
            tipo: 'CAMINHÃO Z',
            ano: 2023,
            imageUrl: '/img/default-vehicle.jpg',
            proximaRevisao: null,
            createdAt: '2024-12-05T10:00:00Z',
            updatedAt: '2024-12-05T10:00:00Z'
        }
    }
};

// Exemplo 2: LISTAR VEÍCULOS
const exemplo2_listarVeiculos = {
    endpoint: 'GET /api/vehicles',
    resposta: {
        success: true,
        data: [
            {
                _id: '507f1f77bcf86cd799439011',
                marca: 'Nissan',
                modelo: 'Titan Warrior',
                placa: 'TITAN88',
                tipo: 'CAMINHÃO Z',
                ano: 2023,
                createdAt: '2024-12-05T10:00:00Z'
            },
            {
                _id: '507f1f77bcf86cd799439012',
                marca: 'Toyota',
                modelo: 'Corolla',
                placa: 'ABC1234',
                tipo: 'SEDAN X',
                ano: 2023,
                createdAt: '2024-12-05T10:05:00Z'
            }
        ],
        count: 2
    }
};

// Exemplo 3: REGISTRAR MANUTENÇÃO
const exemplo3_registrarManutencao = {
    endpoint: 'POST /api/vehicles/507f1f77bcf86cd799439011/maintenances',
    body: {
        data: '2024-12-05',
        servicos: ['Troca de Óleo', 'Filtro de Ar'],
        observacoes: 'Manutenção de rotina, tudo ok',
        custo: 250.00
    },
    resposta: {
        success: true,
        message: 'Manutenção registrada',
        data: {
            _id: '507f1f77bcf86cd799439020',
            veiculo: {
                _id: '507f1f77bcf86cd799439011',
                marca: 'Nissan',
                modelo: 'Titan Warrior',
                placa: 'TITAN88'
            },
            data: '2024-12-05',
            servicos: ['Troca de Óleo', 'Filtro de Ar'],
            observacoes: 'Manutenção de rotina, tudo ok',
            custo: 250.00,
            createdAt: '2024-12-05T10:10:00Z'
        }
    }
};

// Exemplo 4: AGENDAR SERVIÇO
const exemplo4_agendarServico = {
    endpoint: 'POST /api/agendamentos',
    body: {
        veiculo: '507f1f77bcf86cd799439011',
        servicos: ['Alinhamento', 'Balanceamento'],
        data: '2024-12-20'
    },
    resposta: {
        success: true,
        message: 'Agendamento criado',
        data: {
            _id: '507f1f77bcf86cd799439030',
            veiculo: {
                _id: '507f1f77bcf86cd799439011',
                marca: 'Nissan',
                modelo: 'Titan Warrior',
                placa: 'TITAN88'
            },
            servicos: ['Alinhamento', 'Balanceamento'],
            data: '2024-12-20',
            status: 'pendente',
            createdAt: '2024-12-05T10:15:00Z'
        }
    }
};

// Exemplo 5: BUSCAR CLIMA
const exemplo5_buscarClima = {
    endpoint: 'GET /api/weather?city=São Paulo',
    resposta: {
        success: true,
        data: {
            name: 'São Paulo',
            sys: { country: 'BR' },
            main: {
                temp: 28.5,
                feels_like: 29.2,
                humidity: 65
            },
            weather: [
                {
                    main: 'Partly cloudy',
                    description: 'Céu parcialmente nublado'
                }
            ],
            wind: { speed: 5.2 }
        }
    }
};

// Exemplo 6: LISTAR DICAS
const exemplo6_listarDicas = {
    endpoint: 'GET /api/dicas-manutencao',
    resposta: {
        success: true,
        data: [
            {
                _id: '507f1f77bcf86cd799439040',
                dica: 'Troque o óleo a cada 5000 km',
                prioridade: 'alta',
                tipoVeiculo: 'GERAL',
                createdAt: '2024-12-05T10:00:00Z'
            },
            {
                _id: '507f1f77bcf86cd799439041',
                dica: 'Verifique a pressão dos pneus mensalmente',
                prioridade: 'media',
                tipoVeiculo: 'GERAL',
                createdAt: '2024-12-05T10:00:00Z'
            }
        ],
        count: 2
    }
};

// Exemplo 7: ATUALIZAR VEÍCULO
const exemplo7_atualizarVeiculo = {
    endpoint: 'PUT /api/vehicles/507f1f77bcf86cd799439011',
    body: {
        ano: 2024,
        proximaRevisao: '2025-06-05'
    },
    resposta: {
        success: true,
        message: 'Veículo atualizado com sucesso',
        data: {
            _id: '507f1f77bcf86cd799439011',
            marca: 'Nissan',
            modelo: 'Titan Warrior',
            placa: 'TITAN88',
            ano: 2024,
            proximaRevisao: '2025-06-05',
            updatedAt: '2024-12-05T11:00:00Z'
        }
    }
};

// Exemplo 8: DELETAR VEÍCULO
const exemplo8_deletarVeiculo = {
    endpoint: 'DELETE /api/vehicles/507f1f77bcf86cd799439011',
    resposta: {
        success: true,
        message: 'Veículo e registros relacionados deletados'
    }
};

// ============================================================
// ===   CASOS DE USO DO MUNDO REAL   ===
// ============================================================

/**
 * CASO 1: Gerente de Garagem
 * 
 * João é gerente de uma garagem. Ele precisa:
 * 1. Registrar um novo veículo
 * 2. Agendar uma manutenção
 * 3. Consultar o histórico de manutenções
 * 4. Verificar próximas revisões
 */

const casoUso1_GerenciadorGaragem = `
// 1. Registrar novo veículo
POST /api/vehicles
{
  "marca": "BMW",
  "modelo": "X5",
  "placa": "BMW9999",
  "tipo": "Outro",
  "ano": 2024
}

// 2. Agendar manutenção
POST /api/agendamentos
{
  "veiculo": "ID_RETORNADO",
  "servicos": ["Revisão 40mil km"],
  "data": "2024-12-15"
}

// 3. Buscar todas as manutenções do veículo
GET /api/vehicles/ID_RETORNADO/maintenances

// 4. Atualizar próxima revisão
PUT /api/vehicles/ID_RETORNADO
{
  "proximaRevisao": "2025-06-15"
}
`;

/**
 * CASO 2: Cliente da Garagem
 * 
 * Maria cliente de uma garagem. Ela:
 * 1. Quer saber o histórico de manutenção
 * 2. Deseja agendar um serviço
 * 3. Quer dicas de manutenção
 */

const casoUso2_ClienteGaragem = `
// 1. Listar manutenções do seu veículo
GET /api/vehicles/ID_MEU_VEICULO/maintenances

// 2. Agendar novo serviço
POST /api/agendamentos
{
  "veiculo": "ID_MEU_VEICULO",
  "servicos": ["Troca de óleo", "Filtro"],
  "data": "2024-12-10"
}

// 3. Consultar dicas
GET /api/dicas-manutencao/SEDAN_X

// 4. Verificar clima antes de ir à garagem
GET /api/weather?city=São Paulo
`;

/**
 * CASO 3: Aplicação Mobile
 * 
 * Uma app mobile precisa sincronizar dados:
 * 1. Carregar todos os veículos
 * 2. Baixar histórico de manutenções
 * 3. Sincronizar agendamentos
 */

const casoUso3_AplicacaoMobile = `
// Sincronização completa
Promise.all([
  fetch('/api/vehicles'),
  fetch('/api/agendamentos'),
  fetch('/api/dicas-manutencao')
])
.then(responses => Promise.all(responses.map(r => r.json())))
.then(([vehicles, appointments, tips]) => {
  localStorage.setItem('vehicles', JSON.stringify(vehicles.data));
  localStorage.setItem('appointments', JSON.stringify(appointments.data));
  localStorage.setItem('tips', JSON.stringify(tips.data));
})
`;

// ============================================================
// ===   CÓDIGOS DE ERRO E RESPOSTAS   ===
// ============================================================

const respostasErros = {
    200: { descricao: 'OK', exemplo: 'Requisição bem-sucedida' },
    201: { descricao: 'Created', exemplo: 'Recurso criado com sucesso' },
    400: { descricao: 'Bad Request', exemplo: 'Dados inválidos enviados' },
    404: { descricao: 'Not Found', exemplo: 'Recurso não encontrado' },
    409: { descricao: 'Conflict', exemplo: 'Placa já existe no banco' },
    500: { descricao: 'Internal Server Error', exemplo: 'Erro no servidor' }
};

// ============================================================
// ===   SCRIPTS ÚTEIS   ===
// ============================================================

// Script 1: Testar conexão
const scriptTestarConexao = `
curl http://localhost:3001/

// Resposta esperada:
{
  "message": "✅ Servidor da Garagem Inteligente está funcionando!",
  "version": "1.0.0",
  "timestamp": "2024-12-05T10:00:00Z"
}
`;

// Script 2: Criar dados de teste
const scriptCriarDadosTeste = `
// Criar 3 veículos
for (let i = 1; i <= 3; i++) {
  fetch('http://localhost:3001/api/vehicles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      marca: 'Marca' + i,
      modelo: 'Modelo' + i,
      placa: 'PLA' + i + '0000',
      tipo: 'Outro',
      ano: 2023 + i
    })
  }).then(r => r.json()).then(d => console.log('Criado:', d.data._id));
}
`;

// Script 3: Limpeza de dados
const scriptLimpezaDados = `
// Deletar todos os veículos
fetch('http://localhost:3001/api/vehicles')
  .then(r => r.json())
  .then(d => d.data.forEach(v => 
    fetch('http://localhost:3001/api/vehicles/' + v._id, {
      method: 'DELETE'
    })
  ));
`;

// ============================================================
// ===   EXPORTAR PARA USO   ===
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        exemplos: {
            exemplo1_criarVeiculo,
            exemplo2_listarVeiculos,
            exemplo3_registrarManutencao,
            exemplo4_agendarServico,
            exemplo5_buscarClima,
            exemplo6_listarDicas,
            exemplo7_atualizarVeiculo,
            exemplo8_deletarVeiculo
        },
        casosUso: {
            casoUso1_GerenciadorGaragem,
            casoUso2_ClienteGaragem,
            casoUso3_AplicacaoMobile
        },
        scripts: {
            scriptTestarConexao,
            scriptCriarDadosTeste,
            scriptLimpezaDados
        },
        respostasErros
    };
}

console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║  📚 EXEMPLOS PRÁTICOS CARREGADOS                    ║
║                                                       ║
║  Para usar os exemplos:                              ║
║  1. Abra este arquivo em um editor                  ║
║  2. Copie os exemplos JSON                          ║
║  3. Cole no Postman/Insomnia                        ║
║  4. Ou execute os scripts no console                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`);
