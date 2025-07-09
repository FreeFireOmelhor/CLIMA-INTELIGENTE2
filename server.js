// server.js

// --- IMPORTS E CONFIGURAÇÃO INICIAL ---
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose'); // Importando o Mongoose

const app = express();
const PORT = process.env.PORT || 3001;

// --- VALIDAÇÃO DAS VARIÁVEIS DE AMBIENTE ---
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!OPENWEATHER_API_KEY || !DATABASE_URL) {
    console.error("*******************************************************************");
    console.error("ERRO CRÍTICO: Variáveis de ambiente faltando!");
    console.error("Verifique se OPENWEATHER_API_KEY e DATABASE_URL estão no seu arquivo .env.");
    console.error("*******************************************************************");
    process.exit(1); // Impede o servidor de iniciar se a config estiver incompleta
}

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- CONEXÃO COM O MONGODB ---
mongoose.connect(DATABASE_URL)
    .then(() => {
        console.log('✅ Conectado ao MongoDB com sucesso!');
        // popularBancoDeDados(); // Chama a função para popular o banco, se necessário
    })
    .catch(err => {
        console.error('❌ ERRO ao conectar ao MongoDB:', err);
        process.exit(1);
    });

// --- SCHEMAS E MODELS DO MONGOOSE ---

// Schema para Veículos
const veiculoSchema = new mongoose.Schema({
    placa: { type: String, required: true, unique: true, uppercase: true },
    tipo: { type: String, required: true, enum: ['MOTO', 'CARRO', 'CARRO_ESPORTIVO'] },
    modelo: { type: String, required: true },
    ano: { type: Number, required: true },
    proximaRevisao: { type: Date, required: true }
});
const Veiculo = mongoose.model('Veiculo', veiculoSchema);

// Schema para Dicas de Manutenção
const dicaSchema = new mongoose.Schema({
    dica: { type: String, required: true },
    prioridade: { type: String, enum: ['alta', 'media', 'baixa'] },
    tipoVeiculo: { type: String, required: true, enum: ['GERAL', 'MOTO', 'CARRO', 'CARRO_ESPORTIVO'] }
});
const Dica = mongoose.model('Dica', dicaSchema);

// Schema para Viagens Populares
const viagemSchema = new mongoose.Schema({
    destino: { type: String, required: true },
    distancia: { type: Number },
    melhorEpoca: { type: String }
});
const Viagem = mongoose.model('Viagem', viagemSchema);


// --- ROTAS DA API (ENDPOINTS) ---

// Rota raiz
app.get('/', (req, res) => res.status(200).send('Servidor com MongoDB está funcionando!'));

// Endpoint Proxy para OpenWeatherMap (sem alterações)
app.get('/api/weather', async (req, res) => {
    // ... (o código desta rota permanece o mesmo da versão anterior)
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: 'Parâmetro de consulta "city" é obrigatório.' });
    try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: { q: city, appid: OPENWEATHER_API_KEY, units: 'metric', lang: 'pt_br' }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error(`Erro na API de clima para "${city}":`, error.message);
        const status = error.response ? error.response.status : 500;
        const message = error.response ? error.response.data.message : 'Erro no servidor.';
        res.status(status).json({ message });
    }
});

// Endpoint para obter todos os veículos do DB
app.get('/api/veiculos', async (req, res) => {
    try {
        const veiculos = await Veiculo.find();
        res.json(veiculos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar veículos.', error: error.message });
    }
});

// Endpoint para obter próxima revisão do DB
app.get('/api/veiculos/:placa/proxima-revisao', async (req, res) => {
    try {
        const { placa } = req.params;
        const veiculo = await Veiculo.findOne({ placa: placa.toUpperCase() });
        if (veiculo) {
            res.json({
                placa: veiculo.placa,
                modelo: veiculo.modelo,
                proximaRevisao: veiculo.proximaRevisao,
                diasRestantes: Math.ceil((new Date(veiculo.proximaRevisao) - new Date()) / (1000 * 60 * 60 * 24))
            });
        } else {
            res.status(404).json({ message: "Veículo não encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar revisão do veículo.', error: error.message });
    }
});

// Endpoint para dicas de manutenção do DB
app.get('/api/dicas-manutencao/:tipoVeiculo', async (req, res) => {
    try {
        const { tipoVeiculo } = req.params;
        const tipoFormatado = tipoVeiculo.toUpperCase();
        
        const tiposValidos = ['MOTO', 'CARRO', 'CARRO_ESPORTIVO'];
        if (!tiposValidos.includes(tipoFormatado)) {
            return res.status(404).json({ message: 'Tipo de veículo inválido.' });
        }

        // Busca dicas GERAIS e do tipo específico ao mesmo tempo
        const dicas = await Dica.find({ tipoVeiculo: { $in: ['GERAL', tipoFormatado] } });
        
        res.json({
            dicas: dicas,
            mensagem: `Dicas de manutenção para ${tipoFormatado.replace('_', ' ')}`
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dicas de manutenção.', error: error.message });
    }
});

// Endpoint para viagens populares do DB
app.get('/api/viagens-populares', async (req, res) => {
    try {
        const { limite } = req.query;
        let query = Viagem.find();
        
        if (limite && !isNaN(limite)) {
            query = query.limit(parseInt(limite));
        }
        
        const viagens = await query;
        res.json(viagens);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar viagens.', error: error.message });
    }
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});

// --- FUNÇÃO OPCIONAL PARA POPULAR O BANCO DE DADOS (SEED) ---
// Use isso apenas uma vez para inserir os dados iniciais. Depois, pode comentar ou remover.
async function popularBancoDeDados() {
    try {
        // Popula veículos se a coleção estiver vazia
        if (await Veiculo.countDocuments() === 0) {
            await Veiculo.insertMany([
                { placa: "ABC1D23", tipo: "MOTO", modelo: "Honda CB 500", ano: 2020, proximaRevisao: "2024-12-15" },
                { placa: "DEF4G56", tipo: "CARRO", modelo: "Volkswagen Gol", ano: 2018, proximaRevisao: "2024-11-20" },
                { placa: "GHI7J89", tipo: "CARRO_ESPORTIVO", modelo: "Porsche 911", ano: 2022, proximaRevisao: "2025-01-10" }
            ]);
            console.log('Coleção de Veículos populada com dados iniciais.');
        }

        // Popula dicas se a coleção estiver vazia
        if (await Dica.countDocuments() === 0) {
            await Dica.insertMany([
                { dica: "Verifique o nível do óleo regularmente", prioridade: "alta", tipoVeiculo: "GERAL" },
                { dica: "Calibre os pneus semanalmente", prioridade: "media", tipoVeiculo: "GERAL" },
                { dica: "Lubrifique a corrente a cada 500km", prioridade: "alta", tipoVeiculo: "MOTO" },
                { dica: "Faça o rodízio dos pneus a cada 10.000km", prioridade: "media", tipoVeiculo: "CARRO" },
                { dica: "Verifique o sistema de freios com frequência", prioridade: "alta", tipoVeiculo: "CARRO_ESPORTIVO" }
            ]);
            console.log('Coleção de Dicas populada com dados iniciais.');
        }
        
        // Popula viagens se a coleção estiver vazia
        if (await Viagem.countDocuments() === 0) {
            await Viagem.insertMany([
                { destino: "Serra Gaúcha, RS", distancia: 700, melhorEpoca: "Inverno" },
                { destino: "Litoral de Santa Catarina, SC", distancia: 500, melhorEpoca: "Verão" },
                { destino: "Rota Romântica, RS", distancia: 120, melhorEpoca: "Primavera/Outono" }
            ]);
            console.log('Coleção de Viagens populada com dados iniciais.');
        }

    } catch (error) {
        console.error('Erro ao popular o banco de dados:', error);
    }
}