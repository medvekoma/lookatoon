import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { parseToon, ToonDocument, ToonCell } from './toonParser';

export class ToonEditorProvider implements vscode.CustomTextEditorProvider {

  static readonly viewType = 'toon.tableView';

  static register(_context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.window.registerCustomEditorProvider(
      ToonEditorProvider.viewType,
      new ToonEditorProvider(),
      {
        supportsMultipleEditorsPerDocument: false,
      }
    );
  }

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = { enableScripts: false };

    const refresh = () => {
      const nonce = crypto.randomBytes(16).toString('base64');
      webviewPanel.webview.html = buildHtml(parseToon(document.getText()), nonce);
    };

    refresh();

    const sub = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === document.uri.toString()) refresh();
    });

    webviewPanel.onDidDispose(() => sub.dispose());
  }
}

// ---------------------------------------------------------------------------
// HTML generation
// ---------------------------------------------------------------------------

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cellHtml(cell: ToonCell, isFirst: boolean): string {
  if (cell === null) {
    return `<td class="c-null">null</td>`;
  }
  if (isFirst) {
    return `<td class="c-dim">${esc(String(cell))}</td>`;
  }
  if (typeof cell === 'number') {
    return `<td class="c-num">${esc(String(cell))}</td>`;
  }
  if (typeof cell === 'boolean') {
    return `<td class="c-bool">${cell ? 'true' : 'false'}</td>`;
  }
  // String — right-align if it looks like a formatted number (e.g. 3.3M, 77.7K)
  if (/^-?[\d,.]+[KMBkmb%]?$/.test(cell)) {
    return `<td class="c-num">${esc(cell)}</td>`;
  }
  return `<td>${esc(cell)}</td>`;
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

function isNumericCol(colIdx: number, rows: ToonCell[][]): boolean {
  for (const row of rows) {
    const cell = row[colIdx];
    if (cell === null) continue;
    if (typeof cell === 'number') return true;
    if (typeof cell === 'string' && /^-?[\d,.]+[KMBkmb%]?$/.test(cell)) return true;
    return false;
  }
  return false;
}

function renderTable(name: string, columns: string[], rows: ToonCell[][]): string {
  const numericCols = columns.map((_, i) => isNumericCol(i, rows));
  // Col 0 acts as a dim key column only when it contains non-numeric values.
  const isKeyCol = columns.length > 0 && !numericCols[0];
  const headerCells = columns
    .map((c, i) => `<th${numericCols[i] ? ' class="c-num"' : ''}>${esc(c)}</th>`)
    .join('');
  const dataRows = rows
    .map(row => {
      const cells = row.map((cell, idx) => cellHtml(cell, idx === 0 && isKeyCol)).join('');
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

function buildHtml(doc: ToonDocument, nonce: string): string {
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
  --dim:       var(--vscode-editor-foreground);
  --null:      var(--vscode-disabledForeground);
  --num:       var(--vscode-debugTokenExpression-number);
  --bool:      var(--vscode-debugTokenExpression-boolean);
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
.c-dim  { color: var(--dim); font-weight: 500; }
.c-num  { text-align: right; color: var(--num); font-variant-numeric: tabular-nums; }
.c-bool { color: var(--bool); }
.c-null { color: var(--null); text-align: right; font-style: italic; }
.props td { padding: 3px 12px; border-bottom: 1px solid var(--border); }
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
