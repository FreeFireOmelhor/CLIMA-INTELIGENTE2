# 🏎️ GARAGEM INTELIGENTE - Full-Stack MongoDB

## 📋 Descrição do Projeto

Sistema completo de gerenciamento de garagem com:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: HTML5 + CSS3 + JavaScript
- **API**: 33 endpoints RESTful
- **Autenticação**: Dados seguros com .env
- **Uploads**: Multer para imagens de veículos
- **Clima**: Integração com OpenWeatherMap
- **Interface**: Responsiva e moderna

## 🚀 Como Começar

### 1. **Clonar ou descompactar o projeto**
```bash
cd CLIMA-INTELIGENTE2-main
```

### 2. **Instalar dependências**
```bash
npm install
```

### 3. **Configurar arquivo `.env`**
```
PORT=3001
DATABASE_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/banco
OPENWEATHER_API_KEY=sua_chave_aqui
NODE_ENV=development
```

### 4. **Iniciar servidor**
```bash
npm start
```

### 5. **Acessar aplicação**
- Abrir navegador: `http://localhost:3001`
- API disponível em: `http://localhost:3001/api`

## 📊 Endpoints da API

### 🚗 **Veículos** (5)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/vehicles` | Listar todos os veículos |
| GET | `/api/vehicles/:id` | Obter veículo por ID |
| POST | `/api/vehicles` | Criar novo veículo |
| PUT | `/api/vehicles/:id` | Atualizar veículo |
| DELETE | `/api/vehicles/:id` | Deletar veículo |

### 🔧 **Manutenções** (5)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/vehicles/:vehicleId/maintenances` | Listar manutenções de um veículo |
| POST | `/api/vehicles/:vehicleId/maintenances` | Registrar nova manutenção |
| GET | `/api/maintenances/:maintenanceId` | Obter manutenção específica |
| PUT | `/api/maintenances/:maintenanceId` | Atualizar manutenção |
| DELETE | `/api/maintenances/:maintenanceId` | Deletar manutenção |

### 📅 **Agendamentos** (4)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/agendamentos` | Listar todos os agendamentos |
| POST | `/api/agendamentos` | Criar novo agendamento |
| PUT | `/api/agendamentos/:id` | Atualizar agendamento |
| DELETE | `/api/agendamentos/:id` | Cancelar agendamento |

### 💡 **Dicas de Manutenção** (3)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dicas-manutencao` | Listar todas as dicas |
| GET | `/api/dicas-manutencao/:tipoVeiculo` | Dicas por tipo de veículo |
| POST | `/api/dicas-manutencao` | Adicionar nova dica |

### 🌤️ **Clima** (3)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/weather?city=Cidade` | Clima atual de uma cidade |
| GET | `/api/previsao/:cidade` | Previsão de 5 dias |
| GET | `/api/weather-current/:cidade` | Clima com informações estendidas |

### 🛣️ **Consultas Especiais** (3)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/veiculos` | Listar todos os veículos (alias) |
| GET | `/api/viagens-populares` | Listar viagens mais populares entre cidades |
| GET | `/api/veiculos/:placa/proxima-revisao` | Data da próxima revisão de um veículo |

### 🏠 **Controle de Garagem** (2)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/garagem/porta` | Abrir/fechar porta da garagem |
| POST | `/api/garagem/luzes` | Ligar/desligar luzes da garagem |

### ⚙️ **Sistema** (3)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Verificação básica do servidor |
| GET | `/api/health` | Status de saúde (servidor e BD) |
| GET | `/api/stats` | Estatísticas gerais do sistema |

## 📝 Exemplos de Uso

### Criar um Veículo
```javascript
const novoVeiculo = {
    marca: "Toyota",
    modelo: "Corolla",
    placa: "ABC1234",
    tipo: "SEDAN X",
    ano: 2023
};

const response = await fetch('http://localhost:3001/api/vehicles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novoVeiculo)
});
```

### Agendar Manutenção
```javascript
const agendamento = {
    veiculo: "ID_DO_VEICULO",
    servicos: ["Troca de óleo", "Filtro de ar"],
    data: "2025-02-15",
    status: "pendente"
};

const response = await fetch('http://localhost:3001/api/agendamentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agendamento)
});
```

### Verificar Clima
```javascript
const response = await fetch('http://localhost:3001/api/weather?city=São Paulo');
const clima = await response.json();
console.log(clima.data.main.temp); // Temperatura atual
```

### Controlar Garagem
```javascript
// Abrir porta
const response = await fetch('http://localhost:3001/api/garagem/porta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acao: 'abrir' })
});

// Ligar luzes
const response2 = await fetch('http://localhost:3001/api/garagem/luzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acao: 'ligar' })
});
```

## 🗄️ Estrutura do Banco de Dados

### Collections MongoDB

#### **Veiculos**
```javascript
{
    _id: ObjectId,
    marca: String,
    modelo: String,
    placa: String (unique),
    tipo: "CAMINHÃO Z" | "SEDAN X" | "CARRO_ESPORTIVO",
    ano: Number,
    imageUrl: String,
    proximaRevisao: Date,
    createdAt: Date,
    updatedAt: Date
}
```

#### **Manutencaos**
```javascript
{
    _id: ObjectId,
    veiculo: ObjectId (ref: Veiculo),
    data: Date,
    servicos: [String],
    observacoes: String,
    custo: Number,
    createdAt: Date
}
```

#### **Agendamentos**
```javascript
{
    _id: ObjectId,
    veiculo: ObjectId (ref: Veiculo),
    servicos: [String],
    data: Date,
    status: "pendente" | "confirmado" | "concluído",
    createdAt: Date
}
```

#### **Dicas**
```javascript
{
    _id: ObjectId,
    dica: String,
    prioridade: "alta" | "media" | "baixa",
    tipoVeiculo: "GERAL" | "CAMINHÃO Z" | "SEDAN X" | "CARRO_ESPORTIVO",
    createdAt: Date
}
```

## 🔐 Variáveis de Ambiente

```env
# Servidor
PORT=3001

# Banco de Dados
DATABASE_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/banco

# APIs Externas
OPENWEATHER_API_KEY=sua_chave_aqui

# Ambiente
NODE_ENV=development

# Configurações
MAX_FILE_SIZE=5242880
LOG_LEVEL=debug
```

## 📦 Dependências

```json
{
    "axios": "^1.9.0",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "mongoose": "^8.0.0",
    "multer": "^1.4.5-lts.1"
}
```

## 🧪 Testando a API

### Usando cURL
```bash
# Testar servidor
curl http://localhost:3001/

# Listar veículos
curl http://localhost:3001/api/vehicles

# Verificar saúde
curl http://localhost:3001/api/health

# Obter clima
curl "http://localhost:3001/api/weather?city=São Paulo"
```

### Usando Postman
1. Importar endpoints em `http://localhost:3001/api`
2. Configurar headers: `Content-Type: application/json`
3. Testar cada endpoint com dados de exemplo

## 🎨 Frontend

### Acessar Interface Web
```
http://localhost:3001
```

### Funcionalidades
- ✅ Cadastro e gerenciamento de veículos
- ✅ Registro de manutenções
- ✅ Agendamento de serviços
- ✅ Dicas de manutenção por tipo
- ✅ Consulta de clima e previsão
- ✅ Upload de imagens
- ✅ Interface responsiva

## 🚀 Deployment

### Heroku
```bash
heroku login
heroku create seu-app-name
git push heroku main
```

### Docker
```bash
docker build -t garagem-inteligente .
docker run -p 3001:3001 garagem-inteligente
```

### AWS / Azure / GCP
Veja `CONFIGURACAO.md` para instruções detalhadas

## 📚 Documentação Adicional

- `INSTRUCOES.md` - Guia de instalação passo a passo
- `RESUMO_IMPLEMENTACAO.md` - Detalhes técnicos
- `CONFIGURACAO.md` - Configuração avançada
- `MELHORIAS_SERVER.md` - Endpoints novos adicionados
- `EXEMPLOS_PRATICOS.js` - Exemplos de uso da API

## 🐛 Troubleshooting

### Erro de conexão MongoDB
```
Certifique-se de que:
- URL do MongoDB está correta em .env
- Firewall permite conexão
- IP está whitelistado (MongoDB Atlas)
```

### Chave OpenWeather não funciona
```
- Obtenha chave em: https://openweathermap.org/api
- Adicione em .env como OPENWEATHER_API_KEY
```

### Porta 3001 em uso
```bash
# Mudar porta em .env
PORT=3002
npm start
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique `INSTRUCOES.md`
2. Consulte `CONFIGURACAO.md`
3. Veja exemplos em `EXEMPLOS_PRATICOS.js`
4. Teste com `test-endpoints.js`

## 📄 Licença

MIT

---

**Status**: ✅ Produção Pronto | **Versão**: 1.0.0 | **Atualizado**: 2025-12-05
