const accountsContainer = document.getElementById('accounts');
const accountForm = document.getElementById('accountForm');

const getAccounts = () => getFromLocalStorage('accounts');
const saveAccounts = (accounts) => saveToLocalStorage('accounts', accounts);

function renderAccounts() {
    accountsContainer.innerHTML = ''; 
    const template = document.getElementById('accountTemplate');
    getAccounts().forEach(({ name, balance, currency }) => {
        const accountElement = template.content.cloneNode(true);
        accountElement.querySelector('.accountName').textContent = name;
        accountElement.querySelector('.accountBalance').textContent = `${balance} ${currency}`;
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
    window.location.hash = '#bills';
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
});

renderAccounts();