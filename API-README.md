# MCP-PDPJ API

API REST para consulta de processos no Portal de Serviços do Poder Judiciário (PDPJ).

## 🚀 Deploy

A API está disponível em: https://mcp-pdpj22.vercel.app/

## 📋 Endpoints

### GET `/`
Informações sobre a API e endpoints disponíveis.

**Resposta:**
```json
{
  "message": "MCP-PDPJ API",
  "description": "API para consulta de processos no PDPJ",
  "endpoints": {
    "/api/processo/:numero": "Consultar processo específico",
    "/api/documentos/:numero": "Listar documentos de um processo"
  },
  "version": "1.0.0"
}
```

### GET `/api/processo/:numero`
Consulta um processo específico pelo número CNJ.

**Parâmetros:**
- `numero`: Número do processo no formato CNJ (ex: 1234567-89.2023.8.02.0001)

**Exemplo:**
```
GET /api/processo/1234567-89.2023.8.02.0001
```

### GET `/api/documentos/:numero`
Lista os documentos de um processo específico.

**Parâmetros:**
- `numero`: Número do processo no formato CNJ

**Exemplo:**
```
GET /api/documentos/1234567-89.2023.8.02.0001
```

### GET `/health`
Endpoint de verificação de saúde da API.

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2025-06-18T10:30:00.000Z"
}
```

## 🔧 Configuração

### Variáveis de Ambiente

Para que a API funcione, você precisa configurar as seguintes variáveis de ambiente no Vercel:

```env
PDPJ_CLIENT_ID=seu_client_id_aqui
PDPJ_CPF=seu_cpf_aqui
PDPJ_SENHA=sua_senha_aqui
```

### Como configurar no Vercel:

1. Acesse o painel do Vercel
2. Vá em Settings > Environment Variables
3. Adicione as 3 variáveis necessárias
4. Faça redeploy do projeto

## 💡 Uso

### cURL
```bash
# Consultar processo
curl "https://mcp-pdpj22.vercel.app/api/processo/1234567-89.2023.8.02.0001"

# Listar documentos
curl "https://mcp-pdpj22.vercel.app/api/documentos/1234567-89.2023.8.02.0001"
```

### JavaScript/Fetch
```javascript
// Consultar processo
const response = await fetch('https://mcp-pdpj22.vercel.app/api/processo/1234567-89.2023.8.02.0001');
const processo = await response.json();

// Listar documentos
const docsResponse = await fetch('https://mcp-pdpj22.vercel.app/api/documentos/1234567-89.2023.8.02.0001');
const documentos = await docsResponse.json();
```

### Python
```python
import requests

# Consultar processo
response = requests.get('https://mcp-pdpj22.vercel.app/api/processo/1234567-89.2023.8.02.0001')
processo = response.json()

# Listar documentos
docs_response = requests.get('https://mcp-pdpj22.vercel.app/api/documentos/1234567-89.2023.8.02.0001')
documentos = docs_response.json()
```

## 🔒 Autenticação

A API utiliza as credenciais configuradas nas variáveis de ambiente para autenticar automaticamente com o PDPJ. Os usuários da API não precisam fornecer credenciais adicionais.

## ❌ Tratamento de Erros

A API retorna códigos HTTP apropriados e mensagens de erro em JSON:

```json
{
  "error": "Descrição do erro",
  "details": "Detalhes técnicos do erro",
  "timestamp": "2025-06-18T10:30:00.000Z"
}
```

### Códigos de Status:
- `200`: Sucesso
- `400`: Erro na requisição (parâmetros inválidos)
- `404`: Endpoint não encontrado
- `500`: Erro interno do servidor

## 🛠️ Desenvolvimento Local

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Copie `.env.example` para `.env.local` e configure as variáveis
4. Execute o build: `npm run build`
5. Execute o servidor: `node index.js`

## 📝 Notas

- Esta API é um wrapper REST para acesso ao PDPJ
- Originalmente construída como um servidor MCP (Model Context Protocol)
- Adaptada para funcionar como API REST no Vercel
