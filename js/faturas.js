// Seu novo arquivo: js/faturas.js

document.addEventListener('DOMContentLoaded', () => {
    const usersMap = {
        user1: 'Usuário 1 (João Silva)',
        user2: 'Usuário 2 (Maria Oliveira)',
        user3: 'Usuário 3 (Pedro Souza)'
    };

    const userSelect = document.getElementById('userSelect');
    const invoiceTableBody = document.querySelector('#invoiceTable tbody');
    const noInvoicesMessage = document.getElementById('noInvoicesMessage');
    const currentUserName = document.getElementById('currentUserName');
    const logoutBtn = document.getElementById('logoutBtn');

    // Função para Carregar Faturas (AGORA BUSCA DO WORKER/BANCO DE DADOS)
    async function loadInvoices(userId) {
        invoiceTableBody.innerHTML = ''; // Limpa a tabela
        noInvoicesMessage.style.display = 'none'; // Esconde a mensagem inicial

        try {
            // FAZ A REQUISIÇÃO PARA O SEU WORKER (BACKEND)
            const response = await fetch(`/api/faturas?userId=${userId}`);

            if (!response.ok) {
                throw new Error(`Erro ao buscar faturas: ${response.status} ${response.statusText}`);
            }

            const invoices = await response.json();

            if (invoices.length === 0) {
                noInvoicesMessage.style.display = 'block';
                noInvoicesMessage.textContent = 'Nenhuma fatura encontrada para este usuário.';
            } else {
                noInvoicesMessage.style.display = 'none';
                invoices.forEach(invoice => {
                    const row = invoiceTableBody.insertRow();
                    row.insertCell(0).textContent = invoice.id;
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

    // Event Listeners
    userSelect.addEventListener('change', (event) => {
        loadInvoices(event.target.value);
    });

    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        alert('Você foi desconectado!');
        // Opcional: redirecionar para a página de login ou index.html
        window.location.href = 'index.html'; 
    });

    // Atualizar Ano no Rodapé e Última Atualização (global para todas as páginas)
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    const lastUpdate = new Date();
    document.getElementById('lastUpdatedDate').textContent = lastUpdate.toLocaleDateString('pt-BR');

    // Carregar faturas do primeiro usuário ao iniciar a página de faturas
    // Tenta pegar o userId da URL se ele foi passado (ex: faturas.html?userId=user2)
    const urlParams = new URLSearchParams(window.location.search);
    const initialUserId = urlParams.get('userId') || userSelect.value;
    userSelect.value = initialUserId; // Garante que o select mostre o user correto
    loadInvoices(initialUserId);
});
