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

function setVisibilityMode(mode, form) {
  document.getElementById(form).querySelectorAll('[data-visible]').forEach(el => {
    el.style.display = el.dataset.visible === mode ? '' : 'none';
  });
}

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

// Глобальные переменные для select'ов счетов (используются в операциях)
window.billSelect = document.getElementById('bill');
window.billTransferSelect = document.getElementById('billTransfer');

// Функция для обновления select'ов счетов
window.updateAccountSelects = function() {
    if (!window.billSelect || !window.billTransferSelect) return;
    billSelect.innerHTML = '<option value="" disabled selected>Выберите счёт</option>';
    billTransferSelect.innerHTML = '<option value="" disabled selected>Выберите счёт</option>';
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
};