// Teste simples da API
import { consultarProcesso, listarDocumentos } from './tools/pdpj.js';

console.log('Testando as funções da API...');

// Simular uma requisição
const mockReq = {
  url: '/api/processo/1234567-89.2023.8.02.0001',
  headers: { host: 'localhost:3000' }
};

const mockRes = {
  status: (code) => ({
    json: (data) => {
      console.log(`Status: ${code}`);
      console.log('Response:', JSON.stringify(data, null, 2));
      return mockRes;
    }
  })
};

try {
  console.log('\n=== Testando estrutura da API ===');
  
  // Teste do endpoint raiz
  console.log('\n1. Testando endpoint raiz:');
  const url = new URL('/', 'http://localhost:3000');
  console.log('URL:', url.pathname);
  
  if (url.pathname === '/') {
    mockRes.status(200).json({ 
      message: 'MCP-PDPJ API',
      description: 'API para consulta de processos no PDPJ',
      endpoints: {
        '/api/processo/:numero': 'Consultar processo específico',
        '/api/documentos/:numero': 'Listar documentos de um processo'
      },
      version: '1.0.0'
    });
  }

  // Teste de parsing de URL
  console.log('\n2. Testando parsing de URLs:');
  const testUrls = [
    '/api/processo/1234567-89.2023.8.02.0001',
    '/api/documentos/1234567-89.2023.8.02.0001',
    '/health'
  ];
  
  testUrls.forEach(testUrl => {
    const url = new URL(testUrl, 'http://localhost:3000');
    console.log(`URL: ${testUrl} -> pathname: ${url.pathname}`);
    
    if (url.pathname.startsWith('/api/processo/')) {
      const numero = url.pathname.split('/').pop();
      console.log(`  Número extraído: ${numero}`);
    }
  });

  console.log('\n=== Teste das tools ===');
  console.log('Tools disponíveis:');
  console.log('- consultarProcesso:', typeof consultarProcesso);
  console.log('- listarDocumentos:', typeof listarDocumentos);
  
  if (consultarProcesso && consultarProcesso.run) {
    console.log('✅ consultarProcesso.run está disponível');
  } else {
    console.log('❌ consultarProcesso.run não está disponível');
  }
  
  if (listarDocumentos && listarDocumentos.run) {
    console.log('✅ listarDocumentos.run está disponível');
  } else {
    console.log('❌ listarDocumentos.run não está disponível');
  }

} catch (error) {
  console.error('Erro no teste:', error);
}

console.log('\n=== Teste concluído ===');
