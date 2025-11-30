// js/editar-baia.js
document.addEventListener('DOMContentLoaded', () => {
    // Variáveis globais para o escopo do arquivo
    const auth = firebase.auth();
    const database = firebase.database();
    let userUid = null;
    let baiaId = null; // Definido aqui para ser acessível em todo o escopo
    
    // --- Seleciona os elementos do formulário pelos IDs ---
    const form = document.getElementById('baia-form');
    const submitButton = document.getElementById('submit-button');
    const nomeBaiaField = document.getElementById('baia-name');
    const porteField = document.getElementById('baia-size');
    const genioField = document.getElementById('baia-temperament');
    const idadeField = document.getElementById('baia-age');
    const deleteBaiaButton = document.getElementById('delete-baia'); // Novo elemento de exclusão

    // --- Pega o ID da Baia da URL ---
    const urlParams = new URLSearchParams(window.location.search);
    baiaId = urlParams.get('id'); // Atribui à variável global

    // --- Lógica de Redirecionamento e Configuração de Modo ---
    
    // Se não há ID, estamos no modo de CRIAÇÃO. NADA A FAZER aqui.
    if (!baiaId) {
        console.log("Modo de CRIAÇÃO: ID da baia não encontrado na URL.");
        if (submitButton) {
            submitButton.textContent = "CRIAR";
        }
    } else {
        // Se há ID, estamos no modo de EDIÇÃO.
        console.log(`Modo de EDIÇÃO: ID da baia: ${baiaId}`);
        if (submitButton) {
            submitButton.textContent = "ATUALIZAR";
        }
        // Mostra o botão de deletar (se ele existir no HTML)
        if (deleteBaiaButton) {
             deleteBaiaButton.style.display = 'block'; 
        }
    }


    // --- Verifica o usuário logado e Carrega Dados ---
    auth.onAuthStateChanged(user => {
        if (user) {
            userUid = user.uid;
            
            // Se estamos no modo de EDIÇÃO, carrega os dados
            if (baiaId) {
                const baiaRef = database.ref(`user-baias/${userUid}/${baiaId}`);
                
                baiaRef.once('value').then((snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        
                        // --- Preenche o formulário com os dados ---
                        nomeBaiaField.value = data.nomeBaia || '';
                        porteField.value = data.porte || '';
                        genioField.value = data.genio || '';
                        idadeField.value = data.idade || '';
                    } else {
                        alert("Baia não encontrada.");
                        window.location.href = 'baias.html';
                    }
                }).catch(error => {
                    console.error("Erro ao carregar dados da baia:", error);
                    alert("Erro ao carregar dados.");
                });
            }
        } else {
            console.log("Usuário não logado.");
            // Você deve ter um auth.js ou código aqui para forçar o login ou redirecionar.
        }
    });

    // --- LÓGICA DE EXCLUSÃO (Botão 'delete-baia' na página de edição) ---
    // Este bloco AGORA funciona porque baiaId e userUid estão em um escopo acessível
    if (deleteBaiaButton) {
        deleteBaiaButton.addEventListener('click', () => {
            if (!userUid || !baiaId) { // Adicionado verificação do baiaId
                alert("Você não está logado ou a baia não foi identificada.");
                return;
            }

            const confirmDelete = confirm("Tem certeza que deseja excluir esta baia?");
            if (confirmDelete) {
                // baiaId e userUid estão disponíveis
                database.ref(`user-baias/${userUid}/${baiaId}`).remove()
                    .then(() => {
                        alert("Baia excluída com sucesso!");
                        window.location.href = 'baias.html'; // Redireciona para a lista
                    })
                    .catch(error => {
                        console.error("Erro ao excluir baia:", error);
                        alert("Erro ao excluir baia.");
                    });
            }
        });
    }

    // --- Lógica de Envio do Formulário (Criar ou Atualizar) ---
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!userUid) {
            alert("Você não está logado. Faça login novamente.");
            return;
        }

        // Coleta os dados do formulário - ESTA É A PARTE QUE CRIA O NOME!
        // Esta parte já estava CORRETA! O problema estava em como o ID era tratado.
        const baiaData = {
            nomeBaia: nomeBaiaField.value,
            porte: porteField.value,
            genio: genioField.value,
            idade: idadeField.value
            // adicione fotoUrl aqui quando implementar o upload
        };

        const baiaRef = database.ref(`user-baias/${userUid}`);

        if (baiaId) {
            // Atualiza os dados da baia existente
            baiaRef.child(baiaId).update(baiaData)
                .then(() => {
                    alert("Baia atualizada com sucesso!");
                    window.location.href = 'baias.html';
                })
                .catch(error => {
                    console.error("Erro ao atualizar baia:", error);
                    alert("Erro ao atualizar baia.");
                });
        } else {
            // Cria uma nova baia (baiaId é nulo/falso)
            baiaRef.push(baiaData)
                .then(() => {
                    alert("Baia criada com sucesso!");
                    window.location.href = 'baias.html';
                })
                .catch(error => {
                    console.error("Erro ao criar baia:", error);
                    alert("Erro ao criar baia.");
                });
        }
    });
});