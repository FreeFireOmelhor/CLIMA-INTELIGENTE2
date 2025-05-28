
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const apiKey = process.env.OPENWEATHER_API_KEY;

// Middleware para CORS (permitir requisições do frontend)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Troque * pelo domínio do frontend em produção
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Endpoint para previsão do tempo
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params;

    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API não configurada.' });
    }
    if (!cidade) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        console.log(`[Backend] Buscando previsão para: ${cidade}`);
        const apiResponse = await axios.get(weatherAPIUrl);
        res.json(apiResponse.data); // Retorna os dados da OpenWeather para o frontend
    } catch (error) {
        console.error("[Backend] Erro:", error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Erro ao buscar previsão.';
        res.status(status).json({ error: message });
    }
    app.get('/api/previsao/:cidade'), async (req, res) => {
    const { cidade } = req.params; // Pega a cidade da URL
    const apiKey = process.env.OPENWEATHER_API_KEY; // Pega a chave segura do .env
    const weatherAPIUrl = `...${cidade}...${apiKey}...`;} // Monta a URL para a API externa

    try {
        const apiResponse = await axios.get(weatherAPIUrl); // Backend chama a API externa
        res.json(apiResponse.data); // Backend envia a resposta para o Frontend
    } catch (error) {
        res.status(status).json({ error: message }); // Backend envia erro para o Frontend
    }
});

