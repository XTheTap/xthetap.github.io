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
