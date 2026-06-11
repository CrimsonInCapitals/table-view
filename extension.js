// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "table-view" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const DefineTable = (Starts,startID,endID)=>{
			const Tables =[]
			for(let section = 1;section<Starts.length;section++){
				Tables.push(Starts[section].split(endID)[0])
			}
			return(Tables)
        }
	}

	const Idenitfy =(document)=>{
		const editor = vscode.window.activeTextEditor;
        if (!editor && document==undefined) {
            vscode.window.showInformationMessage('No active editor found.');
            return;
        }
		document = document==undefined?editor.document:document
        const text = document.getText();
        const startID = '//Table View Start';
		const endID = '//Table View End'
		const Starts = text.split(startID)
		const Ends = text.split(endID)
		console.log(Starts)
        if (Starts.length >=2) {
			if(Starts.length > Ends.length){vscode.window.showErrorMessage("A table isn't terminated correctly");return;}
			if(Starts.length < Ends.length){vscode.window.showErrorMessage("a table isn't opened correctly");return;}
            vscode.window.showInformationMessage("Found Table in "+ document.fileName.split("\\").pop());

	}
	const openFileListener = vscode.workspace.onDidOpenTextDocument((document)=>{
		Idenitfy(document)
	})

	const create = vscode.commands.registerCommand('tableview.create',function(){
		vscode.window.showInformationMessage('Table View Started')
		Idenitfy()
	})
	context.subscriptions.push(create)
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
