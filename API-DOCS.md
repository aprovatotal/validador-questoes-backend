# API de Validação de Questões - Documentação

Esta API permite gerenciar questões e usuários em um sistema de validação de questões acadêmicas.

## Base URL
```
http://localhost:3000
```

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Após o login ou registro, você receberá um `accessToken` e um `refreshToken`.

### Headers de Autenticação
Para rotas protegidas, inclua o token no header:
```
Authorization: Bearer <access_token>
```

---

## 📝 Rotas de Autenticação

### 1. Registrar Usuário
**POST** `/auth/register`

Cria uma nova conta de usuário.

#### Request Body:
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123456",
  "disciplineIds": [1, 2] // opcional
}
```

#### Validações:
- `name`: string, mínimo 2 caracteres
- `email`: email válido
- `password`: string, mínimo 8 caracteres
- `disciplineIds`: array de números (opcional)

#### Response (201):
```json
{
  "user": {
    "uuid": "uuid-do-usuario",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "USER",
    "isActive": true
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

---

### 2. Login
**POST** `/auth/login`

Autentica um usuário existente.

#### Request Body:
```json
{
  "email": "joao@email.com",
  "password": "senha123456"
}
```

#### Validações:
- `email`: email válido
- `password`: string obrigatória

#### Response (200):
```json
{
  "user": {
    "uuid": "uuid-do-usuario",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "USER",
    "disciplines": [
      {
        "id": "1",
        "slug": "matematica",
        "name": "Matemática"
      }
    ]
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### Erros Comuns:
- `401`: Credenciais inválidas
- `404`: Usuário não encontrado

---

### 3. Renovar Token
**POST** `/auth/refresh`

Renova o token de acesso usando o refresh token.

#### Request Body:
```json
{
  "refreshToken": "refresh-token"
}
```

#### Validações:
- `refreshToken`: string obrigatória

#### Response (200):
```json
{
  "accessToken": "novo-jwt-token",
  "refreshToken": "novo-refresh-token"
}
```

---

## 📚 Rotas de Questões

> ⚠️ **Todas as rotas de questões requerem autenticação (JWT)**

### 1. Criar Questão
**POST** `/questions`

Cria uma nova questão.

#### Request Body:
```json
{
  "externalid": "Q123456",
  "statement": "Qual é a derivada de x²?",
  "competence": "Cálculo Diferencial",
  "skill": "Calcular derivadas",
  "examArea": "Matemática",
  "subject": "Cálculo I",
  "disciplineId": 1,
  "topic": "Derivadas",
  "interpretation": "Questão sobre conceitos básicos de derivação",
  "strategies": "Aplicar regra da potência",
  "distractors": "Alternativas com erros comuns",
  "alternatives": [
    {
      "text": "2x",
      "order": 1,
      "correct": true
    },
    {
      "text": "x",
      "order": 2,
      "correct": false
    },
    {
      "text": "2",
      "order": 3,
      "correct": false
    },
    {
      "text": "x²",
      "order": 4,
      "correct": false
    }
  ]
}
```

#### Validações:
- Todos os campos obrigatórios devem ser strings válidas
- `disciplineId`: número (deve ser uma disciplina que o usuário tem acesso)
- `alternatives`: array com pelo menos uma alternativa
- Exatamente uma alternativa deve ter `correct: true`
- `interpretation`, `strategies`, `distractors`: opcionais

#### Response (201):
```json
{
  "uuid": "uuid-da-questao",
  "externalid": "Q123456",
  "statement": "Qual é a derivada de x²?",
  "competence": "Cálculo Diferencial",
  "skill": "Calcular derivadas",
  "examArea": "Matemática",
  "subject": "Cálculo I",
  "topic": "Derivadas",
  "interpretation": "Questão sobre conceitos básicos de derivação",
  "strategies": "Aplicar regra da potência",
  "distractors": "Alternativas com erros comuns",
  "approved": false,
  "approvedAt": null,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z",
  "alternatives": [...],
  "discipline": {
    "id": "1",
    "slug": "matematica",
    "name": "Matemática"
  },
  "approvedBy": null
}
```

#### Erros Comuns:
- `403`: Acesso negado à disciplina
- `400`: Questão deve ter exatamente uma alternativa correta

---

### 2. Listar Questões
**GET** `/questions`

Lista questões com paginação e filtros.

#### Query Parameters:
- `discipline` (opcional): slug da disciplina para filtrar
- `page` (opcional): número da página (padrão: 1)
- `pageSize` (opcional): itens por página (padrão: 10)
- `search` (opcional): busca no enunciado, tópico ou assunto

#### Exemplo:
```
GET /questions?discipline=matematica&page=1&pageSize=20&search=derivada
```

#### Response (200):
```json
{
  "data": [
    {
      "uuid": "uuid-da-questao",
      "externalid": "Q123456",
      "statement": "Qual é a derivada de x²?",
      "competence": "Cálculo Diferencial",
      "skill": "Calcular derivadas",
      "examArea": "Matemática",
      "subject": "Cálculo I",
      "topic": "Derivadas",
      "approved": false,
      "createdAt": "2024-01-01T10:00:00Z",
      "alternatives": [...],
      "discipline": {
        "id": "1",
        "slug": "matematica",
        "name": "Matemática"
      },
      "approvedBy": null
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 3. Buscar Questão por UUID
**GET** `/questions/:uuid`

Retorna uma questão específica pelo UUID.

#### Parameters:
- `uuid`: UUID da questão

#### Response (200):
```json
{
  "uuid": "uuid-da-questao",
  "externalid": "Q123456",
  "statement": "Qual é a derivada de x²?",
  "competence": "Cálculo Diferencial",
  "skill": "Calcular derivadas",
  "examArea": "Matemática",
  "subject": "Cálculo I",
  "topic": "Derivadas",
  "interpretation": "Questão sobre conceitos básicos de derivação",
  "strategies": "Aplicar regra da potência",
  "distractors": "Alternativas com erros comuns",
  "approved": false,
  "approvedAt": null,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z",
  "alternatives": [
    {
      "id": "1",
      "text": "2x",
      "order": 1,
      "correct": true,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ],
  "discipline": {
    "id": "1",
    "slug": "matematica",
    "name": "Matemática"
  },
  "approvedBy": null
}
```

#### Erros Comuns:
- `404`: Questão não encontrada
- `403`: Acesso negado à disciplina da questão

---

### 4. Atualizar Questão
**PATCH** `/questions/:uuid`

Atualiza uma questão existente (aceita campos parciais).

#### Parameters:
- `uuid`: UUID da questão

#### Request Body:
Todos os campos são opcionais. Exemplo:
```json
{
  "statement": "Novo enunciado da questão",
  "topic": "Novo tópico",
  "alternatives": [
    {
      "text": "Nova alternativa A",
      "order": 1,
      "correct": true
    },
    {
      "text": "Nova alternativa B",
      "order": 2,
      "correct": false
    }
  ]
}
```

#### Validações:
- Se `alternatives` for fornecido, deve conter exatamente uma alternativa correta
- Se `disciplineId` for fornecido, usuário deve ter acesso à disciplina

#### Response (200):
Retorna a questão atualizada com a mesma estrutura da rota GET.

---

### 5. Aprovar Questão
**PATCH** `/questions/:uuid/approve`

Aprova uma questão (apenas para usuários com roles: REVIEWER, EDITOR, ADMIN).

#### Parameters:
- `uuid`: UUID da questão

#### Permissões Necessárias:
- Role: `REVIEWER`, `EDITOR` ou `ADMIN`

#### Response (200):
```json
{
  "uuid": "uuid-da-questao",
  "approved": true,
  "approvedAt": "2024-01-01T15:30:00Z",
  "approvedBy": {
    "name": "Maria Silva",
    "email": "maria@email.com"
  },
  // ... outros campos da questão
}
```

#### Erros Comuns:
- `403`: Permissões insuficientes para aprovar questões
- `404`: Questão não encontrada

---

### 6. Deletar Questão
**DELETE** `/questions/:uuid`

Remove uma questão permanentemente.

#### Parameters:
- `uuid`: UUID da questão

#### Response (200):
Retorna a questão deletada.

#### Erros Comuns:
- `404`: Questão não encontrada
- `403`: Acesso negado à disciplina da questão

---

## 👥 Roles de Usuário

A API possui diferentes níveis de permissão:

- **USER**: Pode criar, visualizar, editar e deletar suas próprias questões
- **REVIEWER**: Pode aprovar questões além das permissões de USER
- **EDITOR**: Pode aprovar questões além das permissões de USER
- **ADMIN**: Pode aprovar questões além das permissões de USER

---

## 🔐 Controle de Acesso

### Disciplinas
- Usuários só podem acessar questões das disciplinas associadas a eles
- O acesso é verificado em todas as operações de questões

### Autenticação
- Rotas de autenticação (`/auth/*`) são públicas
- Todas as rotas de questões (`/questions/*`) requerem JWT válido
- Tokens expiram e devem ser renovados usando `/auth/refresh`

---

## 📋 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Token inválido ou expirado |
| 403 | Acesso negado |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

## 🔍 Exemplos de Uso

### Fluxo Completo de Autenticação
```bash
# 1. Registrar usuário
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123456"
  }'

# 2. Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123456"
  }'

# 3. Usar token para acessar questões
curl -X GET http://localhost:3000/questions \
  -H "Authorization: Bearer <access_token>"
```

### Criando uma Questão
```bash
curl -X POST http://localhost:3000/questions \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "externalid": "Q001",
    "statement": "Quanto é 2 + 2?",
    "competence": "Aritmética Básica",
    "skill": "Somar números inteiros",
    "examArea": "Matemática",
    "subject": "Matemática Básica",
    "disciplineId": 1,
    "topic": "Adição",
    "alternatives": [
      {"text": "4", "order": 1, "correct": true},
      {"text": "3", "order": 2, "correct": false},
      {"text": "5", "order": 3, "correct": false},
      {"text": "2", "order": 4, "correct": false}
    ]
  }'
```