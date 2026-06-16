import * as vscode from 'vscode';

import { TableViewEditorProvider } from './TableView';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor providers
	context.subscriptions.push(TableViewEditorProvider.register(context))
	context.subscriptions.push((
		vscode.commands.registerCommand('CRIMSON.maketable', async()=>{
			const editor = vscode.window.activeTextEditor
			if(!editor)return
			const selection = editor.selection
			const selectionText = editor.document.getText(selection)
			const before="//Table View Start // This document was build using Table View, learn more at: https://crimsonincapitals.github.io/"
			const after="//Table View End"
			let newSelectionText = before+"\n"+selectionText+"\n"+after
		
			await editor.edit(editBuilder=>editBuilder.replace(selection,newSelectionText))
		
			const openTV = await vscode.window.showInformationMessage("Do you want to switch to Table View Now?","Yes","No")
			if (openTV === "Yes"){
				await vscode.commands.executeCommand(
					'vscode.openWith',
					editor.document.uri,
					'CRIMSON.TableView'
				)
			}
		
		})
	))

}
