'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'graceful-fs';
import LineCounter from './LineCounter';
import Gitignore from './Gitignore';
import * as JSONC from 'jsonc-parser';
import * as minimatch from 'minimatch';
import { TextDecoder } from 'util';

const EXTENSION_ID = 'uctakeoff.vscode-counter';
const EXTENSION_NAME = 'VSCodeCounter';
const CONFIGURATION_SECTION = 'VSCodeCounter';
const toZeroPadString = (num: number, fig: number) => num.toString().padStart(fig, '0');
const dateToString = (date: Date) => `${date.getFullYear()}-${toZeroPadString(date.getMonth()+1, 2)}-${toZeroPadString(date.getDate(), 2)}`
                + ` ${toZeroPadString(date.getHours(), 2)}:${toZeroPadString(date.getMinutes(), 2)}:${toZeroPadString(date.getSeconds(), 2)}`;
const toStringWithCommas = (obj: any) => {
    if (typeof obj === 'number') {
        return new Intl.NumberFormat('en-US').format(obj);
    } else {
        return obj.toString();
    }
};
const log = (message: string) => console.log(`[${EXTENSION_NAME}] ${new Date().toISOString()} ${message}`);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let version = "-";
    const ext = vscode.extensions.getExtension(EXTENSION_ID);
    if (ext !== undefined && (typeof ext.packageJSON.version === 'string')) {
        version = ext.packageJSON.version;
    }
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    log(`${EXTENSION_ID} ver.${version} now active! : ${context.extensionPath}`);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const codeCountController = new CodeCounterController();
    context.subscriptions.push(
        codeCountController,
        vscode.commands.registerCommand('extension.vscode-counter.countInWorkspace', () => codeCountController.countInWorkspace()),
        vscode.commands.registerCommand('extension.vscode-counter.countInDirectory', (targetDir: vscode.Uri|undefined) => codeCountController.countInDirectory(targetDir)),
        vscode.commands.registerCommand('extension.vscode-counter.countInFile', () => codeCountController.toggleVisible())
    );
}
// this method is called when your extension is deactivated
export function deactivate() {
}

const workspaceFolders = (): vscode.WorkspaceFolder[] => {
    const folders = vscode.workspace.workspaceFolders;
    return !folders ? [] : folders;
};

class CodeCounterController {
    private configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(CONFIGURATION_SECTION);
    private codeCounter_: CodeCounter|null = null;
    private disposable: vscode.Disposable;
    constructor() {
        // subscribe to selection change and editor activation events
        let subscriptions: vscode.Disposable[] = [];
        vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor, this, subscriptions);
        vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration, this, subscriptions);
        vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument, this, subscriptions);
        vscode.workspace.onDidChangeWorkspaceFolders(this.onDidChangeWorkspaceFolders, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this.disposable = vscode.Disposable.from(...subscriptions);
        if (this.isVisible) {
            this.codeCounter.countCurrentFile();
        }
    }
    dispose() {
        this.disposable.dispose();
        this.disposeCodeCounter();
    }
    private get codeCounter() {
        if (this.codeCounter_ === null) {
            this.codeCounter_ = new CodeCounter(this.configuration);
        }
        return this.codeCounter_;
    }
    private disposeCodeCounter() {
        if (this.codeCounter_ !== null) {
            this.codeCounter_.dispose();
            this.codeCounter_ = null;
        }
    }
    private get isVisible() {
        return this.configuration.get('showInStatusBar', false);
    }
    public toggleVisible() {
        this.configuration.update('showInStatusBar', !this.isVisible);
    }
    public countInDirectory(targetDir: vscode.Uri|undefined) {
        try {
            const folders = workspaceFolders();
            if (folders.length <= 0) {
                vscode.window.showErrorMessage(`[${EXTENSION_NAME}] No open workspace`);
            } else if (targetDir !== undefined) {
                this.codeCounter.countLinesInDirectory(targetDir, folders[0].uri);
            } else {
                const option = {
                    value : folders[0].uri.toString(true),
                    placeHolder: "Input Directory Path",
                    prompt: "Input Directory Path. "
                };
                vscode.window.showInputBox(option).then(uri => {
                    if (uri !== undefined) {
                        this.codeCounter.countLinesInDirectory(vscode.Uri.parse(uri), folders[0].uri);
                    }
                });
            }
        } catch (e) {
            vscode.window.showErrorMessage(`[${EXTENSION_NAME}] failed.`, e.message);
        }
    }
    public countInWorkspace() {
        try {
            const folders = workspaceFolders();
            if (folders.length <= 0) {
                vscode.window.showErrorMessage(`[${EXTENSION_NAME}] No open workspace`);
            } else if (folders.length === 1) {
                this.codeCounter.countLinesInDirectory(folders[0].uri, folders[0].uri);
            } else {
                vscode.window.showWorkspaceFolderPick().then((folder) => {
                    if (folder) {
                        this.codeCounter.countLinesInDirectory(folder.uri, folder.uri);
                    }
                });
            }
        } catch (e) {
            vscode.window.showErrorMessage(`[${EXTENSION_NAME}] failed.`, e.message);
        }
    }
    private onDidChangeWorkspaceFolders(e: vscode.WorkspaceFoldersChangeEvent) {
        log(`onDidChangeWorkspaceFolders()`);
        e.added.forEach((f) =>   log(` added   [${f.index}] ${f.name} : ${f.uri}`));
        e.removed.forEach((f) => log(` removed [${f.index}] ${f.name} : ${f.uri}`));
        workspaceFolders().forEach((f) => log(` [${f.index}] ${f.name} : ${f.uri}`));
    }
    private onDidChangeActiveTextEditor(e: vscode.TextEditor|undefined) {
        if (this.codeCounter_ !== null) {
            log(`onDidChangeActiveTextEditor(${!e ? 'undefined' : e.document.uri})`);
            this.codeCounter.countFile((e !== undefined) ? e.document : undefined);
        }
    }
    private onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent) {
        if (this.codeCounter_ !== null) {
            log(`onDidChangeTextDocument(${e.document.uri})`);
            this.codeCounter.countFile(e.document);
        }
    }
    private onDidChangeConfiguration() {
        const newConf = vscode.workspace.getConfiguration(CONFIGURATION_SECTION);
        if (JSON.stringify(this.configuration) !== JSON.stringify(newConf)) {
            log(`onDidChangeConfiguration()`);
            this.configuration = newConf;
            this.disposeCodeCounter();
            if (this.isVisible) {
                this.codeCounter.countCurrentFile();
            }
        }
    }
}
const encodingTable = new Map<string, string>([
    ['big5hkscs',    'big5-hkscs'],
    // ['cp437',        ''],
    // ['cp850',        ''],
    // ['cp852',        ''],
    // ['cp865',        ''],
    // ['cp866',        ''],
    // ['cp950',        ''],
    ['eucjp',        'euc-jp'],
    ['euckr',        'euc-kr'],
    // ['gb18030',      ''],
    // ['gb2312',       ''],
    // ['gbk',          ''],
    // ['iso88591',     ''],
    // ['iso885910',    ''],
    // ['iso885911',    ''],
    // ['iso885913',    ''],
    // ['iso885914',    ''],
    // ['iso885915',    ''],
    // ['iso88592',     ''],
    // ['iso88593',     ''],
    // ['iso88594',     ''],
    // ['iso88595',     ''],
    // ['iso88596',     ''],
    // ['iso88597',     ''],
    // ['iso88598',     ''],
    // ['iso88599',     ''],
    ['iso885916',    'iso-8859-16'],
    ['koi8r',        'koi8-r'],
    ['koi8ru',       'koi8-ru'],
    ['koi8t',        'koi8-t'],
    ['koi8u',        'koi8-u'],
    ['macroman',     'x-mac-roman'],
    ['shiftjis',     'shift-jis'],
    ['utf16be',      'utf-16be'],
    ['utf16le',      'utf-16le'],
    // ['utf8',         ''],
    ['utf8bom',      'utf8'],
    ['windows1250',  'windows-1250'],
    ['windows1251',  'windows-1251'],
    ['windows1252',  'windows-1252'],
    ['windows1253',  'windows-1253'],
    ['windows1254',  'windows-1254'],
    ['windows1255',  'windows-1255'],
    ['windows1256',  'windows-1256'],
    ['windows1257',  'windows-1257'],
    ['windows1258',  'windows-1258'],
    ['windows874',   'windows-874'],
]);

class CodeCounter {
    private outputChannel: vscode.OutputChannel|null = null;
    private statusBarItem: vscode.StatusBarItem|null = null;
    private configuration: vscode.WorkspaceConfiguration;
    private lineCounterTable: LineCounterTable;

    constructor(configuration: vscode.WorkspaceConfiguration) {
        log(`create CodeCounter`);
        this.configuration = configuration;
        const confFiles = vscode.workspace.getConfiguration("files", null);
        this.lineCounterTable = new LineCounterTable(this.configuration, [...Object.entries(confFiles.get<object>('associations', {}))]);
        if (this.getConf('showInStatusBar', false)) {
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }
    }
    dispose() {
        if (this.statusBarItem !== null) {
            this.statusBarItem.dispose();
        }
        if (this.outputChannel !== null) {
            this.outputChannel.dispose();
        }
        log(`dispose CodeCounter`);
    }
    private getConf<T>(section: string, defaultValue: T): T {
        return this.configuration.get(section, defaultValue);
    }
    private toOutputChannel(text: string) {
        if (this.outputChannel === null) {
            this.outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);
        }
        this.outputChannel.show();
        this.outputChannel.appendLine(text);
    }
    public countLinesInDirectory(targetUri: vscode.Uri, outputDirUri: vscode.Uri) {
        const outputDir = path.resolve(outputDirUri.fsPath, this.getConf('outputDirectory', '.VSCodeCounter'));
        log(`countLinesInDirectory : ${targetUri}, output dir: ${outputDir}`);
        const confFiles = vscode.workspace.getConfiguration("files", null);
        const includes = this.getConf<Array<string>>('include', ['**/*']);
        const excludes = this.getConf<Array<string>>('exclude', []);
        if (this.getConf('useFilesExclude', true)) {
            excludes.push(...Object.keys(confFiles.get<object>('exclude', {})));
        }
        const encoding = confFiles.get('encoding', 'utf8');
        const decoder = new TextDecoder(encodingTable.get(encoding) || encoding);

        excludes.push(vscode.workspace.asRelativePath(outputDir));
        log(`includes : "${includes.join('", "')}"`);
        log(`excludes : "${excludes.join('", "')}"`);

        new Promise((resolve: (p: vscode.Uri[])=> void, reject: (reason: string) => void) => {
            vscode.workspace.findFiles(`{${includes.join(',')}}`, `{${excludes.join(',')}}`).then((files: vscode.Uri[]) => {
                const fileUris = files.filter(uri => uri.path.startsWith(targetUri.path));
                log(`target : ${fileUris.length} files`);
                if (this.getConf('useGitignore', true)) {
                    vscode.workspace.findFiles('**/.gitignore', '').then((gitignoreFiles: vscode.Uri[]) => {
                        gitignoreFiles.forEach(f => log(`use gitignore : ${f}`));
                        const gitignores = new Gitignore('').merge(...gitignoreFiles.map(uri => uri.fsPath).sort().map(p => new Gitignore(fs.readFileSync(p, 'utf8'), path.dirname(p))));
                        resolve(fileUris.filter(p => gitignores.excludes(p.fsPath)));
                    });
                } else {
                    resolve(fileUris);
                }
            });
        }).then((fileUris: vscode.Uri[]) => {
            log(`target : ${fileUris.length} files`);
            return new Promise((resolve: (value: Result[])=> void, reject: (reason: string) => void) => {
                const results: Result[] = [];
                if (fileUris.length <= 0) {
                    resolve(results);
                }
                const ignoreUnsupportedFile = this.getConf('ignoreUnsupportedFile', true);
                let fileCount = 0;
                fileUris.forEach(fileUri => {
                    const lineCounter = this.lineCounterTable.getByUri(fileUri);
                    if (lineCounter !== undefined) {
/*
                        fs.readFile(fileUri.fsPath, encoding, (err, data) => {
                            ++fileCount;
                            if (err) {
                                this.toOutputChannel(`"${fileUri}" Read Error : ${err.message}.`);
                                results.push(new Result(fileUri, '(Read Error)'));
                            } else {
                                results.push(new Result(fileUri, lineCounter.languageId, lineCounter.count(data)));
                            }
                            if (fileCount === fileUris.length) {
                                resolve(results);
                            }
                        });
*/
                        vscode.workspace.fs.readFile(fileUri).then((data => {
                            ++fileCount;
                            try {
                                results.push(new Result(fileUri, lineCounter.languageId, lineCounter.count(decoder.decode(data))));
                            } catch (e) {
                                this.toOutputChannel(`"${fileUri}" Read Error : ${e.message}.`);
                                results.push(new Result(fileUri, '(Read Error)'));
                            }
                            if (fileCount === fileUris.length) {
                                resolve(results);
                            }
                        }));
                    } else {
                        if (!ignoreUnsupportedFile) {
                            results.push(new Result(fileUri, '(Unsupported)'));
                        }
                        ++fileCount;
                        if (fileCount === fileUris.length) {
                            resolve(results);
                        }
                    }
                });
            });
        }).then((results: Result[]) => {
            outputResults(targetUri, results, outputDir, this.configuration);
        }).catch((reason: string) => {
            vscode.window.showErrorMessage(`[${EXTENSION_NAME}] failed.`, reason);
        });
    }
    private countFile_(doc: vscode.TextDocument|undefined) {
        if (doc !== undefined) {
            const lineCounter = this.lineCounterTable.getById(doc.languageId) || this.lineCounterTable.getByUri(doc.uri);
            log(`${doc.uri}: ${JSON.stringify(lineCounter)}`);
            if (lineCounter !== undefined) {
                const result = lineCounter.count(doc.getText());
                // return `Code:${result.code} Comment:${result.comment} Blank:${result.blank} Total:${result.code+result.comment+result.blank}`;
                return `Code:${result.code} Comment:${result.comment} Blank:${result.blank}`;
            }
        }
        return `${EXTENSION_NAME}:Unsupported`;
    }
    public countFile(doc: vscode.TextDocument|undefined) {
        if (this.statusBarItem !== null) {
            this.statusBarItem.show();
            this.statusBarItem.text = this.countFile_(doc);
        }
    }
    public countCurrentFile() {
        // Get the current text editor
        const editor = vscode.window.activeTextEditor;
        if (editor !== undefined) {
            this.countFile(editor.document);
        } else {
            this.countFile(undefined);
        }
    }
}

class LineCounterTable {
    private langIdTable: Map<string, LineCounter>;
    private aliasTable: Map<string, LineCounter>;
    private fileextRules: Map<string, LineCounter>;
    private filenameRules: Map<string, LineCounter>;
    private associations: [string, string][];

    constructor(conf: vscode.WorkspaceConfiguration, associations: [string, string][]) {
        this.langIdTable = new Map<string, LineCounter>();
        this.aliasTable = new Map<string, LineCounter>();
        this.fileextRules = new Map<string, LineCounter>();
        this.filenameRules = new Map<string, LineCounter>();
        this.associations = associations;
        log(`associations : ${this.associations.length}\n[${this.associations.join("],[")}]`);

        const confJsonTable = new Map<string, object>();

        vscode.extensions.all.forEach(ex => {
            const contributes = ex.packageJSON.contributes;
            if (contributes !== undefined) {
                const languages = contributes.languages;
                if (languages !== undefined) {
                    languages.forEach((lang: {id:string, aliases:string[]|undefined, filenames:string[]|undefined, extensions:string[]|undefined, configuration:string|undefined}) => {
                        const lineCounter = getOrSetFirst(this.langIdTable, lang.id, () => new LineCounter(lang.id));
                        if (lang.aliases !== undefined) {
                            lineCounter.addAlias(lang.aliases);
                            lang.aliases.forEach((alias:string) => {
                                this.aliasTable.set(alias, lineCounter);
                            });
                        }
                        const confpath = lang.configuration ? path.join(ex.extensionPath, lang.configuration) : "";
                        if (confpath.length > 0) {
                            log(`  language conf file: ${confpath}`);
                            const v = getOrSetFirst(confJsonTable, confpath, () => JSONC.parse(fs.readFileSync(confpath, "utf8")));
                            log(`  ${JSON.stringify(v)}`);
                            lineCounter.addCommentRule(v.comments);
                        }
                        if (lang.extensions !== undefined) {
                            (lang.extensions as Array<string>).forEach(ex => this.fileextRules.set(ex.startsWith('.') ? ex : `.${ex}`, lineCounter));
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
            patterns.types.forEach(id => {
                const lineCounter = this.getById(id) || this.getByPath(id);
                if (lineCounter) {
                    // log(`addBlockStringRule("${id}",  ${tokenPairs.map(t => t.begin + t.end).join('|')}) => [${lineCounter.name}]`);
                    lineCounter.addBlockStringRule(...patterns.patterns.map(pat => { return {begin: pat[0], end: pat[1]}; }));
                } 
            });
        });

        // log(`confJsonTable : ${confJsonTable.size}  =======================================================================`);
        // confJsonTable.forEach((v, n) => { log(`${n}:\n ${JSON.stringify(v)}`); });
        // log(`this.filenameRules : ${this.filenameRules.size}  =======================================================================`);
        // this.filenameRules.forEach((v, n) => { log(`${n}\t ${JSON.stringify(v)}`); });
        // log(`this.fileextRules : ${this.fileextRules.size}  =======================================================================`);
        // this.fileextRules.forEach((v, n) => { log(`${n}\t ${JSON.stringify(v)}`); });
        // log(`this.langIdTable : ${this.langIdTable.size}  =======================================================================`);
        // this.langIdTable.forEach((v, n) => { log(`${n}\t ${JSON.stringify(v)}`); });
        // log(`this.aliasTable : ${this.aliasTable.size}  =======================================================================`);
        // this.aliasTable.forEach((v, n) => { log(`${n}\t ${JSON.stringify(v)}`); });
    }
    public getById(langId: string) {
        return this.langIdTable.get(langId) || this.aliasTable.get(langId);
    }
    public getByPath(filePath: string) {
        const lineCounter = this.fileextRules.get(filePath) || this.fileextRules.get(path.extname(filePath)) || this.filenameRules.get(path.basename(filePath));
        if (lineCounter !== undefined) {
            return lineCounter; 
        }
        const patType = this.associations.find(([pattern, ]) => minimatch(filePath, pattern, {matchBase: true}));
        //log(`## ${filePath}: ${patType}`);
        return (patType !== undefined) ? this.getById(patType[1]) : undefined;
    }
    public getByUri(uri: vscode.Uri) {
        return this.getByPath(uri.path);
    }

    // public countById(filepath: string, text: string): {languageId:string, code:number, comment:number, blank:number}|undefined {
    //     const counter = this.getById(filepath);
    //     return (counter !== undefined) ? {languageId: counter.languageId, ...counter.count(text)} : undefined;
    // }
    // public countByPath(filepath: string, text: string): {languageId:string, code:number, comment:number, blank:number}|undefined {
    //     const counter = this.getByPath(filepath);
    //     return (counter !== undefined) ? {languageId: counter.languageId, ...counter.count(text)} : undefined;
    // }
}
function outputResults(workspaceUri: vscode.Uri, results: Result[], outputDirPath: string, conf: vscode.WorkspaceConfiguration) {
        const resultTable = new ResultTable(workspaceUri, results, conf.get('printNumberWithCommas', true) ? toStringWithCommas : (obj:any) => obj.toString() );
    const endOfLine = conf.get('endOfLine', '\n');
    log(`count ${results.length} files`);
    if (results.length <= 0) {
        vscode.window.showErrorMessage(`[${EXTENSION_NAME}] There was no target file.`);
        return;
    }
    const previewType = conf.get<string>('outputPreviewType', '');
    log(`OutputDir : ${outputDirPath}`);
    makeDirectories(outputDirPath);
    if (conf.get('outputAsText', true)) {
        const promise = writeTextFile(path.join(outputDirPath, 'results.txt'), resultTable.toTextLines().join(endOfLine));
        if (previewType === 'text') {
            promise.then(ofilename => showTextFile(ofilename)).catch(err => console.error(err));
        } else {
            promise.catch(err => console.error(err));
        }
    }
    if (conf.get('outputAsCSV', true)) {
        const promise = writeTextFile(path.join(outputDirPath, 'results.csv'), resultTable.toCSVLines().join(endOfLine));
        if (previewType === 'csv') {
            promise.then(ofilename => showTextFile(ofilename)).catch(err => console.error(err));
        } else {
            promise.catch(err => console.error(err));
        }
    }
    if (conf.get('outputAsMarkdown', true)) {
        const promise = conf.get('outputMarkdownSeparately.', true)
            ? writeTextFile(path.join(outputDirPath, 'details.md'), [
                    '# Details',
                    '',
                    ...resultTable.toMarkdownHeaderLines(),
                    '',
                    `[summary](results.md)`,
                    '',
                    ...resultTable.toMarkdownDetailsLines(),
                    '',
                    `[summary](results.md)`,
                    ].join(endOfLine)
                ).then(ofilename => writeTextFile(path.join(outputDirPath, 'results.md'), [
                    '# Summary',
                    '',
                    ...resultTable.toMarkdownHeaderLines(),
                    '',
                    `[details](details.md)`,
                    '',
                    ...resultTable.toMarkdownSummaryLines(),
                    '',
                    `[details](details.md)`
                    ].join(endOfLine))
                )
            : writeTextFile(path.join(outputDirPath, 'results.md'), [
                    ...resultTable.toMarkdownHeaderLines(),
                    '',
                    ...resultTable.toMarkdownSummaryLines(),
                    '',
                    ...resultTable.toMarkdownDetailsLines(),
                    ].join(endOfLine)
                );
        if (previewType === 'markdown') {
            promise.then(ofilename => vscode.commands.executeCommand("markdown.showPreview", vscode.Uri.file(ofilename)))
                .catch(err => console.error(err));
        } else {
            promise.catch(err => console.error(err));
        }
    }
}


class Result {
    public uri: vscode.Uri;
    public filename: string;
    public language: string;
    public code = 0;
    public comment = 0;
    public blank = 0;
    get total(): number {
        return this.code + this.comment + this.blank;
    }
    constructor(uri: vscode.Uri, language: string, value: {code:number, comment:number, blank:number} ={code:-1,comment:0,blank:0}) {
        this.uri = uri;
        this.filename = uri.fsPath;
        this.language = language;
        this.code = value.code;
        this.comment = value.comment;
        this.blank = value.blank;
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
    public append(result: Result) {
        this.files++;
        this.code += result.code;
        this.comment += result.comment;
        this.blank += result.blank;
        return this;
    }
}
class MarkdownTableFormatter {
    private dir: string;
    private valueToString: (obj:any) => string;
    private columnInfo: {title:string, format:string}[];
    constructor(dir:string, valueToString: (obj:any) => string, ...columnInfo: {title:string, format:string}[]) {
        this.dir = dir;
        this.valueToString = valueToString;
        this.columnInfo = columnInfo;
    }
    get lineSeparator() {
        return '| ' + this.columnInfo.map(i => (i.format === 'number') ? '---:' : ':---').join(' | ') + ' |';
    }
    get headerLines() {
        return ['| ' + this.columnInfo.map(i => i.title).join(' | ') + ' |', this.lineSeparator];
    }
    public line(...data: (string|number|vscode.Uri)[]) {
        return '| ' + data.map((d, i) => {
            if (typeof d === 'number') {
                return this.valueToString(d);
            }
            if (typeof d === 'string') {
                return d;
            }
            return `[${path.relative(this.dir, d.fsPath)}](${d})`;
        }) .join(' | ') + ' |';
    }
}
class ResultTable {
    private targetDirPath: string;
    private fileResults: Result[] = [];
    private dirResultTable = new Map<string, Statistics>();
    private langResultTable = new Map<string, Statistics>();
    private total = new Statistics('Total');
    private valueToString: (obj:any) => string;

    constructor(workspaceUri: vscode.Uri, results:Result[], valueToString = (obj:any) => obj.toString()) {
        this.targetDirPath = workspaceUri.fsPath;
        this.fileResults = results;
        this.valueToString = valueToString;
        results
        .filter((result) => result.code >= 0)
        .forEach((result) => {
            let parent = path.dirname(path.relative(this.targetDirPath, result.filename));
            while (parent.length >= 0) {
                getOrSetFirst(this.dirResultTable, parent, () => new Statistics(parent)).append(result);
                const p = path.dirname(parent);
                if (p === parent) {
                    break;
                }
                parent = p;
            }
            getOrSetFirst(this.langResultTable, result.language, () => new Statistics(result.language)).append(result);
            this.total.append(result);
        });
    }
    public toCSVLines() {
        const languages = [...this.langResultTable.keys()];
        return [
            `filename, language, ${languages.join(', ')}, comment, blank, total`,
            ...this.fileResults.sort((a,b) => a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0)
                .map(v => `${v.filename}, ${v.language}, ${languages.map(l => l === v.language ? v.code : 0).join(', ')}, ${v.comment}, ${v.blank}, ${v.total}`),
            `Total, -, ${[...this.langResultTable.values()].map(r => r.code).join(', ')}, ${this.total.comment}, ${this.total.blank}, ${this.total.total}`
        ];
    }
    public toTextLines() {
        class TextTableFormatter {
            private valueToString: (obj:any) => string;
            private columnInfo: {title:string, width:number}[];
            constructor(valueToString: (obj:any) => string, ...columnInfo: {title:string, width:number}[]) {
                this.valueToString = valueToString;
                this.columnInfo = columnInfo;
                for (const info of this.columnInfo) {
                    info.width = Math.max(info.title.length, info.width);
                }
            }
            public get lineSeparator() {
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
                        return this.valueToString(d).padStart(this.columnInfo[i].width);
                    }
                }).join(' | ') + ' |';
            }
        }
        const maxNamelen = Math.max(...this.fileResults.map(res => res.filename.length));
        const maxLanglen = Math.max(...[...this.langResultTable.keys()].map(l => l.length));
        const resultFormat = new TextTableFormatter(this.valueToString, {title:'filename', width:maxNamelen}, {title:'language', width:maxLanglen}, 
            {title:'code', width:10}, {title:'comment', width:10}, {title:'blank', width:10}, {title:'total', width:10});
        const dirFormat = new TextTableFormatter(this.valueToString, {title:'path', width:maxNamelen}, {title:'files', width:10}, 
            {title:'code', width:10}, {title:'comment', width:10}, {title:'blank', width:10}, {title:'total', width:10});
        const langFormat = new TextTableFormatter(this.valueToString, {title:'language', width:maxLanglen}, {title:'files', width:10}, 
            {title:'code', width:10}, {title:'comment', width:10}, {title:'blank', width:10}, {title:'total', width:10});
        return [
            // '='.repeat(resultFormat.headerLines[0].length),
            // EXTENSION_NAME,
            `Date : ${dateToString(new Date())}`,
            `Directory : ${this.targetDirPath}`,
            // `Total : code: ${this.total.code}, comment : ${this.total.comment}, blank : ${this.total.blank}, all ${this.total.total} lines`,
            `Total : ${this.total.files} files,  ${this.total.code} codes, ${this.total.comment} comments, ${this.total.blank} blanks, all ${this.total.total} lines`,
            '',
            'Languages',
            ...langFormat.headerLines, 
            ...[...this.langResultTable.values()].sort((a,b) => b.code - a.code)
                .map(v => langFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            ...langFormat.footerLines, 
            '',
            'Directories',
            ...dirFormat.headerLines, 
            ...[...this.dirResultTable.values()].sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
                .map(v => dirFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            ...dirFormat.footerLines, 
            '',
            'Files',
            ...resultFormat.headerLines, 
            ...this.fileResults.sort((a,b) => a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0)
                .map(v => resultFormat.line(v.filename, v.language, v.code, v.comment, v.blank, v.total)),
            resultFormat.line('Total', '', this.total.code, this.total.comment, this.total.blank, this.total.total),
            ...resultFormat.footerLines, 
        ];
    }

    public toMarkdownHeaderLines() {
        return [
            `Date : ${dateToString(new Date())}`,
            '',
            `Directory ${this.targetDirPath}`,
            '',
            `Total : ${this.total.files} files,  ${this.total.code} codes, ${this.total.comment} comments, ${this.total.blank} blanks, all ${this.total.total} lines`,
        ];
    }
    public toMarkdownSummaryLines() {
        const dirFormat = new MarkdownTableFormatter(this.targetDirPath, this.valueToString, 
            {title:'path', format:'string'}, 
            {title:'files', format:'number'}, 
            {title:'code', format:'number'}, 
            {title:'comment', format:'number'}, 
            {title:'blank', format:'number'}, 
            {title:'total', format:'number'}
        );
        const langFormat = new MarkdownTableFormatter(this.targetDirPath, this.valueToString, 
            {title:'language', format:'string'}, 
            {title:'files', format:'number'}, 
            {title:'code', format:'number'}, 
            {title:'comment', format:'number'}, 
            {title:'blank', format:'number'}, 
            {title:'total', format:'number'}
        );
        return [
            '## Languages',
            ...langFormat.headerLines, 
            ...[...this.langResultTable.values()].sort((a,b) => b.code - a.code)
                .map(v => langFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            '',
            '## Directories',
            ...dirFormat.headerLines, 
            ...[...this.dirResultTable.values()].sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
                .map(v => dirFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
        ];
    }
    public toMarkdownDetailsLines() {
        const resultFormat = new MarkdownTableFormatter(this.targetDirPath, this.valueToString, 
            {title:'filename', format:'uri'}, 
            {title:'language', format:'string'}, 
            {title:'code', format:'number'}, 
            {title:'comment', format:'number'}, 
            {title:'blank', format:'number'}, 
            {title:'total', format:'number'}
        );
        return [
            '## Files',
            ...resultFormat.headerLines, 
            ...this.fileResults.sort((a,b) => a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0)
                .map(v => resultFormat.line(v.uri, v.language, v.code, v.comment, v.blank, v.total)),
        ];
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
    log(`showTextFile : ${outputFilename}`);
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
    log(`writeTextFile : ${outputFilename} ${text.length}B`);
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
