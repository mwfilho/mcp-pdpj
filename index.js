// Importação simples para evitar problemas de dependência
import('./tools/pdpj.js').then(module => {
  // Módulo carregado dinamicamente
}).catch(err => {
  console.error('Error loading pdpj module:', err);
});

export default async function handler(req, res) {
  try {
    // Adicionar headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Endpoint de informações sobre o servidor
    if (url.pathname === '/' || url.pathname === '/api') {
      res.status(200).json({ 
        message: 'MCP-PDPJ API',
        description: 'API para consulta de processos no PDPJ',
        endpoints: {
          '/api/processo/:numero': 'Consultar processo específico',
          '/api/documentos/:numero': 'Listar documentos de um processo',
          '/sse': 'Server-Sent Events endpoint para n8n',
          '/health': 'Health check do serviço'
        },
        sse_usage: {
          'url': '/sse',
          'method': 'GET',
          'with_action': '/sse?action=consultar_processo&numero=NUMERO_PROCESSO',
          'supported_actions': ['consultar_processo', 'listar_documentos']
        },
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Health check
    if (url.pathname === '/health') {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
      return;
    }

    // SSE Endpoint para n8n
    if (url.pathname === '/sse') {
      // Configurar headers para SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      // Função para enviar dados via SSE
      const sendSSEData = (data, eventType = 'message') => {
        res.write(`event: ${eventType}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      // Enviar mensagem de conexão estabelecida
      sendSSEData({ 
        message: 'Connected to MCP-PDPJ SSE endpoint',
        timestamp: new Date().toISOString(),
        capabilities: ['consultar_processo', 'listar_documentos']
      }, 'connected');

      // Handle client disconnect
      req.on('close', () => {
        console.log('SSE client disconnected');
      });

      // Manter conexão viva com heartbeat
      const heartbeat = setInterval(() => {
        sendSSEData({ 
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        }, 'heartbeat');
      }, 30000); // A cada 30 segundos

      // Limpar interval quando cliente desconectar
      req.on('close', () => {
        clearInterval(heartbeat);
      });

      // Para requisições POST via SSE (dados enviados via query params ou headers)
      const action = url.searchParams.get('action');
      const numero = url.searchParams.get('numero');

      if (action && numero) {
        try {
          const { consultarProcesso, listarDocumentos } = await import('./tools/pdpj.js');
          
          if (action === 'consultar_processo') {
            const resultado = await consultarProcesso.run({ numero });
            sendSSEData({ 
              action: 'consultar_processo',
              numero,
              resultado,
              timestamp: new Date().toISOString()
            }, 'processo_consultado');
          } else if (action === 'listar_documentos') {
            const resultado = await listarDocumentos.run({ numero });
            sendSSEData({ 
              action: 'listar_documentos',
              numero,
              resultado,
              timestamp: new Date().toISOString()
            }, 'documentos_listados');
          }
        } catch (error) {
          sendSSEData({ 
            error: error.message,
            action,
            numero,
            timestamp: new Date().toISOString()
          }, 'error');
        }
      }

      return; // Manter conexão aberta
    }

    // Para endpoints de processo, vamos importar dinamicamente
    if (url.pathname.startsWith('/api/processo/') || url.pathname.startsWith('/api/documentos/')) {
      try {
        const { consultarProcesso, listarDocumentos } = await import('./tools/pdpj.js');
        
        if (url.pathname.startsWith('/api/processo/')) {
          const numero = url.pathname.split('/').pop();
          if (!numero) {
            res.status(400).json({ error: 'Número do processo é obrigatório' });
            return;
          }
          
          const resultado = await consultarProcesso.run({ numero });
          res.status(200).json(resultado);
          return;
        }

        if (url.pathname.startsWith('/api/documentos/')) {
          const numero = url.pathname.split('/').pop();
          if (!numero) {
            res.status(400).json({ error: 'Número do processo é obrigatório' });
            return;
          }
          
          const resultado = await listarDocumentos.run({ numero });
          res.status(200).json(resultado);
          return;
        }
      } catch (error) {
        console.error('Error loading PDPJ module:', error);
        res.status(500).json({ 
          error: 'Service temporarily unavailable', 
          details: 'Unable to load PDPJ module'
        });
        return;
      }
    }

    // 404 para outras rotas
    res.status(404).json({ error: 'Endpoint não encontrado' });

  } catch (error) {
    console.error('Error in API handler:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
