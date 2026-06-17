"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const TableView_1 = require("./TableView");
const ContextMenu_1 = require("./ContextMenu");
function activate(context) {
    // Register our custom editor providers
    const convertToTable = new ContextMenu_1.ConvertToTableCommand();
    context.subscriptions.push(TableView_1.TableViewEditorProvider.register(context));
    context.subscriptions.push(convertToTable.register(context));
}
//# sourceMappingURL=extension.js.map