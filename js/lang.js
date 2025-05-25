const langSwitcher = document.getElementById('globalLanguage');

function setLanguage(lang) {
  fetch(`lang/${lang}.json`)
    .then(response => response.json())
    .then(data => {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (data[key]) {
          el.textContent = data[key];
        }
      });

      if (data.title) {
        document.title = data.title;
      }

      localStorage.setItem('language', lang);
    });
}

langSwitcher.addEventListener('change', (e) => {
  setLanguage(e.target.value);
});

const savedLang = localStorage.getItem('language') || 'en';
langSwitcher.value = savedLang;
setLanguage(savedLang);
