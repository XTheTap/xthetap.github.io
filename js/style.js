const mainAddBtn = document.getElementById('main-add-btn');
const optionsDiv = document.getElementById('operation-options');

mainAddBtn.addEventListener('click', () => {
  optionsDiv.classList.toggle('hidden');
});

document.querySelectorAll('#operation-options button').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    const operationTypeSelect = document.getElementById('operationType');
    if (operationTypeSelect) {
      operationTypeSelect.value = type === 'addOperation' ? 'expense' : type; // Default to 'expense'
    }
    showSection('addOperation'); 
    optionsDiv.classList.add('hidden');
  });
});
