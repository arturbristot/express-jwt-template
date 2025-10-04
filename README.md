# Backend API com Autenticação JWT e PostgreSQL

API RESTful desenvolvida com Node.js, Express e PostgreSQL, implementando autenticação com JWT (Access Token + Refresh Token) e CRUD de usuários.

## 📋 Funcionalidades

- ✅ Autenticação com JWT (Access Token + Refresh Token)
- ✅ Refresh tokens armazenados no banco de dados
- ✅ Cookies HTTP-only para segurança
- ✅ CRUD de usuários com hash de senha (bcrypt)
- ✅ Middleware de autenticação e autorização por roles
- ✅ Proteção contra SQL Injection

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **JWT** (jsonwebtoken) - Autenticação baseada em tokens
- **Bcrypt** - Hash de senhas
- **Cookie-parser** - Gerenciamento de cookies
- **Dotenv** - Variáveis de ambiente

## 📦 Instalação

### 1. Clone o repositório

```sh
git clone https://github.com/arturbristot/Express-JWT-TEMPLATE.git
cd Express-JWT-TEMPLATE
```

### 2. Instale as dependências

```sh
npm install
```

### 3. Configure o banco de dados PostgreSQL

Execute os comandos SQL abaixo no seu PostgreSQL para criar o banco e as tabelas:

```sql
-- Criar o banco de dados
CREATE DATABASE Generator_AI;

-- Conectar ao banco
\c Generator_AI

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS public.usuarios
(
    id_usuario integer NOT NULL DEFAULT nextval('usuarios_id_usuario_seq'::regclass),
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    senha character varying(255) COLLATE pg_catalog."default" NOT NULL,
    nome character varying(255) COLLATE pg_catalog."default",
    tipo_usuario character varying(20) COLLATE pg_catalog."default" DEFAULT 'standard'::character varying,
    dt_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario),
    CONSTRAINT usuarios_email_key UNIQUE (email)
);

-- Criar tabela para refresh tokens
CREATE TABLE refresh_tokens (
    id_refresh_token SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX idx_refresh_tokens_usuario ON refresh_tokens(id_usuario);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=Generator_AI
DB_PASSWORD=sua_senha_aqui
DB_PORT=5432

# Autentificação
JWT_SECRET=seu_segredo_super_seguro_aqui_min_32_caracteres
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

⚠️ **IMPORTANTE**: 
- Altere `DB_PASSWORD` para a senha do seu PostgreSQL
- Altere `JWT_SECRET` para uma string aleatória e segura (mínimo 32 caracteres)
- **NUNCA** commite o arquivo `.env` no Git (já está no `.gitignore`)

### 5. Inicie o servidor

**Desenvolvimento (com auto-reload):**
```sh
npm run dev
```

**Produção:**
```sh
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 📚 Estrutura do Projeto

```
Express-JWT-TEMPLATE/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── controllers/
│   │   │   │   └── authController.js
│   │   │   ├── models/
│   │   │   │   └── authModel.js
│   │   │   └── routes/
│   │   │       └── authRoutes.js
│   │   └── users/
│   │       ├── controllers/
│   │       │   └── userController.js
│   │       ├── models/
│   │       │   └── userModel.js
│   │       └── routes/
│   │           └── userRoutes.js
│   └── shared/
│       ├── config/
│       │   └── database.js
│       └── middleware/
│           └── authMiddlewares.js
├── .env
├── .gitignore
├── app.js
└── package.json
```

## 🔌 Endpoints da API

### Autenticação

#### **POST** `/api/auth/login`
Realiza login e retorna access token + refresh token (cookie)

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "user": {
    "id_usuario": 1,
    "email": "usuario@email.com",
    "tipo_usuario": "standard"
  },
  "accessToken": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": 1234567890,
    "issuedAt": 1234567000,
    "expiresIn": 900
  }
}
```

#### **POST** `/api/auth/refresh`
Renova o access token usando o refresh token (cookie)

**Response:**
```json
{
  "accessToken": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": 1234567890,
    "issuedAt": 1234567000,
    "expiresIn": 900
  }
}
```

#### **POST** `/api/auth/logout`
Realiza logout e revoga o refresh token

**Response:**
```json
{
  "message": "Logout realizado com sucesso"
}
```

#### **GET** `/api/auth/verify`
Verifica se o access token é válido

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id_usuario": 1,
    "email": "usuario@email.com",
    "tipo_usuario": "standard"
  }
}
```

### Usuários

#### **POST** `/api/users`
Cria um novo usuário (público - não requer autenticação)

**Body:**
```json
{
  "email": "novo@email.com",
  "senha": "senha123",
  "nome": "João Silva"
}
```

**Response:**
```json
"Usuário criado com sucesso"
```

#### **GET** `/api/users/:id`
Busca usuário por ID (requer autenticação)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id_usuario": 1,
  "nome": "João Silva",
  "email": "joao@email.com"
}
```

#### **PUT** `/api/users/:id`
Atualiza dados do usuário (requer autenticação)

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nome": "João Silva Atualizado",
  "email": "novoemail@email.com",
  "senha": "novaSenha123"
}
```

**Response:**
```json
"Usuário atualizado com sucesso"
```

## 🔒 Segurança

- **Senhas** são hash com bcrypt (salt rounds = 10)
- **Tokens JWT** são assinados com secret key
- **Refresh tokens** são armazenados no banco e podem ser revogados
- **Cookies HTTP-only** para refresh tokens (proteção contra XSS)
- **Proteção SQL Injection** com queries parametrizadas
- **Middleware de autenticação** para rotas protegidas

## 🧪 Testando a API

Você pode usar ferramentas como:
- **Bruno** (arquivos de teste já incluídos em `Bruno_API`)
- **Postman**
- **Insomnia**
- **cURL**

Exemplo com cURL:

```sh
# Criar usuário
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","senha":"123456","nome":"Teste"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"123456"}' \
  -c cookies.txt

# Buscar usuário (usando token)
curl -X GET http://localhost:3001/api/users/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📝 Scripts Disponíveis

```sh
npm start          # Inicia o servidor em produção
npm run dev        # Inicia com nodemon (auto-reload)
npm run dev:watch  # Inicia com watch em src/ e app.js
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 👤 Autor

**Artur Bristot Rocha**
- GitHub: [@arturbristot](https://github.com/arturbristot)

---

⭐ Se este projeto te ajudou, deixe uma estrela!
