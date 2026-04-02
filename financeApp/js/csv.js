function toCsvRow(values) {
    return values.map(v => {
        const s = v === null || v === undefined ? '' : String(v);
        if (/[",\n]/.test(s)) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }).join(',');
}

function parseCsv(text) {
    const rows = [];
    const re = /(?:\s*"([^"]*(?:""[^"]*)*)"\s*|([^,]*))(,|$)/g;
    let row = [];
    let m;
    let col;

    for (let i = 0; i < text.length;) {
        re.lastIndex = i;
        m = re.exec(text);
        if (!m) break;

        col = m[1] !== undefined ? m[1].replace(/""/g, '"') : m[2];
        row.push(col);

        i = re.lastIndex;

        if (m[3] === '' || i >= text.length) {
            rows.push(row);
            row = [];
            break;
        }

        if (m[3] === ',') {
            if (text[i] === '\n') {
                i += 1;
                rows.push(row);
                row = [];
            } else if (text[i] === '\r' && text[i + 1] === '\n') {
                i += 2;
                rows.push(row);
                row = [];
            }
        }
    }

    if (row.length > 0) rows.push(row);

    if (rows.length === 0 && text.trim()) {
        const lines = text.split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
            rows.push(line.split(',').map(s => s.trim()));
        }
    }

    return rows;
}

function exportCsvData() {
    const accounts = getFromLocalStorage('accounts') || [];
    const operations = getFromLocalStorage('operations') || [];

    const header = ['recordType','id','name','currency','balance','debitBalance','summ','type','bill','billTransfer','summTransfer','tag','comment','currentDate'];
    const lines = [toCsvRow(header)];

    accounts.forEach(acc => {
        lines.push(toCsvRow(['account', acc.id, acc.name, acc.currency, acc.balance, acc.debitBalance || '', '', '', '', '', '', '', '', '']));
    });

    operations.forEach(op => {
        lines.push(toCsvRow(['operation', op.id, '', '', '', '', op.summ, op.type, op.bill, op.billTransfer || '', op.summTransfer || '', op.tag || '', op.comment || '', op.currentDate]));
    });

    const csv = lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `finance_data_${new Date().toISOString().slice(0,10)}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function importCsvData(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const text = event.target.result;
        const rows = parseCsv(text).filter(r => r.length > 0);
        if (rows.length < 2) {
            alert('Не удалось импортировать: нет данных.');
            return;
        }

        const [header, ...dataRows] = rows;
        const idx = {};
        header.forEach((h, i) => idx[h] = i);

        const accounts = [];
        const operations = [];

        dataRows.forEach(cols => {
            const recType = (cols[idx.recordType] || '').trim().toLowerCase();
            if (recType === 'account') {
                accounts.push({
                    id: cols[idx.id] || generateId(),
                    name: cols[idx.name] || 'Без имени',
                    currency: cols[idx.currency] || 'USD',
                    balance: parseFloat(cols[idx.balance]) || 0,
                    debitBalance: parseFloat(cols[idx.debitBalance]) || 0
                });
            } else if (recType === 'operation') {
                operations.push({
                    id: cols[idx.id] || generateId(),
                    summ: parseFloat(cols[idx.summ]) || 0,
                    type: cols[idx.type] || 'expense',
                    bill: cols[idx.bill] || '',
                    billTransfer: cols[idx.billTransfer] || '',
                    summTransfer: parseFloat(cols[idx.summTransfer]) || 0,
                    tag: cols[idx.tag] || '',
                    comment: cols[idx.comment] || '',
                    currentDate: Number(cols[idx.currentDate]) || Date.now()
                });
            }
        });

        saveToLocalStorage('accounts', accounts);
        saveToLocalStorage('operations', operations);
        updateAccountSelects();
        renderAccounts();
        renderOperations();

        alert('Импорт завершен.');
    };

    reader.onerror = function() {
        alert('Ошибка чтения файла.');
    };

    reader.readAsText(file);
}

function setupCsvButtons() {
    const exportBtn = document.getElementById('exportDataBtn');
    const importBtn = document.getElementById('importDataBtn');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportCsvData);
    }
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv,text/csv';
            input.addEventListener('change', () => {
                if (input.files.length) {
                    importCsvData(input.files[0]);
                }
            });
            input.click();
        });
    }
}

document.addEventListener('DOMContentLoaded', setupCsvButtons);