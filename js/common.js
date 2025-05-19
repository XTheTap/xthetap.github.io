showSection('bills');

const getFromLocalStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveToLocalStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();
const getDateKey = (date) => {
    const today = new Date(), yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return isSameDay(date, today) ? `Сегодня, ${today.toLocaleDateString()}` :
           isSameDay(date, yesterday) ? `Вчера, ${yesterday.toLocaleDateString()}` :
           `${date.toLocaleDateString()}, ${date.toLocaleDateString('ru-RU', { weekday: 'long' })}`;
};

function showSection(id) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      section.classList.remove('active');
    });
    
    const active = document.getElementById(id);
    if (active) {
      active.classList.add('active');
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
    
    const operationSection = document.getElementById('addOperation');
    if (operationSection) {
        operationSection.dataset.operationId = operationId;
    }

    showSection('addOperation');
}