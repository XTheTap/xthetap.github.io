const operationContainer = document.getElementById('operation');
const operationForm = document.getElementById('operationForm');

const getOperations = () => getFromLocalStorage('operations');
const saveOperations = (operations) => saveToLocalStorage('operations', operations);
const getAccountById = (id) => getFromLocalStorage('accounts').find(acc => acc.id === id);

function renderOperations() {
    operationContainer.innerHTML = ''; 
    const template = document.getElementById('operationTemplate');
    const operations = getOperations();

    operations.sort((a, b) => new Date(b.currentDate) - new Date(a.currentDate));

    const grouped = operations.reduce((acc, op) => {
        const dateKey = getDateKey(new Date(op.currentDate));
        (acc[dateKey] = acc[dateKey] || []).push(op);
        return acc;
    }, {});

    Object.entries(grouped).forEach(([dateKey, operations]) => {
        const dateHeader = document.createElement('h3');
        dateHeader.textContent = dateKey;
        operationContainer.appendChild(dateHeader);

        operations.forEach(({ bill, summ, comment, type }) => {
            const account = getAccountById(bill) || {};
            const { name = 'Счёт не найден или удалён', currency = 'NoN' } = account;
            const operationElement = template.content.cloneNode(true);
            const formattedSumm = `${type === 'expense' ? '-' : '+'}${summ} ${currency}`;
            operationElement.querySelector('.accountName').textContent = name;
            operationElement.querySelector('.operationAmount').textContent = formattedSumm;
            operationElement.querySelector('.operationComment').textContent = comment || '';
            operationContainer.appendChild(operationElement);
        });
    });
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
        option.textContent = `${name} (${balance} ${currency})`;
        billSelect.appendChild(option);
    });
});

renderOperations();