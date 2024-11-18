// Função para alternar entre mostrar e esconder a senha
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const eyeIcon = document.getElementById('eye-icon-' + inputId);

  if (input.type === 'password') {
    input.type = 'text';
    eyeIcon.innerHTML = '&#128065;'; // Ícone de olho aberto
  } else {
    input.type = 'password';
    eyeIcon.innerHTML = '&#128062;'; // Ícone de olho fechado
  }
}

// Função para formatar o CPF enquanto o usuário digita
function formatCPF(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 3) value = value.replace(/^(\d{3})(\d)/, '$1.$2');
  if (value.length > 7) value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
  if (value.length > 11) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  input.value = value;
}

// Função para formatar o telefone enquanto o usuário digita
function formatPhone(input) {
  let value = input.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

  // Adiciona parênteses no DDD
  if (value.length > 2) value = value.replace(/^(\d{2})(\d)/, '($1)$2');

  // Adiciona o traço após o quinto número
  if (value.length > 6) value = value.replace(/^(\(\d{2}\))(\d{5})(\d)/, '$1$2-$3');

  input.value = value;
}

// Função para registrar um novo usuário
function registerUser() {
  const fullname = document.getElementById('register-fullname').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const cpf = document.getElementById('register-cpf').value.trim();
  const phone = document.getElementById('register-phone').value.trim(); // Obtém o telefone
  const address = document.getElementById('register-address').value.trim();
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value.trim();
  const confirmPassword = document.getElementById('register-confirm-password').value.trim();
  const message = document.getElementById('register-message');

  if (!fullname || !email || !cpf || !phone || !address || !username || !password || !confirmPassword) {
    message.textContent = 'Por favor, preencha todos os campos.';
    return;
  }

  if (password !== confirmPassword) {
    message.textContent = 'As senhas não coincidem.';
    return;
  }

  const strongPassword = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8,}$/;
  if (!strongPassword.test(password)) {
    message.textContent = 'A senha deve ter ao menos 8 caracteres, uma letra maiúscula e um caractere especial.';
    return;
  }

  // Armazenando as informações no localStorage
  localStorage.setItem('fullname', fullname);
  localStorage.setItem('email', email);
  localStorage.setItem('cpf', cpf);
  localStorage.setItem('phone', phone); // Armazenando o telefone formatado
  localStorage.setItem('address', address);
  localStorage.setItem('username', username);
  localStorage.setItem('password', password);

  message.textContent = 'Registrado com sucesso!';
  message.style.color = 'green';

  setTimeout(() => {
    window.location.href = 'login.html';
  }, 2000);
}

// Função para login
function loginUser() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const storedUsername = localStorage.getItem('username');
  const storedPassword = localStorage.getItem('password');
  const message = document.getElementById('login-message');

  if (username === storedUsername && password === storedPassword) {
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = 'app.html';
  } else {
    message.textContent = 'Nome de usuário ou senha incorretos.';
  }
}

// Função para exibir informações do usuário no profile.html
function displayUserInfo() {
  const fullname = localStorage.getItem('fullname');
  const username = localStorage.getItem('username');
  const cpf = localStorage.getItem('cpf');
  const email = localStorage.getItem('email');
  const phone = localStorage.getItem('phone');
  const address = localStorage.getItem('address');

  document.getElementById('user-name').textContent = fullname || 'Não informado';
  document.getElementById('username').textContent = username || 'Não informado';
  document.getElementById('user-cpf').textContent = cpf || 'Não informado';
  document.getElementById('user-email').textContent = email || 'Não informado';
  document.getElementById('user-phone').textContent = phone || 'Não informado';
  document.getElementById('user-address').textContent = address || 'Não informado';
}

// Função para adicionar um item
function addItem() {
  const itemName = document.getElementById('item-name').value.trim();
  const foundLocation = document.getElementById('found-location').value.trim();
  const dropLocation = document.getElementById('drop-location').value.trim();
  const dropNumber = document.getElementById('drop-number').value.trim();
  const quantity = document.getElementById('quantity').value.trim();

  if (!itemName || !foundLocation || !dropLocation || !dropNumber || !quantity) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  // Busca o endereço completo a partir do CEP inserido
  fetch(`https://viacep.com.br/ws/${dropLocation}/json/`)
    .then(response => response.json())
    .then(data => {
      const fullAddress = data.erro ? 'CEP não encontrado' : `${data.logradouro}, ${dropNumber}, ${data.bairro}, ${data.localidade} - ${data.uf}`;

      // Obtendo o nome e telefone do usuário (registrador)
      const fullname = localStorage.getItem('fullname');
      const userPhone = localStorage.getItem('phone');

      const item = {
        name: itemName,
        foundLocation: foundLocation,
        dropLocation: fullAddress,
        dropNumber: dropNumber,
        quantity: quantity,
        date: new Date().toISOString(),
        registeredBy: fullname,  // Nome de quem registrou
        userPhone: userPhone     // Telefone de quem registrou
      };

      let items = JSON.parse(localStorage.getItem('items')) || [];
      items.push(item);
      localStorage.setItem('items', JSON.stringify(items));

      document.getElementById('item-name').value = '';
      document.getElementById('found-location').value = '';
      document.getElementById('drop-location').value = '';
      document.getElementById('drop-number').value = '';
      document.getElementById('quantity').value = '';

      alert("Item adicionado com sucesso!");
    })
    .catch(() => {
      alert('Erro ao buscar o endereço. Verifique o CEP e tente novamente.');
    });
}

// Função para buscar itens
function searchItems() {
  const searchQuery = document.getElementById('search-query').value.trim().toLowerCase();
  const items = JSON.parse(localStorage.getItem('items')) || [];

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery)
  );

  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  if (filteredItems.length === 0) {
    resultsContainer.innerHTML = 'Nenhum item encontrado.';
    return;
  }

  filteredItems.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('item');
    itemElement.innerHTML = `
      <p><strong>Item:</strong> ${item.name}</p>
      <p><strong>Local onde foi encontrado:</strong> ${item.foundLocation}</p>
      <p><strong>Endereço onde foi deixado:</strong> ${item.dropLocation}</p>
      <p><strong>Quantidade:</strong> ${item.quantity}</p>
      <p><strong>Data:</strong> ${new Date(item.date).toLocaleDateString()}</p>
      <p><strong>Encontrado por:</strong> ${item.registeredBy} | <strong>Telefone:</strong> ${item.userPhone}</p>
    `;
    resultsContainer.appendChild(itemElement);
  });
}

// Garante que as funções sejam chamadas ao carregar as páginas corretas
window.onload = function () {
  if (window.location.pathname.includes('profile.html')) {
    displayUserInfo();  // Chama a função para exibir as informações do usuário
  }

  if (window.location.pathname.includes('app.html')) {
    // Inicializa a página de itens (adicionar e buscar)
  }
};
