#!/usr/bin/env node

/**
 * Script de teste para o endpoint SSE
 * Uso: node test-sse.js [numero_processo]
 */

import { EventSource } from 'eventsource';

const BASE_URL = 'https://mcp-pdpj22.vercel.app';
const numero = process.argv[2] || '1234567-89.2023.8.02.0001';

console.log('🔌 Testando SSE endpoint...');
console.log(`📋 Número do processo: ${numero}`);
console.log('─'.repeat(50));

// Teste 1: Conexão básica
console.log('1️⃣ Testando conexão básica...');
const basicSSE = new EventSource(`${BASE_URL}/sse`);

basicSSE.addEventListener('connected', (event) => {
  const data = JSON.parse(event.data);
  console.log('✅ Conexão estabelecida:', data.message);
  console.log('🔧 Capacidades:', data.capabilities);
  
  // Fechar conexão básica após receber confirmação
  setTimeout(() => {
    basicSSE.close();
    console.log('🔌 Conexão básica fechada\n');
    
    // Iniciar teste com ação
    testWithAction();
  }, 2000);
});

basicSSE.addEventListener('heartbeat', (event) => {
  const data = JSON.parse(event.data);
  console.log('💓 Heartbeat recebido:', data.timestamp);
});

basicSSE.addEventListener('error', (event) => {
  console.error('❌ Erro na conexão básica:', event);
  basicSSE.close();
});

// Teste 2: Consulta de processo
function testWithAction() {
  console.log('2️⃣ Testando consulta de processo...');
  
  const actionSSE = new EventSource(`${BASE_URL}/sse?action=consultar_processo&numero=${numero}`);
  
  actionSSE.addEventListener('connected', (event) => {
    const data = JSON.parse(event.data);
    console.log('✅ Conectado para consulta:', data.message);
  });
  
  actionSSE.addEventListener('processo_consultado', (event) => {
    const data = JSON.parse(event.data);
    console.log('📄 Processo consultado com sucesso!');
    console.log('📋 Número:', data.numero);
    console.log('⏰ Timestamp:', data.timestamp);
    console.log('📊 Resultado:', JSON.stringify(data.resultado, null, 2));
    
    actionSSE.close();
    console.log('🔌 Conexão de consulta fechada\n');
    
    // Iniciar teste de documentos
    testDocuments();
  });
  
  actionSSE.addEventListener('error', (event) => {
    const data = JSON.parse(event.data);
    console.error('❌ Erro na consulta:', data.error);
    actionSSE.close();
    
    // Mesmo com erro, testar documentos
    testDocuments();
  });
  
  actionSSE.addEventListener('error', (event) => {
    console.error('❌ Erro de conexão na consulta:', event);
    actionSSE.close();
  });
  
  // Timeout de segurança
  setTimeout(() => {
    if (actionSSE.readyState !== EventSource.CLOSED) {
      console.log('⏰ Timeout na consulta - fechando conexão');
      actionSSE.close();
      testDocuments();
    }
  }, 10000);
}

// Teste 3: Listagem de documentos
function testDocuments() {
  console.log('3️⃣ Testando listagem de documentos...');
  
  const docsSSE = new EventSource(`${BASE_URL}/sse?action=listar_documentos&numero=${numero}`);
  
  docsSSE.addEventListener('connected', (event) => {
    const data = JSON.parse(event.data);
    console.log('✅ Conectado para listar documentos:', data.message);
  });
  
  docsSSE.addEventListener('documentos_listados', (event) => {
    const data = JSON.parse(event.data);
    console.log('📑 Documentos listados com sucesso!');
    console.log('📋 Número:', data.numero);
    console.log('⏰ Timestamp:', data.timestamp);
    console.log('📊 Documentos encontrados:', data.resultado?.length || 0);
    
    if (data.resultado && data.resultado.length > 0) {
      console.log('📄 Primeiro documento:', JSON.stringify(data.resultado[0], null, 2));
    }
    
    docsSSE.close();
    console.log('🔌 Conexão de documentos fechada');
    console.log('\n✅ Todos os testes concluídos!');
    process.exit(0);
  });
  
  docsSSE.addEventListener('error', (event) => {
    const data = JSON.parse(event.data);
    console.error('❌ Erro na listagem:', data.error);
    docsSSE.close();
    console.log('\n❌ Testes concluídos com erro');
    process.exit(1);
  });
  
  docsSSE.addEventListener('error', (event) => {
    console.error('❌ Erro de conexão na listagem:', event);
    docsSSE.close();
    process.exit(1);
  });
  
  // Timeout de segurança
  setTimeout(() => {
    if (docsSSE.readyState !== EventSource.CLOSED) {
      console.log('⏰ Timeout na listagem - fechando conexão');
      docsSSE.close();
      console.log('\n⏰ Testes finalizados por timeout');
      process.exit(1);
    }
  }, 10000);
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n🛑 Interrompido pelo usuário');
  process.exit(0);
});

console.log('🚀 Iniciando testes SSE...');
console.log('💡 Pressione Ctrl+C para interromper\n');
