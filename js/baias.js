// ARQUIVO: editar-baia.js

document.addEventListener('DOMContentLoaded', () => {
    // Variáveis Firebase
    const auth = firebase.auth();
    const database = firebase.database();

    // Variáveis globais para o escopo do arquivo
    let userUid = null;
    let baiaId = null; 
    
    // --- Seleciona os elementos do formulário pelos IDs (USANDO getElementById) ---
    // ESTE É O PONTO CRÍTICO PARA A CORREÇÃO DO NOME NÃO SALVO!
    const form = document.getElementById('baia-form');
    const submitButton = document.getElementById('submit-button');
    const nomeBaiaField = document.getElementById('baia-name');
    const porteField = document.getElementById('baia-size');
    const genioField = document.getElementById('baia-temperament');
    const idadeField = document.getElementById('baia-age');
    const deleteBaiaButton = document.getElementById('delete-baia'); // O botão de exclusão na página de edição

    // --- Pega o ID da Baia da URL ---
    const urlParams = new URLSearchParams(window.location.search);
    baiaId = urlParams.get('id');

    // --- 1. CONFIGURAÇÃO INICIAL (Modo Criação ou Edição) ---
    if (!baiaId) {
        // Modo de CRIAÇÃO:
        console.log("Modo de CRIAÇÃO.");
        if (submitButton) submitButton.textContent = "CRIAR BAIA";
        if (deleteBaiaButton) deleteBaiaButton.style.display = 'none'; // Esconde o botão de delete na criação
    } else {
        // Modo de EDIÇÃO:
        console.log(`Modo de EDIÇÃO. ID: ${baiaId}`);
        if (submitButton) submitButton.textContent = "ATUALIZAR BAIA";
        if (deleteBaiaButton) deleteBaiaButton.style.display = 'block'; // Mostra o botão de delete na edição
    }

    // --- 2. VERIFICAÇÃO DE AUTENTICAÇÃO E CARREGAMENTO DE DADOS ---
    auth.onAuthStateChanged(user => {
        if (user) {
            userUid = user.uid;
            
            // Carrega dados da baia somente se estiver no modo de EDIÇÃO
            if (baiaId) {
                const baiaRef = database.ref(`user-baias/${userUid}/${baiaId}`);
                
                baiaRef.once('value').then((snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        
                        // Preenche o formulário
                        nomeBaiaField.value = data.nome || ''; // Use 'nome' ou 'nomeBaia' conforme seu DB
                        porteField.value = data.porte || '';
                        genioField.value = data.genio || '';
                        idadeField.value = data.idade || '';
                    } else {
                        alert("Baia não encontrada.");
                        window.location.href = 'baias.html';
                    }
                }).catch(error => {
                    console.error("Erro ao carregar dados da baia:", error);
                });
            }
        } else {
            alert("Sessão expirada. Redirecionando para login.");
            // Assumindo que você tem um arquivo auth.js que lida com o redirecionamento
        }
    });

    // --- 3. LÓGICA DE ENVIO DO FORMULÁRIO (CRIAR/ATUALIZAR) ---
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!userUid) {
            alert("Usuário não logado. Faça login novamente.");
            return;
        }

        // CORRIGIDO: Coleta os dados (com os valores corretos garantidos pelo getElementById)
        const baiaData = {
            // Ajuste o nome da propriedade para 'nome' se for o que você usa no DB na criação
            nome: nomeBaiaField.value, 
            porte: porteField.value,
            genio: genioField.value,
            idade: idadeField.value,
            userId: userUid,
            createdAt: new Date().toISOString()
        };
        
        const userBaiaRef = database.ref(`user-baias/${userUid}`);

        if (baiaId) {
            // ATUALIZAR
            userBaiaRef.child(baiaId).update(baiaData)
                .then(() => {
                    alert("Baia atualizada com sucesso!");
                    window.location.href = 'baias.html';
                })
                .catch(error => {
                    console.error("Erro ao atualizar baia:", error);
                    alert("Erro ao atualizar baia.");
                });
        } else {
            // CRIAR
            // Usando o .push() no userBaiaRef para criar a chave única do Firebase
            userBaiaRef.push(baiaData)
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

    // --- 4. LÓGICA DE EXCLUSÃO (Botão 'delete-baia') ---
    // Este bloco agora tem acesso ao baiaId e userUid no escopo correto.
    if (deleteBaiaButton) {
        deleteBaiaButton.addEventListener('click', () => {
            if (!userUid || !baiaId) {
                alert("Não foi possível excluir. Usuário não autenticado ou Baia não identificada.");
                return;
            }

            const confirmDelete = confirm(`Tem certeza que deseja excluir a baia ID ${baiaId}?`);
            if (confirmDelete) {
                database.ref(`user-baias/${userUid}/${baiaId}`).remove()
                    .then(() => {
                        alert("Baia excluída com sucesso!");
                        window.location.href = 'baias.html'; 
                    })
                    .catch(error => {
                        console.error("Erro ao excluir baia:", error);
                        alert("Erro ao excluir baia.");
                    });
            }
        });
    }
});