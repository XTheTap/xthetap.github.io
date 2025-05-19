let cachedTagsData = null;

async function loadTagsData() {
    if (cachedTagsData) return cachedTagsData;
    const response = await fetch('../json/tags.json');
    if (!response.ok) return null;
    cachedTagsData = await response.json();
    return cachedTagsData;
}

async function getTagNameById(tagId) {
    const tagsData = await loadTagsData();
    if (!tagsData) return 'Err';
    const allTags = [...tagsData.expense, ...tagsData.income];
    const tag = allTags.find(t => t.id == tagId);
    return tag ? tag.name : 'Non';
}

async function getPaerntTagNameById(tagId) {
    const tagsData = await loadTagsData();
    if (!tagsData) return 'Err';
    const allTags = [...tagsData.expense, ...tagsData.income];
    const tag = allTags.find(t => t.id == tagId);
    return tag ? tag.parent : null;
}

function getTagsFromJson(key) {
    return fetch('../json/tags.json')
        .then((res) => res.ok ? res.json() : Promise.reject('Ошибка загрузки данных'))
        .then((data) => data[key] || [])
        .catch(console.error);
}