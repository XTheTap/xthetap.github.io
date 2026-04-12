const tagsList = document.getElementById('tagsList');
const addTagBtn = document.getElementById('addTagBtn');

async function renderTags() {
    tagsList.innerHTML = '';
    const tagsData = await loadTagsData();
    if (!tagsData) return;

    const allTags = [
        ...tagsData.expense.map(tag => ({ ...tag, type: 'expense' })),
        ...tagsData.income.map(tag => ({ ...tag, type: 'income' }))
    ];

    allTags.forEach(tag => {
        const tagEl = document.createElement('div');
        tagEl.className = 'tag-item';
        tagEl.innerHTML = `
            <span>${tag.name} (${tag.type})</span>
            <button class="delete-tag" data-id="${tag.id}" data-type="${tag.type}">Delete</button>
        `;
        tagsList.appendChild(tagEl);
    });

    document.querySelectorAll('.delete-tag').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(e.target.dataset.id);
            const type = e.target.dataset.type;
            await removeUserTag(type, id);
            renderTags();
            window.updateTagSelectors();
        });
    });
}

addTagBtn.addEventListener('click', () => {
    showSection('addTag');
});

window.renderTags = renderTags;