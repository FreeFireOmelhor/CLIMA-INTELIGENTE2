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