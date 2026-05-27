import type { ToonDocument, ToonCell } from './toonParser';

export function buildHtml(doc: ToonDocument, nonce: string): string {
  let body: string;
  if (doc.error) {
    body = `<div class="parse-error">${esc(doc.error)}</div>`;
  } else if (doc.sections.length === 0) {
    body = `<div class="parse-error">No content to display.</div>`;
  } else {
    body = doc.sections
      .map(s =>
        s.kind === 'properties'
          ? renderProperties(s.name, s.entries)
          : renderTable(s.name, s.columns, s.rows)
      )
      .join('\n');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}';">
<style nonce="${nonce}">
:root {
  --bg:        var(--vscode-editor-background);
  --surface:   var(--vscode-editorWidget-background);
  --border:    var(--vscode-panel-border, var(--vscode-editorWidget-border));
  --text:      var(--vscode-editor-foreground);
  --muted:     var(--vscode-descriptionForeground);
  --heading:   var(--vscode-textLink-foreground);
  --col-head:  var(--vscode-editorInfo-foreground);
  --null:      var(--vscode-disabledForeground);
  --hover:     var(--vscode-list-hoverBackground);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: ui-monospace, 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  padding: 20px 24px;
}
section {
  margin-bottom: 28px;
}
h2 {
  font-size: 11px;
  font-weight: 700;
  color: var(--heading);
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
}
.tbl-wrap {
  overflow-x: auto;
}
table {
  border-collapse: collapse;
  width: max-content;
}
thead th {
  background: var(--surface);
  color: var(--col-head);
  font-size: 11px;
  font-weight: 600;
  padding: 5px 12px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 2px solid var(--border);
  position: sticky;
  top: 0;
}
td {
  padding: 3px 12px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
tr:hover td { background: var(--hover); }
.c-num  { text-align: right; font-variant-numeric: tabular-nums; }
.c-null { color: var(--null); font-style: italic; }
.props .pk { color: var(--muted); width: 160px; }
.parse-error {
  color: var(--text);
  background: var(--surface);
  border-left: 4px solid var(--vscode-errorForeground, #f44);
  border-radius: 4px;
  padding: 12px 16px;
  font-family: inherit;
}
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type ColType = 'num' | 'bool' | 'str';
const NUM_RE = /^-?[\d,.]+[KMBkmb%]?$/;
const MAX_TYPE_SAMPLE = 1000;

function detectColType(colIdx: number, rows: ToonCell[][]): ColType {
  let type: ColType | undefined;
  const limit = Math.min(rows.length, MAX_TYPE_SAMPLE);
  for (let i = 0; i < limit; i++) {
    const cell = rows[i][colIdx];
    if (cell === null) continue;
    const cellType: ColType =
      typeof cell === 'number' || (typeof cell === 'string' && NUM_RE.test(cell))
        ? 'num'
        : typeof cell === 'boolean'
        ? 'bool'
        : 'str';
    if (type === undefined) {
      type = cellType;
    } else if (type !== cellType) {
      return 'str';
    }
  }
  return type ?? 'str';
}

function cellHtml(cell: ToonCell, colType: ColType): string {
  if (cell === null) {
    return colType === 'num'
      ? `<td class="c-null c-num">null</td>`
      : `<td class="c-null">null</td>`;
  }
  if (typeof cell === 'boolean') {
    return `<td>${cell ? 'true' : 'false'}</td>`;
  }
  const text = esc(String(cell));
  return colType === 'num'
    ? `<td class="c-num">${text}</td>`
    : `<td>${text}</td>`;
}

function renderProperties(name: string, entries: [string, string][]): string {
  const rows = entries
    .map(([k, v]) => `<tr><td class="pk">${esc(k)}</td><td>${esc(v)}</td></tr>`)
    .join('');
  return `
<section>
  <h2>${esc(name)}</h2>
  <table class="props"><tbody>${rows}</tbody></table>
</section>`;
}

function renderTable(name: string, columns: string[], rows: ToonCell[][]): string {
  const colTypes = columns.map((_, i) => detectColType(i, rows));
  const headerCells = columns
    .map((c, i) => {
      const cls = colTypes[i] === 'num' ? ' class="c-num"' : '';
      return `<th${cls}>${esc(c)}</th>`;
    })
    .join('');
  const dataRows = rows
    .map(row => {
      const cells = row.map((cell, i) => cellHtml(cell, colTypes[i])).join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');
  return `
<section>
  <h2>${esc(name)}</h2>
  <div class="tbl-wrap">
    <table>
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${dataRows}</tbody>
    </table>
  </div>
</section>`;
}
