import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { parseToon } from './toonParser';
import { buildHtml } from './htmlBuilder';

export class ToonEditorProvider implements vscode.CustomTextEditorProvider {

  static readonly viewType = 'toon.tableView';

  static register(): vscode.Disposable {
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
