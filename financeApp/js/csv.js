function toCsvValue(value) {
    if (value === null || value === undefined) return '';

    const str = String(value);

    if (/[",\r\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
}

function toCsvRow(values) {
    return values.map(toCsvValue).join(',');
}

function parseCsv(text) {
    if (!text || !text.trim()) return [];

    text = text.replace(/^\uFEFF/, '');

    const rows = [];
    let row = [];
    let field = '';

    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
        const char = text[i];
        const next = text[i + 1];

        if (inQuotes) {
            if (char === '"') {
                if (next === '"') {
                    field += '"';
                    i += 2;
                    continue;
                }

                inQuotes = false;
                i++;
                continue;
            }

            field += char;
            i++;
            continue;
        }

        if (char === '"') {
            inQuotes = true;
            i++;
            continue;
        }

        if (char === ',') {
            row.push(field);
            field = '';
            i++;
            continue;
        }

        if (char === '\r' && next === '\n') {
            row.push(field);
            rows.push(row);

            row = [];
            field = '';

            i += 2;
            continue;
        }

        if (char === '\n') {
            row.push(field);
            rows.push(row);

            row = [];
            field = '';

            i++;
            continue;
        }

        field += char;
        i++;
    }

    row.push(field);

    if (row.some(v => v !== '')) {
        rows.push(row);
    }

    return rows;
}

function safeNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

function exportCsvData() {
    const accounts = getFromLocalStorage('accounts') || [];
    const operations = getFromLocalStorage('operations') || [];
    const userTags = JSON.parse(localStorage.getItem('userTags')) || { expense: [], income: [] };

    const header = [
        'recordType',
        'id',
        'name',
        'currency',
        'balance',
        'debitBalance',
        'summ',
        'type',
        'bill',
        'billTransfer',
        'summTransfer',
        'tag',
        'comment',
        'currentDate',
        'icon',
        'parent',
        'obligation'
    ];

    const rows = [toCsvRow(header)];

    for (const acc of accounts) {
        rows.push(toCsvRow([
            'account',
            acc.id,
            acc.name,
            acc.currency,
            acc.balance,
            acc.debitBalance,
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
        ]));
    }

    for (const op of operations) {
        rows.push(toCsvRow([
            'operation',
            op.id,
            '',
            '',
            '',
            '',
            op.summ,
            op.type,
            op.bill,
            op.billTransfer,
            op.summTransfer,
            op.tag,
            op.comment,
            op.currentDate,
            '',
            '',
            ''
        ]));
    }

    for (const type of ['expense', 'income']) {
        for (const tag of userTags[type]) {
            rows.push(toCsvRow([
                'tag',
                tag.id,
                tag.name,
                '',
                '',
                '',
                '',
                type,
                '',
                '',
                '',
                '',
                '',
                '',
                tag.icon || '',
                tag.parent || '',
                tag.obligation || false
            ]));
        }
    }

    const csv = rows.join('\r\n');

    const blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `finance_data_${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

function importCsvData(file) {
    const reader = new FileReader();

    reader.onload = ({ target }) => {
        try {
            const text = target.result;
            const rows = parseCsv(text);

            if (rows.length < 2) {
                alert('Failed to import: file is empty.');
                return;
            }

            const [header, ...dataRows] = rows;

            const indexMap = {};
            header.forEach((name, index) => {
                indexMap[name.trim()] = index;
            });

            const accounts = [];
            const operations = [];
            const userTags = { expense: [], income: [] };

            for (const cols of dataRows) {
                if (!cols.length) continue;

                const recordType = (
                    cols[indexMap.recordType] || ''
                ).trim().toLowerCase();

                if (recordType === 'account') {
                    accounts.push({
                        id: cols[indexMap.id] || generateId(),
                        name: cols[indexMap.name] || 'Без имени',
                        currency: cols[indexMap.currency] || 'USD',
                        balance: safeNumber(cols[indexMap.balance]),
                        debitBalance: safeNumber(cols[indexMap.debitBalance])
                    });
                }

                if (recordType === 'operation') {
                    operations.push({
                        id: cols[indexMap.id] || generateId(),
                        summ: safeNumber(cols[indexMap.summ]),
                        type: cols[indexMap.type] || 'expense',
                        bill: cols[indexMap.bill] || '',
                        billTransfer: cols[indexMap.billTransfer] || '',
                        summTransfer: safeNumber(cols[indexMap.summTransfer]),
                        tag: cols[indexMap.tag] || '',
                        comment: cols[indexMap.comment] || '',
                        currentDate: safeNumber(
                            cols[indexMap.currentDate],
                            Date.now()
                        )
                    });
                }

                if (recordType === 'tag') {
                    const type = cols[indexMap.type] || 'expense';
                    if (type === 'expense' || type === 'income') {
                        userTags[type].push({
                            id: cols[indexMap.id] || generateId(),
                            name: cols[indexMap.name] || 'Без имени',
                            icon: cols[indexMap.icon] || null,
                            parent: cols[indexMap.parent] || null,
                            obligation: cols[indexMap.obligation] === 'true' || false
                        });
                    }
                }
            }

            saveToLocalStorage('accounts', accounts);
            saveToLocalStorage('operations', operations);
            localStorage.setItem('userTags', JSON.stringify(userTags));

            updateAccountSelects();
            renderAccounts();
            renderOperations();
            updateTagSelectors();

            alert(
                `Import done.\nAccounts: ${accounts.length}\nOperations: ${operations.length}\nTags: ${userTags.expense.length + userTags.income.length}`
            );
        } catch (error) {
            console.error(error);
            alert('Error importing CSV.');
        }
    };

    reader.onerror = () => {
        alert('Error reading file.');
    };

    reader.readAsText(file, 'utf-8');
}

function setupCsvButtons() {
    document
        .getElementById('exportDataBtn')
        ?.addEventListener('click', exportCsvData);

    document
        .getElementById('importDataBtn')
        ?.addEventListener('click', () => {
            const input = document.createElement('input');

            input.type = 'file';
            input.accept = '.csv,text/csv';

            input.onchange = () => {
                const file = input.files?.[0];
                if (file) {
                    importCsvData(file);
                }
            };

            input.click();
        });
}

document.addEventListener('DOMContentLoaded', setupCsvButtons);