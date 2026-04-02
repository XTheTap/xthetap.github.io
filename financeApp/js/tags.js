let cachedTagsData = null;

async function loadTagsData() {
    if (cachedTagsData) return cachedTagsData;
    const response = await fetch('json/tags.json');
    if (!response.ok) return null;
    cachedTagsData = await response.json();
    return cachedTagsData;
}

async function getTagNameById(tagId) {
    const tagsData = await loadTagsData();
    if (!tagsData) return 'Err';
    const allTags = [...tagsData.expense, ...tagsData.income];
    let tag = allTags.find(t => t.id == tagId);
    if (tag) return tag.name;

    // Check user tags
    const userTags = getFromLocalStorage('userTags') || [];
    tag = userTags.find(t => t.id == tagId);
    return tag ? tag.name : 'Non';
}

async function getPaerntTagNameById(tagId) {
    const tagsData = await loadTagsData();
    if (!tagsData) return 'Err';
    const allTags = [...tagsData.expense, ...tagsData.income];
    let tag = allTags.find(t => t.id == tagId);
    if (tag) return tag.parent;

    // Check user tags
    const userTags = getFromLocalStorage('userTags') || [];
    tag = userTags.find(t => t.id == tagId);
    return tag ? tag.parent : null;
}

function getTagsFromJson(key) {
    return loadTagsData()
        .then((data) => {
            const predefined = (data && data[key]) ? data[key] : [];
            const userTags = getFromLocalStorage('userTags') || [];
            const userTagsForKey = userTags.filter(t => t.type === key);
            return [...predefined, ...userTagsForKey];
        })
        .catch(() => []);
}

function addUserTag(name, type, parent = null) {
    const userTags = getFromLocalStorage('userTags') || [];
    const maxId = Math.max(...userTags.map(t => t.id), 1000); // Start from 1000 to avoid conflict
    const newTag = {
        id: maxId + 1,
        name,
        type,
        parent,
        icon: 'icons/custom.png', // Default icon
        obligation: false // Default
    };
    userTags.push(newTag);
    saveToLocalStorage('userTags', userTags);
    return newTag;
}