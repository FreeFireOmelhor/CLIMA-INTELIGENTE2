// ============================================================
// ===   SERVIDOR FULL-STACK - GARAGEM INTELIGENTE    ===
// ============================================================

// --- IMPORTS E CONFIGURAÇÃO INICIAL ---
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// --- INICIALIZAÇÃO DO EXPRESS ---
const app = express();
const PORT = process.env.PORT || 3001;

// --- VALIDAÇÃO DAS VARIÁVEIS DE AMBIENTE ---
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/giga-garage';

// --- CONFIGURAÇÃO DO MULTER PARA UPLOAD DE IMAGENS ---
const UPLOADS_FOLDER = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
    console.log(`📁 Diretório de uploads criado: ${UPLOADS_FOLDER}`);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

// --- MIDDLEWARES ---
app.use(cors()); // Habilita requisições de outras origens
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse formulários
app.use(express.static(path.join(__dirname, 'public'))); // Servir arquivos estáticos
app.use('/uploads', express.static(UPLOADS_FOLDER)); // Servir imagens

// --- CONEXÃO COM O MONGODB ---
mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('✅ Conectado ao MongoDB com sucesso!');
        console.log(`📊 Banco: ${DATABASE_URL.split('/').pop()}`);
        addInitialData(); // Adicionar dados iniciais se necessário
    })
    .catch(err => {
        console.error('❌ ERRO ao conectar ao MongoDB:', err.message);
        console.warn('⚠️  Certifique-se de que o MongoDB está rodando em localhost:27017');
    });

// --- SCHEMAS E MODELS DO MONGOOSE ---

// Schema para Veículos
const veiculoSchema = new mongoose.Schema({
    marca: { type: String, required: [true, 'Marca é obrigatória'] },
    modelo: { type: String, required: [true, 'Modelo é obrigatório'] },
    placa: { type: String, required: [true, 'Placa é obrigatória'], unique: true, uppercase: true, trim: true },
    tipo: { type: String, enum: ['CAMINHÃO Z', 'SEDAN X', 'CARRO_ESPORTIVO', 'Outro'], default: 'Outro' },
    ano: { type: Number, min: 1900, max: new Date().getFullYear() + 1 },
    imageUrl: { type: String, default: '/img/default-vehicle.jpg' },
    proximaRevisao: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

veiculoSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Veiculo = mongoose.model('Veiculo', veiculoSchema);

// Schema para Manutenção
const manutencaoSchema = new mongoose.Schema({
    veiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Veiculo', required: true },
    data: { type: Date, required: true },
    servicos: [{ type: String, required: true }],
    observacoes: { type: String },
    custo: { type: Number, default: 0, min: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Manutencao = mongoose.model('Manutencao', manutencaoSchema);

// Schema para Agendamento
const agendamentoSchema = new mongoose.Schema({
    veiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Veiculo', required: true },
    servicos: [{ type: String }],
    data: { type: Date, required: true },
    status: { type: String, enum: ['pendente', 'confirmado', 'concluído'], default: 'pendente' },
    createdAt: { type: Date, default: Date.now }
});

const Agendamento = mongoose.model('Agendamento', agendamentoSchema);

// Schema para Dicas de Manutenção
const dicaSchema = new mongoose.Schema({
    dica: { type: String, required: true },
    prioridade: { type: String, enum: ['alta', 'media', 'baixa'], default: 'media' },
    tipoVeiculo: { type: String, enum: ['GERAL', 'CAMINHÃO Z', 'SEDAN X', 'CARRO_ESPORTIVO'], default: 'GERAL' },
    createdAt: { type: Date, default: Date.now }
});

const Dica = mongoose.model('Dica', dicaSchema);

// --- ROTAS DA API ---

// Rota raiz de verificação
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: '✅ Servidor da Garagem Inteligente está funcionando!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// ===== ROTAS PARA VEÍCULOS (CRUD) =====

/**
 * GET /api/vehicles - Retorna todos os veículos
 */
app.get('/api/vehicles', async (req, res) => {
    try {
        const vehicles = await Veiculo.find().sort({ marca: 1, modelo: 1 });
        res.status(200).json({ success: true, data: vehicles, count: vehicles.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar veículos', error: error.message });
    }
});

/**
 * GET /api/vehicles/:id - Retorna um veículo específico
 */
app.get('/api/vehicles/:id', async (req, res) => {
    try {
        const vehicle = await Veiculo.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Veículo não encontrado' });
        }
        res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar veículo', error: error.message });
    }
});

/**
 * POST /api/vehicles - Cria um novo veículo
 */
app.post('/api/vehicles', upload.single('imageUrl'), async (req, res) => {
    try {
        const vehicleData = { ...req.body };
        if (req.file) {
            vehicleData.imageUrl = `/uploads/${req.file.filename}`;
        }
        
        const novoVeiculo = new Veiculo(vehicleData);
        const veiculoSalvo = await novoVeiculo.save();
        res.status(201).json({ success: true, message: 'Veículo criado com sucesso', data: veiculoSalvo });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: `Placa ${req.body.placa} já cadastrada` });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.errors });
        }
        res.status(500).json({ success: false, message: 'Erro ao criar veículo', error: error.message });
    }
});

/**
 * PUT /api/vehicles/:id - Atualiza um veículo
 */
app.put('/api/vehicles/:id', upload.single('imageUrl'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const updatedVehicle = await Veiculo.findByIdAndUpdate(req.params.id, updateData, { 
            new: true, 
            runValidators: true 
        });
        
        if (!updatedVehicle) {
            return res.status(404).json({ success: false, message: 'Veículo não encontrado' });
        }
        res.status(200).json({ success: true, message: 'Veículo atualizado com sucesso', data: updatedVehicle });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Placa já cadastrada' });
        }
        res.status(500).json({ success: false, message: 'Erro ao atualizar veículo', error: error.message });
    }
});

/**
 * DELETE /api/vehicles/:id - Deleta um veículo
 */
app.delete('/api/vehicles/:id', async (req, res) => {
    try {
        const deletedVehicle = await Veiculo.findByIdAndDelete(req.params.id);
        if (!deletedVehicle) {
            return res.status(404).json({ success: false, message: 'Veículo não encontrado' });
        }
        
        // Limpar dados relacionados
        await Manutencao.deleteMany({ veiculo: req.params.id });
        await Agendamento.deleteMany({ veiculo: req.params.id });
        
        res.status(200).json({ success: true, message: 'Veículo e registros relacionados deletados' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao deletar veículo', error: error.message });
    }
});

// ===== ROTAS PARA MANUTENÇÕES =====

/**
 * GET /api/vehicles/:vehicleId/maintenances - Lista manutenções de um veículo
 */
app.get('/api/vehicles/:vehicleId/maintenances', async (req, res) => {
    try {
        const maintenances = await Manutencao.find({ veiculo: req.params.vehicleId })
            .populate('veiculo')
            .sort({ data: -1 });
        res.status(200).json({ success: true, data: maintenances, count: maintenances.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar manutenções', error: error.message });
    }
});

/**
 * POST /api/vehicles/:vehicleId/maintenances - Cria uma manutenção
 */
app.post('/api/vehicles/:vehicleId/maintenances', async (req, res) => {
    try {
        const veiculoExiste = await Veiculo.findById(req.params.vehicleId);
        if (!veiculoExiste) {
            return res.status(404).json({ success: false, message: 'Veículo não encontrado' });
        }

        const novaManutencao = new Manutencao({
            veiculo: req.params.vehicleId,
            data: req.body.data || req.body.date,
            servicos: req.body.servicos || req.body.services,
            observacoes: req.body.observacoes || req.body.observations,
            custo: req.body.custo || req.body.cost || 0
        });

        const manutencaoSalva = await novaManutencao.save();
        await manutencaoSalva.populate('veiculo');
        res.status(201).json({ success: true, message: 'Manutenção registrada', data: manutencaoSalva });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao registrar manutenção', error: error.message });
    }
});

/**
 * GET /api/maintenances/:maintenanceId - Retorna uma manutenção específica
 */
app.get('/api/maintenances/:maintenanceId', async (req, res) => {
    try {
        const maintenance = await Manutencao.findById(req.params.maintenanceId).populate('veiculo');
        if (!maintenance) {
            return res.status(404).json({ success: false, message: 'Manutenção não encontrada' });
        }
        res.status(200).json({ success: true, data: maintenance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar manutenção', error: error.message });
    }
});

/**
 * PUT /api/maintenances/:maintenanceId - Atualiza uma manutenção
 */
app.put('/api/maintenances/:maintenanceId', async (req, res) => {
    try {
        const updatedMaintenance = await Manutencao.findByIdAndUpdate(
            req.params.maintenanceId,
            req.body,
            { new: true, runValidators: true }
        ).populate('veiculo');

        if (!updatedMaintenance) {
            return res.status(404).json({ success: false, message: 'Manutenção não encontrada' });
        }
        res.status(200).json({ success: true, message: 'Manutenção atualizada', data: updatedMaintenance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao atualizar manutenção', error: error.message });
    }
});

/**
 * DELETE /api/maintenances/:maintenanceId - Deleta uma manutenção
 */
app.delete('/api/maintenances/:maintenanceId', async (req, res) => {
    try {
        const deletedMaintenance = await Manutencao.findByIdAndDelete(req.params.maintenanceId);
        if (!deletedMaintenance) {
            return res.status(404).json({ success: false, message: 'Manutenção não encontrada' });
        }
        res.status(200).json({ success: true, message: 'Manutenção deletada' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao deletar manutenção', error: error.message });
    }
});

// ===== ROTAS PARA AGENDAMENTOS =====

/**
 * GET /api/agendamentos - Lista todos os agendamentos
 */
app.get('/api/agendamentos', async (req, res) => {
    try {
        const agendamentos = await Agendamento.find().populate('veiculo').sort({ data: 1 });
        res.status(200).json({ success: true, data: agendamentos, count: agendamentos.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos', error: error.message });
    }
});

/**
 * POST /api/agendamentos - Cria um agendamento
 */
app.post('/api/agendamentos', async (req, res) => {
    try {
        const { vehicleId, veiculo, selectedServices, servicos, data, date } = req.body;
        const veiculoId = vehicleId || veiculo;

        const veiculoExiste = await Veiculo.findById(veiculoId);
        if (!veiculoExiste) {
            return res.status(404).json({ success: false, message: 'Veículo não encontrado' });
        }

        const novoAgendamento = new Agendamento({
            veiculo: veiculoId,
            servicos: selectedServices || servicos || [],
            data: data || date
        });

        const agendamentoSalvo = await novoAgendamento.save();
        await agendamentoSalvo.populate('veiculo');
        res.status(201).json({ success: true, message: 'Agendamento criado', data: agendamentoSalvo });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao criar agendamento', error: error.message });
    }
});

/**
 * PUT /api/agendamentos/:id - Atualiza um agendamento
 */
app.put('/api/agendamentos/:id', async (req, res) => {
    try {
        const updatedAgendamento = await Agendamento.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('veiculo');

        if (!updatedAgendamento) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }
        res.status(200).json({ success: true, message: 'Agendamento atualizado', data: updatedAgendamento });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao atualizar agendamento', error: error.message });
    }
});

/**
 * DELETE /api/agendamentos/:id - Deleta um agendamento
 */
app.delete('/api/agendamentos/:id', async (req, res) => {
    try {
        const deletedAgendamento = await Agendamento.findByIdAndDelete(req.params.id);
        if (!deletedAgendamento) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }
        res.status(200).json({ success: true, message: 'Agendamento deletado' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao deletar agendamento', error: error.message });
    }
});

// ===== ROTAS PARA DICAS DE MANUTENÇÃO =====

/**
 * GET /api/dicas-manutencao - Lista todas as dicas
 */
app.get('/api/dicas-manutencao', async (req, res) => {
    try {
        const dicas = await Dica.find().sort({ prioridade: -1 });
        res.status(200).json({ success: true, data: dicas, count: dicas.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar dicas', error: error.message });
    }
});

/**
 * GET /api/dicas-manutencao/:tipoVeiculo - Dicas por tipo de veículo
 */
app.get('/api/dicas-manutencao/:tipoVeiculo', async (req, res) => {
    try {
        const { tipoVeiculo } = req.params;
        const dicas = await Dica.find({
            $or: [
                { tipoVeiculo: 'GERAL' },
                { tipoVeiculo: tipoVeiculo }
            ]
        }).sort({ prioridade: -1 });
        res.status(200).json({ success: true, data: dicas, count: dicas.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar dicas', error: error.message });
    }
});

/**
 * POST /api/dicas-manutencao - Cria uma dica
 */
app.post('/api/dicas-manutencao', async (req, res) => {
    try {
        const novaDica = new Dica(req.body);
        const dicaSalva = await novaDica.save();
        res.status(201).json({ success: true, message: 'Dica adicionada', data: dicaSalva });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao adicionar dica', error: error.message });
    }
});

// ===== ROTAS PARA CLIMA (OPENWEATHER) =====

/**
 * GET /api/weather - Busca dados de clima
 */
app.get('/api/weather', async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ success: false, message: 'Cidade não fornecida' });
        }

        if (!OPENWEATHER_API_KEY) {
            return res.status(500).json({ success: false, message: 'Chave da API do OpenWeather não configurada' });
        }

        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                appid: OPENWEATHER_API_KEY,
                units: 'metric',
                lang: 'pt_br'
            }
        });

        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar dados de clima', error: error.message });
    }
});
// ===== TRATAMENTO DE ROTAS NÃO ENCONTRADAS =====

app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Rota não encontrada', 
        path: req.originalUrl 
    });
});

// ===== INICIALIZAÇÃO DO SERVIDOR =====

app.listen(PORT, () => {
    console.log('\n============================================================');
    console.log('🚀 SERVIDOR INICIADO COM SUCESSO!');
    console.log(`📡 Porta: http://localhost:${PORT}`);
    console.log(`📊 MongoDB: ${DATABASE_URL}`);
    console.log('============================================================\n');
});

// ===== FUNÇÃO PARA ADICIONAR DADOS INICIAIS =====

async function addInitialData() {
    try {
        const existingVehicles = await Veiculo.countDocuments();
        if (existingVehicles === 0) {
            console.log('📝 Adicionando dados iniciais...');
            
            const initialVehicles = [
                { marca: 'Nissan', modelo: 'Titan Warrior', placa: 'TITAN88', tipo: 'CAMINHÃO Z', ano: 2023 },
                { marca: 'Declasse', modelo: 'Vigero (Recruit)', placa: 'RECRUT01', tipo: 'SEDAN X', ano: 2022 },
                { marca: 'Kawasaki', modelo: 'Ninja H2R (Fury)', placa: 'FURY666', tipo: 'CARRO_ESPORTIVO', ano: 2024 }
            ];
            
            const savedVehicles = await Veiculo.insertMany(initialVehicles);
            console.log(`✅ ${savedVehicles.length} veículos adicionados`);

            // Adicionar manutenções de exemplo
            if (savedVehicles.length > 0) {
                const initialMaintenances = [
                    {
                        veiculo: savedVehicles[0]._id,
                        data: new Date('2024-01-15'),
                        servicos: ['Troca de Óleo', 'Filtro de Ar'],
                        observacoes: 'Manutenção de rotina',
                        custo: 250.00
                    },
                    {
                        veiculo: savedVehicles[0]._id,
                        data: new Date('2024-06-20'),
                        servicos: ['Troca de Pneu', 'Balanceamento'],
                        observacoes: 'Pneus dianteiros novos',
                        custo: 800.00
                    }
                ];
                await Manutencao.insertMany(initialMaintenances);
                console.log(`✅ ${initialMaintenances.length} manutenções adicionadas`);
            }

            // Adicionar dicas de exemplo
            const initialDicas = [
                { dica: 'Troque o óleo a cada 5000 km', tipoVeiculo: 'GERAL', prioridade: 'alta' },
                { dica: 'Verifique a pressão dos pneus mensalmente', tipoVeiculo: 'GERAL', prioridade: 'media' },
                { dica: 'Revise os freios a cada 2 anos', tipoVeiculo: 'GERAL', prioridade: 'alta' }
            ];
            await Dica.insertMany(initialDicas);
            console.log(`✅ ${initialDicas.length} dicas adicionadas`);
        }
    } catch (error) {
        console.error('⚠️  Erro ao adicionar dados iniciais:', error.message);
    }
}
