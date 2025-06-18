import fetch from 'node-fetch';
import { Tool } from '../dist/FastMCP.js';

let token, expires = 0;

async function login() {
  const url = 'https://sso.cloud.pje.jus.br/auth/realms/pje/protocol/openid-connect/token';
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: process.env.PDPJ_CLIENT_ID,
    username: process.env.PDPJ_CPF,
    password: process.env.PDPJ_SENHA
  });

  const r = await fetch(url, { method: 'POST', body });
  const js = await r.json();
  token = js.access_token;
  expires = Date.now() + js.expires_in * 1000 - 60_000; // 1 min de folga
}

async function auth() {
  if (!token || Date.now() > expires) await login();
  return { Authorization: `Bearer ${token}` };
}

/* ---------- TOOLS ---------- */

export const consultarProcesso = new Tool({
  name: 'consultar_processo',
  description: 'Consulta processo pelo número CNJ no PDPJ',
  inputSchema: { type: 'object', properties: { numero: { type: 'string' } }, required: ['numero'] },
  run: async ({ numero }) => {
    const url = `https://portaldeservicos.pdpj.jus.br/api/v2/processos/${numero}`;
    const r = await fetch(url, { headers: await auth() });
    if (!r.ok) throw new Error(`Status ${r.status}`);
    return await r.json();
  }
});

export const listarDocumentos = new Tool({
  name: 'listar_documentos',
  description: 'Lista documentos de um processo',
  inputSchema: { type: 'object', properties: { numero: { type: 'string' } }, required: ['numero'] },
  run: async ({ numero }) => {
    const dados = await consultarProcesso.run({ numero });
    return dados.documentos;
  }
});
