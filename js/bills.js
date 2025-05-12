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
        accountElement.querySelector('.accountBalance').textContent = `${balance.toFixed(2)} ${currency}`; // Added toFixed(2)
        accountElement.querySelector('.account').addEventListener('click', () => {
            renderAccountDetails(id);
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

    // const mainCurrency = prompt('Выберите основную валюту (например, USD, EUR):');
    // if (mainCurrency) {
    //     localStorage.setItem('mainCurrency', mainCurrency);
    // }
});

async function renderAccountDetails(accountId) {
    const accountDetailsSection = document.getElementById('accountDetails');
    const accountOperationsContainer = document.getElementById('accountOperations');
    const template = document.getElementById('operationTemplate');
    const account = getAccounts().find(acc => acc.id === accountId);

    if (!account) return;

    accountDetailsSection.style.display = 'block';
    accountOperationsContainer.innerHTML = '';

    const operations = getFromLocalStorage('operations').filter(op => op.bill === accountId);

    const operationSums = await processAndRenderOperations(accountOperationsContainer, operations, template);

    document.getElementById('positiveExpenses').textContent = `${operationSums.totalPositive.toFixed(2)} ${account.currency}`; // Added toFixed(2)
    document.getElementById('negativeExpenses').textContent = `${operationSums.totalNegative.toFixed(2)} ${account.currency}`; // Added toFixed(2)
    
    showSection('accountDetails');
}

function calculateTotalBalance(mainCurrency) {
    const accounts = getAccounts();
    const exchangeRates = getFromLocalStorage('exchangeRates'); // Assume exchange rates are stored in localStorage

    return accounts.reduce((total, { balance, currency }) => {
        const rate = exchangeRates[currency] || 1; // Default to 1 if no rate is found
        return total + (balance * rate);
    }, 0).toFixed(2); // Added toFixed(2)
}

renderAccounts();