import { getDb } from "../../../../db.ts";
import { eq } from "drizzle-orm";
import { certificadosTable } from "../../../../schema.ts";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'pdf';
    
    console.log(`[PDF API] Iniciando geração de ${format} para certificado ${params.id}`);
    
    // Buscar certificado no banco
    const db = await getDb({
      // Mock env para desenvolvimento
      DECO_CHAT_WORKSPACE_API: {} as any,
      DECO_CHAT_API: {} as any,
      ASSETS: {} as any,
    } as any);
    
    const certificados = await db.select()
      .from(certificadosTable)
      .where(eq(certificadosTable.id, parseInt(params.id)))
      .limit(1);
    
    if (certificados.length === 0) {
      console.error(`[PDF API] Certificado ${params.id} não encontrado`);
      return new Response(JSON.stringify({ error: 'Certificado não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const certificado = certificados[0];
    console.log(`[PDF API] Certificado encontrado:`, { 
      id: certificado.id, 
      nome: certificado.nome, 
      arquivoUrl: certificado.arquivoUrl ? 'exists' : 'missing',
      status: certificado.status 
    });
    
    if (!certificado.arquivoUrl) {
      console.error(`[PDF API] Certificado ${params.id} não possui arquivoUrl`);
      return new Response(JSON.stringify({ error: 'HTML do certificado não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Extrair HTML do certificado
    let htmlContent = '';
    
    if (certificado.arquivoUrl.startsWith('data:text/html;base64,')) {
      const base64Content = certificado.arquivoUrl.replace('data:text/html;base64,', '');
      htmlContent = atob(base64Content);
      console.log(`[PDF API] HTML decodificado com sucesso, tamanho: ${htmlContent.length} caracteres`);
    } else {
      console.error(`[PDF API] arquivoUrl não é base64: ${certificado.arquivoUrl.substring(0, 100)}...`);
      return new Response(JSON.stringify({ error: 'Formato de URL não suportado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    
    // Para teste inicial, retornar o HTML como download
    if (format === 'html' || format === 'debug') {
      console.log(`[PDF API] Retornando HTML para teste`);
      return new Response(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="certificado-${certificado.nome || 'aluno'}.html"`,
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    // Para PDF, por enquanto, retornar erro informativo
    return new Response(JSON.stringify({ 
      error: 'Funcionalidade em desenvolvimento',
      message: 'PDF generation is being implemented. Use format=html for now.',
      debug: {
        certificadoId: certificado.id,
        nome: certificado.nome,
        htmlSize: htmlContent.length,
        format: format
      }
    }), {
      status: 501,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('[PDF API] Erro ao processar requisição:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
