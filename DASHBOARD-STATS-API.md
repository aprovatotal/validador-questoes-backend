# Documentação - Rota de Estatísticas do Dashboard

## Endpoint

**GET** `/dashboard/stats`

## Descrição

Retorna estatísticas de questões baseadas nas permissões de disciplina do usuário autenticado. Inclui totais gerais e detalhamento por disciplina.

## Autenticação

Esta rota requer autenticação via JWT Bearer Token.

### Header Necessário
```
Authorization: Bearer {token_jwt}
```

## Resposta de Sucesso (200 OK)

### Estrutura da Resposta

```json
{
  "totalQuestions": number,      // Total de questões em todas as disciplinas permitidas
  "totalApproved": number,        // Total de questões aprovadas
  "totalPending": number,         // Total de questões pendentes
  "disciplineStats": [           // Array com estatísticas por disciplina
    {
      "id": number,              // ID da disciplina
      "slug": string,            // Slug da disciplina
      "name": string,            // Nome da disciplina
      "totalQuestions": number,  // Total de questões na disciplina
      "approvedQuestions": number, // Questões aprovadas na disciplina
      "pendingQuestions": number   // Questões pendentes na disciplina
    }
  ],
  "generatedAt": string          // Data/hora de geração das estatísticas (ISO 8601)
}
```

### Exemplo de Resposta

```json
{
  "totalQuestions": 450,
  "totalApproved": 300,
  "totalPending": 150,
  "disciplineStats": [
    {
      "id": 1,
      "slug": "mathematics",
      "name": "Matemática",
      "totalQuestions": 150,
      "approvedQuestions": 100,
      "pendingQuestions": 50
    },
    {
      "id": 2,
      "slug": "portuguese",
      "name": "Português",
      "totalQuestions": 120,
      "approvedQuestions": 80,
      "pendingQuestions": 40
    }
  ],
  "generatedAt": "2024-01-15T10:30:00Z"
}
```

## Possíveis Erros

### 401 Unauthorized
Token JWT inválido ou ausente.

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden
Usuário não tem acesso a nenhuma disciplina.

```json
{
  "statusCode": 403,
  "message": "Você não tem acesso a nenhuma disciplina",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Como Usar

### Exemplo com cURL

```bash
# 1. Primeiro faça login para obter o token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@validador.com",
    "password": "admin123"
  }'

# 2. Use o token retornado para acessar as estatísticas
curl -X GET http://localhost:3000/dashboard/stats \
  -H "Authorization: Bearer {seu_token_aqui}"
```

### Exemplo com JavaScript (Fetch API)

```javascript
// Função para obter estatísticas do dashboard
async function getDashboardStats(token) {
  try {
    const response = await fetch('http://localhost:3000/dashboard/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const stats = await response.json();
    console.log('Estatísticas:', stats);
    return stats;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
  }
}

// Uso
const token = 'seu_token_jwt_aqui';
getDashboardStats(token);
```

### Exemplo com Axios

```javascript
const axios = require('axios');

async function getDashboardStats(token) {
  try {
    const response = await axios.get('http://localhost:3000/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Estatísticas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
}
```

## Notas Importantes

1. **Permissões**: A rota retorna apenas estatísticas das disciplinas que o usuário tem acesso:
   - Usuários com role `ADMIN` veem todas as disciplinas
   - Outros usuários veem apenas as disciplinas associadas ao seu perfil

2. **Performance**: Para grandes volumes de dados, considere implementar cache nas estatísticas

3. **Atualização**: As estatísticas são calculadas em tempo real a cada requisição

## Integração com o Frontend

Esta rota é ideal para exibir um dashboard com:
- Cards mostrando totais gerais
- Gráficos de pizza ou barras com distribuição por disciplina
- Indicadores de progresso de aprovação
- Tabelas detalhadas por disciplina

### Exemplo de Componente React

```jsx
import { useEffect, useState } from 'react';

function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('authToken');
      
      try {
        const response = await fetch('/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (!stats) return <div>Erro ao carregar estatísticas</div>;

  return (
    <div className="dashboard">
      <div className="stats-summary">
        <div className="stat-card">
          <h3>Total de Questões</h3>
          <p>{stats.totalQuestions}</p>
        </div>
        <div className="stat-card">
          <h3>Aprovadas</h3>
          <p>{stats.totalApproved}</p>
        </div>
        <div className="stat-card">
          <h3>Pendentes</h3>
          <p>{stats.totalPending}</p>
        </div>
      </div>
      
      <div className="disciplines-grid">
        {stats.disciplineStats.map(discipline => (
          <div key={discipline.id} className="discipline-card">
            <h4>{discipline.name}</h4>
            <p>Total: {discipline.totalQuestions}</p>
            <p>Aprovadas: {discipline.approvedQuestions}</p>
            <p>Pendentes: {discipline.pendingQuestions}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```