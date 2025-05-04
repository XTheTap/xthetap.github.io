const mainAddBtn = document.getElementById('main-add-btn');
const optionsDiv = document.getElementById('operation-options');

mainAddBtn.addEventListener('click', () => {
  optionsDiv.classList.toggle('hidden');
});

document.querySelectorAll('#operation-options button').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    showSection(type); 
    optionsDiv.classList.add('hidden');
  });
});
