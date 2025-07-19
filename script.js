// Seu arquivo: js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // Garante que o script só rode depois que todo o HTML for carregado
    const myButton = document.getElementById('myButton');

    if (myButton) {
        myButton.addEventListener('click', () => {
            alert('Você clicou no botão! Interatividade com JavaScript!');
        });
    }

    console.log('Script.js carregado com sucesso!');
});
