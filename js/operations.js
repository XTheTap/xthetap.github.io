const operationContainer = document.getElementById('operation');
const operationForm = document.getElementById('operationForm');

const getOperations = () => getFromLocalStorage('operations');
const saveOperations = (operations) => saveToLocalStorage('operations', operations);
const getAccountById = (id) => getFromLocalStorage('accounts').find(acc => acc.id === id);

function renderOperations() {
    operationContainer.innerHTML = ''; 
    const template = document.getElementById('operationTemplate');
    const grouped = getOperations().reduce((acc, op) => {
        const dateKey = getDateKey(new Date(op.currentDate));
        (acc[dateKey] = acc[dateKey] || []).push(op);
        return acc;
    }, {});

    Object.entries(grouped).forEach(([dateKey, operations]) => {
        operationContainer.innerHTML += `<h3>${dateKey}</h3>`;
        operations.forEach(({ bill, summ, comment, currentDate }) => {
            const account = getAccountById(bill) || {};
            const { name = 'Счёт не найден или удалён', currency = 'NoN' } = account;
            const operationElement = template.content.cloneNode(true);
            operationElement.querySelector('.accountName').textContent = name;
            operationElement.querySelector('.operationAmount').textContent = `-${summ} ${currency}`;
            operationElement.querySelector('.operationComment').textContent = comment || '';
            operationElement.querySelector('.operationDate').textContent = `Дата: ${new Date(currentDate).toLocaleDateString()}`;
            operationContainer.appendChild(operationElement);
        });
    });
}

operationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const { value: summ } = document.getElementById('summ');
    const { value: bill } = document.getElementById('bill');
    const { value: tag } = document.getElementById('tag');
    const { value: comment } = document.getElementById('comment');
    const newOperation = { id: generateId(), summ: parseFloat(summ), bill, tag, comment, currentDate: Date.now() };
    saveOperations([...getOperations(), newOperation]);
    renderOperations();
    window.location.hash = '#operations';
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