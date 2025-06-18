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
          '/api/documentos/:numero': 'Listar documentos de um processo'
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
