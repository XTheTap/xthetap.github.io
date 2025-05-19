const operationContainer = document.getElementById('operation');
const operationForm = document.getElementById('operationForm');
const operationTypeSelect = document.getElementById('operationType');

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
    const { value: billTransfer } = document.getElementById('billTransfer');
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

    switch (operationType) {
        case 'expense':
            account.balance -= amount;
        break;
        case 'income':
            account.balance += amount;
        break;
        case 'transfer':
            const { value: summTransfer } = document.getElementById('summTransfer');

            const accounTransfer = accounts.find(acc => acc.id === billTransfer);
            account.balance -= amount;
            accounTransfer.balance += parseFloat(summTransfer);
        break;
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
    const billTransferSelect = document.getElementById('billTransfer');
    (getFromLocalStorage('accounts') || []).forEach(({ id, name, balance, currency }) => {
        const option1 = document.createElement('option');
        option1.value = id;
        option1.textContent = `${name} (${balance.toFixed(2)} ${currency})`;
        billSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = id;
        option2.textContent = `${name} (${balance.toFixed(2)} ${currency})`;
        billTransferSelect.appendChild(option2);
    });
});

operationTypeSelect.addEventListener('change', () => {
  handleOperationTypeChange(operationTypeSelect.value);
});

document.querySelectorAll('#operation-options button').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    if (operationTypeSelect) {
      operationTypeSelect.value = type === 'addOperation' ? 'expense' : type;
      handleOperationTypeChange(operationTypeSelect.value);
    }

    optionsDiv.classList.add('hidden');
    
    operationForm.reset();
    Array.from(operationForm.querySelectorAll('input, select')).forEach(el => el.disabled = false);

    setVisibilityMode('adding', 'addOperation');

    showSection('addOperation');
  });
});

function handleOperationTypeChange(type) {
    const tagSelect = document.getElementById('tag');
    const tagField = tagSelect.parentElement;
    const transferBillField = document.getElementById('billTransfer').parentElement;
    const summTransferField = document.getElementById('summTransfer').parentElement;

    switch (type) {
        case 'expense':
        case 'income':
            tagField.style.display = '';
            transferBillField.style.display = 'none';
            summTransferField.style.display = 'none';
            getTagsFromJson(type).then((tags) => {
                tagSelect.innerHTML = '';
                tags.forEach((tag) => {
                    const option = document.createElement('option');
                    option.value = tag.id;
                    option.textContent = tag.name;
                    tagSelect.appendChild(option);
                });
            });
            break;
        case 'transfer':
            tagField.style.display = 'none';
            transferBillField.style.display = '';
            summTransferField.style.display = '';
            break;
    }
}

renderOperations();