import * as vscode from 'vscode';

import { TableViewEditorProvider } from './TableView';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor providers
	context.subscriptions.push(TableViewEditorProvider.register(context))
	

}
