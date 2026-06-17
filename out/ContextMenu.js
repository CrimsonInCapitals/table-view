"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertToTableCommand = void 0;
const vscode = require("vscode");
const TableTypes_1 = require("./TableTypes");
class ConvertToTableCommand {
    constructor() { }
    register(context) {
        return vscode.commands.registerCommand('CRIMSON.converttable', this.run, this);
    }
    async run() {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const selection = editor.selection;
        const selectionText = editor.document.getText(selection);
        let defined = undefined;
        let before = TableTypes_1.defstrings[0] + ' ' + TableTypes_1.defstrings[1];
        let after = TableTypes_1.defstrings[2];
        if (selectionText.trim() === '') {
            let options = TableTypes_1.types.map(t => t.display);
            const choice = await vscode.window.showErrorMessage('The selected area is empty. Please select a table type to create a new table:', ...options);
            defined = TableTypes_1.types.filter(t => t.display === choice)[0];
            before = defined.newBefore('Placeholder');
            after = defined.newAfter;
        }
        else {
            let beforeSeconsNew = selectionText.split('new')[1];
            let linesBefore = beforeSeconsNew.split('\n');
            let stringBefore = linesBefore[linesBefore.length - 1];
            let inuse = TableTypes_1.types.filter(t => stringBefore.includes(t.forntIdentifier.trim()))[0];
            defined = inuse;
            before = defined.before('Placeholder');
            after = defined.after;
        }
        const newSelectionText = before + "\n" + selectionText + "\n" + after;
        await editor.edit(editBuilder => editBuilder.replace(selection, newSelectionText));
        const openTV = await vscode.window.showInformationMessage("Do you want to switch to Table View Now?", "Yes", "No");
        if (openTV === "Yes") {
            await vscode.commands.executeCommand('vscode.openWith', editor.document.uri, 'CRIMSON.TableView');
        }
    }
}
exports.ConvertToTableCommand = ConvertToTableCommand;
//# sourceMappingURL=ContextMenu.js.map