'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import LineCounter from './LineCounter';
import Gitignore from './Gitignore';
import * as JSONC from 'jsonc-parser';

const EXTENSION_NAME = 'VSCodeCounter';
const CONFIGURATION_SECTION = 'vscode-counter';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log(`Congratulations, your extension "${EXTENSION_NAME}" is now active!`);
    console.log(context.extensionPath);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const codeCountController = new CodeCounterController();
    context.subscriptions.push(
        codeCountController,
        vscode.commands.registerCommand('extension.vscode-counter.countInDirectory', (targetDir: vscode.Uri|undefined) => codeCountController.countInDirectory(targetDir)),
        vscode.commands.registerCommand('extension.vscode-counter.countInFile', () => codeCountController.toggleShowCounter())
    );
}
// this method is called when your extension is deactivated
export function deactivate() {
}


class CodeCounterController {
    private codeCounter: CodeCounter;
    private disposable: vscode.Disposable;
    constructor() {
        this.codeCounter = new CodeCounter();
        // subscribe to selection change and editor activation events
        let subscriptions: vscode.Disposable[] = [];
        vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor, this, subscriptions);
        vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration, this, subscriptions);
        vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this.disposable = vscode.Disposable.from(...subscriptions);
        this.codeCounter.countCurrentFile();
    }
    dispose() {
        this.disposable.dispose();
        this.codeCounter.dispose();
    }
    public countInDirectory(targetDir: vscode.Uri|undefined) {
        const dir = vscode.workspace.rootPath;
        if (targetDir !== undefined) {
            this.codeCounter.countLinesInDirectory(targetDir.fsPath);
        } else if (typeof dir === 'string') {
            this.codeCounter.countLinesInDirectory(dir);
        } else {
            vscode.window.showInformationMessage('No open workspace!');
        }
    }
    public toggleShowCounter() {
        this.codeCounter.toggleShowCounter();
        this.codeCounter.countCurrentFile();
    }
    private onDidChangeActiveTextEditor() {
        console.log('onDidChangeActiveTextEditor()');
        this.codeCounter.countCurrentFile();
    }
    private onDidChangeTextDocument() {
        console.log('onDidChangeTextDocument()');
        this.codeCounter.countCurrentFile();
    }
    private onDidChangeConfiguration() {
        console.log('onDidChangeConfiguration()');
        this.codeCounter = new CodeCounter();
        this.codeCounter.countCurrentFile();
    }
}

class CodeCounter {
    private statusBarItem: vscode.StatusBarItem =  vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    private configuration: vscode.WorkspaceConfiguration;
    private lineCounterTable: LineCounterTable;
    private showInStatusBar = false;

    constructor() {
        this.configuration = vscode.workspace.getConfiguration(CONFIGURATION_SECTION);
        this.lineCounterTable = new LineCounterTable(this.configuration);
        // this.showInStatusBar = this.getConf('showInStatusBar', true);
    }
    private getConf<T>(section: string, defaultValue: T): T {
        return this.configuration.get(section, defaultValue);
    }
    public toggleShowCounter() {
        this.showInStatusBar = !this.showInStatusBar;
        // this.configuration.update('showInStatusBar', this.showInStatusBar);
    }
    public countLinesInDirectory(dir: string) {
        console.log(`countLinesInDirectory : ${dir}`);
        const confFiles = vscode.workspace.getConfiguration("files");
        const outputDir = path.resolve(vscode.workspace.rootPath || `.${path.sep}`, this.getConf('outputDirectory', ''));
        const ignoreUnsupportedFile = this.getConf('ignoreUnsupportedFile', true);
        const includes = this.getConf<Array<string>>('include', ['**/*']);
        const excludes = this.getConf<Array<string>>('exclude', []);

        excludes.push(outputDir);
        if (this.getConf('useFilesExclude', true)) {
            excludes.push(...Object.keys(confFiles.get<object>('exclude', {})));
        }
        excludes.push('.gitignore');
        const encoding = confFiles.get('encoding', 'utf8');
        const endOfLine = confFiles.get('eol', '\n');
        console.log(`encoding : ${encoding}`);
        console.log(`includes : ${includes.join(',')}`);
        console.log(`excludes : ${excludes.join(',')}`);
        this.statusBarItem.text = `${EXTENSION_NAME}: Counting...`;
        this.statusBarItem.show();

        vscode.workspace.findFiles(`{${includes.join(',')}}`, `{${excludes.join(',')}}`).then((files: vscode.Uri[]) => {
            new Promise((resolve: (p: string[])=> void, reject: (p: string[]) => void) => {
                const filePathes = files.map(uri => uri.fsPath).filter(p => !path.relative(dir, p).startsWith('..'));
                console.log(`target : ${filePathes.length} files`);
                // filePathes.forEach(p=> console.log(p));
                if (this.getConf('useGitignore', true)) {
                    vscode.workspace.findFiles('**/.gitignore', '').then((gitignoreFiles: vscode.Uri[]) => {
                        gitignoreFiles.forEach(f => console.log(`use gitignore : ${f.fsPath}`));
                        const gitignores = new Gitignore('').merge(...gitignoreFiles.map(uri => uri.fsPath).sort().map(p => new Gitignore(fs.readFileSync(p, 'utf8'), path.dirname(p))));
                        // console.log(`=========================================\ngitignore rules\n${gitignores.debugString}`);
                        resolve(filePathes.filter(p => gitignores.excludes(p)));
                    });
                } else {
                    resolve(filePathes);
                }
            }).then((filePathes: string[]) => {
                console.log(`target : ${filePathes.length} files`);
                // filePathes.forEach(p=> console.log(p));
                return new Promise((resolve: (value: ResultTable)=> void, reject: (value: ResultTable) => void) => {
                    const results = new ResultTable();
                    let fileCount = 0;
                    filePathes.forEach(filepath => {
                        const relativePath = path.relative(dir, filepath);
                        const lineCounter = this.lineCounterTable.getByPath(filepath);
                        if (lineCounter !== undefined) {
                            fs.readFile(filepath, encoding, (err, data) => {
                                // console.log(filepath);
                                ++fileCount;
                                if (err) {
                                    results.appendError(relativePath, lineCounter.name, err);
                                } else {
                                    results.appendResult(relativePath, lineCounter.name, lineCounter.count(data));
                                }
                                if (fileCount === filePathes.length) {
                                    resolve(results);
                                }
                            });
                        } else {
                            if (!ignoreUnsupportedFile) {
                                results.fileResults.push(new Result(relativePath, '(Unsupported)'));
                            }
                            ++fileCount;
                            if (fileCount === filePathes.length) {
                                resolve(results);
                            }
                        }
                    });
                });
            }).then((results: ResultTable) => {
                console.log(`count ${results.fileResults.length} files`);
                this.statusBarItem.hide();
                console.log(`OutputDir : ${outputDir}`);
                makeDirectories(outputDir);
                if (this.getConf('outputAsText', true)) {
                    writeTextFile(path.join(outputDir, 'results.txt'), results.toTextLines().join(endOfLine))
                    .then(ofilename => showTextFile(ofilename))
                    .then(editor => console.log(`output file : ${editor.document.fileName}`))
                    .catch(err => console.error(err));
                }
                if (this.getConf('outputAsCSV', true)) {
                    writeTextFile(path.join(outputDir, 'results.csv'), results.toCSVLines().join(endOfLine))
                    .then(ofilename => console.log(`output file : ${ofilename}`))
                    .catch(err => console.error(err));
                }
                if (this.getConf('outputAsMarkdown', true)) {
                    writeTextFile(path.join(outputDir, 'results.md'), results.toMarkdownLines().join(endOfLine));
                    // , err => {
                        // if (err) {
                        //     console.log(err);
                        // } else {
                        //     let uri = vscode.Uri.parse('file:///' + path.join(outputDir, 'results.md'));
                        //     vscode.commands.executeCommand("markdown.showPreview", uri);
                        // }
                    // });
                }
            });
        });
    }
    public countCurrentFile() {
        if (!this.showInStatusBar) {
            this.statusBarItem.hide();
            return;
        }
        // Get the current text editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.statusBarItem.hide();
            return;
        }
        const doc = editor.document;
        const lineCounter = this.lineCounterTable.getByName(doc.languageId) || this.lineCounterTable.getByPath(doc.uri.fsPath);
        console.log(`${path.basename(doc.uri.fsPath)}: ${JSON.stringify(lineCounter)})`);
        if (lineCounter !== undefined) {
            const result = lineCounter.count(doc.getText());
            this.statusBarItem.text = `Code:${result.code} Comment:${result.comment} Blank:${result.blank} Total:${result.code+result.comment+result.blank}`;
            this.statusBarItem.show();
        } else {
            this.statusBarItem.text = `${EXTENSION_NAME}:Unsupported`;
            this.statusBarItem.show();
        }
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}


class Result {
    public filename: string;
    public language: string;
    public errorMessage: string;
    public code = 0;
    public comment = 0;
    public blank = 0;
    get total(): number {
        return this.code + this.comment + this.blank;
    }
    constructor(filename: string, language: string, errorMessage = '') {
        this.filename = filename;
        this.language = language;
        this.errorMessage = errorMessage;
    }
    public append(value: {code:number, comment:number, blank:number}) {
        this.code += value.code;
        this.comment += value.comment;
        this.blank += value.blank;
        return this;
    }
}
class Statistics {
    public name: string;
    public files = 0;
    public code = 0;
    public comment = 0;
    public blank = 0;
    get total(): number {
        return this.code + this.comment + this.blank;
    }
    constructor(name: string) {
        this.name = name;
    }
    public append(value: {code:number, comment:number, blank:number}) {
        this.files++;
        this.code += value.code;
        this.comment += value.comment;
        this.blank += value.blank;
        return this;
    }
}
class ResultTable {
    public fileResults: Result[] = [];
    public dirResultTable = new Map<string, Statistics>();
    public langResultTable = new Map<string, Statistics>();
    public total = new Result('Total', '');

    public appendResult(relativePath: string, language: string, value: {code:number, comment:number, blank:number}) {
        this.fileResults.push(new Result(relativePath, language).append(value));
        let parent = path.dirname(relativePath);
        while (parent.length > 0) {
            getOrSetFirst(this.dirResultTable, parent, () => new Statistics(parent)).append(value);
            const p = path.dirname(parent);
            if (p === parent) {
                break;
            }
            parent = p;
        }
        getOrSetFirst(this.langResultTable, language, () => new Statistics(language)).append(value);
        this.total.append(value);
    }
    public appendError(relativePath: string, language: string, err:NodeJS.ErrnoException) {
        this.fileResults.push(new Result(relativePath, language, 'Error:' + err.message));
    }
    public toCSVLines() {
        return [
            'file path, language, code, comment, blank, total',
            ...this.fileResults.sort((a,b) => a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0)
                .map(v => `${v.filename}, ${v.language}, ${v.code}, ${v.comment}, ${v.blank}, ${v.total}`),
        ];
    }
    public toTextLines() {
        class Formatter {
            private columnInfo: {title:string, width:number}[];
            constructor(...columnInfo: {title:string, width:number}[]) {
                this.columnInfo = columnInfo;
            }
            private get lineSeparator() {
                return '+-' + this.columnInfo.map(i => '-'.repeat(i.width)).join('-+-') + '-+';
            }
            get headerLines() {
                return [this.lineSeparator, '| ' + this.columnInfo.map(i => i.title.padEnd(i.width)).join(' | ') + ' |', this.lineSeparator];
            }
            get footerLines() {
                return [this.lineSeparator];
            }
            public line(...data: (string|number|boolean)[]) {
                return '| ' + data.map((d, i) => {
                    if (typeof d === 'string') {
                        return d.padEnd(this.columnInfo[i].width);
                    } else {
                        return d.toString().padStart(this.columnInfo[i].width);
                    }
                }).join(' | ') + ' |';
            }
        }
        const maxNamelen = Math.max(...this.fileResults.map(res => res.filename.length));
        const maxLanglen = Math.max(...[...this.langResultTable.keys()].map(l => l.length));
        const resultFormat = new Formatter({title:'file path', width:maxNamelen}, {title:'language', width:maxLanglen}, 
            {title:'code', width:10}, {title:'comment', width:10}, {title:'blank', width:10}, {title:'total', width:10});
        const dirFormat = new Formatter({title:'path', width:maxNamelen}, {title:'files', width:10}, 
            {title:'code', width:10}, {title:'comment', width:10}, {title:'blank', width:10}, {title:'total', width:10});
        const langFormat = new Formatter({title:'language', width:maxLanglen}, {title:'files', width:10}, 
            {title:'code', width:10}, {title:'comment', width:10}, {title:'blank', width:10}, {title:'total', width:10});
        return [
            'Files',
            ...resultFormat.headerLines, 
            ...this.fileResults.sort((a,b) => a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0)
                .map(v => resultFormat.line(v.filename, v.language, v.code, v.comment, v.blank, v.total)),
            resultFormat.line(this.total.filename, this.total.language, this.total.code, this.total.comment, this.total.blank, this.total.total),
            ...resultFormat.footerLines, 
            '',
            'Directories',
            ...dirFormat.headerLines, 
            ...[...this.dirResultTable.values()].sort((a,b) => b.code - a.code)
                .map(v => dirFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            ...dirFormat.footerLines, 
            '',
            'Languages',
            ...langFormat.headerLines, 
            ...[...this.langResultTable.values()].sort((a,b) => b.code - a.code)
                .map(v => langFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            ...langFormat.footerLines, 
        ];
    }
    public toMarkdownLines() {
        class MarkdownFormatter {
            private columnInfo: {title:string, format:string}[];
            constructor(...columnInfo: {title:string, format:string}[]) {
                this.columnInfo = columnInfo;
            }
            get lineSeparator() {
                return '| ' + this.columnInfo.map(i => (i.format === 'number') ? '---:' : ':---').join(' | ') + ' |';
            }
            get headerLines() {
                return ['| ' + this.columnInfo.map(i => i.title).join(' | ') + ' |', this.lineSeparator];
            }
            public line(...data: (string|number|boolean)[]) {
                return '| ' + data.map((d, i) => (typeof d !== 'string') ? d.toString() : (this.columnInfo[i].format === 'uri') ? `[${d}](${d})` : d).join(' | ') + ' |';
            }
        }
        const resultFormat = new MarkdownFormatter({title:'file path', format:'uri'}, {title:'language', format:'string'}, 
            {title:'code', format:'number'}, {title:'comment', format:'number'}, {title:'blank', format:'number'}, {title:'total', format:'number'});
        const dirFormat = new MarkdownFormatter({title:'path', format:'string'}, {title:'files', format:'number'}, 
            {title:'code', format:'number'}, {title:'comment', format:'number'}, {title:'blank', format:'number'}, {title:'total', format:'number'});
        const langFormat = new MarkdownFormatter({title:'language', format:'string'}, {title:'files', format:'number'}, 
            {title:'code', format:'number'}, {title:'comment', format:'number'}, {title:'blank', format:'number'}, {title:'total', format:'number'});
    
        return [
            '## Files',
            ...resultFormat.headerLines, 
            ...this.fileResults.sort((a,b) => a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0)
                .map(v => resultFormat.line(v.filename, v.language, v.code, v.comment, v.blank, v.total)),
            resultFormat.line(this.total.filename, this.total.language, this.total.code, this.total.comment, this.total.blank, this.total.total),
            '',
            '## Directories',
            ...dirFormat.headerLines, 
            // ...[...dirResultTable.values()].sort((a,b) => b.code - a.code)
            ...[...this.dirResultTable.values()].sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
                .map(v => dirFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            '',
            '## Languages',
            ...langFormat.headerLines, 
            ...[...this.langResultTable.values()].sort((a,b) => b.code - a.code)
                .map(v => langFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
        ];
    }
}
class LineCounterTable {
    private langIdTable: Map<string, LineCounter>;
    private aliasTable: Map<string, LineCounter>;
    private fileextRules: Map<string, LineCounter>;
    private filenameRules: Map<string, LineCounter>;

    constructor(conf: vscode.WorkspaceConfiguration) {
        this.langIdTable = new Map<string, LineCounter>();
        this.aliasTable = new Map<string, LineCounter>();
        this.fileextRules = new Map<string, LineCounter>();
        this.filenameRules = new Map<string, LineCounter>();
        const confJsonTable = new Map<string, object>();

        vscode.extensions.all.forEach(ex => {
            // console.log(JSON.stringify(ex.packageJSON));
            const contributes = ex.packageJSON.contributes;
            if (contributes !== undefined) {
                const languages = contributes.languages;
                if (languages !== undefined) {
                    languages.forEach((lang:any) => {
                        const lineCounter = getOrSetFirst(this.langIdTable, lang.id, () => new LineCounter(lang.id));
                        lineCounter.addAlias(lang.aliases);
                        if (lang.aliases !== undefined && lang.aliases.length > 0) {
                            lang.aliases.forEach((alias:string) => {
                                this.aliasTable.set(alias, lineCounter);
                            });
                        }
                        const confpath = lang.configuration ? path.join(ex.extensionPath, lang.configuration) : "";
                        if (confpath.length > 0) {
                            console.log(`language conf file: ${confpath}`);
                            const v = getOrSetFirst(confJsonTable, confpath, () => JSONC.parse(fs.readFileSync(confpath, "utf8")));
                            lineCounter.addCommentRule(v.comments);
                        }
                        if (lang.extensions !== undefined) {
                            (lang.extensions as Array<string>).forEach(ex => this.fileextRules.set(ex, lineCounter));
                        }
                        if (lang.filenames !== undefined) {
                            (lang.filenames as Array<string>).forEach(ex => this.filenameRules.set(ex, lineCounter));
                        }
                    });
                }
            }
        });
        class BlockPattern {
            public types: string[] = [];
            public patterns: string[][] = [];
        }
        conf.get< Array<BlockPattern> >('blockComment', []).forEach(patterns => {
            console.log(JSON.stringify(patterns));
            patterns.types.forEach(t => {
                this.addBlockStringRule(t, ...patterns.patterns.map(pat => { return {begin: pat[0], end: pat[1]}; }));
            });
        });

        // console.log(`confJsonTable : ${confJsonTable.size}  =======================================================================`);
        // confJsonTable.forEach((v, n) => { console.log(`${n}:\n ${JSON.stringify(v)}`); });
        // console.log(`this.filenameRules : ${this.filenameRules.size}  =======================================================================`);
        // this.filenameRules.forEach((v, n) => { console.log(`${n}\t ${JSON.stringify(v)}`); });
        // console.log(`this.fileextRules : ${this.fileextRules.size}  =======================================================================`);
        // this.fileextRules.forEach((v, n) => { console.log(`${n}\t ${JSON.stringify(v)}`); });
        // console.log(`this.langIdTable : ${this.langIdTable.size}  =======================================================================`);
        // this.langIdTable.forEach((v, n) => { console.log(`${n}\t ${JSON.stringify(v)}`); });
        // console.log(`this.aliasTable : ${this.aliasTable.size}  =======================================================================`);
        // this.aliasTable.forEach((v, n) => { console.log(`${n}\t ${JSON.stringify(v)}`); });
    }
    public getByName(langName: string) {
        return this.langIdTable.get(langName) || this.aliasTable.get(langName);
    }
    public getByPath(filePath: string) {
        return this.fileextRules.get(filePath) || this.fileextRules.get(path.extname(filePath)) || this.filenameRules.get(path.basename(filePath));
    }
    public addBlockStringRule(id: string, ...tokenPairs: {begin:string,end:string}[]) {
        const lineCounter = this.getByName(id) || this.getByPath(id);
        if (lineCounter) {
            console.log(`${id} : ${tokenPairs.map(t => t.begin + t.end).join('|')} to LineCounter: ${lineCounter.name}`);
            lineCounter.addBlockStringRule(...tokenPairs);
        } 
    }
}



function getOrSetFirst<K,V>(map: Map<K,V>, key: K, otherwise: () => V) {
    let v = map.get(key);
    if (v === undefined) {
        v = otherwise();
        map.set(key, v);
    }
    return v;
}
function makeDirectories(dirpath: string) {
    if (fs.existsSync(dirpath)) {
        return true;
    }
    const parent = path.dirname(dirpath);
    if ((parent !== dirpath) && makeDirectories(parent)) {
        fs.mkdirSync(dirpath);
        return true;
    } else {
        return false;
    }
}
function showTextFile(outputFilename: string) {
    console.log(`showTextFile : ${outputFilename}`);
    return new Promise((resolve: (editor: vscode.TextEditor)=> void, reject: (err: any) => void) => {
        vscode.workspace.openTextDocument(outputFilename)
        .then((doc) => {
            return vscode.window.showTextDocument(doc, vscode.ViewColumn.One, true);
        }, err => {
            reject(err);
        }).then((editor) => {
            resolve(editor);
        }, err => {
            reject(err);
        });
    });
}
function writeTextFile(outputFilename: string, text: string) {
    console.log(`writeTextFile : ${outputFilename} ${text.length}B`);
    return new Promise((resolve: (filename: string)=> void, reject: (err: NodeJS.ErrnoException) => void) => {
        fs.writeFile(outputFilename, text, err => {
            if (err) {
                reject(err);
            } else {
                resolve(outputFilename);
            }
        });
    });
}
