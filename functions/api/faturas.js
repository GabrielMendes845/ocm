// Este arquivo deve ser salvo como: ocm/functions/api/faturas.js
// no SEU REPOSITÓRIO GITHUB.

export async function onRequest(context) {
    const { request, env, params } = context;
    const url = new URL(request.url);

    console.log(`Requisição recebida: Método = ${request.method}, Caminho = ${url.pathname}`);

    // --- Lógica para GET (Buscar Faturas) ---
    // Esta função será ativada para requisições GET para /api/faturas
    if (request.method === "GET") {
        try {
            const userId = url.searchParams.get('userId'); // Pega o 'userId' da URL (ex: ?userId=user1)

            if (!userId) {
                console.error("Erro 400: userId é obrigatório para buscar faturas.");
                return new Response(
                    JSON.stringify({ error: "Parâmetro 'userId' é obrigatório." }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            let results = [];
            let tableNameToQuery;

            // Mapeia userId para o nome da tabela no D1
            switch (userId) {
                case 'user1':
                    tableNameToQuery = '"usuario 1"'; // Seu nome de tabela real no D1
                    break;
                default:
                    // Para qualquer outro 'userId' que não 'user1', retorna array vazio.
                    console.log(`Nenhuma fatura encontrada para ${userId} ou tabela não configurada para ele.`);
                    return new Response(
                        JSON.stringify([]), // Retorna um array vazio
                        { 
                            status: 200, 
                            headers: { 
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*', 
                                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                                'Access-Control-Allow-Headers': 'Content-Type'
                            } 
                        }
                    );
            }

            // Prepara e executa a instrução SQL SELECT no seu banco D1
            // Certifique-se de que os nomes das colunas ('fatura', 'valor', 'data')
            // correspondem exatamente aos nomes das colunas na sua tabela D1.
            const { results: fetchedResults } = await env.D1_banco.prepare(
                `SELECT fatura AS id, 
                        valor AS amount, 
                        data AS date, 
                        data AS dueDate,   
                        'Pendente' AS status 
                 FROM ${tableNameToQuery} 
                 ORDER BY data DESC`
            ).all(); 
            results = fetchedResults;

            console.log(`Faturas buscadas para ${userId} da tabela ${tableNameToQuery}:`, results);

            // Retorna os dados como JSON
            return new Response(
                JSON.stringify(results),
                {
                    status: 200, 
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*', 
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    }
                }
            );

        } catch (error) {
            console.error("Erro interno do servidor ao buscar faturas (GET):", error);
            return new Response(
                JSON.stringify({ error: "Erro interno do servidor ao buscar faturas.", details: error.message }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // --- Lógica para POST (Adicionar Fatura) ---
    // Esta função será ativada para requisições POST para /api/faturas
    if (request.method === "POST") {
        try {
            // SÓ TENTA LER request.json() se o método for POST
            const data = await request.json(); 
            const { fatura, valor, data: dataFatura, userId } = data; 

            // Validação básica dos campos
            if (!fatura || valor === undefined || valor === null || !dataFatura || !userId) {
                console.error("Erro 400: Campos obrigatórios faltando ou inválidos.", { fatura, valor, dataFatura, userId });
                return new Response(
                    JSON.stringify({ error: "Campos 'fatura', 'valor', 'data' e 'userId' são obrigatórios." }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            const valorNumerico = parseFloat(valor);
            if (isNaN(valorNumerico)) {
                console.error("Erro 400: 'valor' não é um número válido.", { valor });
                return new Response(
                    JSON.stringify({ error: "'valor' deve ser um número válido." }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            let tableName;
            switch (userId) {
                case 'user1':
                    tableName = '"usuario 1"'; 
                    break;
                default:
                    console.error("Erro 400: userId inválido para inserção ou tabela não configurada para ele.");
                    return new Response(
                        JSON.stringify({ error: "userId inválido para inserção ou tabela não configurada." }),
                        { status: 400, headers: { 'Content-Type': 'application/json' } }
                    );
            }

            // Prepara e executa a instrução SQL INSERT
            const { success, results, meta } = await env.D1_banco.prepare(
                `INSERT INTO ${tableName} (fatura, valor, data) VALUES (?, ?, ?)`
            )
            .bind(fatura, valorNumerico, dataFatura) 
            .run(); 

            if (success) {
                console.log(`Fatura adicionada com sucesso em ${tableName}.`, { fatura, valorNumerico, dataFatura, results });
                return new Response(
                    JSON.stringify({ message: "Fatura adicionada com sucesso!", data: results }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                );
            } else {
                console.error("Falha ao inserir fatura no D1 (não gerou exceção, mas success=false).", { meta });
                throw new Error("Falha desconhecida ao inserir fatura no D1.");
            }

        } catch (error) {
            console.error("Erro interno do servidor ao processar requisição de fatura (POST):", error);
            return new Response(
                JSON.stringify({ error: "Erro interno do servidor.", details: error.message }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // Se o método da requisição não for GET nem POST, retorna 404
    return new Response("Rota não encontrada ou método não permitido.", { status: 404 });
}
