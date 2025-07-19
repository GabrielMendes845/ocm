// Seu arquivo: js/script.js (SIMPLIFICADO)

document.addEventListener('DOMContentLoaded', () => {
    // Atualiza o ano no rodapé
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Adiciona funcionalidade simples para links de navegação suave (seções)
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

    console.log('Página carregada com sucesso e script JS executado.');
});
