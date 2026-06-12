import * as vscode from 'vscode';

export class TableViewProvider implements vscode.CustomTextEditorProvider{

    public static register(contect: vscode.ExtensionContect): vscode.Disposable{
        const provider = new TableViewProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(TableViewProvider.viewType,provider);
        return providerRegistration;
    }

    private static readonly viewType ='Crimson.TableView'

	private static readonly scratchCharacters = ['😸', '😹', '😺', '😻', '😼', '😽', '😾', '🙀', '😿', '🐱'];

    public async resolveCustomTextEditor(
        document: vscode.TextDocument, 
        webviewPanel: vscode.WebviewPanel, 
        token: vscode.CancellationToken
    ): Thenable<void> | void {
        webviewPanel.webview.options={enableScripts:true}
        webviewPanel.webview.html=this.getHtmlForWebview(webviewPanel.webview)


        function updateWebview(){

            //run when document updates
            webviewPanel.webview.postMessage({
                type:'update',
                text:document.getText()
            })
        }


        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});
        webviewPanel.webview.onDidDispose(()=>{changeDocumentSubscription.dispose()})

        webviewPanel.webview.onDidReceiveMessage(e=>{
            switch(e.type){
                case'add':
                    return
                case 'delete':
                    return
            }
        })
        updateWebview();
    }
    private getHtmlForWebview(webview:vscode.Webview):string{
        
        const scriptUri=webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri,'meida',))
    }

}