// Este arquivo deve ser salvo como: ocm/functions/api/faturas.js
// no SEU REPOSITÓRIO GITHUB.

export async function onRequest(context) {
    // 'context' é um objeto fornecido pelo Cloudflare Pages Functions que contém
    // 'request' (a requisição HTTP de entrada), 'env' (variáveis de ambiente, incluindo bindings D1),
    // e 'params' (parâmetros de rota, se houverem).
    const { request, env, params } = context;
    const url = new URL(request.url); // Para analisar a URL e pegar searchParams como 'userId'

    console.log(`Requisição recebida: Método = ${request.method}, Caminho = ${url.pathname}`);

    // --- Lógica para POST (Adicionar Fatura) ---
    // Esta função será ativada para requisições POST para /api/faturas
    if (request.method === "POST") {
        try {
            const data = await request.json(); // Pega o corpo JSON da requisição
            // Desestrutura os dados. 'userId' é importante para saber em qual tabela inserir (se você usar tabelas separadas)
            const { fatura, valor, data: dataFatura, userId } = data; 

            // Validação básica dos campos obrigatórios
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

            let tableName; // Variável para armazenar o nome da tabela do D1
            // A sua tabela atual no D1 é "usuario 1". Se você adicionar 'user2' ou 'user3',
            // e quiser que cada um use uma tabela separada (ex: "usuario 2"),
            // você precisaria criar essas tabelas e descomentar as linhas abaixo.
            // A melhor prática seria uma única tabela com uma coluna 'user_id'.
            switch (userId) {
                case 'user1':
                    tableName = '"usuario 1"'; // Seu nome de tabela real no D1
                    break;
                /*
                // EXEMPLO: Se você tivesse tabelas para outros usuários:
                case 'user2':
                    tableName = '"usuario 2"'; 
                    break;
                case 'user3':
                    tableName = '"usuario 3"';
                    break;
                */
                default:
                    // Se o userId enviado no POST não for 'user1' (ou outros que você adicionar),
                    // retornamos um erro, pois não sabemos onde inserir.
                    console.error("Erro 400: userId inválido para inserção ou tabela não configurada para ele.");
                    return new Response(
                        JSON.stringify({ error: "userId inválido para inserção ou tabela não configurada." }),
                        { status: 400, headers: { 'Content-Type': 'application/json' } }
                    );
            }

            // Prepara e executa a instrução SQL INSERT no seu banco D1
            const { success, results, meta } = await env.D1_banco.prepare(
                `INSERT INTO ${tableName} (fatura, valor, data) VALUES (?, ?, ?)`
            )
            .bind(fatura, valorNumerico, dataFatura) // Vincula os valores aos placeholders (?)
            .run(); // Executa a inserção

            if (success) {
                console.log(`Fatura adicionada com sucesso em ${tableName}.`, { fatura, valorNumerico, dataFatura, results });
                return new Response(
                    JSON.stringify({ message: "Fatura adicionada com sucesso!", data: results }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                );
            } else {
                console.error("Falha ao inserir fatura no D1 (não gerou exceção, mas success=false).", { meta });
                // Lança um erro para ser pego pelo bloco catch
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

            // Como você especificou que APENAS UM usuário deve pegar os dados do banco,
            // vamos permitir que APENAS 'user1' acesse a tabela "usuario 1".
            // Para 'user2', 'user3' ou qualquer outro, ele retornará um array vazio.
            switch (userId) {
                case 'user1':
                    tableNameToQuery = '"usuario 1"'; // O nome da sua tabela no D1
                    break;
                default:
                    // Para qualquer outro 'userId' (ex: 'user2', 'user3'),
                    // a busca é considerada bem-sucedida, mas nenhum dado é encontrado.
                    // Isso evita um erro 404 e permite que o frontend exiba "Nenhuma fatura encontrada".
                    console.log(`Nenhuma fatura encontrada para ${userId} ou tabela não configurada para ele.`);
                    return new Response(
                        JSON.stringify([]), // Retorna um array vazio
                        { 
                            status: 200, // Status OK (200), pois a requisição foi processada com sucesso
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
            const { results: fetchedResults } = await env.D1_banco.prepare(
                `SELECT fatura AS id, 
                        valor AS amount, 
                        data AS date, 
                        data AS dueDate,   -- Usando 'data' para 'dueDate' e 'status' por falta de colunas separadas
                        'Pendente' AS status 
                 FROM ${tableNameToQuery} 
                 ORDER BY data DESC` // Ordena as faturas pela data mais recente
            ).all(); // 'all()' para buscar todas as linhas
            results = fetchedResults;

            console.log(`Faturas buscadas para ${userId} da tabela ${tableNameToQuery}:`, results);

            // Retorna os dados como JSON
            return new Response(
                JSON.stringify(results),
                {
                    status: 200, // Código de sucesso HTTP
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*', // Permite requisições de qualquer origem (CORS)
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Métodos permitidos
                        'Access-Control-Allow-Headers': 'Content-Type' // Cabeçalhos permitidos
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

    // Resposta padrão para rotas não encontradas ou métodos não permitidos
    return new Response("Rota não encontrada ou método não permitido.", { status: 404 });
}
