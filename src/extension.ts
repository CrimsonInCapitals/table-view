import * as vscode from 'vscode';

import { TableViewEditorProvider } from './TableView';
import { ConvertToTableCommand } from './ContextMenu';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor providers

	const convertToTable = new ConvertToTableCommand();

	context.subscriptions.push(TableViewEditorProvider.register(context))
	context.subscriptions.push(convertToTable.register(context))

}
