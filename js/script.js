// Seu arquivo: js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // REMOVIDOS os dados de faturas simulados (invoicesData)

    const usersMap = {
        user1: 'Usuário 1 (João Silva)',
        user2: 'Usuário 2 (Maria Oliveira)',
        user3: 'Usuário 3 (Pedro Souza)'
    };

    // 2. Elementos DOM
    const userSelect = document.getElementById('userSelect');
    const invoiceTableBody = document.querySelector('#invoiceTable tbody');
    const noInvoicesMessage = document.getElementById('noInvoicesMessage');
    const currentUserName = document.getElementById('currentUserName');
    const logoutBtn = document.getElementById('logoutBtn');

    // 3. Função para Carregar Faturas (AGORA BUSCA DO WORKER/BANCO DE DADOS)
    async function loadInvoices(userId) { // Adicionado 'async'
        invoiceTableBody.innerHTML = ''; // Limpa a tabela
        noInvoicesMessage.style.display = 'none'; // Esconde a mensagem inicial

        try {
            // FAZ A REQUISIÇÃO PARA O SEU WORKER (BACKEND)
            // A rota configurada no Cloudflare vai direcionar esta chamada para o seu Worker
            const response = await fetch(`/api/faturas?userId=${userId}`); 
            
            if (!response.ok) { 
                throw new Error(`Erro ao buscar faturas: ${response.status} ${response.statusText}`);
            }

            const invoices = await response.json(); // Pega os dados em formato JSON do Worker

            if (invoices.length === 0) {
                noInvoicesMessage.style.display = 'block';
                noInvoicesMessage.textContent = 'Nenhuma fatura encontrada para este usuário.';
            } else {
                noInvoicesMessage.style.display = 'none';
                invoices.forEach(invoice => {
                    const row = invoiceTableBody.insertRow();
                    row.insertCell(0).textContent = invoice.id;
                    // Certifique-se que os nomes das propriedades (date, dueDate, amount, status)
                    // correspondem exatamente aos nomes que seu Worker retorna da query SQL.
                    // Se seu banco tiver 'data' em vez de 'date', use invoice.data, etc.
                    row.insertCell(1).textContent = invoice.date; 
                    row.insertCell(2).textContent = invoice.dueDate; 
                    row.insertCell(3).textContent = invoice.amount;

                    const statusCell = row.insertCell(4);
                    statusCell.textContent = invoice.status;
                    statusCell.className = `status-${invoice.status.toLowerCase()}`;

                    const actionsCell = row.insertCell(5);
                    const viewBtn = document.createElement('button');
                    viewBtn.textContent = 'Ver';
                    viewBtn.className = 'action-btn view';
                    viewBtn.onclick = () => alert(`Visualizando fatura ${invoice.id}`);
                    actionsCell.appendChild(viewBtn);

                    if (invoice.status !== 'Pago') {
                        const payBtn = document.createElement('button');
                        payBtn.textContent = 'Pagar';
                        payBtn.className = 'action-btn pay';
                        payBtn.onclick = () => alert(`Processando pagamento para fatura ${invoice.id}`);
                        actionsCell.appendChild(payBtn);
                    }
                });
            }
            currentUserName.textContent = `Faturas de: ${usersMap[userId] || 'Usuário Desconhecido'}`;
        } catch (error) {
            console.error("Erro ao carregar faturas:", error);
            noInvoicesMessage.textContent = `Erro ao carregar faturas: ${error.message}. Verifique o console.`;
            noInvoicesMessage.style.display = 'block';
        }
    }

    // 4. Event Listeners
    userSelect.addEventListener('change', (event) => {
        loadInvoices(event.target.value);
    });

    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault(); 
        alert('Você foi desconectado!');
    });

    // 5. Atualizar Ano no Rodapé e Última Atualização
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    const lastUpdate = new Date();
    document.getElementById('lastUpdatedDate').textContent = lastUpdate.toLocaleDateString('pt-BR');

    // 6. Carregar faturas do primeiro usuário ao iniciar
    loadInvoices(userSelect.value);

    // Navegação suave para as seções
    document.querySelectorAll('nav ul li a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});
