# 🔧 CONFIGURAÇÃO RECOMENDADA - Garagem Inteligente

## 📋 Checklist de Configuração

### 1. Ambiente Local (Desenvolvimento)

#### MongoDB Local
```bash
# Instalar MongoDB Community Edition
# Windows: https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install -y mongodb

# Iniciar MongoDB
mongod

# Ou com Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Node.js e npm
```bash
# Verificar versão
node --version  # v14+ recomendado
npm --version   # v6+ recomendado

# Instalar dependências
npm install
```

### 2. Variáveis de Ambiente (.env)

```env
# Porta do servidor
PORT=3001

# MongoDB Local
DATABASE_URL=mongodb://localhost:27017/giga-garage

# MongoDB Atlas (produção)
# DATABASE_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/giga-garage

# OpenWeather API
# Obtenha em: https://openweathermap.org/api
OPENWEATHER_API_KEY=sua_chave_aqui

# Ambiente
NODE_ENV=development
```

### 3. Plugins Recomendados (VS Code)

```
- MongoDB for VS Code
- Thunder Client (testes API)
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- REST Client
```

### 4. Postman/Insomnia

**Para importar endpoints:**

1. Crie uma coleção
2. Adicione pasta "Vehicles"
3. Crie requisições:

```json
{
  "info": {
    "name": "Garagem Inteligente API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Listar Veículos",
      "request": {
        "method": "GET",
        "url": "http://localhost:3001/api/vehicles"
      }
    }
  ]
}
```

### 5. Git Configuration

```bash
# Inicializar repo
git init

# Adicionar .gitignore
cat > .gitignore << EOF
node_modules/
.env
.env.local
uploads/
dist/
EOF

# Commit inicial
git add .
git commit -m "Initial commit: Garagem Inteligente Full-Stack"
```

### 6. Performance Tweaks

#### Node.js
```bash
# Aumentar heap limit (se necessário)
node --max-old-space-size=4096 server.js

# Rodar com PM2 (produção)
npm install -g pm2
pm2 start server.js --name "giga-garage"
```

#### MongoDB
```javascript
// Criar índices adicionais
db.veiculos.createIndex({ "placa": 1 })
db.veiculos.createIndex({ "marca": 1 })
db.manutencaos.createIndex({ "veiculo": 1 })
```

### 7. CORS Configuration

**Já configurado em server.js:**
```javascript
app.use(cors());
```

Se precisar customizar:
```javascript
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
```

### 8. HTTPS (Produção)

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(3001);
```

### 9. Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

### 10. Logging

```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🚀 Deployment

### Heroku

```bash
# Login
heroku login

# Criar app
heroku create seu-app-name

# Adicionar environment vars
heroku config:set DATABASE_URL=mongodb+srv://...
heroku config:set OPENWEATHER_API_KEY=...

# Deploy
git push heroku main
```

### Docker

**Dockerfile:**
```dockerfile
FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3'
services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: mongodb://mongo:27017/giga-garage
    depends_on:
      - mongo
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
```

### AWS / Google Cloud / Azure

1. Crie conta na plataforma
2. Configure variáveis de ambiente
3. Deploy via CLI ou interface web

## 📊 Monitoramento

### PM2 Plus
```bash
npm install -g pm2-plus
pm2 plus
```

### Sentry (Error tracking)
```bash
npm install @sentry/node
```

### DataDog (APM)
```bash
npm install dd-trace
```

## 🔐 Segurança

### Helmet.js
```bash
npm install helmet
```

```javascript
const helmet = require("helmet");
app.use(helmet());
```

### Validação
```bash
npm install express-validator
```

## 📈 Escalabilidade

### Redis Cache
```bash
npm install redis
```

### Load Balancing
```
nginx + Node.js cluster
```

## 🧪 Testes

### Jest
```bash
npm install --save-dev jest
npm test
```

### Supertest
```bash
npm install --save-dev supertest
```

## ✅ Pré-Produção Checklist

- [ ] .env configurado corretamente
- [ ] MongoDB com backup automático
- [ ] HTTPS habilitado
- [ ] CORS configurado
- [ ] Rate limiting ativo
- [ ] Logging implementado
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Segurança validada
- [ ] Performance otimizada

## 🎯 Recursos Adicionais

- [Node.js Docs](https://nodejs.org/docs/)
- [Express Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

**Criado em: 5 de dezembro de 2025**  
**Versão: 1.0.0**
