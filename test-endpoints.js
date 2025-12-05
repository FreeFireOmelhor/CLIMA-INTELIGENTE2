#!/usr/bin/env node

/**
 * 🧪 TESTE RÁPIDO DOS ENDPOINTS DO SERVER
 * Execute com: npm test ou node test-endpoints.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Cores para terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Função para fazer requisições HTTP
function fazerRequisicao(metodo, caminho, dados = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(caminho, BASE_URL);
        const opcoes = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(opcoes, (res) => {
            let dados_resposta = '';
            res.on('data', (chunk) => {
                dados_resposta += chunk;
            });
            res.on('end', () => {
                try {
                    const json = JSON.parse(dados_resposta);
                    resolve({ status: res.statusCode, dados: json });
                } catch (e) {
                    resolve({ status: res.statusCode, dados: dados_resposta });
                }
            });
        });

        req.on('error', reject);

        if (dados) {
            req.write(JSON.stringify(dados));
        }
        req.end();
    });
}

// Função para testar endpoint
async function testarEndpoint(metodo, caminho, descricao, dados = null) {
    try {
        console.log(`\n${colors.cyan}[TESTANDO]${colors.reset} ${descricao}`);
        console.log(`${colors.blue}${metodo} ${caminho}${colors.reset}`);

        const resultado = await fazerRequisicao(metodo, caminho, dados);

        if (resultado.status >= 200 && resultado.status < 300) {
            console.log(`${colors.green}✅ SUCCESS${colors.reset} (${resultado.status})`);
            console.log(`   Resposta: ${JSON.stringify(resultado.dados).substring(0, 100)}...`);
        } else {
            console.log(`${colors.red}❌ ERRO${colors.reset} (${resultado.status})`);
            console.log(`   ${JSON.stringify(resultado.dados)}`);
        }
    } catch (error) {
        console.log(`${colors.red}❌ ERRO DE CONEXÃO:${colors.reset} ${error.message}`);
        console.log(`${colors.yellow}⚠️  Certifique-se de que o servidor está rodando: npm start${colors.reset}`);
    }
}

// Executar testes
async function executarTestes() {
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.green}🧪 TESTE DOS ENDPOINTS - GARAGEM INTELIGENTE${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);

    // Testes
    await testarEndpoint('GET', '/', 'Verificar servidor');
    await testarEndpoint('GET', '/api/health', 'Status de saúde');
    await testarEndpoint('GET', '/api/stats', 'Estatísticas gerais');
    await testarEndpoint('GET', '/api/vehicles', 'Listar veículos');
    await testarEndpoint('GET', '/api/veiculos', 'Listar veículos (alias)');
    await testarEndpoint('GET', '/api/agendamentos', 'Listar agendamentos');
    await testarEndpoint('GET', '/api/dicas-manutencao', 'Listar dicas de manutenção');
    await testarEndpoint('GET', '/api/viagens-populares', 'Viagens populares');
    await testarEndpoint('GET', '/api/weather?city=São Paulo', 'Clima atual');
    
    // Testes de controle
    await testarEndpoint('POST', '/api/garagem/porta', 'Abrir porta da garagem', { acao: 'abrir' });
    await testarEndpoint('POST', '/api/garagem/luzes', 'Ligar luzes da garagem', { acao: 'ligar' });

    console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.green}✅ TESTES CONCLUÍDOS${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

// Executar
console.log(`${colors.yellow}Aguardando 2s para conectar ao servidor...${colors.reset}\n`);
setTimeout(executarTestes, 2000);
