const operationContainer = document.getElementById('operation');
const operationForm = document.getElementById('operationForm');

function getOperations() {
    return JSON.parse(localStorage.getItem('operations')) || [];
}

function saveOperations(accounts) {
    localStorage.setItem('operations', JSON.stringify(accounts));
}

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function getAccountById(accountId) {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    return accounts.find(account => account.id === accountId);
}

function renderOperations() {
    operationContainer.innerHTML = ''; 

    const operations = getOperations();
    operations.forEach((operation) => {
        const account = getAccountById(operation.bill); 
        const accountName = account ? `${account.name}` : 'Счёт не найден или удалён';
        const accountCurrency = account ? `${account.currency}` : 'NoN';

        const operationDiv = document.createElement('div');
        operationDiv.className = 'operation';
        operationDiv.dataset.id = operation.id; 
        operationDiv.innerHTML = 
        `<div class="billField">
        <tt>${accountName}</tt>
        <span>-${operation.summ} ${accountCurrency}</span>
        </div>`;
        operationContainer.appendChild(operationDiv);
    });
}

operationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const summ = parseFloat(document.getElementById('summ').value);
    const bill = document.getElementById('bill').value;
    const tag = document.getElementById('tag').value;
    const comment = document.getElementById('comment').value;
    const currentDate = Date.now();
    const id = generateId();

    const newOperation = { id, summ, bill, tag, comment, currentDate };
    const operation = getOperations();
    operation.push(newOperation);
    saveOperations(operation);
    renderOperations();

    operationForm.reset();
});

document.addEventListener('DOMContentLoaded', () => {
    const billSelect = document.getElementById('bill');

    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id; 
        option.textContent = `${account.name} (${account.balance} ${account.currency})`;
        billSelect.appendChild(option);
    });
});

renderOperations();