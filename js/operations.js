const operationContainer = document.getElementById('operation');
const operationForm = document.getElementById('operationForm');

function getOperations() {
    return JSON.parse(localStorage.getItem('operations')) || [];
}

// Сохранение данных в LocalStorage
function saveOperations(accounts) {
    localStorage.setItem('operations', JSON.stringify(accounts));
}

// Отображение счетов
function renderOperations() {
    operationContainer.innerHTML = ''; 

    const accounts = getOperations();
    accounts.forEach((operation, index) => {
        const operationDiv = document.createElement('div');
        operationDiv.className = 'operation';
        operationDiv.innerHTML = 
        `<div class="billField">
        <tt>${operation.bill}</tt>
        <span>-${operation.summ}</span>
        </div>`;
        operationContainer.appendChild(operationDiv);
    });
}

operationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const summ = parseFloat(document.getElementById('summ').value);
    const bill = document.getElementById('bill').value;
    const tag = document.getElementById('accountName').value;
    const comment = document.getElementById('comment').value;
    const currentDate = Date.now();

    const newOperation = { summ, bill, tag, comment, currentDate };
    const operation = getOperations();
    operation.push(newOperation);
    saveOperations(operation);
    renderOperations();

    operationForm.reset(); // Очистка формы
});

renderOperations();