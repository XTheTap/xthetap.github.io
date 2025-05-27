const operationContainer = document.getElementById('operation');
const operationForm = document.getElementById('operationForm');
const operationTypeSelect = document.getElementById('operationType');

const operationFields = {
    summ: document.getElementById('summ'),
    summTransfer: document.getElementById('summTransfer'),
    operationType: document.getElementById('operationType'),
    bill: document.getElementById('bill'),
    billTransfer: document.getElementById('billTransfer'),
    tag: document.getElementById('tag'),
    comment: document.getElementById('comment')
};

const getOperations = () => getFromLocalStorage('operations');
const saveOperations = (operations) => saveToLocalStorage('operations', operations);
const getAccountById = (id) => getFromLocalStorage('accounts').find(acc => acc.id === id);

let currentOperation = null;

function renderOperations() {
    operationContainer.innerHTML = ''; 
    const template = document.getElementById('operationTemplate');
    const operations = getOperations();

    processAndRenderOperations(operationContainer, operations, template);
}

operationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const { value: summ } = operationFields.summ;
    const { value: operationType } = operationFields.operationType;
    const { value: bill } = operationFields.bill;
    const { value: billTransfer } = operationFields.billTransfer;
    const { value: tag } = operationFields.tag;
    const { value: comment } = operationFields.comment;
    const { value: summTransfer } = operationFields.summTransfer;

    const amount = parseFloat(summ);
    const newOperation = { 
        id: generateId(), 
        summ: amount, 
        bill, 
        tag, 
        comment, 
        type: operationType,
        currentDate: Date.now(),
        billTransfer,
        summTransfer
    };

    const accounts = getFromLocalStorage('accounts');
    // Корректируем балансы
    switch (operationType) {
        case 'expense': {
            const account = accounts.find(acc => acc.id === bill);
            if (account) account.balance -= amount;
            break;
        }
        case 'income': {
            const account = accounts.find(acc => acc.id === bill);
            if (account) account.balance += amount;
            break;
        }
        case 'transfer': {
            const account = accounts.find(acc => acc.id === bill);
            const accounTransfer = accounts.find(acc => acc.id === billTransfer);
            if (account) account.balance -= amount;
            if (accounTransfer) accounTransfer.balance += parseFloat(summTransfer);
            break;
        }
    }

    saveAccounts(accounts);
    saveOperations([...getOperations(), newOperation]);
    renderOperations();
    renderAccounts(); 
    updateAccountSelects();
    showSection('operations');
    operationForm.reset();
});

document.addEventListener('DOMContentLoaded', () => {
    updateAccountSelects();
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

async function processAndRenderOperations(container, operations, template) {
    operations.sort((a, b) => new Date(b.currentDate) - new Date(a.currentDate));

    const grouped = operations.reduce((acc, op) => {
        const dateKey = getDateKey(new Date(op.currentDate));
        (acc[dateKey] = acc[dateKey] || []).push(op);
        return acc;
    }, {});

    let totalPositive = 0;
    let totalNegative = 0;

    for (const [dateKey, ops] of Object.entries(grouped)) {
        const dateHeader = document.createElement('h3');
        dateHeader.textContent = dateKey;
        container.appendChild(dateHeader);

        for (const { id, bill, summ, comment, type, tag } of ops) {
            const account = getAccountById(bill) || {};
            const { name = 'Счёт не найден или удалён', currency = 'NoN' } = account;
            const operationElement = template.content.cloneNode(true);
            const formattedSumm = `${type === 'expense' ? '-' : '+'}${summ.toFixed(2)} ${currency}`;
            operationElement.querySelector('.accountName').textContent = name;
            operationElement.querySelector('.operationAmount').textContent = formattedSumm;
            operationElement.querySelector('.operationComment').textContent = comment || '';
    
            var tagName = 'Non';
            if (tag) {
                tagName = await getTagNameById(tag);
            }
        
            operationElement.querySelector('.operationTag').textContent = tagName;
            
            operationElement.querySelector('.operation').addEventListener('click', () => {
                renderOperationDetails(id);
            });

            container.appendChild(operationElement);

            if (type === 'expense') {
                totalNegative += summ;
            } else {
                totalPositive += summ;
            }
        }
    }

    return { totalPositive, totalNegative };
}

function renderOperationDetails(operationId) {
    var operation = getOperations().find(op => op.id === operationId);

    if (!operation) return;

    currentOperation = operation;

    const operationSection = document.getElementById('addOperation');
    if (operationSection) {
        operationSection.dataset.operationId = operationId;
    }
    setVisibilityMode('description', 'addOperation');
    handleOperationTypeChange(operation.type);

    operationFields.summ.value = operation.summ || '';
    operationFields.operationType.value = operation.type || '';
    operationFields.bill.value = operation.bill || '';
    if (operationFields.billTransfer) operationFields.billTransfer.value = operation.billTransfer || '';
    if (operationFields.summTransfer) operationFields.summTransfer.value = operation.summTransfer || '';
    operationFields.tag.value = operation.tag || '';
    operationFields.comment.value = operation.comment || '';

    Array.from(operationSection.querySelectorAll('input, select')).forEach(el => el.disabled = true);

    showSection('addOperation');
}

document.getElementById('operationDelete').addEventListener('click', function() {
    if (!currentOperation) return;
    let operations = getOperations();
    let accounts = getFromLocalStorage('accounts');

    revertOperationBalance(currentOperation, accounts);

    operations = operations.filter(op => op.id !== currentOperation.id);
    saveOperations(operations);
    saveAccounts(accounts);

    renderOperations();
    updateAccountSelects();
    showSection('operations');
    currentOperation = null;
});

document.getElementById('operationSave').addEventListener('click', function(e) {
    e.preventDefault();
    if (!currentOperation) return;

    let accounts = getFromLocalStorage('accounts');

    revertOperationBalance(currentOperation, accounts);

    const summ = parseFloat(operationFields.summ.value);
    const operationType = operationFields.operationType.value;
    const bill = operationFields.bill.value;
    const billTransfer = operationFields.billTransfer.value;
    const summTransfer = operationFields.summTransfer.value;
    const tag = operationFields.tag.value;
    const comment = operationFields.comment.value;

    currentOperation.summ = summ;
    currentOperation.type = operationType;
    currentOperation.bill = bill;
    currentOperation.billTransfer = billTransfer;
    currentOperation.summTransfer = summTransfer;
    currentOperation.tag = tag;
    currentOperation.comment = comment;

    applyOperationBalance(currentOperation, accounts);

    let operations = getOperations();
    operations = operations.map(op => op.id === currentOperation.id ? currentOperation : op);
    saveOperations(operations);
    saveAccounts(accounts);

    renderOperations();
    updateAccountSelects();
    showSection('operations');
    currentOperation = null;
});

renderOperations();

function revertOperationBalance(operation, accounts) {
    const { type, bill, billTransfer, summ, summTransfer } = operation;
    const account = accounts.find(acc => acc.id === bill);
    if (!account) return;
    switch (type) {
        case 'expense':
            account.balance += summ;
            break;
        case 'income':
            account.balance -= summ;
            break;
        case 'transfer':
            const accTransfer = accounts.find(acc => acc.id === billTransfer);
            if (!accTransfer) return;
            account.balance += summ;
            accTransfer.balance -= parseFloat(summTransfer || 0);
            break;
    }
}

function applyOperationBalance(operation, accounts) {
    const { type, bill, billTransfer, summ, summTransfer } = operation;
    const account = accounts.find(acc => acc.id === bill);
    if (!account) return;
    switch (type) {
        case 'expense':
            account.balance -= summ;
            break;
        case 'income':
            account.balance += summ;
            break;
        case 'transfer':
            const accTransfer = accounts.find(acc => acc.id === billTransfer);
            if (!accTransfer) return;
            account.balance -= summ;
            accTransfer.balance += parseFloat(summTransfer || 0);
            break;
    }
}