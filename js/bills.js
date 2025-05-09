const accountsContainer = document.getElementById('accounts');
const accountForm = document.getElementById('accountForm');

const getAccounts = () => getFromLocalStorage('accounts');
const saveAccounts = (accounts) => saveToLocalStorage('accounts', accounts);

function renderAccounts() {
    accountsContainer.innerHTML = ''; 
    const template = document.getElementById('accountTemplate');
    getAccounts().forEach(({ id, name, balance, currency }) => {
        const accountElement = template.content.cloneNode(true);
        accountElement.querySelector('.accountName').textContent = name;
        accountElement.querySelector('.accountBalance').textContent = `${balance} ${currency}`;
        accountElement.querySelector('.account').addEventListener('click', () => {
            renderAccountDetails(id); // Open account details on click
        });
        accountsContainer.appendChild(accountElement);
    });
}

accountForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const { value: name } = document.getElementById('accountName');
    const { value: currency } = document.getElementById('currency');
    const balance = parseFloat(document.getElementById('balance').value);
    const newAccount = { id: generateId(), name, currency, balance };
    saveAccounts([...getAccounts(), newAccount]);
    renderAccounts();
    showSection('bills');
    accountForm.reset();
});

document.addEventListener('DOMContentLoaded', () => {
    // Populate currency dropdown
    fetch('../json/currencies.json')
        .then((res) => res.ok ? res.json() : Promise.reject('Ошибка загрузки данных'))
        .then((data) => {
            const tagSelect = document.getElementById('currency');
            data.forEach((currency) => {
                const option = document.createElement('option');
                option.value = option.textContent = currency;
                tagSelect.appendChild(option);
            });
        })
        .catch(console.error);
});

function renderAccountDetails(accountId) {
    const accountDetailsSection = document.getElementById('accountDetails');
    const accountOperationsContainer = document.getElementById('accountOperations');
    const template = document.getElementById('operationTemplate');
    const account = getAccounts().find(acc => acc.id === accountId);

    if (!account) return;

    accountDetailsSection.style.display = 'block';
    accountOperationsContainer.innerHTML = '';

    const operations = getFromLocalStorage('operations').filter(op => op.bill === accountId);

    const operationSums = processAndRenderOperations(accountOperationsContainer, operations, template);

    document.getElementById('positiveExpenses').textContent = `${operationSums.totalPositive} ${account.currency}`;
    document.getElementById('negativeExpenses').textContent = `${operationSums.totalNegative} ${account.currency}`;
    
    showSection('accountDetails');
}

renderAccounts();