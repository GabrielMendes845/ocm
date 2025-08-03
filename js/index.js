// Seu novo arquivo: js/index.js

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const userSelectIndex = document.getElementById('userSelectIndex'); // Novo ID para o select no index

    // Event Listener para o botão Sair
    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        alert('Você foi desconectado!');
        // Opcional: redirecionar para a página de login
        window.location.href = 'index.html'; 
    });

    // Event listener para o select no index.html (se você quiser que ele faça algo)
    // Por exemplo, redirecionar para a página de faturas com o userId selecionado
    if (userSelectIndex) {
        userSelectIndex.addEventListener('change', (event) => {
            const selectedUserId = event.target.value;
            window.location.href = `faturas.html?userId=${selectedUserId}`;
        });
    }

    // Atualizar Ano no Rodapé e Última Atualização
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    const lastUpdate = new Date();
    document.getElementById('lastUpdatedDate').textContent = lastUpdate.toLocaleDateString('pt-BR');

    // Removido o JavaScript de navegação suave, pois agora são páginas separadas
});
