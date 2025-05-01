
const accountsContainer = document.getElementById('accounts');
const accountForm = document.getElementById('accountForm');

// Чтение данных из LocalStorage
function getAccounts() {
    return JSON.parse(localStorage.getItem('accounts')) || [];
}

// Сохранение данных в LocalStorage
function saveAccounts(accounts) {
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

// Отображение счетов
function renderAccounts() {
    accountsContainer.innerHTML = ''; 

    const accounts = getAccounts();
    accounts.forEach((account, index) => {
        const accountDiv = document.createElement('div');
        accountDiv.className = 'account';
        accountDiv.innerHTML = 
        `<div class="billField">
        <span>${account.name}</span>
        <tt>${account.balance} ${account.currency}</tt>
        </div>`;
        accountsContainer.appendChild(accountDiv);
    });
}

// Добавление нового счёта
accountForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('accountName').value;
    const currency = document.getElementById('currency').value;
    const balance = parseFloat(document.getElementById('balance').value);

    const newAccount = { name, currency, balance };
    const accounts = getAccounts();
    accounts.push(newAccount);
    saveAccounts(accounts);
    renderAccounts();

    accountForm.reset(); // Очистка формы
});

renderAccounts();