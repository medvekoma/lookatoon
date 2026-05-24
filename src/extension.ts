import * as vscode from 'vscode';
import { ToonEditorProvider } from './toonEditorProvider';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(ToonEditorProvider.register());
}

export function deactivate(): void {}
