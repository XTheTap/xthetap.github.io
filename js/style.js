const mainAddBtn = document.getElementById('main-add-btn');
const optionsDiv = document.getElementById('operation-options');

mainAddBtn.addEventListener('click', () => {
  optionsDiv.classList.toggle('hidden');
});

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav');
  const addOperation = document.querySelector('.add-operation');
  if (nav && addOperation) {
      const navHeight = nav.offsetHeight;
      addOperation.style.marginBottom = `${navHeight + 10}px`;
  }
});