# 🏎️ Garagem Inteligente - Full-Stack

Sistema completo de gerenciamento de garagem inteligente com backend em Node.js/Express, banco de dados MongoDB e interface web moderna.

## 📋 Características

✅ **CRUD Completo de Veículos** - Criar, ler, atualizar e deletar veículos  
✅ **Gerenciamento de Manutenções** - Registrar e acompanhar serviços  
✅ **Sistema de Agendamentos** - Agendar manutenções  
✅ **Dicas de Manutenção** - Base de conhecimento por tipo de veículo  
✅ **Integração com OpenWeather** - Dados climáticos em tempo real  
✅ **Upload de Imagens** - Armazenamento de fotos de veículos  
✅ **Banco de Dados MongoDB** - Persistência de dados  

## 🛠️ Tecnologias

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Multer (upload de arquivos)
- Axios (requisições HTTP)
- CORS (integração frontend-backend)

**Frontend:**
- HTML5 + CSS3 + JavaScript
- Fetch API para comunicação

## 📦 Instalação

### 1. Pré-requisitos
- Node.js (versão 14+)
- MongoDB (local ou Atlas)
- npm ou yarn

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3001
DATABASE_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/giga-garage
OPENWEATHER_API_KEY=sua_chave_da_api
NODE_ENV=development
```

**Configurações importantes:**
- `DATABASE_URL`: Conexão com MongoDB (local ou Atlas)
- `OPENWEATHER_API_KEY`: Obtenha em https://openweathermap.org/api

### 4. Iniciar o servidor

```bash
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 📚 API Endpoints

### Veículos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/vehicles` | Listar todos os veículos |
| GET | `/api/vehicles/:id` | Obter veículo por ID |
| POST | `/api/vehicles` | Criar novo veículo |
| PUT | `/api/vehicles/:id` | Atualizar veículo |
| DELETE | `/api/vehicles/:id` | Deletar veículo |

### Manutenções

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/vehicles/:vehicleId/maintenances` | Listar manutenções |
| POST | `/api/vehicles/:vehicleId/maintenances` | Criar manutenção |
| PUT | `/api/maintenances/:id` | Atualizar manutenção |
| DELETE | `/api/maintenances/:id` | Deletar manutenção |

### Agendamentos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/agendamentos` | Listar agendamentos |
| POST | `/api/agendamentos` | Criar agendamento |
| PUT | `/api/agendamentos/:id` | Atualizar agendamento |
| DELETE | `/api/agendamentos/:id` | Cancelar agendamento |

### Dicas de Manutenção

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dicas-manutencao` | Listar todas as dicas |
| GET | `/api/dicas-manutencao/:tipoVeiculo` | Dicas por tipo |
| POST | `/api/dicas-manutencao` | Adicionar dica |

### Clima

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/weather?city=CityName` | Dados de clima |

## 📝 Exemplos de Uso

### Criar Veículo

```javascript
const vehicleData = {
  marca: "Nissan",
  modelo: "Titan Warrior",
  placa: "TITAN88",
  tipo: "CAMINHÃO Z",
  ano: 2023
};

const result = await makeRequest('/vehicles', 'POST', vehicleData);
```

### Registrar Manutenção

```javascript
const maintenanceData = {
  data: "2024-12-05",
  servicos: ["Troca de Óleo", "Filtro de Ar"],
  observacoes: "Manutenção de rotina",
  custo: 250.00
};

const result = await makeRequest('/vehicles/ID_DO_VEICULO/maintenances', 'POST', maintenanceData);
```

### Agendar Serviço

```javascript
const appointmentData = {
  veiculo: "ID_DO_VEICULO",
  servicos: ["Alinhamento", "Balanceamento"],
  data: "2024-12-20"
};

const result = await makeRequest('/agendamentos', 'POST', appointmentData);
```

## 🔧 Estrutura do Projeto

```
CLIMA-INTELIGENTE2-main/
├── server.js              # Servidor principal
├── .env                   # Variáveis de ambiente
├── package.json           # Dependências
├── public/                # Arquivos estáticos
│   ├── index.html         # Interface web
│   ├── script.js          # Script original
│   ├── cliente-api.js     # Cliente API (novo)
│   ├── CSS/
│   │   └── style.css
│   └── Imagens/
└── uploads/               # Pasta de uploads (criada automaticamente)
```

## 🚀 Recursos Implementados

### ✅ Backend
- [x] Servidor Express funcionando
- [x] Conexão MongoDB integrada
- [x] CRUD completo de veículos
- [x] CRUD de manutenções com referência
- [x] CRUD de agendamentos
- [x] Sistema de dicas
- [x] Integração OpenWeather
- [x] Upload de imagens (Multer)
- [x] Tratamento de erros
- [x] Validação de dados

### ✅ Frontend
- [x] Cliente API em JavaScript
- [x] Funções de requisição HTTP
- [x] Renderização de dados
- [x] Notificações ao usuário
- [x] Integração com servidor

## 🐛 Erros Corrigidos

- ✅ Duplicação de código no `server.js`
- ✅ Porta conflitante (3000 vs 3001)
- ✅ Variáveis de ambiente não validadas
- ✅ Imports conflitantes
- ✅ Middleware duplicado
- ✅ Schemas duplicados do Mongoose

## 📖 Como Usar o Cliente API

Incluir no HTML:

```html
<script src="cliente-api.js"></script>
```

Exemplos de uso:

```javascript
// Listar veículos
renderVehiclesList();

// Listar agendamentos
renderAppointmentsList();

// Obter clima
const weather = await getWeather('São Paulo');

// Deletar veículo
await deleteVehicle('ID_DO_VEICULO');
```

## 🔐 Segurança

- CORS habilitado para requisições cross-origin
- Validação de dados no servidor
- Índices únicos no banco para evitar duplicatas
- Tratamento de erros apropriado

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se MongoDB está rodando
2. Confira as variáveis de ambiente no `.env`
3. Verifique os logs do servidor
4. Teste endpoints com Postman ou Insomnia

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para Garagem Inteligente**
