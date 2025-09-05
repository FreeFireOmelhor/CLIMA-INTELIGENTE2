// server.js

// --- IMPORTS E CONFIGURAÇÃO INICIAL ---
require('dotenv').config();
const express = require('express');
const axios =require('axios');
const cors = require('cors');
const mongoose = require('mongoose');

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
app.use(cors()); // Habilita requisições de outras origens (frontend)
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// --- CONEXÃO COM O MONGODB ---
mongoose.connect(DATABASE_URL)
    .then(() => {
        console.log('✅ Conectado ao MongoDB com sucesso!');
        // popularBancoDeDados(); // Descomente para popular o banco na primeira execução
    })
    .catch(err => {
        console.error('❌ ERRO ao conectar ao MongoDB:', err);
        process.exit(1);
    });

// --- SCHEMAS E MODELS DO MONGOOSE ---

// Schema para Veículos
const veiculoSchema = new mongoose.Schema({
    placa: { type: String, required: [true, 'A placa é obrigatória.'], unique: true, uppercase: true, trim: true },
    tipo: { type: String, required: true, enum: ['CAMINHÃO Z', 'SEDAN X', 'CARRO_ESPORTIVO'] },
    modelo: { type: String, required: [true, 'O modelo é obrigatório.'], trim: true },
    ano: { type: Number, required: [true, 'O ano é obrigatório.'], min: 1900, max: new Date().getFullYear() + 1 },
    proximaRevisao: { type: Date, required: [true, 'A data da próxima revisão é obrigatória.'] }
});
const Veiculo = mongoose.model('Veiculo', veiculoSchema);

// Schema para Dicas de Manutenção
const dicaSchema = new mongoose.Schema({
    dica: { type: String, required: true },
    prioridade: { type: String, enum: ['alta', 'media', 'baixa'] },
    tipoVeiculo: { type: String, required: true, enum: ['GERAL', 'CAMINHÃO Z', 'SEDAN X', 'CARRO_ESPORTIVO'] }
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

// Rota raiz de verificação
app.get('/', (req, res) => res.status(200).send('Servidor da Garagem Inteligente está funcionando!'));

// ===========================================
// ===   ROTAS CRUD (CREATE, READ, UPDATE, DELETE) PARA VEÍCULOS   ===
// ===========================================

/**
 * @route   GET /api/veiculos
 * @desc    READ - Retorna todos os veículos cadastrados
 */
app.get('/api/veiculos', async (req, res) => {
    try {
        const veiculos = await Veiculo.find().sort({ modelo: 1 }); // Ordena por modelo
        res.status(200).json(veiculos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar veículos.', error: error.message });
    }
});

/**
 * @route   POST /api/veiculos
 * @desc    CREATE - Adiciona um novo veículo ao banco de dados
 */
app.post('/api/veiculos', async (req, res) => {
    try {
        const novoVeiculo = new Veiculo(req.body);
        const veiculoSalvo = await novoVeiculo.save();
        res.status(201).json(veiculoSalvo); // 201 Created
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Dados inválidos.', errors: error.errors });
        }
        if (error.code === 11000) { // Conflito (placa duplicada)
             return res.status(409).json({ message: `A placa ${req.body.placa} já está cadastrada.` });
        }
        res.status(500).json({ message: 'Erro ao criar veículo.', error: error.message });
    }
});

/**
 * @route   PUT /api/veiculos/:id
 * @desc    UPDATE - Atualiza um veículo existente pelo seu ID
 */
app.put('/api/veiculos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const veiculoAtualizado = await Veiculo.findByIdAndUpdate(id, req.body, { 
            new: true, // Retorna o documento atualizado
            runValidators: true // Roda as validações do schema na atualização
        });

        if (!veiculoAtualizado) {
            return res.status(404).json({ message: 'Veículo não encontrado.' }); // 404 Not Found
        }
        res.status(200).json(veiculoAtualizado);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Dados de atualização inválidos.', errors: error.errors });
        }
        if (error.code === 11000) {
             return res.status(409).json({ message: `A placa ${req.body.placa} já pertence a outro veículo.` });
        }
        res.status(500).json({ message: 'Erro ao atualizar veículo.', error: error.message });
    }
});

/**
 * @route   DELETE /api/veiculos/:id
 * @desc    DELETE - Deleta um veículo pelo seu ID
 */
app.delete('/api/veiculos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const veiculoDeletado = await Veiculo.findByIdAndDelete(id);

        if (!veiculoDeletado) {
            return res.status(404).json({ message: 'Veículo não encontrado.' });
        }
        res.status(200).json({ message: 'Veículo deletado com sucesso.', veiculo: veiculoDeletado });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar veículo.', error: error.message });
    }
});

// ===========================================
// ===        OUTRAS ROTAS DA API          ===
// ===========================================

// Endpoint para dicas de manutenção
app.get('/api/dicas-manutencao/:tipoVeiculo', async (req, res) => {
    // ... (código original mantido)
});

// Endpoint para viagens populares
app.get('/api/viagens-populares', async (req, res) => {
    // ... (código original mantido)
});

// Endpoint Proxy para OpenWeatherMap
app.get('/api/weather', async (req, res) => {
    // ... (código original mantido)
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});

// --- FUNÇÃO OPCIONAL PARA POPULAR O BANCO DE DADOS (SEED) ---
// (Sem alterações, código original mantido)
async function popularBancoDeDados() {
    // ...
}