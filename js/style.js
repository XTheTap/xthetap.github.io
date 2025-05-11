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

document.querySelectorAll('#operation-options button').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    const operationTypeSelect = document.getElementById('operationType');
    if (operationTypeSelect) {
      operationTypeSelect.value = type === 'addOperation' ? 'expense' : type; 
    }
    showSection('addOperation'); 
    optionsDiv.classList.add('hidden');
  });
});
