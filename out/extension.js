"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const TableView_1 = require("./TableView");
function activate(context) {
    // Register our custom editor providers
    context.subscriptions.push(TableView_1.TableViewEditorProvider.register(context));
}
//# sourceMappingURL=extension.js.map