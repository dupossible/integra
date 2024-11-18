

function mascaraCpf(input) {
    let valor = input.value.replace(/\D/g, '');
    valor = valor.replace(/^(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = valor;
}


document.getElementById('cpf').addEventListener('input', function() {
    mascaraCpf(this);
});

$(document).ready(function(){
   
    $('[data-toggle="tooltip"]').tooltip();
    
    
    var checkbox = $('table tbody input[type="checkbox"]');
    $("#selectAll").click(function(){
        if(this.checked){
            checkbox.each(function(){
                this.checked = true;                        
            });
        } else{
            checkbox.each(function(){
                this.checked = false;                        
            });
        } 
    });
    checkbox.click(function(){
        if(!this.checked){
            $("#selectAll").prop("checked", false);
        }
    });
});


const statusCheckbox = document.getElementById('status');
const statusLabel = document.getElementById('statusLabel');

statusLabel.textContent = statusCheckbox.checked ? 'Ativo' : 'Inativo';

statusCheckbox.addEventListener('change', function() {
    statusLabel.textContent = this.checked ? 'Ativo' : 'Inativo';
});

statusCheckbox.checked = true;
statusLabel.textContent = statusCheckbox.checked ?  'Ativo' : 'Inativo';

// Listar usuários e verificar autorização
async function listarUsuarios(filtro = '') {
    try {
        const response = await fetch('https://integra.creaba.org.br:8181/v1/users/list');
        if (!response.ok) throw new Error('Erro ao listar usuários');

        const result = await response.json();
        const resultsBody = document.getElementById('resultsBody');
        resultsBody.innerHTML = ''; 

        const rows = []; // Array para armazenar as linhas

        if (result.dataList && result.dataList.length > 0) {
            const authorizationPromises = result.dataList.map(async (user) => {
                if (
                    user.fullName.toLowerCase().includes(filtro.toLowerCase()) ||
                    user.username.toLowerCase().includes(filtro.toLowerCase()) ||
                    user.cpf.toLowerCase().includes(filtro.toLowerCase())
                ) {
                    const row = document.createElement('tr');
                    const agencyAcronym = user.agency && user.agency.acronym ? user.agency.acronym : 'N/A';

                    let isAuthorized = false;
                    if (user.active) {
                        try {
                            const authResponse = await fetch(`https://integra.creaba.org.br:8181/v1/users/authorize?cpf=${user.cpf}`);
                            if (authResponse.ok) {
                                const authResult = await authResponse.json();
                                isAuthorized = authResult.isAuthorized;
                            } else {
                                console.warn(`Falha ao verificar autorização para o CPF: ${user.cpf}`);
                            }
                        } catch (error) {
                            console.error('Erro ao verificar autorização:', error);
                        }
                    }

                    row.innerHTML = `
                    <td>${user.fullName}</td>
                    <td>${user.username}</td>
                    <td>${user.cpf}</td>
                    <td>${user.email}</td>
                    <td>${agencyAcronym}</td>
                    <td class="status-icon">${user.active ? '✔️' : '❌'}</td>
                    <td class="authorization-status" data-cpf="${user.cpf}">${isAuthorized ? '✔️' : '❌'}</td>
                    <td>
                        <button href="#editCadastro" class="edit-btn" data-toggle="modal"
                            data-username="${user.username}" 
                            data-fullname="${user.fullName}" 
                            data-email="${user.email}"
                            data-agency="${agencyAcronym}" 
                            data-active="${user.active}" 
                            data-cpf="${user.cpf}">✏️</button>
                    </td>
                `;


                    rows.push(row); 
                }
            });

            await Promise.all(authorizationPromises); 

            rows.forEach(row => resultsBody.appendChild(row)); 
            document.getElementById('resultsTable').style.display = 'table';
        } else {
            document.getElementById('resultsTable').style.display = 'none';
            alert('Nenhum usuário encontrado.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

// Chamada inicial para listar usuários ao carregar a página
window.onload = () => {
    listarUsuarios();
};


document.getElementById('search').addEventListener('input', function () {
    const searchValue = this.value; 
    listarUsuarios(searchValue); 
});

// listar usuários com filtro em todos os campos
async function listarUsuarios(filtro = '') {
    try {
        const response = await fetch('https://integra.creaba.org.br:8181/v1/users/list');
        if (!response.ok) throw new Error('Erro ao listar usuários');

        const result = await response.json();
        const resultsBody = document.getElementById('resultsBody');
        resultsBody.innerHTML = ''; 

        const rows = []; // Array para armazenar as linhas

        if (result.dataList && result.dataList.length > 0) {
            result.dataList.forEach((user) => {
                // Concatenar todos os dados do usuário em uma string para simplificar a busca
                const userData = `
                    ${user.fullName} 
                    ${user.username} 
                    ${user.cpf} 
                    ${user.email} 
                    ${user.agency && user.agency.acronym ? user.agency.acronym : 'N/A'} 
                    ${user.active ? 'ativo' : 'inativo'}
                `.toLowerCase();

                if (userData.includes(filtro.toLowerCase())) {
                    const row = document.createElement('tr');
                    const agencyAcronym = user.agency && user.agency.acronym ? user.agency.acronym : 'N/A';
                    const isAuthorized = user.active;

                    row.innerHTML = `
                        <td>${user.fullName}</td>
                        <td>${user.username}</td>
                        <td>${user.cpf}</td>
                        <td>${user.email}</td>
                        <td>${agencyAcronym}</td>
                        <td class="status-icon">${user.active ? '✔️' : '❌'}</td>
                        <td>${isAuthorized ? '✔️' : '❌'}</td>
                        <td>
                            <button href="#editCadastro" class="edit-btn" data-toggle="modal"
                                data-username="${user.username}" 
                                data-fullname="${user.fullName}" 
                                data-email="${user.email}"
                                data-agency="${agencyAcronym}" 
                                data-active="${user.active}" 
                                data-cpf="${user.cpf}">✏️</button>
                        </td>
                    `;
                    rows.push(row);
                }
            });

            // Renderiza todas as linhas de uma vez na tabela
            rows.forEach(row => resultsBody.appendChild(row));
            document.getElementById('resultsTable').style.display = rows.length ? 'table' : 'none';
        } else {
            document.getElementById('resultsTable').style.display = 'none';
            alert('Nenhum usuário encontrado.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

// Cadastro do usuário
document.getElementById('cadastroForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Captura os valores dos campos do formulário
    const nome = document.getElementById('nome').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const agency = document.getElementById('agency').value;
    const cpf = document.getElementById('cpf').value;
    const ativo = document.getElementById('status').checked;
    
    // Cria o objeto JSON com os dados do usuário
    const usuario = {
        active: ativo,
        agencyAcronym: agency,
        username: username,
        fullName: nome,
        email: email,
        cpf: cpf
    };

    try {
        const response = await fetch('https://integra.creaba.org.br:8181/v1/users/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('#modalCadastro', result.message, true); 
            document.getElementById('cadastroForm').reset(); 
            await listarUsuarios(); 
            showMessage.style.display ='none';
            } else {
            showMessage('#modalCadastro', result.message, false); 
        }
    } catch (error) {
        showMessage('#modalCadastro', 'Erro ao cadastrar usuário.', false);
    }
});

// Edição de usuário
document.body.addEventListener('click', function (e) {
    if (e.target.classList.contains('edit-btn')) {
        const fullName = e.target.dataset.fullname;
        const username = e.target.dataset.username;
        const email = e.target.dataset.email; 
        const agencyAcronym = e.target.dataset.agency; 
        const active = e.target.dataset.active === 'true';
        const cpf = e.target.dataset.cpf;

        // Preencher os campos do formulário de edição com os dados do usuário
        document.getElementById('editName').value = fullName;
        document.getElementById('editUsername').value = username;
        document.getElementById('editEmail').value = email;
        document.getElementById('editAgency').value = agencyAcronym;
        document.getElementById('editActive').checked = active;

        
        const cpfField = document.getElementById('editCpf');
        cpfField.value = cpf;
        cpfField.readOnly = true; // CPF não editável

        
        $('#editCadastro').modal('show');
    }
});


// Fechar modal ao clicar no "x"
document.querySelector('.close').onclick = function () {
    document.getElementById('editModal').style.display = 'none';
};

// Fechar modal ao clicar fora dele
window.onclick = function (event) {
    if (event.target === document.getElementById('editModal')) {
        document.getElementById('edit').style.display = 'none';
    }
};

// salvar mudanças e enviar para o endpoint de atualização
document.getElementById('saveChanges').addEventListener('click', async function () {
    const cpf = document.getElementById('editCpf').value;
    const fullName = document.getElementById('editName').value;
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const agencyAcronym = document.getElementById('editAgency').value;
    const active = document.getElementById('editActive').checked;

    // Construindo o objeto de atualização somente com os campos preenchidos
    const updatedUser = {};
    if (cpf) updatedUser.cpf = cpf;
    if (fullName) updatedUser.fullName = fullName;
    if (username) updatedUser.username = username;
    if (email) updatedUser.email = email;
    if (agencyAcronym) updatedUser.agencyAcronym = agencyAcronym;
    updatedUser.active = active;

    try {
        const response = await fetch(`https://integra.creaba.org.br:8181/v1/users/update?cpf=${cpf}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUser)
        });

        const result = await response.json();
        
        if (response.ok) {
            confirm(`Usuário ${username} atualizado com sucesso!`);
            listarUsuarios(); // Atualiza a lista de usuários
            
            document.getElementById('editModal').style.display = 'none';
        } else {
            alert(`Erro ao atualizar usuário: ${result.message}`);
            
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
    }
   });

//span de sucesso
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    notificationMessage.textContent = message;
    notification.style.display = 'block';
    notification.style.opacity = '1';

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 500); // Tempo para ocultar
    }, 3000); // Tempo que a notificação ficará visível
}

function closeNotification() {
    const notification = document.getElementById('notification');
    notification.style.opacity = '0';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 500); // Tempo para ocultar
}

//atualizar tabela
function atualizarTabela(cpf, fullName, username, email, agencyAcronym, active) {
    const rows = document.querySelectorAll('#resultsBody tr');

    rows.forEach(row => {
        const cellCpf = row.querySelector('td:nth-child(3)'); // Seleciona o CPF na terceira coluna
        if (cellCpf && cellCpf.textContent === cpf) {
            row.querySelector('td:nth-child(1)').textContent = fullName;
            row.querySelector('td:nth-child(2)').textContent = username;
            row.querySelector('td:nth-child(4)').textContent = email;
            row.querySelector('td:nth-child(5)').textContent = agencyAcronym;
            row.querySelector('td:nth-child(6)').textContent = active ? '✔️' : '❌';
        }
    });
}

// Máscara de CPF para campo de edição
document.getElementById('editCpf').addEventListener('input', function () {
    mascaraCpf(this);
});

// Adicionar filtro para CPF na busca de usuários
document.getElementById('cpfSearch').addEventListener('input', function () {
    mascaraCpf(this);
});


