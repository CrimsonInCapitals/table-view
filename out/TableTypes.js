"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.defstrings = void 0;
exports.defstrings = [
    '//Table View Start',
    '// This document was build using Table View, learn more at: https://crimsonincapitals.github.io/',
    '//Table View End'
];
class def {
    get;
    identifies;
    named;
    deconstruct;
    constructor(a, b = undefined) {
        this.get = (vname = 'example') => {
            if (b !== undefined)
                return ' ' + a.trim() + ' ' + vname.trim() + ' ' + b.trim() + ' ';
            else
                return ' ' + a.trim() + ' ';
        };
        this.named = b === undefined ? false : true;
        this.deconstruct = (start = 'export const Name = ') => {
            if (b === undefined)
                return undefined;
            start = start.trim();
            let name = start.startsWith(a.trim()) ? start.slice(a.trim().length).trim() : start;
            if (b !== undefined) {
                name = name.endsWith(b.trim()) ? name.slice(0, name.length - b.trim().length).trim() : name;
            }
            return name;
        };
        this.identifies = a == '' && b !== undefined ? b : a;
    }
}
class TableType {
    before;
    front;
    newBefore;
    newAfter;
    askName;
    namedRows;
    display;
    back;
    after;
    forntIdentifier;
    name;
    deconstructFront;
    constructor(name = '', askName, display, before, after, front, back) {
        this.before = (vname) => exports.defstrings[0].trim() + ' type=' + name + ' ' + exports.defstrings[1].trim() + '\n';
        this.newBefore = (vname) => this.before(vname) + before.get(vname);
        this.front = (vname) => front.get(vname).trim() + ' ';
        this.forntIdentifier = front.identifies;
        this.deconstructFront = (start) => front.deconstruct(start);
        this.namedRows = front.named;
        this.display = display;
        this.back = back + '\n';
        this.after = exports.defstrings[2].trim();
        this.newAfter = after + '\n' + this.after;
        this.askName = askName;
        this.name = name;
    }
}
exports.types = [
    new TableType('ec', false, 'Export Each', new def(''), '', new def('export const', '='), ''),
    new TableType('ob', true, 'Export All: Object', new def('export const', '= {'), '}', new def('	', ':'), ','),
    new TableType('ar', true, 'Export All: Array', new def('export const', '= ['), ']', new def('	'), ',')
];
//# sourceMappingURL=TableTypes.js.map