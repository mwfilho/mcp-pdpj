import { FastMCP } from './dist/FastMCP.js';
import { consultarProcesso, listarDocumentos } from './tools/pdpj.js';

const mcp = new FastMCP('MCP-PDPJ');
mcp.addTool(consultarProcesso);
mcp.addTool(listarDocumentos);

mcp.listen();
