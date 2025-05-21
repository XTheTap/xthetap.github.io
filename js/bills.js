const accountsContainer = document.getElementById('accounts');
const accountForm = document.getElementById('accountForm');
const addBillForm = document.getElementById('addBill');

const getAccounts = () => getFromLocalStorage('accounts');
const saveAccounts = (accounts) => saveToLocalStorage('accounts', accounts);

const accountFields = {
    name: document.getElementById('accountName'),
    currency: document.getElementById('currency'),
    balance: document.getElementById('balance'),
    debitBalance: document.getElementById('debitBalance')
};

let currentAccount = null;

function renderAccounts() {
    accountsContainer.innerHTML = '';
    const template = document.getElementById('accountTemplate');
    getAccounts().forEach(acc => {
        const el = template.content.cloneNode(true);
        el.querySelector('.accountName').textContent = acc.name;
        if (acc.balance != null)
            el.querySelector('.accountBalance').textContent = `${acc.balance.toFixed(2)} ${acc.currency}`;
        el.querySelector('.account').onclick = () => renderAccountDetails(acc.id);
        accountsContainer.appendChild(el);
    });
}

accountForm.onsubmit = e => {
    e.preventDefault();
    const { name, currency, balance, debitBalance } = accountFields;
    const newAccount = {
        id: generateId(),
        name: name.value,
        currency: currency.value,
        balance: parseFloat(balance.value)
    };
    if (debitBalance.value !== '') newAccount.debitBalance = parseFloat(debitBalance.value);
    saveAccounts([...getAccounts(), newAccount]);
    renderAccounts();
    showSection('bills');
    accountForm.reset();
};

document.addEventListener('DOMContentLoaded', () => {
    fetch('../json/currencies.json')
        .then(res => res.ok ? res.json() : Promise.reject('Ошибка загрузки данных'))
        .then(data => {
            const tagSelect = accountFields.currency;
            data.forEach(currency => {
                const option = document.createElement('option');
                option.value = option.textContent = currency;
                tagSelect.appendChild(option);
            });
        })
        .catch(console.error);
});

async function renderAccountDetails(accountId) {
    const accOps = document.getElementById('accountOperations');
    const template = document.getElementById('operationTemplate');
    const acc = getAccounts().find(a => a.id === accountId);
    if (!acc) return;
    currentAccount = acc;
    accOps.innerHTML = '';
    const ops = getFromLocalStorage('operations').filter(op => op.bill === accountId);
    accountFields.name.value = acc.name || '';
    accountFields.currency.value = acc.currency || '';
    accountFields.balance.value = acc.balance != null ? acc.balance : '';
    accountFields.debitBalance.value = 'debitBalance' in acc && acc.debitBalance != null ? acc.debitBalance : '';
    const sums = await processAndRenderOperations(accOps, ops, template);
    document.getElementById('positiveExpenses').textContent = `${sums.totalPositive.toFixed(2)} ${acc.currency}`;
    document.getElementById('negativeExpenses').textContent = `${sums.totalNegative.toFixed(2)} ${acc.currency}`;
    setVisibilityMode('description', 'addBill');
    addBillForm.querySelectorAll('input, select').forEach(el => el.disabled = true);
    showSection('addBill');
}

function calculateTotalBalance(mainCurrency) {
    const accounts = getAccounts();
    const rates = getFromLocalStorage('exchangeRates');
    return accounts.reduce((t, { balance, currency }) => t + (balance * (rates[currency] || 1)), 0).toFixed(2);
}

function showAddBill() {
    setVisibilityMode('adding', 'addBill');
    accountForm.reset();
    addBillForm.querySelectorAll('input, select').forEach(el => el.disabled = false);
    showSection('addBill');
}

document.getElementById('accountSave').onclick = e => {
    e.preventDefault();
    if (!currentAccount) return;
    const { name, currency, balance, debitBalance } = accountFields;
    Object.assign(currentAccount, {
        name: name.value,
        currency: currency.value,
        balance: parseFloat(balance.value)
    });
    if (debitBalance.value !== '') currentAccount.debitBalance = parseFloat(debitBalance.value);
    else delete currentAccount.debitBalance;
    let accounts = getAccounts().map(acc => acc.id === currentAccount.id ? currentAccount : acc);
    saveAccounts(accounts);
    renderAccounts();
    showSection('bills');
    currentAccount = null;
};

document.getElementById('accountDelete').onclick = function() {
    if (!currentAccount) return;
    let accounts = getAccounts().filter(acc => acc.id !== currentAccount.id);
    saveAccounts(accounts);
    renderAccounts();
    showSection('bills');
    currentAccount = null;
};

renderAccounts();