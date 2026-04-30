if ('serviceWorker' in navigator) { 
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js');
    });
}

function adjustSectionHeight() {
  const nav = document.querySelector('nav');
  if (nav) {
    const navHeight = nav.offsetHeight;
    document.documentElement.style.setProperty('--nav-height', navHeight + 'px');
  }
}

window.addEventListener('load', adjustSectionHeight);
window.addEventListener('resize', adjustSectionHeight);
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(adjustSectionHeight, 100);
});