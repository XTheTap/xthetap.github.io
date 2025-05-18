async function getTagNameById(tagId) {
    const response = await fetch('../json/tags.json');
    if (!response.ok) return 'Err';
    const tagsData = await response.json();
    const allTags = [...tagsData.expense, ...tagsData.income];
    const tag = allTags.find(t => t.id == tagId);
    return tag ? tag.name : 'Non';
}

async function getPaerntTagNameById(tagId) {
    const response = await fetch('../json/tags.json');
    if (!response.ok) return 'Err';
    const tagsData = await response.json();
    const allTags = [...tagsData.expense, ...tagsData.income];
    const tag = allTags.find(t => t.id == tagId);
    return tag ? tag.parent : null;
}