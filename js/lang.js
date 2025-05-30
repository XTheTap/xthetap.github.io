const langSwitcher = document.getElementById('globalLanguage');

function getValueByPath(obj, path) {
  const arrayRegex = /^([^\[]+)\[(\d+)\]$/;
  if (arrayRegex.test(path)) {
    const [, arrKey, idx] = path.match(arrayRegex);
    return obj[arrKey] && obj[arrKey][idx];
  }
  return obj[path];
}

function setLanguage(lang) {
  fetch(`lang/${lang}.json`)
    .then(response => response.json())
    .then(data => {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const value = getValueByPath(data, key);
        if (value) {
          el.textContent = value;
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
