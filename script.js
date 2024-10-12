document.addEventListener('DOMContentLoaded', () => {
    const turmaButtons = document.querySelectorAll('.turma-btn');
    const registroModal = document.getElementById('registro-modal');
    const exibirModal = document.getElementById('exibir-modal');
    const closeButtons = document.querySelectorAll('.close-button');
    const turmaAtualSpan = document.getElementById('turma-atual');
    const registroForm = document.getElementById('registro-form');
    const tabelaRegistrosBody = document.querySelector('#tabela-registros tbody');
    const turmaExibirSpan = document.getElementById('turma-exibir');
    const turmaPesquisaInput = document.getElementById('turma-pesquisa');
    const nomePesquisaInput = document.getElementById('nome-pesquisa');
    const numeroPesquisaInput = document.getElementById('numero-pesquisa');
    const btnPesquisar = document.getElementById('btn-pesquisar');
    const resultadosDiv = document.getElementById('resultados');

    let turmaSelecionada = '';
    let registros = JSON.parse(localStorage.getItem('registros')) || {};

    // Função para abrir o modal
    function abrirModal(modal) {
        modal.style.display = 'block';
    }

    // Função para fechar o modal
    function fecharModal(modal) {
        modal.style.display = 'none';
    }

    // Fechar modais
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            fecharModal(registroModal);
            fecharModal(exibirModal);
        });
    });

    // Fechar modais ao clicar fora do conteúdo
    window.addEventListener('click', (event) => {
        if (event.target === registroModal) {
            fecharModal(registroModal);
        }
        if (event.target === exibirModal) {
            fecharModal(exibirModal);
        }
    });

    // Abrir modal de registro ao clicar em uma turma
    turmaButtons.forEach(button => {
        button.addEventListener('click', () => {
            turmaSelecionada = button.getAttribute('data-turma');
            turmaAtualSpan.textContent = turmaSelecionada.toUpperCase();
            registroForm.reset();
            abrirModal(registroModal);
        });

        // Adicionar evento para exibir registros ao clicar duas vezes
        button.addEventListener('dblclick', () => {
            exibirRegistros(turmaSelecionada);
        });
    });

    // Manipular envio do formulário de registro
    registroForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const numero = document.getElementById('numero').value.trim();
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;

        const registro = {
            nome,
            numero,
            turma: turmaSelecionada,
            data,
            hora
        };

        // Se a turma ainda não tem registros, cria um array vazio
        if (!registros[turmaSelecionada]) {
            registros[turmaSelecionada] = [];
        }

        // Adicionar registro
        registros[turmaSelecionada].push(registro);

        // Salvar de volta no localStorage
        localStorage.setItem('registros', JSON.stringify(registros));

        alert('Registro realizado com sucesso!');
        fecharModal(registroModal);
    });

    // Função para exibir registros de uma turma
    function exibirRegistros(turma) {
        tabelaRegistrosBody.innerHTML = ''; // Limpa a tabela

        const registrosTurma = registros[turma] || [];
        turmaExibirSpan.textContent = turma.toUpperCase();

        registrosTurma.forEach((registro, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${registro.nome}</td>
                <td>${registro.numero}</td>
                <td>${registro.data}</td>
                <td>${registro.hora}</td>
                <td>
                    <button class="btn-editar" data-index="${index}" data-turma="${turma}">Editar</button>
                    <button class="btn-excluir" data-index="${index}" data-turma="${turma}">Excluir</button>
                </td>
            `;
            tabelaRegistrosBody.appendChild(row);
        });

        abrirModal(exibirModal);

        // Adicionar eventos de edição e exclusão
        document.querySelectorAll('.btn-editar').forEach(button => {
            button.addEventListener('click', () => {
                const index = button.getAttribute('data-index');
                editarRegistro(turma, index);
            });
        });

        document.querySelectorAll('.btn-excluir').forEach(button => {
            button.addEventListener('click', () => {
                const index = button.getAttribute('data-index');
                excluirRegistro(turma, index);
            });
        });
    }

    // Função para editar registro
    function editarRegistro(turma, index) {
        const registro = registros[turma][index];

        document.getElementById('nome').value = registro.nome;
        document.getElementById('numero').value = registro.numero;
        document.getElementById('data').value = registro.data;
        document.getElementById('hora').value = registro.hora;
        turmaSelecionada = turma;

        fecharModal(exibirModal);
        abrirModal(registroModal);

        // Alterar o comportamento do botão de enviar
        registroForm.onsubmit = (e) => {
            e.preventDefault();
            registro.nome = document.getElementById('nome').value.trim();
            registro.numero = document.getElementById('numero').value.trim();
            registro.data = document.getElementById('data').value;
            registro.hora = document.getElementById('hora').value;

            // Atualizar o registro no localStorage
            localStorage.setItem('registros', JSON.stringify(registros));
            alert('Registro atualizado com sucesso!');
            fecharModal(registroModal);
            exibirRegistros(turma); // Atualiza a lista de registros
        };
    }

    // Função para excluir registro
    function excluirRegistro(turma, index) {
        if (confirm('Você tem certeza que deseja excluir este registro?')) {
            registros[turma].splice(index, 1); // Remove o registro

            // Se não houver mais registros na turma, remove a turma
            if (registros[turma].length === 0) {
                delete registros[turma];
            }

            // Salvar de volta no localStorage
            localStorage.setItem('registros', JSON.stringify(registros));
            alert('Registro excluído com sucesso!');
            exibirRegistros(turma); // Atualiza a lista de registros
        }
    }

    // Função para pesquisar registros
    btnPesquisar.addEventListener('click', () => {
        const turmaPesquisa = turmaPesquisaInput.value.trim().toUpperCase();
        const nomePesquisa = nomePesquisaInput.value.trim().toLowerCase();
        const numeroPesquisa = numeroPesquisaInput.value.trim();
        let resultados = [];

        // Filtrar registros por turma, nome ou número
        for (let turma in registros) {
            if (turmaPesquisa && turma !== turmaPesquisa) continue; // Verificar turma
            registros[turma].forEach(registro => {
                const nomeMatch = registro.nome.toLowerCase().includes(nomePesquisa);
                const numeroMatch = registro.numero.toString().includes(numeroPesquisa);
                if ((nomePesquisa && nomeMatch) || (numeroPesquisa && numeroMatch) || (!nomePesquisa && !numeroPesquisa)) {
                    resultados.push(registro);
                }
            });
        }

        // Exibir resultados
        resultadosDiv.innerHTML = '';
        if (resultados.length > 0) {
            resultadosDiv.innerHTML = `
                <h4>Resultados:</h4>
                <ul>
                    ${resultados.map(registro => `<li>${registro.nome} - ${registro.numero} - ${registro.data} às ${registro.hora}</li>`).join('')}
                </ul>
            `;
        } else {
            resultadosDiv.innerHTML = `<p>Nenhum registro encontrado.</p>`;
        }
        
    });
});
