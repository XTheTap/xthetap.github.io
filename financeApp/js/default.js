if ('serviceWorker' in navigator) { 
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js');
    });
}

// Вычисляем высоту навигации и устанавливаем CSS переменную
function adjustSectionHeight() {
  const nav = document.querySelector('nav');
  if (nav) {
    const navHeight = nav.offsetHeight;
    document.documentElement.style.setProperty('--nav-height', navHeight + 'px');
  }
}

// Вызываем при полной загрузке страницы
window.addEventListener('load', adjustSectionHeight);
// Вызываем при изменении размера окна
window.addEventListener('resize', adjustSectionHeight);
// Также вызываем при DOMContentLoaded с небольшой задержкой
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(adjustSectionHeight, 100);
});