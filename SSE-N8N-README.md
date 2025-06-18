# SSE Endpoint para n8n - MCP-PDPJ

## 📡 Server-Sent Events (SSE)

Este endpoint permite conexões em tempo real com o n8n usando Server-Sent Events.

### 🔗 URL Base
```
https://mcp-pdpj22.vercel.app/sse
```

## 🚀 Como usar no n8n

### 1. Configuração Básica no n8n

#### Node: **HTTP Request**
- **Method**: `GET`
- **URL**: `https://mcp-pdpj22.vercel.app/sse`
- **Headers**:
  ```json
  {
    "Accept": "text/event-stream",
    "Cache-Control": "no-cache"
  }
  ```

### 2. Consultando Processos via SSE

#### URL com Parâmetros:
```
https://mcp-pdpj22.vercel.app/sse?action=consultar_processo&numero=NUMERO_DO_PROCESSO
```

#### URL para Listar Documentos:
```
https://mcp-pdpj22.vercel.app/sse?action=listar_documentos&numero=NUMERO_DO_PROCESSO
```

### 3. Exemplos de URLs

#### Consultar Processo:
```
https://mcp-pdpj22.vercel.app/sse?action=consultar_processo&numero=1234567-89.2023.8.02.0001
```

#### Listar Documentos:
```
https://mcp-pdpj22.vercel.app/sse?action=listar_documentos&numero=1234567-89.2023.8.02.0001
```

## 📨 Tipos de Eventos SSE

### 1. **connected** - Conexão Estabelecida
```json
{
  "message": "Connected to MCP-PDPJ SSE endpoint",
  "timestamp": "2024-12-18T10:30:00.000Z",
  "capabilities": ["consultar_processo", "listar_documentos"]
}
```

### 2. **processo_consultado** - Processo Consultado
```json
{
  "action": "consultar_processo",
  "numero": "1234567-89.2023.8.02.0001",
  "resultado": {
    // dados do processo aqui
  },
  "timestamp": "2024-12-18T10:30:01.000Z"
}
```

### 3. **documentos_listados** - Documentos Listados
```json
{
  "action": "listar_documentos",
  "numero": "1234567-89.2023.8.02.0001",
  "resultado": [
    // array de documentos aqui
  ],
  "timestamp": "2024-12-18T10:30:02.000Z"
}
```

### 4. **error** - Erro na Operação
```json
{
  "error": "Mensagem de erro",
  "action": "consultar_processo",
  "numero": "1234567-89.2023.8.02.0001",
  "timestamp": "2024-12-18T10:30:03.000Z"
}
```

### 5. **heartbeat** - Manter Conexão Viva
```json
{
  "type": "heartbeat",
  "timestamp": "2024-12-18T10:30:30.000Z"
}
```

## ⚙️ Configuração Detalhada no n8n

### Workflow Exemplo:

1. **Trigger Node**: Manual/Webhook/Schedule
2. **HTTP Request Node**:
   - Method: `GET`
   - URL: `https://mcp-pdpj22.vercel.app/sse?action=consultar_processo&numero={{$json.numero}}`
   - Headers:
     ```json
     {
       "Accept": "text/event-stream",
       "Cache-Control": "no-cache"
     }
     ```

3. **Code Node** para processar eventos SSE:
   ```javascript
   // Processar dados SSE
   const sseData = items[0].json;
   
   // Filtrar apenas eventos de interesse
   if (sseData.event === 'processo_consultado') {
     return [{
       json: {
         processo: sseData.data.resultado,
         numero: sseData.data.numero,
         timestamp: sseData.data.timestamp
       }
     }];
   }
   
   return [];
   ```

## 🔐 Variáveis de Ambiente Necessárias

Para o funcionamento completo, configure no Vercel:

- `PDPJ_CLIENT_ID` - Client ID para acesso ao PDPJ
- `PDPJ_CPF` - CPF para autenticação
- `PDPJ_SENHA` - Senha para autenticação

## 🧪 Testando o SSE

### Teste Simples com curl:
```bash
curl -N -H "Accept: text/event-stream" \
  "https://mcp-pdpj22.vercel.app/sse?action=consultar_processo&numero=NUMERO_DO_PROCESSO"
```

### Teste de Conexão:
```bash
curl -N -H "Accept: text/event-stream" \
  "https://mcp-pdpj22.vercel.app/sse"
```

## 📋 Notas Importantes

1. **Heartbeat**: O endpoint envia um heartbeat a cada 30 segundos para manter a conexão viva
2. **Timeout**: As conexões SSE podem ter timeout dependendo do provedor (Vercel = ~10 segundos para serverless)
3. **Reconexão**: Configure reconexão automática no n8n para conexões perdidas
4. **Rate Limiting**: Respeite os limites de rate da API do PDPJ

## 🔄 Fluxo de Dados

1. Cliente (n8n) conecta no `/sse`
2. Servidor envia evento `connected`
3. Se parâmetros `action` e `numero` fornecidos, executa ação
4. Servidor envia resultado via evento específico
5. Heartbeats mantêm conexão viva
6. Cliente processa eventos conforme necessário

## ❌ Troubleshooting

### Conexão não estabelece:
- Verifique headers `Accept: text/event-stream`
- Confirme que o endpoint está acessível

### Não recebe dados:
- Verifique se variáveis de ambiente estão configuradas
- Confirme formato do número do processo
- Verifique logs do Vercel para erros

### Conexão interrompida:
- Implemente reconexão automática no n8n
- Verifique timeout settings
