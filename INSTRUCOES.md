# 🚀 INSTRUÇÕES DE USO - GARAGEM INTELIGENTE FULL-STACK

## ✅ Pré-requisitos Instalados

- ✅ Node.js
- ✅ npm
- ✅ MongoDB (local ou Atlas)

## 📦 Passo 1: Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

Isso instalará:
- express
- mongoose
- cors
- multer
- axios
- dotenv

## ⚙️ Passo 2: Configurar .env

O arquivo `.env` já foi criado com a seguinte configuração:

```env
PORT=3001
DATABASE_URL=mongodb+srv://ramonsarzedavargas444:67034482@cluster0.t2z47xb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
OPENWEATHER_API_KEY=sua_chave_da_api_aqui
NODE_ENV=development
```

**Se você usar MongoDB local, altere:**
```env
DATABASE_URL=mongodb://localhost:27017/giga-garage
```

## 🎯 Passo 3: Iniciar o Servidor

```bash
npm start
```

Você verá:
```
============================================================
🚀 SERVIDOR INICIADO COM SUCESSO!
📡 Porta: http://localhost:3001
📊 MongoDB: mongodb+srv://...
============================================================
```

## 🌐 Passo 4: Acessar a Aplicação

Abra seu navegador e acesse:

```
http://127.0.0.1:5500/public/index-fullstack.html
```

## 📊 Estrutura de Dados MongoDB

### Veículos (Vehicles)
```json
{
  "_id": "ObjectId",
  "marca": "Nissan",
  "modelo": "Titan Warrior",
  "placa": "TITAN88",
  "tipo": "CAMINHÃO Z",
  "ano": 2023,
  "imageUrl": "/uploads/imagem.jpg",
  "proximaRevisao": "2024-12-15",
  "createdAt": "2024-12-05T10:00:00Z",
  "updatedAt": "2024-12-05T10:00:00Z"
}
```

### Manutenções (Maintenances)
```json
{
  "_id": "ObjectId",
  "veiculo": "ObjectId do veículo",
  "data": "2024-12-05",
  "servicos": ["Troca de Óleo", "Filtro de Ar"],
  "observacoes": "Manutenção de rotina",
  "custo": 250.00,
  "createdAt": "2024-12-05T10:00:00Z"
}
```

### Agendamentos (Appointments)
```json
{
  "_id": "ObjectId",
  "veiculo": "ObjectId do veículo",
  "servicos": ["Alinhamento"],
  "data": "2024-12-20",
  "status": "pendente",
  "createdAt": "2024-12-05T10:00:00Z"
}
```

## 🔌 Endpoints da API

### Veículos
- `GET /api/vehicles` - Listar todos
- `GET /api/vehicles/:id` - Obter um
- `POST /api/vehicles` - Criar
- `PUT /api/vehicles/:id` - Atualizar
- `DELETE /api/vehicles/:id` - Deletar

### Manutenções
- `GET /api/vehicles/:vehicleId/maintenances` - Listar
- `POST /api/vehicles/:vehicleId/maintenances` - Criar
- `DELETE /api/maintenances/:id` - Deletar

### Agendamentos
- `GET /api/agendamentos` - Listar todos
- `POST /api/agendamentos` - Criar
- `DELETE /api/agendamentos/:id` - Deletar

### Dicas
- `GET /api/dicas-manutencao` - Listar todas
- `GET /api/dicas-manutencao/:tipoVeiculo` - Por tipo

### Clima
- `GET /api/weather?city=SãoPaulo` - Dados climáticos

## 🧪 Testar a API com Postman/Insomnia

### Exemplo 1: Criar Veículo
```
POST http://localhost:3001/api/vehicles
Content-Type: application/json

{
  "marca": "Toyota",
  "modelo": "Corolla",
  "placa": "ABC1234",
  "tipo": "SEDAN X",
  "ano": 2023
}
```

### Exemplo 2: Listar Veículos
```
GET http://localhost:3001/api/vehicles
```

### Exemplo 3: Criar Manutenção
```
POST http://localhost:3001/api/vehicles/{ID_DO_VEICULO}/maintenances
Content-Type: application/json

{
  "data": "2024-12-05",
  "servicos": ["Troca de Óleo"],
  "observacoes": "Manutenção regular",
  "custo": 150.00
}
```

## 🎨 Funcionalidades da Interface

1. **Veículos** - Adicionar, visualizar e deletar veículos
2. **Manutenções** - Registrar serviços realizados
3. **Agendamentos** - Agendar futuras manutenções
4. **Dicas** - Consultar dicas de manutenção
5. **Clima** - Ver previsão de tempo

## 🐛 Solução de Problemas

### Erro: "Cannot connect to MongoDB"
- Verifique se MongoDB está rodando
- Para MongoDB Atlas, verifique a senha no `.env`
- Confira se a IP está autorizada no Atlas

### Erro: "Port 3001 already in use"
- Mude a porta no `.env` para 3002, 3003, etc.
- Ou feche a aplicação que usa a porta

### Erros CORS
- Já foi configurado automaticamente no servidor
- Frontend e backend podem estar em portas diferentes

## 📁 Arquivos Principais

- `server.js` - Servidor Express + Mongoose + API
- `.env` - Variáveis de ambiente
- `public/index-fullstack.html` - Interface web
- `public/cliente-api.js` - Client-side API
- `package.json` - Dependências

## 🎓 Para Aprender Mais

- MongoDB: https://docs.mongodb.com/
- Express: https://expressjs.com/
- Mongoose: https://mongoosejs.com/
- OpenWeather API: https://openweathermap.org/api

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do servidor no terminal
2. Abra o DevTools do navegador (F12) para ver erros
3. Confirme que todas as variáveis estão configuradas

---

**Sistema pronto para produção! Divirta-se gerenciando sua garagem! 🏎️✨**
