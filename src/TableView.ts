import * as vscode from 'vscode';
import { getNonce } from './util';
import { types } from './TableTypes';

export class TableViewEditorProvider implements vscode.CustomTextEditorProvider {



		
	public static register(context: vscode.ExtensionContext): vscode.Disposable {
        return vscode.window.registerCustomEditorProvider(
            'CRIMSON.TableView',
            new TableViewEditorProvider(context),
            {
                webviewOptions: { retainContextWhenHidden: true },
                supportsMultipleEditorsPerDocument: false
            }
        );
    }

	private static readonly viewType = 'CRIMSON.TableView';

	constructor(private readonly context: vscode.ExtensionContext) {}
	
	
	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {

		const text = document.getText();
		const trigger = "//Table View Start";

		if (!text.includes(trigger)) {
			await vscode.commands.executeCommand(
				'vscode.openWith',
				document.uri,
				'default'
			);
			return;
		}
		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.getText(),
				tableTypes: types
			});
		}

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(async (e) => {
			switch (e.type) {
				case 'message':					
					switch(e.messagetype){
						case'error':
							vscode.window.showErrorMessage(e.text)
							break;
						default:
							vscode.window.showInformationMessage(e.text)
							break
					}
					break
					// this.addNewScratch(document);
					
				case 'RowUpdate':
					const edit = new vscode.WorkspaceEdit();
					let line = document.lineAt(e.line)
					edit.replace(
						document.uri,
						new vscode.Range(line.range.start,line.range.end),
						e.newLine.replace(/(\r?\n){1,}/g, "")
					)
					vscode.workspace.applyEdit(edit)
					vscode.window.showInformationMessage('Row updated')
					return;
					
				case 'RowAdd':
					const editAdd = new vscode.WorkspaceEdit();
					let lineadd = document.lineAt(e.after)
					editAdd.insert(
						document.uri,
						new vscode.Position(lineadd.range.end.line+1,0),
						e.content.replace(/(\r?\n){2,}/g, "\n")
					)
					vscode.workspace.applyEdit(editAdd)
					vscode.window.showInformationMessage('Row updated')					
					return;
				
				case 'RowDelete':
					let confirm = await vscode.window.showWarningMessage('Are you sure you want to delete this row?','Delete','No')
					if(confirm !== 'Delete') return;
					const editDelete = new vscode.WorkspaceEdit();
					let lineDelete = document.lineAt(e.line)
					editDelete.delete(
						document.uri,
						new vscode.Range(lineDelete.range.start,lineDelete.rangeIncludingLineBreak.end)
					)
					vscode.workspace.applyEdit(editDelete)
					vscode.window.showInformationMessage('Row deleted')					
					return;
			}
			
		});
		updateWebview();
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	
	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'jsTableView.js'));

		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'reset.css'));

		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'vscode.css'));

		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'TableView.css'));
		
		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet" />
				<link href="${styleVSCodeUri}" rel="stylesheet" />
				<link href="${styleMainUri}" rel="stylesheet" />

				<title>Table View</title>
			</head>
			<body id='root'>
				Loading is taking longer than expected, please wait...
				<script nonce="${nonce}" src="${scriptUri}"/>
			</body>
			</html>`;
	}

	/**
	 * Try to get a current document as json text.
	 */
	private getDocumentAsJson(document: vscode.TextDocument): any {
		const text = document.getText();
		if (text.trim().length === 0) {
			return {};
		}

		try {
			return JSON.parse(text);
		} catch {
			throw new Error('Could not get document as json. Content is not valid json');
		}
	}

	/**
	 * Write out the json to a given document.
	 */
	private updateTextDocument(document: vscode.TextDocument, json: any) {
		const edit = new vscode.WorkspaceEdit();

		// Just replace the entire document every time for this example extension.
		// A more complete extension should compute minimal edits instead.
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			JSON.stringify(json, null, 2));

		return vscode.workspace.applyEdit(edit);
	}
}
