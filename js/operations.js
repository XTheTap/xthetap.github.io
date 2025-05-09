const operationContainer = document.getElementById('operation');
const operationForm = document.getElementById('operationForm');

const getOperations = () => getFromLocalStorage('operations');
const saveOperations = (operations) => saveToLocalStorage('operations', operations);
const getAccountById = (id) => getFromLocalStorage('accounts').find(acc => acc.id === id);

function renderOperations() {
    operationContainer.innerHTML = ''; 
    const template = document.getElementById('operationTemplate');
    const operations = getOperations();

    processAndRenderOperations(operationContainer, operations, template);
}

operationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const { value: summ } = document.getElementById('summ');
    const { value: operationType } = document.getElementById('operationType');
    const { value: bill } = document.getElementById('bill');
    const { value: tag } = document.getElementById('tag');
    const { value: comment } = document.getElementById('comment');

    const amount = parseFloat(summ);
    const newOperation = { 
        id: generateId(), 
        summ: amount, 
        bill, 
        tag, 
        comment, 
        type: operationType,
        currentDate: Date.now() 
    };

    const accounts = getFromLocalStorage('accounts');
    const account = accounts.find(acc => acc.id === bill);

    if (operationType === 'expense') {
        account.balance -= amount;
    } else if (operationType === 'income') {
        account.balance += amount;
    } else if (operationType === 'transfer') {
        // Handle transfer logic here if needed
        alert('Перевод пока не реализован.');
    }

    saveAccounts(accounts);
    saveOperations([...getOperations(), newOperation]);
    renderOperations();
    renderAccounts(); 
    showSection('operations');
    operationForm.reset();
});

document.addEventListener('DOMContentLoaded', () => {
    const billSelect = document.getElementById('bill');
    (getFromLocalStorage('accounts') || []).forEach(({ id, name, balance, currency }) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${name} (${balance.toFixed(2)} ${currency})`; // Added toFixed(2)
        billSelect.appendChild(option);
    });
});

renderOperations();