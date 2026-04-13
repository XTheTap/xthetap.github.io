const tagForm = document.getElementById('tagForm');
const cancelTagBtn = document.getElementById('cancelTagBtn');

const tagFields = {
    name: document.getElementById('tagName'),
    type: document.getElementById('tagType'),
    icon: document.getElementById('tagIcon'),
    parent: document.getElementById('tagParent'),
    obligation: document.getElementById('tagObligation')
};

tagForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { name, type, icon, parent, obligation } = tagFields;
    const tagName = name.value.trim();
    const tagType = type.value;
    const tagIcon = icon.value.trim() || null;
    const tagParent = parent.value ? parseInt(parent.value) : null;
    const tagObligation = obligation.checked;

    if (tagName && tagType) {
        await addUserTag(tagType, tagName, tagIcon, tagParent, tagObligation);
        window.updateTagSelectors();
        showSection('manageTags');
        tagForm.reset();
    }
});

cancelTagBtn.addEventListener('click', () => {
    showSection('manageTags');
    tagForm.reset();
});