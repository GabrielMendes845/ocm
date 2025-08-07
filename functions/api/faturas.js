// O nome da função deve ser onRequest
export async function onRequest(context) {
    const { request, env, params } = context;
    const url = new URL(request.url);

    console.log(`Requisição recebida: Método = ${request.method}, Caminho = ${url.pathname}`);

    // ... (restante do código que você já tem para POST e GET) ...

    // LÓGICA PARA LER OS DADOS (MÉTODO GET)
    if (request.method === "GET") {
        try {
            // A sua função está em /functions/api/faturas.js. O endpoint é /api/faturas.
            // O request.url.pathname já é /api/faturas
            const { results } = await env.D1_banco.prepare(
                `SELECT * FROM "usuario 1" ORDER BY rowid DESC`
            ).all();

            return new Response(JSON.stringify(results), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (error) {
            console.error("Erro ao buscar faturas no D1:", error);
            return new Response(
                JSON.stringify({ error: "Erro interno do servidor ao buscar dados.", details: error.message }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    return new Response("Rota não encontrada ou método não permitido.", { status: 404 });
}
