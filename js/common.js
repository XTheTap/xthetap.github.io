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

function processAndRenderOperations(container, operations, template) {
  operations.sort((a, b) => new Date(b.currentDate) - new Date(a.currentDate));

  const grouped = operations.reduce((acc, op) => {
      const dateKey = getDateKey(new Date(op.currentDate));
      (acc[dateKey] = acc[dateKey] || []).push(op);
      return acc;
  }, {});

  Object.entries(grouped).forEach(([dateKey, operations]) => {
      const dateHeader = document.createElement('h3');
      dateHeader.textContent = dateKey;
      container.appendChild(dateHeader);

      operations.forEach(({ bill, summ, comment, type }) => {
          const account = getAccountById(bill) || {};
          const { name = 'Счёт не найден или удалён', currency = 'NoN' } = account;
          const operationElement = template.content.cloneNode(true);
          const formattedSumm = `${type === 'expense' ? '-' : '+'}${summ} ${currency}`;
          operationElement.querySelector('.accountName').textContent = name;
          operationElement.querySelector('.operationAmount').textContent = formattedSumm;
          operationElement.querySelector('.operationComment').textContent = comment || '';
          container.appendChild(operationElement);
      });
  });
}
