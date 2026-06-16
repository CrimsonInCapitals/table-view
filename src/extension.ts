import * as vscode from 'vscode';
import * as fs from 'fs'

import { CatScratchEditorProvider } from './catScratchEditor';
import { PawDrawEditorProvider } from './pawDrawEditor';
import { TableViewEditorProvider } from './TableView';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor providers
	context.subscriptions.push(TableViewEditorProvider.register(context))
	

}
