let cachedTagsData = null;

async function loadTagsData() {
    if (cachedTagsData) return cachedTagsData;
    const response = await fetch('json/tags.json');
    if (!response.ok) return null;
    const defaultTags = await response.json();
    const userTags = JSON.parse(localStorage.getItem('userTags')) || { expense: [], income: [] };
    cachedTagsData = {
        expense: [...defaultTags.expense, ...userTags.expense],
        income: [...defaultTags.income, ...userTags.income]
    };
    return cachedTagsData;
}

function saveUserTags(userTags) {
    localStorage.setItem('userTags', JSON.stringify(userTags));
    cachedTagsData = null;
}

async function addUserTag(type, name, icon = null, parent = null, obligation = false) {
    const userTags = JSON.parse(localStorage.getItem('userTags')) || { expense: [], income: [] };
    const newId = Date.now();
    const newTag = { id: newId, name, icon, parent, obligation };
    userTags[type].push(newTag);
    saveUserTags(userTags);
    return newId;
}

async function removeUserTag(type, id) {
    const userTags = JSON.parse(localStorage.getItem('userTags')) || { expense: [], income: [] };
    userTags[type] = userTags[type].filter(tag => tag.id !== id);
    saveUserTags(userTags);
}

async function getTagNameById(tagId) {
    const tagsData = await loadTagsData();
    if (!tagsData) return 'Err';
    const allTags = [...tagsData.expense, ...tagsData.income];
    const tag = allTags.find(t => t.id == tagId);
    return tag ? tag.name : 'Non';
}

async function getParentTagNameById(tagId) {
    const tagsData = await loadTagsData();
    if (!tagsData) return 'Err';
    const allTags = [...tagsData.expense, ...tagsData.income];
    const tag = allTags.find(t => t.id == tagId);
    return tag ? tag.parent : null;
}

function getTagsFromJson(key) {
    return loadTagsData()
        .then((data) => (data && data[key]) ? data[key] : [])
        .catch(() => []);
}

async function updateTagSelectors() {
    const tagSelect = document.getElementById('tag');
    const operationTypeSelect = document.getElementById('operationType');
    if (!tagSelect || !operationTypeSelect) return;
    const operationType = operationTypeSelect.value;
    if (operationType === 'expense' || operationType === 'income') {
        const tags = await getTagsFromJson(operationType);
        tagSelect.innerHTML = '<option value="" disabled selected>Choose tag</option>';
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = tag.name;
            tagSelect.appendChild(option);
        });
    }
}

window.updateTagSelectors = updateTagSelectors;