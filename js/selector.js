function loadScript() {
    const script = document.createElement('script');
    script.src = '../js/bills.js';
    document.body.appendChild(script);
}

// Пример: ждем появления элемента в viewport
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        loadScript();
        observer.disconnect(); // Отключаем наблюдателя
    }
});

const lazyElement = document.getElementById('bills');
observer.observe(lazyElement);