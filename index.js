import { FastMCP } from './dist/FastMCP.js';
import { consultarProcesso, listarDocumentos } from './tools/pdpj.js';

const mcp = new FastMCP('MCP-PDPJ');
mcp.addTool(consultarProcesso);
mcp.addTool(listarDocumentos);

// Para Vercel, vamos usar uma abordagem diferente
// Vercel não suporta servidores MCP nativamente, então vamos criar uma API simples

export default async function handler(req, res) {
  try {
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
        version: '1.0.0'
      });
      return;
    }

    // Endpoint para consultar processo
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

    // Endpoint para listar documentos
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

    // Health check
    if (url.pathname === '/health') {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
      return;
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
