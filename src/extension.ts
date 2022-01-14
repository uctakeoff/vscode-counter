'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { LineCounter, Count } from './LineCounter';
import Gitignore from './Gitignore';
import * as minimatch from 'minimatch';
import { buildUri, createTextDecoder, currentWorkspaceFolder, dirUri, makeDirectories, readJsonFile, readTextFiles, showTextPreview, writeTextFile } from './vscode-utils';

const EXTENSION_ID = 'uctakeoff.vscode-counter';
const EXTENSION_NAME = 'VSCodeCounter';
const CONFIGURATION_SECTION = 'VSCodeCounter';
const toZeroPadString = (num: number, fig: number) => num.toString().padStart(fig, '0');
const toLocalDateString = (date: Date, delims: [string, string, string] = ['-', ' ', ':']) => {
    return `${date.getFullYear()}${delims[0]}${toZeroPadString(date.getMonth() + 1, 2)}${delims[0]}${toZeroPadString(date.getDate(), 2)}${delims[1]}`
        + `${toZeroPadString(date.getHours(), 2)}${delims[2]}${toZeroPadString(date.getMinutes(), 2)}${delims[2]}${toZeroPadString(date.getSeconds(), 2)}`;
}
const toStringWithCommas = (obj: any) => {
    if (typeof obj === 'number') {
        return new Intl.NumberFormat('en-US').format(obj);
    } else {
        return obj.toString();
    }
};
const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));
const log = (message: string, ...items: any[]) => console.log(`${new Date().toISOString()} ${message}`, ...items);
const showError = (message: string, ...items: any[]) => vscode.window.showErrorMessage(`[${EXTENSION_NAME}] ${message}`, ...items);
const registerCommand = (command: string, callback: (...args: any[]) => any, thisArg?: any): vscode.Disposable => {
    return vscode.commands.registerCommand(`extension.vscode-counter.${command}`, async (...args) => {
        try {
            await callback(...args);
        } catch (e: any) {
            showError(`"${command}" failed.`, e.message);
        }
    }, thisArg);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export const activate = (context: vscode.ExtensionContext) => {
    const version = vscode.extensions.getExtension(EXTENSION_ID)?.packageJSON?.version;
    log(`${EXTENSION_ID} ver.${version} now active! : ${context.extensionPath}`);
    const codeCountController = new CodeCounterController();
    context.subscriptions.push(
        codeCountController,
        registerCommand('countInWorkspace', () => codeCountController.countLinesInWorkSpace()),
        registerCommand('countInDirectory', (targetDir: vscode.Uri | undefined) => codeCountController.countLinesInDirectory(targetDir)),
        registerCommand('countInFile', () => codeCountController.toggleVisible()),
        registerCommand('saveLanguageConfigurations', () => codeCountController.saveLanguageConfigurations()),
        registerCommand('outputAvailableLanguages', () => codeCountController.outputAvailableLanguages())
    );
}
// this method is called when your extension is deactivated
export const deactivate = () => { }

const loadConfig = () => {
    const conf = vscode.workspace.getConfiguration(CONFIGURATION_SECTION);
    const confFiles = vscode.workspace.getConfiguration("files", null);

    const include = conf.get<string[]>('include', ['**/*']);
    const exclude = conf.get<string[]>('exclude', []);
    if (conf.get('useFilesExclude', true)) {
        exclude.push(...Object.keys(confFiles.get<object>('exclude', {})));
    }
    return {
        configuration: conf,
        saveLocation: conf.get<string>('saveLocation', 'global settings'),
        outputDirectory: conf.get('outputDirectory', '.VSCodeCounter'),
        // include: `{${include.join(',')}}`,
        // exclude: `{${exclude.join(',')}}`,
        include: include.join(','),
        exclude: exclude.join(','),
        useGitignore: conf.get('useGitignore', true),

        encoding: confFiles.get('encoding', 'utf8'),
        associations: Object.entries(confFiles.get<{ [key: string]: string }>('associations', {})),

        maxOpenFiles: conf.get('maxOpenFiles', 500),
        ignoreUnsupportedFile: conf.get('ignoreUnsupportedFile', true),
        history: Math.max(1, conf.get('history', 5)),
        languages: conf.get<{ [key: string]: LanguageConf }>('languages', {}),

        endOfLine: conf.get('endOfLine', '\n'),
        printNumberWithCommas: conf.get('printNumberWithCommas', true),
        outputPreviewType: conf.get<string>('outputPreviewType', ''),
        outputAsText: conf.get('outputAsText', true),
        outputAsCSV: conf.get('outputAsCSV', true),
        outputAsMarkdown: conf.get('outputAsMarkdown', true),
    };
}
type Config = ReturnType<typeof loadConfig>;

class CodeCounterController {
    private codeCounter_: LineCounterTable | null = null;
    private statusBarItem: vscode.StatusBarItem | null = null;
    private outputChannel: vscode.OutputChannel | null = null;
    private disposable: vscode.Disposable;
    private conf: Config;

    constructor() {
        // subscribe to selection change and editor activation events
        let subscriptions: vscode.Disposable[] = [];
        vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor, this, subscriptions);
        vscode.window.onDidChangeTextEditorSelection(this.onDidChangeTextEditorSelection, this, subscriptions);
        vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration, this, subscriptions);
        vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument, this, subscriptions);
        // vscode.workspace.onDidChangeWorkspaceFolders(this.onDidChangeWorkspaceFolders, this, subscriptions);
        this.conf = loadConfig();

        // create a combined disposable from both event subscriptions
        this.disposable = vscode.Disposable.from(...subscriptions);
    }
    dispose() {
        this.statusBarItem?.dispose();
        this.statusBarItem = null;
        this.outputChannel?.dispose();
        this.outputChannel = null;
        this.disposable.dispose();
        this.codeCounter_ = null;
    }
    // private onDidChangeWorkspaceFolders(e: vscode.WorkspaceFoldersChangeEvent) {
    //     log(`onDidChangeWorkspaceFolders()`);
    //     // e.added.forEach((f) =>   log(` added   [${f.index}] ${f.name} : ${f.uri}`));
    //     // e.removed.forEach((f) => log(` removed [${f.index}] ${f.name} : ${f.uri}`));
    //     // vscode.workspace.workspaceFolders?.forEach((f) => log(` [${f.index}] ${f.name} : ${f.uri}`));
    // }
    private onDidChangeActiveTextEditor(e: vscode.TextEditor | undefined) {
        if (this.codeCounter_) {
            // log(`onDidChangeActiveTextEditor(${!e ? 'undefined' : e.document.uri})`);
            this.countLinesInEditor(e);
        }
    }
    private onDidChangeTextEditorSelection(e: vscode.TextEditorSelectionChangeEvent) {
        if (this.codeCounter_) {
            // log(`onDidChangeTextEditorSelection(${e.selections.length}selections, ${e.selections[0].isEmpty} )`, e.selections[0]);
            this.countLinesInEditor(e.textEditor);
        }
    }
    private onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent) {
        if (this.codeCounter_) {
            // log(`onDidChangeTextDocument(${e.document.uri})`);
            this.countLinesOfFile(e.document);
        }
    }
    private onDidChangeConfiguration() {
        // log(`onDidChangeConfiguration()`);
        this.codeCounter_ = null;
        this.conf = loadConfig();
        this.countLinesInEditor(vscode.window.activeTextEditor);
    }
    public toggleVisible() {
        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100000);
            this.countLinesInEditor(vscode.window.activeTextEditor);
        } else {
            this.statusBarItem.dispose();
            this.statusBarItem = null;
        }
    }

    private async getCodeCounter() {
        if (this.codeCounter_) {
            return this.codeCounter_
        }
        const langs = objectToMap(await loadLanguageConfigurations(this.conf));
        log(`load Language Settings = ${langs.size}`);
        await collectLanguageConfigurations(langs);
        log(`collect Language Settings = ${langs.size}`);
        this.codeCounter_ = new LineCounterTable(langs, this.conf.associations);
        return this.codeCounter_;
    }
    public async saveLanguageConfigurations() {
        const c = await this.getCodeCounter();
        saveLanguageConfigurations(mapToObject(c.entries()), this.conf);
    }

    public async outputAvailableLanguages() {
        const c = await this.getCodeCounter();
        c.entries().forEach((lang, id) => {
            this.toOutputChannel(`${id} : aliases[${lang.aliases}], extensions[${lang.extensions}], filenames:[${lang.filenames}]`);
        });
        this.toOutputChannel(`VS Code Counter : available all ${c.entries().size} languages.`);
    }

    public async countLinesInDirectory(targetDir: vscode.Uri | undefined) {
        const folder = await currentWorkspaceFolder();
        if (targetDir) {
            this.countLinesInDirectory_(targetDir, folder.uri);
        } else {
            const option = {
                value: folder.uri.toString(true),
                placeHolder: "Input Directory Path",
                prompt: "Input Directory Path. "
            };
            const uri = await vscode.window.showInputBox(option);
            if (uri) {
                this.countLinesInDirectory_(vscode.Uri.parse(uri), folder.uri);
            }
        }
    }
    public async countLinesInWorkSpace() {
        const folder = await currentWorkspaceFolder();
        this.countLinesInDirectory_(folder.uri, folder.uri);
    }
    private async countLinesInDirectory_(targetUri: vscode.Uri, workspaceDir: vscode.Uri) {
        const date = new Date();
        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        try {
            statusBar.show();
            statusBar.text = `VSCodeCounter: Preparing...`;

            const outputDir = buildUri(workspaceDir, this.conf.outputDirectory);
            log(`include : "${this.conf.include}"`);
            log(`exclude : "${this.conf.exclude}"`);
            const files = await vscode.workspace.findFiles(`{${this.conf.include}}`, `{${this.conf.exclude},${vscode.workspace.asRelativePath(outputDir)}}`);
            let targetFiles = files.filter(uri => !path.relative(targetUri.path, uri.path).startsWith(".."));
            if (this.conf.useGitignore) {
                log(`target : ${targetFiles.length} files -> use .gitignore`);
                const gitignores = await loadGitIgnore();
                targetFiles = targetFiles.filter(p => gitignores.excludes(p.fsPath));
            }

            const counter = await this.getCodeCounter();
            const results = await countLines(counter, targetFiles, this.conf.maxOpenFiles, this.conf.encoding, this.conf.ignoreUnsupportedFile, (msg: string) => statusBar.text = `VSCodeCounter: ${msg}`);
            if (results.length <= 0) {
                throw Error(`There was no target file.`);
            }
            statusBar.text = `VSCodeCounter: Totaling...`;

            const regex = /^\d\d\d\d-\d\d-\d\d\_\d\d-\d\d-\d\d$/;
            const histories = (await vscode.workspace.fs.readDirectory(outputDir))
                .filter(d => ((d[1] & vscode.FileType.Directory) != 0) && regex.test(d[0]))
                .map(d => d[0])
                .sort()
                .map(d => buildUri(outputDir, d));

            const outSubdir = buildUri(outputDir, toLocalDateString(date, ['-', '_', '-']));
            await outputResults(date, targetUri, results, outSubdir, histories[histories.length - 1], this.conf);

            if (histories.length >= this.conf.history) {
                histories.length -= this.conf.history - 1;
                histories.forEach(dir => vscode.workspace.fs.delete(dir, { recursive: true }));
            }
        } finally {
            log(` finished. ${(new Date().getTime() - date.getTime())}ms`);
            statusBar.dispose();
        }
    }
    private async countLinesInEditor(editor: vscode.TextEditor | undefined) {
        const doc = editor?.document;
        if (!editor || !doc) {
            this.showStatusBar();
        } else if (editor.selection.isEmpty) {
            await this.countLinesOfFile(doc);
        } else {
            const c = await this.getCodeCounter();
            const lineCounter = c.getById(doc.languageId) || c.getByUri(doc.uri);
            if (lineCounter) {
                const result = editor.selections
                    .map(s => lineCounter.count(doc.getText(s)))
                    .reduce((prev, cur) => prev.add(cur), new Count());
                this.showStatusBar(`Selected Code:${result.code} Comment:${result.comment} Blank:${result.blank}`);
            } else {
                this.showStatusBar();
            }
        }
    }
    private async countLinesOfFile(doc: vscode.TextDocument | undefined) {
        if (!doc) {
            this.showStatusBar();
        } else {
            const c = await this.getCodeCounter();
            const lineCounter = c.getById(doc.languageId) || c.getByUri(doc.uri);
            if (lineCounter) {
                const result = lineCounter?.count(doc.getText());
                this.showStatusBar(`Code:${result.code} Comment:${result.comment} Blank:${result.blank}`);
            } else {
                this.showStatusBar();
            }
        }
    }
    private showStatusBar(text?: string) {
        if (this.statusBarItem) {
            this.statusBarItem.show();
            this.statusBarItem.text = text ?? `${EXTENSION_NAME}:Unsupported`;
        }
    }
    private toOutputChannel(text: string) {
        if (!this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);
        }
        this.outputChannel.show();
        this.outputChannel.appendLine(text);
    }
}


const loadGitIgnore = async () => {
    const gitignoreFiles = await vscode.workspace.findFiles('**/.gitignore', '');
    gitignoreFiles.forEach(f => log(`use gitignore : ${f}`));
    const values = await readTextFiles(gitignoreFiles.sort());
    return new Gitignore('').merge(...values.map(p => new Gitignore(p.data ?? '', dirUri(p.uri).fsPath)));
}

const countLines = (lineCounterTable: LineCounterTable, fileUris: vscode.Uri[], maxOpenFiles: number, fileEncoding: string, ignoreUnsupportedFile: boolean, showStatus: (text: string) => void) => {
    log(`countLines : target ${fileUris.length} files`);
    return new Promise(async (resolve: (value: Result[]) => void, reject: (reason: string) => void) => {
        const results: Result[] = [];
        if (fileUris.length <= 0) {
            resolve(results);
        }
        const decoder = createTextDecoder(fileEncoding);
        const totalFiles = fileUris.length;
        let fileCount = 0;
        const onFinish = () => {
            ++fileCount;
            if (fileCount === totalFiles) {
                log(`finished : total:${totalFiles} valid:${results.length}`);
                resolve(results);
            }
        };
        for (let i = 0; i < totalFiles; ++i) {
            const fileUri = fileUris[i];
            const lineCounter = lineCounterTable.getByUri(fileUri);
            if (lineCounter) {

                while ((i - fileCount) >= maxOpenFiles) {
                    // log(`sleep : total:${totalFiles} current:${i} finished:${fileCount} valid:${results.length}`);
                    showStatus(`${fileCount}/${totalFiles}`);
                    await sleep(50);
                }

                vscode.workspace.fs.readFile(fileUri).then(data => {
                    try {
                        results.push(new Result(fileUri, lineCounter.name, lineCounter.count(decoder.decode(data))));
                    } catch (e: any) {
                        log(`"${fileUri}" Read Error : ${e.message}.`);
                        results.push(new Result(fileUri, '(Read Error)'));
                    }
                    onFinish();
                },
                    (reason: any) => {
                        log(`"${fileUri}" Read Error : ${reason}.`);
                        results.push(new Result(fileUri, '(Read Error)'));
                        onFinish();
                    });
            } else {
                if (!ignoreUnsupportedFile) {
                    results.push(new Result(fileUri, '(Unsupported)'));
                }
                onFinish();
            }
        }
    });
}

type VscodeLanguage = {
    id: string
    aliases?: string[]
    filenames?: string[]
    extensions?: string[]
    configuration?: string
};
type LanguageConf = {
    aliases: string[]
    filenames: string[]
    extensions: string[]
    lineComments: string[]
    blockComments: [string, string][]
    blockStrings: [string, string][]
}
const pushUnique = <T>(array: T[], value: T) => {
    if (array.indexOf(value) < 0) {
        array.push(value);
    }
}

const append = (langs: Map<string, LanguageConf>, l: VscodeLanguage) => {
    const langExt = getOrSet(langs, l.id, (): LanguageConf => {
        return {
            aliases: [],
            filenames: [],
            extensions: [],
            lineComments: [],
            blockComments: [],
            blockStrings: []
        }
    });
    // l.aliases?.filter(v => langExt.aliases.indexOf(v) < 0).forEach(v => langExt.aliases.push(v));
    // l.filenames?.filter(v => langExt.filenames.indexOf(v) < 0).forEach(v => langExt.filenames.push(v));
    // l.extensions?.filter(v => langExt.extensions.indexOf(v) < 0).forEach(v => langExt.extensions.push(v));
    l.aliases?.forEach(v => pushUnique(langExt.aliases, v));
    l.filenames?.forEach(v => pushUnique(langExt.filenames, v));
    l.extensions?.forEach(v => pushUnique(langExt.extensions, v));
    return langExt;
}

const collectLanguageConfigurations = (langs: Map<string, LanguageConf>): Promise<Map<string, LanguageConf>> => {
    return new Promise((resolve: (values: Map<string, LanguageConf>) => void, reject: (reason: any) => void) => {
        if (vscode.extensions.all.length <= 0) {
            resolve(langs);
        } else {
            let finishedCount = 0;
            let totalCount = 0;
            vscode.extensions.all.forEach(ex => {
                const languages = ex.packageJSON.contributes?.languages as VscodeLanguage[] ?? undefined;
                if (languages) {
                    totalCount += languages.length
                    languages.forEach(l => {
                        const langExt = append(langs, l);
                        if (l.configuration) {
                            const confUrl = vscode.Uri.file(path.join(ex.extensionPath, l.configuration));
                            readJsonFile(confUrl).then((langConf: vscode.LanguageConfiguration) => {
                                // log(`${confUrl} ${data.length}B :${l.id}`);
                                if (langConf.comments) {
                                    if (langConf.comments.lineComment) {
                                        pushUnique(langExt.lineComments, langConf.comments.lineComment);
                                    }
                                    if (langConf.comments.blockComment && langConf.comments.blockComment.length >= 2) {
                                        pushUnique(langExt.blockComments, langConf.comments.blockComment);
                                    }
                                }
                                if (++finishedCount >= totalCount) {
                                    resolve(langs);
                                }
                            }, (reason: any) => {
                                log(`${confUrl} : error ${reason}`);
                                if (++finishedCount >= totalCount) {
                                    resolve(langs);
                                }
                            });
                        } else {
                            if (++finishedCount >= totalCount) {
                                resolve(langs);
                            }
                        }
                    });
                }
            });
        }
    });
}

const saveLanguageConfigurations = async (langs: { [key: string]: LanguageConf }, conf: Config) => {
    switch (conf.saveLocation) {
        case "global settings":
            conf.configuration.update('languages', langs, vscode.ConfigurationTarget.Global);
            break;
        case "workspace settings":
            conf.configuration.update('languages', langs, vscode.ConfigurationTarget.Workspace);
            break;
        case "output directory":
            const workFolder = await currentWorkspaceFolder();
            const outputDir = buildUri(workFolder.uri, conf.outputDirectory);
            await makeDirectories(outputDir);
            await writeTextFile(outputDir, 'languages.json', JSON.stringify(langs));
            break;
        default: break;
    }
}

const loadLanguageConfigurations = async (conf: Config): Promise<{ [key: string]: LanguageConf }> => {
    try {
        switch (conf.saveLocation) {
            case "global settings":
            case "workspace settings":
                return conf.languages;
            case "output directory":
                const workFolder = await currentWorkspaceFolder();
                const outputDir = buildUri(workFolder.uri, conf.outputDirectory);
                return await readJsonFile(outputDir, 'languages.json');
            default: break;
        }
    } catch (e: any) {
        log(`loadLanguageConfigurations failed. ${e.message}`);
    }
    return {};
}

class LineCounterTable {
    private langIdTable: Map<string, LineCounter> = new Map();
    private aliasTable: Map<string, LineCounter> = new Map();
    private fileextRules: Map<string, LineCounter> = new Map();
    private filenameRules: Map<string, LineCounter> = new Map();

    constructor(private langExtensions: Map<string, LanguageConf>, private associations: [string, string][]) {
        log(`associations : ${this.associations.length}\n[${this.associations.join("],[")}]`);
        langExtensions.forEach((lang, id) => {
            const langName = lang.aliases.length > 0 ? lang.aliases[0] : id;
            const lineCounter = new LineCounter(langName, lang.lineComments, lang.blockComments, lang.blockStrings);
            lang.aliases.forEach(v => this.aliasTable.set(v, lineCounter));
            lang.extensions.forEach(v => this.fileextRules.set(v.startsWith('.') ? v : `.${v}`, lineCounter));
            lang.filenames.forEach(v => this.filenameRules.set(v, lineCounter));
        });
    }
    public entries = () => this.langExtensions;

    public getById(langId: string) {
        return this.langIdTable.get(langId) || this.aliasTable.get(langId);
    }
    public getByPath(filePath: string) {
        const lineCounter = this.fileextRules.get(filePath) || this.fileextRules.get(path.extname(filePath)) || this.filenameRules.get(path.basename(filePath));
        if (lineCounter !== undefined) {
            return lineCounter;
        }
        const patType = this.associations.find(([pattern,]) => minimatch(filePath, pattern, { matchBase: true }));
        //log(`## ${filePath}: ${patType}`);
        return (patType !== undefined) ? this.getById(patType[1]) : undefined;
    }
    public getByUri(uri: vscode.Uri) {
        return this.getByPath(uri.fsPath);
    }
}

const outputFiles = new Map<string, string>([
    ['text', 'results.txt'],
    ['diff-text', 'diff.txt'],
    ['csv', 'results.csv'],
    ['diff-csv', 'diff.csv'],
    ['markdown', 'results.md'],
    ['diff-markdown', 'diff.md'],
]);
const outputResults = async (date: Date, targetDirUri: vscode.Uri, results: Result[], outputDir: vscode.Uri, prevOutputDir: vscode.Uri | undefined, conf: Config) => {
    await makeDirectories(outputDir);
    writeTextFile(outputDir, `results.json`, resultsToJson(results));

    const resultTable = new ResultFormatter(targetDirUri, results, conf.endOfLine, conf.printNumberWithCommas ? toStringWithCommas : undefined);
    log(`OutputDir : ${outputDir}, count ${results.length} files`);

    const diffs: Result[] = [];
    if (prevOutputDir) {
        const prevResults: { [uri: string]: Count } = await readJsonFile(prevOutputDir, 'results.json');
        log(`Previous OutputDir : ${prevOutputDir}, count ${prevResults.length} files`);
        results.map(r => {
            const p = prevResults[r.uri.toString()];
            const diff = p ? r.clone().sub(p) : r;
            if (!diff.isEmpty) {
                diffs.push(diff);
            }
        });
    }
    const diffTable = new ResultFormatter(targetDirUri, diffs, conf.endOfLine, conf.printNumberWithCommas ? toStringWithCommas : undefined);

    if (conf.outputAsText) {
        await writeTextFile(outputDir, 'results.txt', resultTable.toTextLines(date));
        await writeTextFile(outputDir, 'diff.txt', diffTable.toTextLines(date));
    }
    if (conf.outputAsCSV) {
        await writeTextFile(outputDir, 'results.csv', resultTable.toCSVLines());
        await writeTextFile(outputDir, 'diff.csv', diffTable.toCSVLines());
    }
    if (conf.outputAsMarkdown) {
        const links: [string, string | undefined][] = [
            ['summary', 'results.md'],
            ['details', 'details.md'],
            ['diff summary', 'diff.md'],
            ['diff details', 'diff-details.md'],
            // ['Previous', prevOutputDir ? '/' + vscode.workspace.asRelativePath(buildUri(prevOutputDir, 'results.md')) : undefined],
        ];
        await writeTextFile(outputDir, 'results.md', resultTable.toMarkdown(date, 'Summary', false, links.map((l, i) => i === 0 ? [l[0], undefined] : l)));
        await writeTextFile(outputDir, 'details.md', resultTable.toMarkdown(date, 'Details', true, links.map((l, i) => i === 1 ? [l[0], undefined] : l)));
        await writeTextFile(outputDir, 'diff.md', diffTable.toMarkdown(date, 'Diff Summary', false, links.map((l, i) => i === 2 ? [l[0], undefined] : l)));
        await writeTextFile(outputDir, 'diff-details.md', diffTable.toMarkdown(date, 'Diff Details', true, links.map((l, i) => i === 3 ? [l[0], undefined] : l)));
    }
    const previewFile = outputFiles.get(conf.outputPreviewType);
    if (previewFile) {
        showTextPreview(buildUri(outputDir, previewFile));
    }
}

class Result extends Count {
    public uri: vscode.Uri;
    public filename: string;
    public language: string;

    constructor(uri: vscode.Uri, language: string, count = { code: 0, comment: 0, blank: 0 }) {
        super(count.code, count.comment, count.blank);
        this.uri = uri;
        this.filename = uri.fsPath;
        this.language = language;
    }
    clone() {
        return new Result(this.uri, this.language, this);
    }
}
const resultsToJson = (results: Result[]) => {
    const obj: any = {};
    results.forEach(({ uri, language, code, comment, blank }) => obj[uri.toString()] = { language, code, comment, blank });
    // return JSON.stringify(obj, undefined, 2);
    return JSON.stringify(obj);
}
class Statistics extends Count {
    public name: string;
    public files = 0;

    constructor(name: string) {
        super();
        this.name = name;
    }
    override add(value: Count) {
        this.files++;
        return super.add(value);
    }
}

class MarkdownTableFormatter {
    private valueToString: (obj: any) => string;
    private columnInfo: { title: string, format: string }[];
    constructor(valueToString: (obj: any) => string, ...columnInfo: { title: string, format: string }[]) {
        this.valueToString = valueToString;
        this.columnInfo = columnInfo;
    }
    get lineSeparator() {
        return '| ' + this.columnInfo.map(i => (i.format === 'number') ? '---:' : ':---').join(' | ') + ' |';
    }
    get headerLines() {
        return ['| ' + this.columnInfo.map(i => i.title).join(' | ') + ' |', this.lineSeparator];
    }
    public line(...data: (string | number | vscode.Uri)[]) {
        return '| ' + data.map((d, i) => {
            if (typeof d === 'number') {
                return this.valueToString(d);
            }
            if (typeof d === 'string') {
                return d;
            }
            const relativePath = vscode.workspace.asRelativePath(d);
            return `[${relativePath}](/${relativePath})`;
        }).join(' | ') + ' |';
    }
}
class ResultFormatter {
    private dirResultTable = new Map<string, Statistics>();
    private langResultTable = new Map<string, Statistics>();
    private total = new Statistics('Total');

    constructor(private targetDirUri: vscode.Uri, private results: Result[], private endOfLine: string, private valueToString = (obj: any) => obj.toString()) {
        results.forEach((result) => {
            let parent = path.dirname(path.relative(this.targetDirUri.fsPath, result.filename));
            while (parent.length >= 0) {
                getOrSet(this.dirResultTable, parent, () => new Statistics(parent)).add(result);
                const p = path.dirname(parent);
                if (p === parent) {
                    break;
                }
                parent = p;
            }
            getOrSet(this.langResultTable, result.language, () => new Statistics(result.language)).add(result);
            this.total.add(result);
        });
    }
    toCSVLines() {
        const languages = [...this.langResultTable.keys()];
        return [
            `"filename", "language", "${languages.join('", "')}", "comment", "blank", "total"`,
            ...this.results.sort((a, b) => a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0)
                .map(v => `"${v.filename}", "${v.language}", ${languages.map(l => l === v.language ? v.code : 0).join(', ')}, ${v.comment}, ${v.blank}, ${v.total}`),
            `"Total", "-", ${[...this.langResultTable.values()].map(r => r.code).join(', ')}, ${this.total.comment}, ${this.total.blank}, ${this.total.total}`
        ].join(this.endOfLine);
    }
    toTextLines(date: Date) {
        class TextTableFormatter {
            private valueToString: (obj: any) => string;
            private columnInfo: { title: string, width: number }[];
            constructor(valueToString: (obj: any) => string, ...columnInfo: { title: string, width: number }[]) {
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
            public line(...data: (string | number | boolean)[]) {
                return '| ' + data.map((d, i) => {
                    if (typeof d === 'string') {
                        return d.padEnd(this.columnInfo[i].width);
                    } else {
                        return this.valueToString(d).padStart(this.columnInfo[i].width);
                    }
                }).join(' | ') + ' |';
            }
        }
        const maxNamelen = Math.max(...this.results.map(res => res.filename.length));
        const maxLanglen = Math.max(...[...this.langResultTable.keys()].map(l => l.length));
        const resultFormat = new TextTableFormatter(this.valueToString, { title: 'filename', width: maxNamelen }, { title: 'language', width: maxLanglen },
            { title: 'code', width: 10 }, { title: 'comment', width: 10 }, { title: 'blank', width: 10 }, { title: 'total', width: 10 });
        const dirFormat = new TextTableFormatter(this.valueToString, { title: 'path', width: maxNamelen }, { title: 'files', width: 10 },
            { title: 'code', width: 10 }, { title: 'comment', width: 10 }, { title: 'blank', width: 10 }, { title: 'total', width: 10 });
        const langFormat = new TextTableFormatter(this.valueToString, { title: 'language', width: maxLanglen }, { title: 'files', width: 10 },
            { title: 'code', width: 10 }, { title: 'comment', width: 10 }, { title: 'blank', width: 10 }, { title: 'total', width: 10 });
        return [
            `Date : ${toLocalDateString(date)}`,
            `Directory : ${this.targetDirUri.fsPath}`,
            // `Total : code: ${this.total.code}, comment : ${this.total.comment}, blank : ${this.total.blank}, all ${this.total.total} lines`,
            `Total : ${this.total.files} files,  ${this.total.code} codes, ${this.total.comment} comments, ${this.total.blank} blanks, all ${this.total.total} lines`,
            '',
            'Languages',
            ...langFormat.headerLines,
            ...[...this.langResultTable.values()].sort((a, b) => b.code - a.code)
                .map(v => langFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            ...langFormat.footerLines,
            '',
            'Directories',
            ...dirFormat.headerLines,
            ...[...this.dirResultTable.values()].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
                .map(v => dirFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            ...dirFormat.footerLines,
            '',
            'Files',
            ...resultFormat.headerLines,
            ...this.results.sort((a, b) => a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0)
                .map(v => resultFormat.line(v.filename, v.language, v.code, v.comment, v.blank, v.total)),
            resultFormat.line('Total', '', this.total.code, this.total.comment, this.total.blank, this.total.total),
            ...resultFormat.footerLines,
        ].join(this.endOfLine);
    }
    /*
        toMarkdown(date: Date) {
            return [
                ...this.toMarkdownHeaderLines(date),
                '',
                ...this.toMarkdownSummaryLines(),
                '',
                ...this.toMarkdownDetailsLines(),
            ].join(this.endOfLine);
        }
    */
    toMarkdown(date: Date, title: string, detail: boolean, links: [string, string | undefined][]) {
        const linksStr = links.map(l => l[1] ? `[${l[0]}](${l[1]})` : l[0]).join(' / ');
        return [
            `# ${title}`,
            '',
            ...this.toMarkdownHeaderLines(date),
            '',
            linksStr,
            '',
            ...(detail ? this.toMarkdownDetailsLines() : this.toMarkdownSummaryLines()),
            '',
            linksStr,
        ].join(this.endOfLine);
    }

    private toMarkdownHeaderLines(date: Date) {
        return [
            `Date : ${toLocalDateString(date)}`,
            '',
            `Directory ${this.targetDirUri.fsPath}`,
            '',
            `Total : ${this.total.files} files,  ${this.total.code} codes, ${this.total.comment} comments, ${this.total.blank} blanks, all ${this.total.total} lines`,
        ];
    }
    private toMarkdownSummaryLines() {
        const dirFormat = new MarkdownTableFormatter(this.valueToString,
            { title: 'path', format: 'string' },
            { title: 'files', format: 'number' },
            { title: 'code', format: 'number' },
            { title: 'comment', format: 'number' },
            { title: 'blank', format: 'number' },
            { title: 'total', format: 'number' }
        );
        const langFormat = new MarkdownTableFormatter(this.valueToString,
            { title: 'language', format: 'string' },
            { title: 'files', format: 'number' },
            { title: 'code', format: 'number' },
            { title: 'comment', format: 'number' },
            { title: 'blank', format: 'number' },
            { title: 'total', format: 'number' }
        );
        return [
            '## Languages',
            ...langFormat.headerLines,
            ...[...this.langResultTable.values()].sort((a, b) => b.code - a.code)
                .map(v => langFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            '',
            '## Directories',
            ...dirFormat.headerLines,
            ...[...this.dirResultTable.values()].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
                .map(v => dirFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
        ];
    }
    private toMarkdownDetailsLines() {
        const resultFormat = new MarkdownTableFormatter(this.valueToString,
            { title: 'filename', format: 'uri' },
            { title: 'language', format: 'string' },
            { title: 'code', format: 'number' },
            { title: 'comment', format: 'number' },
            { title: 'blank', format: 'number' },
            { title: 'total', format: 'number' }
        );
        return [
            '## Files',
            ...resultFormat.headerLines,
            ...this.results.sort((a, b) => a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0)
                .map(v => resultFormat.line(v.uri, v.language, v.code, v.comment, v.blank, v.total)),
        ];
    }
}


const mapToObject = <T>(map: Map<string, T>) => {
    const obj: { [key: string]: T } = {}
    map.forEach((v, id) => {
        obj[id] = v
    })
    return obj;
}
const objectToMap = <V>(obj: { [key: string]: V }): Map<string, V> => {
    return new Map<string, V>(Object.entries(obj));
}

const getOrSet = <K, V>(map: Map<K, V>, key: K, otherwise: () => V) => {
    let v = map.get(key);
    if (v === undefined) {
        v = otherwise();
        map.set(key, v);
    }
    return v;
}
