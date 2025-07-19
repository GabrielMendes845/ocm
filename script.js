// Seu arquivo: js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Dados de Faturas (Simulando um banco de dados no frontend)
    const invoicesData = {
        user1: [ // João Silva
            { id: 'F001', date: '2025-01-15', dueDate: '2025-02-15', amount: 'R$ 150,00', status: 'Pendente' },
            { id: 'F002', date: '2025-02-10', dueDate: '2025-03-10', amount: 'R$ 200,00', status: 'Pago' },
            { id: 'F003', date: '2025-03-05', dueDate: '2025-04-05', amount: 'R$ 180,00', status: 'Vencido' }
        ],
        user2: [ // Maria Oliveira
            { id: 'F004', date: '2025-01-20', dueDate: '2025-02-20', amount: 'R$ 120,00', status: 'Pago' },
            { id: 'F005', date: '2025-03-12', dueDate: '2025-04-12', amount: 'R$ 300,00', status: 'Pendente' }
        ],
        user3: [ // Pedro Souza
            { id: 'F006', date: '2025-02-01', dueDate: '2025-03-01', amount: 'R$ 250,00', status: 'Pago' }
        ]
    };

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

    // 3. Função para Carregar Faturas
    function loadInvoices(userId) {
        const invoices = invoicesData[userId] || [];
        invoiceTableBody.innerHTML = ''; // Limpa a tabela

        if (invoices.length === 0) {
            noInvoicesMessage.style.display = 'block';
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
                statusCell.className = `status-${invoice.status.toLowerCase()}`; // Adiciona classe para estilização

                const actionsCell = row.insertCell(5);
                // Botão "Ver"
                const viewBtn = document.createElement('button');
                viewBtn.textContent = 'Ver';
                viewBtn.className = 'action-btn view';
                viewBtn.onclick = () => alert(`Visualizando fatura ${invoice.id}`);
                actionsCell.appendChild(viewBtn);

                // Botão "Pagar" (apenas se não estiver pago)
                if (invoice.status !== 'Pago') {
                    const payBtn = document.createElement('button');
                    payBtn.textContent = 'Pagar';
                    payBtn.className = 'action-btn pay';
                    payBtn.onclick = () => alert(`Processando pagamento para fatura ${invoice.id}`);
                    actionsCell.appendChild(payBtn);
                }
            });
        }
        currentUserName.textContent = `Faturas de: ${usersMap[userId]}`;
    }

    // 4. Event Listeners
    userSelect.addEventListener('change', (event) => {
        loadInvoices(event.target.value);
    });

    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Evita que o link redirecione
        alert('Você foi desconectado!');
        // Aqui você adicionaria a lógica real de logout/redirecionamento
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
