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
    const monthlyResultElement = document.getElementById('monthlyResult');
    const account = getAccounts().find(acc => acc.id === accountId);

    if (!account) return;

    accountDetailsSection.style.display = 'block';
    accountOperationsContainer.innerHTML = '';
    monthlyResultElement.textContent = '';

    const operations = getFromLocalStorage('operations').filter(op => op.bill === accountId);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let monthlyTotal = 0;

    const grouped = operations.reduce((acc, op) => {
        const dateKey = getDateKey(new Date(op.currentDate));
        (acc[dateKey] = acc[dateKey] || []).push(op);
        return acc;
    }, {});

    Object.entries(grouped).forEach(([dateKey, operations]) => {
        const dateHeader = document.createElement('h3');
        dateHeader.textContent = dateKey; 
        accountOperationsContainer.appendChild(dateHeader);

        operations
            .sort((a, b) => new Date(b.currentDate) - new Date(a.currentDate))
            .forEach(({ summ, comment, currentDate }) => {
                const operationDate = new Date(currentDate);
                if (operationDate.getMonth() === currentMonth && operationDate.getFullYear() === currentYear) {
                    monthlyTotal += summ;
                }

                const operationElement = document.createElement('div');
                operationElement.innerHTML = `
                    <p>Сумма: ${summ}</p>
                    <p>Комментарий: ${comment || 'Нет комментария'}</p>
                    <p>Дата: ${operationDate.toLocaleDateString()}</p>
                `;
                accountOperationsContainer.appendChild(operationElement);
            });
    });

    monthlyResultElement.textContent = `${monthlyTotal} ${account.currency}`;
    
    showSection('accountDetails');
}

renderAccounts();