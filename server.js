// Importar os módulos necessários
const express = require('express');
const axios = require('axios'); // Para fazer requisições HTTP para a OpenWeatherMap
const cors = require('cors');   // Para permitir requisições de diferentes origens (do seu frontend)
require('dotenv').config();     // Para carregar variáveis de ambiente do arquivo .env

// Inicializar a aplicação Express
const app = express();

// Configurar a porta do servidor
// Render.com definirá a variável de ambiente PORT. Para desenvolvimento local, usamos 3000.
const PORT = process.env.PORT || 3000;

// Chave da API da OpenWeatherMap e URL base da API
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}';

// --- Validação Rigorosa da Configuração Essencial ---
if (!OPENWEATHER_API_KEY) {
    console.error("*******************************************************************");
    console.error("ERRO CRÍTICO: A variável de ambiente OPENWEATHER_API_KEY não está definida.");
    console.error("O servidor não pode funcionar corretamente sem ela.");
    console.error("Verifique seu arquivo .env localmente ou as configurações de ambiente no Render.com.");
    console.error("*******************************************************************");
    // Em um cenário de produção mais robusto, você poderia optar por não iniciar o servidor:
    // process.exit(1);
}

// --- Middlewares ---
// Habilita CORS para permitir que seu frontend (em outra URL) acesse este backend
app.use(cors());

// Middleware para parsear JSON no corpo das requisições (útil para POST/PUT, mas bom ter)
app.use(express.json());

// --- Endpoint Proxy para OpenWeatherMap ---
// Rota: GET /api/weather
// Parâmetros de Query: ?city=NOME_DA_CIDADE
app.get('/api/weather', async (req, res) => {
    const { city } = req.query;

    // 1. Validação do parâmetro 'city'
    if (!city) {
        console.log("Requisição recebida sem o parâmetro 'city'.");
        return res.status(400).json({
            cod: "400", // Mantendo um formato similar ao da OpenWeatherMap para erros
            message: 'Parâmetro de consulta "city" é obrigatório.'
        });
    }

    // 2. Verificação se a API Key está configurada (redundante se o check inicial falhar, mas bom para o contexto da rota)
    if (!OPENWEATHER_API_KEY) {
        console.error("Tentativa de acesso à API sem OPENWEATHER_API_KEY configurada no servidor.");
        return res.status(500).json({
            cod: "500",
            message: 'Erro interno do servidor: Chave da API OpenWeatherMap não configurada.'
        });
    }

    console.log(`Recebida requisição para a cidade: ${city}`);

    try {
        // 3. Realizar a chamada para a API da OpenWeatherMap
        const params = {
            q: city,
            appid: OPENWEATHER_API_KEY,
            units: 'metric', // Para temperatura em Celsius
            lang: 'pt_br'    // Para descrições em português
        };

        console.log(`Fazendo requisição para OpenWeatherMap com params:`, params);
        const response = await axios.get(OPENWEATHER_BASE_URL, { params });

        // 4. Sucesso: Formatar e retornar os dados relevantes para o frontend
        // Isso evita expor dados desnecessários da API original e simplifica para o frontend.
        const weatherData = {
            city: response.data.name,
            country: response.data.sys.country,
            temperature: response.data.main.temp,
            feels_like: response.data.main.feels_like,
            humidity: response.data.main.humidity,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon, // Código do ícone
            windSpeed: response.data.wind.speed,
            datetime: new Date(response.data.dt * 1000) // Convertendo timestamp UNIX para Data JS
        };
        console.log(`Dados da OpenWeatherMap recebidos e formatados para: ${city}`, weatherData);
        res.status(200).json(weatherData);

    } catch (error) {
        // 5. Tratamento de Erros da chamada à OpenWeatherMap
        console.error(`Erro ao buscar dados da OpenWeatherMap para a cidade "${city}":`, error.message);

        if (error.response) {
            // A requisição foi feita e o servidor da OpenWeatherMap respondeu com um status de erro
            console.error('Detalhes do erro da OpenWeatherMap:', error.response.data);
            // Repassar o status e a mensagem de erro da OpenWeatherMap
            return res.status(error.response.status).json({
                cod: String(error.response.data.cod) || String(error.response.status),
                message: error.response.data.message || 'Erro ao comunicar com o serviço de meteorologia.'
            });
        } else if (error.request) {
            // A requisição foi feita mas nenhuma resposta foi recebida (problema de rede, API offline)
            console.error('Nenhuma resposta recebida da OpenWeatherMap:', error.request);
            return res.status(503).json({ // 503 Service Unavailable
                cod: "503",
                message: 'Serviço de meteorologia indisponível no momento. Tente novamente mais tarde.'
            });
        } else {
            // Algo aconteceu ao configurar a requisição que disparou um erro
            console.error('Erro na configuração da requisição:', error.message);
            return res.status(500).json({
                cod: "500",
                message: 'Erro interno no servidor ao processar sua solicitação.'
            });
        }
    }
});

// Rota raiz para verificar se o servidor está online (útil para health checks do Render)
app.get('/', (req, res) => {
    res.status(200).send('Servidor de Previsão do Tempo está funcionando!');
});

// --- Iniciar o Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
    if (OPENWEATHER_API_KEY) {
        console.log("OPENWEATHER_API_KEY carregada com sucesso.");
    } else {
        console.warn("ATENÇÃO: OPENWEATHER_API_KEY NÃO está configurada. O proxy da OpenWeatherMap não funcionará.");
    }
});

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Dados simulados em memória
const veiculos = [
    { placa: "ABC1D23", tipo: "MOTO", modelo: "Honda CB 500", ano: 2020, proximaRevisao: "2023-12-15" },
    { placa: "DEF4G56", tipo: "CARRO", modelo: "Volkswagen Gol", ano: 2018, proximaRevisao: "2023-11-20" },
    { placa: "GHI7J89", tipo: "CARRO_ESPORTIVO", modelo: "Porsche 911", ano: 2022, proximaRevisao: "2024-01-10" }
];

const dicasManutencao = {
    GERAL: [
        { id: 1, dica: "Verifique o nível do óleo regularmente", prioridade: "alta" },
        { id: 2, dica: "Calibre os pneus semanalmente", prioridade: "media" },
        { id: 3, dica: "Confira o fluido de arrefecimento mensalmente", prioridade: "media" }
    ],
    MOTO: [
        { id: 4, dica: "Lubrifique a corrente a cada 500km", prioridade: "alta" },
        { id: 5, dica: "Verifique a pressão dos pneus antes de viagens longas", prioridade: "alta" }
    ],
    CARRO: [
        { id: 6, dica: "Faça o rodízio dos pneus a cada 10.000km", prioridade: "media" },
        { id: 7, dica: "Substitua o filtro de ar anualmente", prioridade: "baixa" }
    ],
    CARRO_ESPORTIVO: [
        { id: 8, dica: "Verifique o sistema de suspensão regularmente", prioridade: "alta" },
        { id: 9, dica: "Troque o óleo com frequência maior devido ao alto desempenho", prioridade: "alta" }
    ]
};

const viagensPopulares = [
    { id: 1, destino: "Serra Gaúcha", distancia: 120, melhorEpoca: "Abril a Novembro" },
    { id: 2, destino: "Florianópolis", distancia: 180, melhorEpoca: "Verão" },
    { id: 3, destino: "Gramado", distancia: 115, melhorEpoca: "Junho a Agosto" }
];

// Endpoint para previsão do tempo (existente)
app.get('/api/clima/:cidade', async (req, res) => {
    try {
        const { cidade } = req.params;
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=pt`);
        
        const climaData = {
            temperatura: response.data.main.temp,
            condicao: response.data.weather[0].main,
            descricao: response.data.weather[0].description,
            umidade: response.data.main.humidity,
            vento: response.data.wind.speed,
            visibilidade: response.data.visibility / 1000 // convertendo para km
        };
        
        res.json(climaData);
    } catch (error) {
        console.error("Erro na API de clima:", error.message);
        res.status(500).json({ error: "Erro ao obter dados climáticos" });
    }
});

// Novos endpoints
app.get('/api/dicas-manutencao', (req, res) => {
    res.json({
        dicas: dicasManutencao.GERAL,
        mensagem: "Dicas gerais de manutenção para todos os veículos"
    });
});

app.get('/api/dicas-manutencao/:tipoVeiculo', (req, res) => {
    const { tipoVeiculo } = req.params;
    const tipoFormatado = tipoVeiculo.toUpperCase();
    
    if (dicasManutencao[tipoFormatado]) {
        res.json({
            dicas: [...dicasManutencao.GERAL, ...dicasManutencao[tipoFormatado]],
            mensagem: `Dicas específicas para ${tipoFormatado.replace('_', ' ')}`
        });
    } else {
        res.status(404).json({ 
            error: "Tipo de veículo não encontrado",
            tiposDisponiveis: ["MOTO", "CARRO", "CARRO_ESPORTIVO"] 
        });
    }
});

app.get('/api/veiculos/:placa/proxima-revisao', (req, res) => {
    const { placa } = req.params;
    const veiculo = veiculos.find(v => v.placa === placa);
    
    if (veiculo) {
        res.json({
            placa: veiculo.placa,
            modelo: veiculo.modelo,
            proximaRevisao: veiculo.proximaRevisao,
            diasRestantes: Math.floor((new Date(veiculo.proximaRevisao) - new Date()) / (1000 * 60 * 60 * 24))
        });
    } else {
        res.status(404).json({ error: "Veículo não encontrado" });
    }
});

app.get('/api/viagens-populares', (req, res) => {
    const { limite } = req.query;
    let viagens = [...viagensPopulares];
    
    if (limite && !isNaN(limite)) {
        viagens = viagens.slice(0, parseInt(limite));
    }
    
    res.json(viagens);
});

// Endpoint para obter todos os veículos
app.get('/api/veiculos', (req, res) => {
    res.json(veiculos);
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Algo deu errado no servidor!" });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
