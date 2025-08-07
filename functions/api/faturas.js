// Este arquivo deve ser salvo como: ocm/js/faturas.js

document.addEventListener('DOMContentLoaded', () => {
    // Substitua [SEU-SITE] pela URL real do seu Pages que está na imagem (8fa9a52a.ocm-2jf.pages.dev)
    const API_URL = 'https://8fa9a52a.ocm-2jf.pages.dev/api/faturas';
    const invoiceTableBody = document.getElementById('invoiceTableBody');
    
    // Pega o ID do usuário do armazenamento local (localStorage)
    // Se não houver, usa 'user1' como padrão
    const userId = localStorage.getItem('currentUserId') || 'user1'; 
    
    async function fetchInvoices() {
        try {
            // A API exige o parâmetro userId=user1, conforme seu código faturas.js
            const response = await fetch(`${API_URL}?userId=${userId}`);
            
            if (!response.ok) {
                throw new Error('Falha ao buscar as faturas.');
            }
            const invoices = await response.json();
            displayInvoices(invoices);
        } catch (error) {
            console.error('Erro ao buscar faturas:', error);
            invoiceTableBody.innerHTML = '<tr><td colspan="5">Erro ao carregar as faturas.</td></tr>';
        }
    }

    function displayInvoices(invoices) {
        invoiceTableBody.innerHTML = ''; 

        if (invoices.length === 0) {
            invoiceTableBody.innerHTML = '<tr><td colspan="5">Nenhuma fatura encontrada.</td></tr>';
            return;
        }

        invoices.forEach(invoice => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${invoice.id}</td>
                <td>R$ ${invoice.amount.toFixed(2)}</td>
                <td>${invoice.dueDate}</td>
                <td><span class="status-pendente">${invoice.status}</span></td>
                <td>
                    <button class="action-btn view">Ver</button>
                    <button class="action-btn pay">Pagar</button>
                </td>
            `;
            invoiceTableBody.appendChild(row);
        });
    }
    
    fetchInvoices();
});
