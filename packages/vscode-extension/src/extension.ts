// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

import * as vscode from 'vscode';
import { CalmPreviewPanel, isCalmFile } from './preview.js';

/**
 * Called when the extension is activated (when a .calm.json file is opened).
 */
export function activate(context: vscode.ExtensionContext): void {
  // 1. Register the "Open CALM Diagram Preview" command
  context.subscriptions.push(
    vscode.commands.registerCommand('calmstudio.openPreview', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        CalmPreviewPanel.createOrShow(context, editor.document.uri);
      }
    })
  );

  // 2. Register the "Open in CalmStudio" command (desktop app or web fallback)
  context.subscriptions.push(
    vscode.commands.registerCommand('calmstudio.openInApp', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const fileUri = vscode.Uri.parse(
          `calmstudio://open?file=${encodeURIComponent(editor.document.uri.fsPath)}`
        );
        void vscode.env.openExternal(fileUri);
      }
    })
  );

  // 3. Register save listener — re-render preview when a .calm.json file is saved
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (isCalmFile(doc.fileName)) {
        CalmPreviewPanel.updateIfVisible(doc.uri);
      }
    })
  );

  // 4. Register active editor change listener — auto-open preview for CALM files
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && isCalmFile(editor.document.uri.fsPath)) {
        CalmPreviewPanel.createOrShow(context, editor.document.uri);
      }
    })
  );
}

/**
 * Called when the extension is deactivated.
 * VS Code handles cleanup via context.subscriptions automatically.
 */
export function deactivate(): void {
  // No-op — VS Code disposes subscriptions automatically
}
