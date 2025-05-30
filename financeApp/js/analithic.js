async function generateDataFromOperations(operations) {
  const categories = {};

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const tag = op.tag || "Без тэга"; // Если тэг отсутствует, записываем в "Без тэга"
    
    if (!categories[tag]) {
      categories[tag] = {
        name: await getTagNameById(tag),
        value: 0,
        color: `hsl(${Math.random() * 360}, 60%, 70%)`, // Случайный цвет
        children: []
      };
    }

    categories[tag].value += op.summ;
    
    const parentTag = await getPaerntTagNameById(); // Родительский тэг, если есть
    
    if (parentTag) {
      if (!categories[parentTag]) {
        categories[parentTag] = {
          name: parentTag,
          value: 0,
          color: `hsl(${Math.random() * 360}, 60%, 70%)`,
          children: []
        };
      }

      categories[parentTag].value += op.summ;

      if (!categories[parentTag].children.find(child => child.name === tag)) {
        categories[parentTag].children.push(categories[tag]);
      }
    }
  }

  return {
    name: "Root",
    children: Object.values(categories)
  };
}

async function initAnalyticData() {
  const operations = (await getOperations()).filter(op => op.type === 'expense');
  const data = await generateDataFromOperations(operations);
  return data;
}

function createTreemap(container, data, x, y, width, height) {
  const total = data.children ? data.children.reduce((sum, d) => sum + d.value, 0) : data.value;

  let offset = 0;
  const isHorizontal = width > height;

  (data.children || [data]).forEach(child => {
    const ratio = child.value / total;
    const w = isHorizontal ? width * ratio : width;
    const h = isHorizontal ? height : height * ratio;
    const cx = isHorizontal ? x + offset : x;
    const cy = isHorizontal ? y : y + offset;

    const node = document.createElement('div');
    node.className = 'node';
    node.style.left = cx + 'px';
    node.style.top = cy + 'px';
    node.style.width = w + 'px';
    node.style.height = h + 'px';
    node.style.backgroundColor = child.color || 'hsl(200, 60%, 70%)'; // Используем цвет категории или дефолтный

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = child.name;
    node.appendChild(label);

    container.appendChild(node);

    if (child.children) {
      createTreemap(node, child, 0, 0, w, h);
    }

    offset += isHorizontal ? w : h;
  });
}

initAnalyticData().then(data => {
  window.analyticData = data;
  window.createTreemap = createTreemap;
});