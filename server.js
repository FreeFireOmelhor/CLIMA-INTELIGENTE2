// --- server.js ---

// --- IMPORTAÇÕES DOS MÓDULOS ---
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// --- INICIALIZAÇÃO DO APP EXPRESS ---
const app = express();
const PORT = process.env.PORT || 3000; // A porta onde o servidor vai rodar

// --- MIDDLEWARE ---
// Para o Express entender JSON vindo no corpo das requisições
app.use(express.json());
// Para o Express entender dados de formulários
app.use(express.urlencoded({ extended: true }));
// Para servir os arquivos estáticos (html, css, js, img) da pasta 'public'
// É uma boa prática colocar seus arquivos de front-end em uma pasta como 'public'
app.use(express.static(path.join(__dirname)));


// --- CONEXÃO COM O MONGODB ---
// Substitua a string de conexão pela sua. Crie um banco chamado 'giga-garage'
const MONGO_URI = "mongodb://localhost:27017/giga-garage";

mongoose.connect(MONGO_URI)
    .then(() => console.log("CONEXÃO COM MONGODB FORJADA COM SUCESSO!"))
    .catch(err => console.error("FALHA AO FORJAR CONEXÃO COM MONGODB:", err));

// --- DEFINIÇÃO DOS SCHEMAS E MODELS ---

// Schema do Veículo
const VeiculoSchema = new mongoose.Schema({
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    placa: { type: String, required: true, unique: true, uppercase: true },
    imageUrl: { type: String, default: 'img/default-vehicle.jpg' }, // Para armazenar a URL da imagem
    createdAt: { type: Date, default: Date.now }
});
const Veiculo = mongoose.model('Veiculo', VeiculoSchema);

// Schema da Manutenção
const ManutencaoSchema = new mongoose.Schema({
    veiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Veiculo', required: true }, // Referência ao Veículo
    data: { type: Date, required: true },
    servicos: [{ type: String, required: true }], // Quais serviços foram feitos
    observacoes: { type: String }, // Notas adicionais
    custo: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Manutencao = mongoose.model('Manutencao', ManutencaoSchema);


// Schema do Agendamento (Atualizado para referenciar Veiculo)
const AgendamentoSchema = new mongoose.Schema({
    veiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Veiculo', required: true }, // Referência ao Veículo
    servicos: [{ type: String }], // Um array de strings
    data: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now } // Data de criação do registro
});
const Agendamento = mongoose.model('Agendamento', AgendamentoSchema);


// --- ROTAS DA API (CRUD) ---

// --- ROTAS PARA VEÍCULOS ---

// [CREATE] Rota para criar um novo veículo
app.post('/api/vehicles', async (req, res) => {
    try {
        const novoVeiculo = new Veiculo(req.body);
        const veiculoSalvo = await novoVeiculo.save();
        res.status(201).json(veiculoSalvo);
    } catch (error) {
        // Handle duplicate plate error
        if (error.code === 11000) {
            return res.status(400).json({ message: "ERRO: PLACA JÁ CADASTRADA!", error: error.message });
        }
        res.status(400).json({ message: "ERRO AO CADASTRAR VEÍCULO", error: error.message });
    }
});

// [READ] Rota para buscar todos os veículos
app.get('/api/vehicles', async (req, res) => {
    try {
        const vehicles = await Veiculo.find().sort({ marca: 1, modelo: 1 });
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: "ERRO AO BUSCAR VEÍCULOS", error: error.message });
    }
});

// [READ] Rota para buscar um único veículo por ID
app.get('/api/vehicles/:id', async (req, res) => {
    try {
        const vehicle = await Veiculo.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: "VEÍCULO NÃO ENCONTRADO" });
        }
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: "ERRO AO BUSCAR VEÍCULO", error: error.message });
    }
});

// [UPDATE] Rota para atualizar um veículo
app.put('/api/vehicles/:id', async (req, res) => {
    try {
        const updatedVehicle = await Veiculo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedVehicle) {
            return res.status(404).json({ message: "VEÍCULO NÃO ENCONTRADO" });
        }
        res.status(200).json(updatedVehicle);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "ERRO: PLACA JÁ CADASTRADA!", error: error.message });
        }
        res.status(400).json({ message: "ERRO AO ATUALIZAR VEÍCULO", error: error.message });
    }
});

// [DELETE] Rota para deletar um veículo
app.delete('/api/vehicles/:id', async (req, res) => {
    try {
        const deletedVehicle = await Veiculo.findByIdAndDelete(req.params.id);
        if (!deletedVehicle) {
            return res.status(404).json({ message: "VEÍCULO NÃO ENCONTRADO" });
        }
        // Opcional: Deletar manutenções e agendamentos relacionados
        await Manutencao.deleteMany({ veiculo: req.params.id });
        await Agendamento.deleteMany({ veiculo: req.params.id });
        res.status(200).json({ message: "VEÍCULO E REGISTROS RELACIONADOS DELETADOS COM SUCESSO!" });
    } catch (error) {
        res.status(500).json({ message: "ERRO AO DELETAR VEÍCULO", error: error.message });
    }
});


// --- ROTAS PARA MANUTENÇÕES (Sub-recurso de Veículo) ---

// [CREATE] Rota para criar uma nova manutenção para um veículo
app.post('/api/vehicles/:vehicleId/maintenances', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const veiculoExiste = await Veiculo.findById(vehicleId);
        if (!veiculoExiste) {
            return res.status(404).json({ message: "VEÍCULO NÃO ENCONTRADO PARA CADASTRAR MANUTENÇÃO." });
        }

        const novaManutencao = new Manutencao({
            veiculo: vehicleId,
            data: req.body.date,
            servicos: req.body.services,
            observacoes: req.body.observations,
            custo: req.body.cost
        });

        const manutencaoSalva = await novaManutencao.save();
        res.status(201).json(manutencaoSalva);
    } catch (error) {
        res.status(400).json({ message: "ERRO AO CADASTRAR MANUTENÇÃO", error: error.message });
    }
});

// [READ] Rota para buscar todas as manutenções de um veículo específico
app.get('/api/vehicles/:vehicleId/maintenances', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const veiculoExiste = await Veiculo.findById(vehicleId);
        if (!veiculoExiste) {
            return res.status(404).json({ message: "VEÍCULO NÃO ENCONTRADO PARA BUSCAR MANUTENÇÕES." });
        }
        // Popula os dados do veículo referenciado
        const maintenances = await Manutencao.find({ veiculo: vehicleId }).populate('veiculo').sort({ data: -1 });
        res.status(200).json(maintenances);
    } catch (error) {
        res.status(500).json({ message: "ERRO AO BUSCAR MANUTENÇÕES", error: error.message });
    }
});

// [READ] Rota para buscar uma única manutenção por ID para um veículo específico
app.get('/api/vehicles/:vehicleId/maintenances/:maintenanceId', async (req, res) => {
    try {
        const { vehicleId, maintenanceId } = req.params;
        const maintenance = await Manutencao.findOne({ _id: maintenanceId, veiculo: vehicleId }).populate('veiculo');
        if (!maintenance) {
            return res.status(404).json({ message: "MANUTENÇÃO NÃO ENCONTRADA PARA ESTE VEÍCULO." });
        }
        res.status(200).json(maintenance);
    } catch (error) {
        res.status(500).json({ message: "ERRO AO BUSCAR MANUTENÇÃO", error: error.message });
    }
});

// [UPDATE] Rota para atualizar uma manutenção de um veículo específico
app.put('/api/vehicles/:vehicleId/maintenances/:maintenanceId', async (req, res) => {
    try {
        const { vehicleId, maintenanceId } = req.params;
        const updatedMaintenance = await Manutencao.findOneAndUpdate(
            { _id: maintenanceId, veiculo: vehicleId },
            req.body,
            { new: true, runValidators: true }
        ).populate('veiculo');
        if (!updatedMaintenance) {
            return res.status(404).json({ message: "MANUTENÇÃO NÃO ENCONTRADA PARA ESTE VEÍCULO." });
        }
        res.status(200).json(updatedMaintenance);
    } catch (error) {
        res.status(400).json({ message: "ERRO AO ATUALIZAR MANUTENÇÃO", error: error.message });
    }
});

// [DELETE] Rota para deletar uma manutenção de um veículo específico
app.delete('/api/vehicles/:vehicleId/maintenances/:maintenanceId', async (req, res) => {
    try {
        const { vehicleId, maintenanceId } = req.params;
        const deletedMaintenance = await Manutencao.findOneAndDelete({ _id: maintenanceId, veiculo: vehicleId });
        if (!deletedMaintenance) {
            return res.status(404).json({ message: "MANUTENÇÃO NÃO ENCONTRADA PARA ESTE VEÍCULO." });
        }
        res.status(200).json({ message: "MANUTENÇÃO DELETADA COM SUCESSO!" });
    } catch (error) {
        res.status(500).json({ message: "ERRO AO DELETAR MANUTENÇÃO", error: error.message });
    }
});


// --- ROTAS PARA AGENDAMENTOS (Atualizadas para usar Veiculo ID) ---

// [CREATE] Rota para criar um novo agendamento
app.post('/api/agendamentos', async (req, res) => {
    try {
        const { vehicleId, selectedServices, date } = req.body;

        const veiculoExiste = await Veiculo.findById(vehicleId);
        if (!veiculoExiste) {
            return res.status(404).json({ message: "VEÍCULO SELECIONADO NÃO ENCONTRADO." });
        }

        const novoAgendamento = new Agendamento({
            veiculo: vehicleId,
            servicos: selectedServices,
            data: date
        });

        const agendamentoSalvo = await novoAgendamento.save();
        // Popula o veículo para retornar informações completas
        await agendamentoSalvo.populate('veiculo');
        res.status(201).json(agendamentoSalvo); // Status 201: Criado
    } catch (error) {
        res.status(400).json({ message: "ERRO AO FORJAR AGENDAMENTO", error: error.message });
    }
});

// [READ] Rota para buscar todos os agendamentos (populando detalhes do veículo)
app.get('/api/agendamentos', async (req, res) => {
    try {
        // .populate('veiculo') irá substituir o ID do veículo pelos dados completos do objeto Veiculo
        const agendamentos = await Agendamento.find().populate('veiculo').sort({ data: 1 });
        res.status(200).json(agendamentos);
    } catch (error) {
        res.status(500).json({ message: "ERRO AO BUSCAR AGENDAMENTOS", error: error.message });
    }
});

// [DELETE] Rota para deletar um agendamento
app.delete('/api/agendamentos/:id', async (req, res) => {
    try {
        const deletedAppointment = await Agendamento.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) {
            return res.status(404).json({ message: "AGENDAMENTO NÃO ENCONTRADO." });
        }
        res.status(200).json({ message: "AGENDAMENTO DELETADO COM SUCESSO!" });
    } catch (error) {
        res.status(500).json({ message: "ERRO AO DELETAR AGENDAMENTO", error: error.message });
    }
});


// --- INICIANDO O SERVIDOR ---
app.listen(PORT, () => {
    console.log(`GIGA GARAGE RODANDO NA ARENA http://localhost:${PORT}`);
    // Adicionar alguns dados iniciais se o banco estiver vazio (para teste)
    addInitialData();
});

// Função para adicionar dados iniciais (apenas para desenvolvimento)
async function addInitialData() {
    const existingVehicles = await Veiculo.countDocuments();
    if (existingVehicles === 0) {
        console.log("Adicionando veículos iniciais...");
        const initialVehicles = [
            { marca: 'Nissan', modelo: 'Titan Warrior', placa: 'TITAN88', imageUrl: 'img/titan.jpg' },
            { marca: 'Declasse', modelo: 'Vigero (Recruit)', placa: 'RECRUT01', imageUrl: 'img/recruit.jpg' },
            { marca: 'Kawasaki', modelo: 'Ninja H2R (Fury)', placa: 'FURY666', imageUrl: 'img/h2r.jpg' }
        ];
        const savedVehicles = await Veiculo.insertMany(initialVehicles);
        console.log("Veículos iniciais adicionados:", savedVehicles.map(v => v.placa));

        // Adicionar algumas manutenções de exemplo para o primeiro veículo
        if (savedVehicles.length > 0) {
            console.log("Adicionando manutenções iniciais...");
            const firstVehicleId = savedVehicles[0]._id;
            const initialMaintenances = [
                {
                    veiculo: firstVehicleId,
                    data: new Date('2024-01-15'),
                    servicos: ['Troca de Óleo', 'Filtro de Ar'],
                    observacoes: 'Manutenção de rotina, tudo ok.',
                    custo: 250.00
                },
                {
                    veiculo: firstVehicleId,
                    data: new Date('2024-06-20'),
                    servicos: ['Troca de Pneu', 'Balanceamento'],
                    observacoes: 'Pneus dianteiros novos.',
                    custo: 800.00
                }
            ];
            await Manutencao.insertMany(initialMaintenances);
            console.log("Manutenções iniciais adicionadas.");

            // Adicionar agendamentos de exemplo
            const secondVehicleId = savedVehicles[1]._id;
            const thirdVehicleId = savedVehicles[2]._id;
            const initialAppointments = [
                {
                    veiculo: secondVehicleId,
                    data: new Date('2025-09-01'),
                    servicos: ['Check-up', 'Alinhamento']
                },
                {
                    veiculo: thirdVehicleId,
                    data: new Date('2025-09-05'),
                    servicos: ['Upgrade de Performance']
                }
            ];
            await Agendamento.insertMany(initialAppointments);
            console.log("Agendamentos iniciais adicionados.");
        }
    }
}