async function generateDataFromOperations(operations) {
  const categories = {};

  for (const op of operations) {
    const tagId = op.tag || 'Без тэга';
    const tagName = tagId === 'Без тэга' ? 'Без тэга' : await getTagNameById(tagId);

    if (!categories[tagName]) {
      categories[tagName] = {
        name: tagName,
        value: 0,
        color: `hsl(${Math.random() * 360}, 60%, 70%)`
      };
    }

    categories[tagName].value += Number(op.summ) || 0;

    const parentTagId = tagId === 'Без тэга' ? null : await getPaerntTagNameById(tagId);
    if (parentTagId) {
      const parentName = await getTagNameById(parentTagId);
      if (!categories[parentName]) {
        categories[parentName] = {
          name: parentName,
          value: 0,
          color: `hsl(${Math.random() * 360}, 60%, 70%)`
        };
      }
      categories[parentName].value += Number(op.summ) || 0;
    }
  }

  return {
    name: 'Root',
    children: Object.values(categories)
  };
}

function isCurrentMonth(dateValue) {
  const date = new Date(dateValue);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

async function initAnalyticData() {
  const allOperations = await getOperations() || [];
  const operations = allOperations.filter(op => {
    return op.type === 'expense' && isCurrentMonth(op.currentDate);
  });
  const data = await generateDataFromOperations(operations);
  return data;
}

function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(angleInRadians)),
    y: cy + (r * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${x} ${y}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z'
  ].join(' ');
}

function createPieChart(container, data) {
  container.innerHTML = '';
  const slices = data.children || [];
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (!total) {
    const empty = document.createElement('p');
    empty.textContent = 'Нет данных за текущий месяц';
    container.appendChild(empty);
    return;
  }

  const size = Math.min(container.clientWidth, container.clientHeight, 360);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 20;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.style.width = '100%';
  svg.style.height = 'auto';

  let startAngle = 0;

  slices.forEach((slice, idx) => {
    const sliceAngle = (slice.value / total) * 360;
    const endAngle = startAngle + sliceAngle;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', describeArc(cx, cy, radius, startAngle, endAngle));
    path.setAttribute('fill', slice.color || `hsl(${(idx * 45) % 360}, 60%, 70%)`);
    path.setAttribute('stroke', '#ffffff');
    path.setAttribute('stroke-width', '1');

    const percent = (slice.value / total * 100).toFixed(1);
    path.setAttribute('title', `${slice.name}: ${slice.value.toFixed(2)} (${percent}%)`);
    svg.appendChild(path);

    startAngle = endAngle;
  });

  container.appendChild(svg);

  const legend = document.createElement('div');
  legend.style.marginTop = '12px';
  legend.style.display = 'grid';
  legend.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
  legend.style.gap = '8px';

  slices.forEach(slice => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';

    const dot = document.createElement('span');
    dot.style.width = '12px';
    dot.style.height = '12px';
    dot.style.borderRadius = '50%';
    dot.style.display = 'inline-block';
    dot.style.backgroundColor = slice.color || '#999';
    dot.style.marginRight = '8px';

    const percent = (slice.value / total * 100).toFixed(1);
    const text = document.createElement('span');
    text.textContent = `${slice.name}: ${slice.value.toFixed(2)} (${percent}%)`;

    row.appendChild(dot);
    row.appendChild(text);
    legend.appendChild(row);
  });

  const totalRow = document.createElement('p');
  totalRow.style.marginTop = '8px';
  totalRow.textContent = `Итого: ${total.toFixed(2)} (100%)`;

  container.appendChild(legend);
  container.appendChild(totalRow);
}

initAnalyticData().then(data => {
  window.analyticData = data;
  window.createPieChart = createPieChart;
  window.createTreemap = createPieChart;
});