
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

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function renderAccounts() {
    accountsContainer.innerHTML = ''; 

    const accounts = getAccounts();
    accounts.forEach((account) => {
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

accountForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('accountName').value;
    const currency = document.getElementById('currency').value;
    const balance = parseFloat(document.getElementById('balance').value);
    const id = generateId();

    const newAccount = { id, name, currency, balance };
    const accounts = getAccounts();
    accounts.push(newAccount);
    saveAccounts(accounts);
    renderAccounts();

    accountForm.reset();
});

document.addEventListener('DOMContentLoaded', () => {
    const tagSelect = document.getElementById('currency');

    fetch('../json/currencies.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        return response.json();
    })
    .then(data => {
        data.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency;
            option.textContent = currency;
            tagSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
});

renderAccounts();