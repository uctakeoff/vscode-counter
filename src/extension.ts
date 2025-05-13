// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { Count } from './LineCounter';
import { LanguageConf, LineCounterTable } from './LineCounterTable';
import Gitignore from './Gitignore';
import { buildUri, compileTemplate, createTextDecoder, currentWorkspaceFolder, dirUri, readJsonFile, readUtf8Files, showTextPreview, writeTextFile } from './vscode-utils';
import { internalDefinitions } from './internalDefinitions';

const EXTENSION_ID = 'uctakeoff.vscode-counter';
const EXTENSION_NAME = 'VSCodeCounter';
const CONFIGURATION_SECTION = 'VSCodeCounter';
const toZeroPadString = (num: number, fig: number) => num.toString().padStart(fig, '0');
const toLocalDateString = (date: Date, delims: [string, string, string] = ['-', ' ', ':']) => {
    return `${date.getFullYear()}${delims[0]}${toZeroPadString(date.getMonth() + 1, 2)}${delims[0]}${toZeroPadString(date.getDate(), 2)}${delims[1]}`
        + `${toZeroPadString(date.getHours(), 2)}${delims[2]}${toZeroPadString(date.getMinutes(), 2)}${delims[2]}${toZeroPadString(date.getSeconds(), 2)}`;
};
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
const registerCommand = (command: string, callback: (...args: any[]) => Promise<any>, thisArg?: any): vscode.Disposable => {
    return vscode.commands.registerCommand(`extension.vscode-counter.${command}`, async (...args) => {
        try {
            await callback(...args);
        } catch (e: any) {
            showError(`"${command}" failed.`, e.message);
        }
    }, thisArg);
};

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
        registerCommand('countInFile', () => codeCountController.toggleVisibleRealtimeCounter()),
        registerCommand('saveLanguageConfigurations', () => codeCountController.saveLanguageConfigurations()),
        registerCommand('outputAvailableLanguages', () => codeCountController.outputAvailableLanguages())
    );
};
// this method is called when your extension is deactivated
export const deactivate = () => { };

type LanguageLocation = 'global settings' | 'workspace settings' | 'output directory' | 'use languageConfUri';

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
        saveLocation: conf.get<string>('saveLocation', 'global settings') as LanguageLocation,
        outputDirectory: conf.get('outputDirectory', '.VSCodeCounter'),
        languageConfUri: conf.get('languageConfUri', ''),
        // include: `{${include.join(',')}}`,
        // exclude: `{${exclude.join(',')}}`,
        include: include.join(','),
        exclude: exclude.join(','),
        useGitignore: conf.get('useGitignore', true),

        encoding: confFiles.get('encoding', 'utf8'),
        associations: Object.entries(confFiles.get<{ [key: string]: string }>('associations', {})),

        maxOpenFiles: conf.get('maxOpenFiles', 500),
        maxFindFiles: conf.get('maxFindFiles', 1_000_000),
        ignoreUnsupportedFile: conf.get('ignoreUnsupportedFile', true),
        history: Math.max(1, conf.get('history', 5)),
        languages: conf.get<{ [key: string]: Partial<LanguageConf> }>('languages', {}),

        includeIncompleteLine: conf.get('includeIncompleteLine', false),
        endOfLine: conf.get('endOfLine', '\n'),
        printNumberWithCommas: conf.get('printNumberWithCommas', true),
        outputPreviewType: conf.get<string>('outputPreviewType', ''),
        outputAsText: conf.get('outputAsText', true),
        outputAsCSV: conf.get('outputAsCSV', true),
        outputAsMarkdown: conf.get('outputAsMarkdown', true),
        countDirectLevelFiles: conf.get('countDirectLevelFiles', true),
    };
};
type Config = ReturnType<typeof loadConfig>;

const pathBasedName = (uri: vscode.Uri) => {
    const path = (uri.scheme === 'file') ? uri.fsPath : uri.toString();
    // return path.replace(/[^\w\-~\.]+/g, '-');
    return path.replace(/[:\/\\?#\[\]\@]+/g, '-');
};
class CodeCounterController {
    private codeCounter_: LineCounterTable | null = null;
    private statusBarItem: vscode.StatusBarItem | null = null;
    private outputChannel: vscode.OutputChannel | null = null;
    private disposable: vscode.Disposable;
    private conf: Config;
    private async getWorkDirs() {
        const workDir = await currentWorkspaceFolder();
        const v = {
            workspaceName: workDir.name,
            workspacePath: pathBasedName(workDir.uri),
            workspaceIndex: workDir.index.toString(),
        };
        const dir = compileTemplate(this.conf.outputDirectory, v);
        const outputDir = buildUri(workDir.uri, dir);
        log(`OutDir: "${this.conf.outputDirectory}"->"${dir}"`, v);
        return { workDir, outputDir };
    }
    private async getLangageConfUri() {
        const { workDir, outputDir } = await this.getWorkDirs();
        switch (this.conf.saveLocation) {
            case "output directory":
                return vscode.Uri.joinPath(outputDir, 'languages.json');
            case "use languageConfUri":
                return buildUri(workDir.uri, this.conf.languageConfUri);
            case "global settings":
            case "workspace settings":
            default: break;
        }
        return undefined;
    }
    private async getRealtimeCounterStateFileUri() {
        const { outputDir } = await this.getWorkDirs();
        return vscode.Uri.joinPath(outputDir, '.VSCodeCounterCountRealtime');
    }

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

        this.getRealtimeCounterStateFileUri()
            .then((uri) => vscode.workspace.fs.stat(uri))
            .then(() => this.toggleVisibleRealtimeCounter(), log);
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
        // log(`onDidChangeActiveTextEditor(${e?.document.uri})`);
        this.countLinesInEditor(e);
    }
    private onDidChangeTextEditorSelection(e: vscode.TextEditorSelectionChangeEvent) {
        // log(`onDidChangeTextEditorSelection(${e.selections.length}selections, ${e.selections[0].isEmpty} )`, e.selections[0]);
        this.countLinesInEditor(e.textEditor);
    }
    private onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent) {
        // log(`onDidChangeTextDocument(${e.document.uri})`);
        this.countLinesOfFile(e.document);
    }
    private onDidChangeConfiguration() {
        // log(`onDidChangeConfiguration()`);
        this.codeCounter_ = null;
        this.conf = loadConfig();
        this.countLinesInEditor(vscode.window.activeTextEditor);
    }
    public async toggleVisibleRealtimeCounter() {
        const uri = await this.getRealtimeCounterStateFileUri();
        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100000);
            this.countLinesInEditor(vscode.window.activeTextEditor);
            await writeTextFile(uri, '', { recursive: true });
        } else {
            this.statusBarItem.dispose();
            this.statusBarItem = null;
            await vscode.workspace.fs.delete(uri);
        }
    }

    private async getCodeCounter() {
        if (this.codeCounter_) {
            return this.codeCounter_;
        }
        const langs = new Map<string, LanguageConf>();
        appendAll(langs, internalDefinitions);
        appendAll(langs, await this.loadLanguageConfigurations());

        log(`load Language Settings = ${langs.size}`);
        await collectLanguageConfigurations(langs);
        log(`collect Language Settings = ${langs.size}`);
        this.codeCounter_ = new LineCounterTable(langs, this.conf.associations);
        return this.codeCounter_;
    }
    public async loadLanguageConfigurations(): Promise<{ [key: string]: Partial<LanguageConf> }> {
        try {
            switch (this.conf.saveLocation) {
                case "global settings":
                case "workspace settings":
                    return this.conf.languages;
                default:
                    const uri = await this.getLangageConfUri();
                    log(`Language Settings File: ${uri}`);
                    if (uri) {return await readJsonFile<{ [key: string]: Partial<LanguageConf> }>(uri, {});}
            }
        } catch (e: any) {
            showError(`loadLanguageConfigurations failed. ${e.message}`);
        }
        return {};
    }

    public async saveLanguageConfigurations() {
        const c = await this.getCodeCounter();
        const langs = mapToObject(c.entries());
        switch (this.conf.saveLocation) {
            case "global settings":
                return this.conf.configuration.update('languages', langs, vscode.ConfigurationTarget.Global);
            case "workspace settings":
                return this.conf.configuration.update('languages', langs, vscode.ConfigurationTarget.Workspace);
            default:
                const uri = await this.getLangageConfUri();
                log(`Language Settings File: ${uri}`);
                if (uri) {return writeTextFile(uri, JSON.stringify(langs), { recursive: true });}
        }
    }

    public async outputAvailableLanguages() {
        const c = await this.getCodeCounter();
        c.entries().forEach((lang, id) => {
            this.toOutputChannel(`${id} : aliases[${lang.aliases}], extensions[${lang.extensions}], filenames:[${lang.filenames}]`);
        });
        this.toOutputChannel(`VS Code Counter : available all ${c.entries().size} languages.`);
    }

    public async countLinesInDirectory(targetDir: vscode.Uri | undefined) {
        const { workDir, outputDir } = await this.getWorkDirs();
        if (targetDir) {
            await this.countLinesInDirectory_(targetDir, outputDir);
        } else {
            const option = {
                value: workDir.uri.toString(true),
                placeHolder: "Input Directory Path",
                prompt: "Input Directory Path. "
            };
            const uri = await vscode.window.showInputBox(option);
            if (uri) {
                await this.countLinesInDirectory_(vscode.Uri.parse(uri), outputDir);
            }
        }
    }
    public async countLinesInWorkSpace() {
        const { workDir, outputDir } = await this.getWorkDirs();
        await this.countLinesInDirectory_(workDir.uri, outputDir);
    }
    private async countLinesInDirectory_(targetUri: vscode.Uri, outputDir: vscode.Uri) {
        const date = new Date();
        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        try {
            statusBar.show();
            statusBar.text = `VSCodeCounter: Preparing...`;

            log(`include : "${this.conf.include}"`);
            log(`exclude : "${this.conf.exclude}"`);
            const files = await vscode.workspace.findFiles(
                `{${this.conf.include}}`,
                `{${this.conf.exclude},${vscode.workspace.asRelativePath(outputDir)}}`,
                this.conf.maxFindFiles);
            let targetFiles = files.filter(uri => !path.relative(targetUri.path, uri.path).startsWith(".."));
            if (this.conf.useGitignore) {
                log(`target : ${targetFiles.length} files -> use .gitignore`);
                const gitignores = await loadGitIgnore(this.conf.maxFindFiles);
                targetFiles = targetFiles.filter(p => gitignores.excludes(p.fsPath));
            }

            const counter = await this.getCodeCounter();
            const results = await countLines(counter, targetFiles, {
                maxOpenFiles: this.conf.maxOpenFiles,
                fileEncoding: this.conf.encoding,
                ignoreUnsupportedFile: this.conf.ignoreUnsupportedFile,
                includeIncompleteLine: this.conf.includeIncompleteLine,
                showStatus: (msg: string) => statusBar.text = `VSCodeCounter: ${msg}`
            });
            if (results.length <= 0) {
                throw Error(`There was no target file.`);
            }
            statusBar.text = `VSCodeCounter: Totaling...`;

            await vscode.workspace.fs.createDirectory(outputDir);
            const regex = /^\d\d\d\d-\d\d-\d\d\_\d\d-\d\d-\d\d$/;
            const histories = (await vscode.workspace.fs.readDirectory(outputDir))
                .filter(d => ((d[1] & vscode.FileType.Directory) !== 0) && regex.test(d[0]))
                .map(d => d[0])
                .sort()
                .map(d => vscode.Uri.joinPath(outputDir, d));

            const outSubdir = vscode.Uri.joinPath(outputDir, toLocalDateString(date, ['-', '_', '-']));
            await outputResults(date, targetUri, results, outSubdir, histories[histories.length - 1], this.conf);

            if (histories.length >= this.conf.history) {
                histories.length -= this.conf.history - 1;
                histories.forEach(dir => vscode.workspace.fs.delete(dir, { recursive: true }));
            }
        } finally {
            log(`finished. ${(new Date().getTime() - date.getTime())}ms`);
            statusBar.dispose();
        }
    }
    private async countLinesInEditor(editor: vscode.TextEditor | undefined) {
        return this.countLinesOfFile(editor?.document, editor?.selections);
    }
    private async countLinesOfFile(doc: vscode.TextDocument | undefined, selections?: readonly vscode.Selection[]) {
        const c = await this.getCodeCounter();
        const lineCounter = doc ? c.getCounter(doc.uri.fsPath, doc.languageId) : undefined;
        if (!this.statusBarItem) {return;}
        let text: string | undefined;
        if (doc && lineCounter) {
            if (!selections || selections.length <= 0 || selections[0].isEmpty) {
                const result = lineCounter?.count(doc.getText(), this.conf.includeIncompleteLine);
                text = `Code: ${result.code} Comment: ${result.comment} Blank: ${result.blank}`;
            } else {
                const result = selections
                    .map(s => lineCounter.count(doc.getText(s), true))
                    .reduce((prev, cur) => prev.add(cur), new Count());
                text = `Selected Code: ${result.code} Comment: ${result.comment} Blank: ${result.blank}`;
            }
        }
        this.statusBarItem.show();
        this.statusBarItem.text = text ?? `${EXTENSION_NAME}: Unsupported`;
    }

    private toOutputChannel(text: string) {
        if (!this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);
        }
        this.outputChannel.show();
        this.outputChannel.appendLine(text);
    }
}


const loadGitIgnore = async (maxFindFiles?: number) => {
    const gitignoreFiles = await vscode.workspace.findFiles('**/.gitignore', '', maxFindFiles);
    gitignoreFiles.forEach(f => log(`use gitignore : ${f}`));
    const values = await readUtf8Files(gitignoreFiles.sort());
    return new Gitignore('').merge(...values.map(p => new Gitignore(p.data, dirUri(p.uri).fsPath)));
};
type CountLineOption = {
    maxOpenFiles: number;
    fileEncoding: string;
    ignoreUnsupportedFile?: boolean;
    includeIncompleteLine?: boolean;
    showStatus?: (text: string) => void;
};
const countLines = (lineCounterTable: LineCounterTable, fileUris: vscode.Uri[], option: CountLineOption) => {
    log(`countLines : target ${fileUris.length} files`);
    return new Promise(async (resolve: (value: Result[]) => void, reject: (reason: string) => void) => {
        const results: Result[] = [];
        if (fileUris.length <= 0) {
            resolve(results);
        }
        const decoder = createTextDecoder(option.fileEncoding);
        const totalFiles = fileUris.length;
        let fileCount = 0;
        const onFinish = () => {
            ++fileCount;
            if (fileCount === totalFiles) {
                log(`count finished : total:${totalFiles} valid:${results.length}`);
                resolve(results);
            }
        };
        for (let i = 0; i < totalFiles; ++i) {
            const fileUri = fileUris[i];
            const lineCounter = lineCounterTable.getCounter(fileUri.fsPath);
            if (lineCounter) {
                while ((i - fileCount) >= option.maxOpenFiles) {
                    // log(`sleep : total:${totalFiles} current:${i} finished:${fileCount} valid:${results.length}`);
                    option.showStatus?.(`${fileCount}/${totalFiles}`);
                    await sleep(50);
                }

                vscode.workspace.fs.readFile(fileUri).then(data => {
                    try {
                        results.push(new Result(fileUri, lineCounter.name, lineCounter.count(decoder.decode(data), option.includeIncompleteLine)));
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
                if (!option.ignoreUnsupportedFile) {
                    results.push(new Result(fileUri, '(Unsupported)'));
                }
                onFinish();
            }
        }
    });
};

type VscodeLanguage = {
    id: string;
    aliases?: string[];
    filenames?: string[];
    extensions?: string[];
    configuration?: string;
};
type VscodeLanguageConfiguration = Omit<vscode.LanguageConfiguration, 'autoClosingPairs'> & {
    autoClosingPairs?: ({
        open?: string;
        close?: string;
        notIn?: string[];
    } | vscode.CharacterPair)[];
};

const append = (langs: Map<string, LanguageConf>, id: string, value: Partial<LanguageConf>) => {
    const langExt = getOrSet(langs, id, (): LanguageConf => {
        return {
            aliases: [],
            filenames: [],
            extensions: [],
            lineComments: [],
            blockComments: [],
            blockStrings: [],
            lineStrings: [],
        };
    });
    langExt.aliases.push(...(value.aliases ?? []));
    langExt.filenames.push(...(value.filenames ?? []));
    langExt.extensions.push(...(value.extensions ?? []));
    langExt.lineComments.push(...(value.lineComments ?? []));
    langExt.blockComments.push(...(value.blockComments ?? []));
    langExt.blockStrings.push(...(value.blockStrings ?? []));
    langExt.lineStrings.push(...(value.lineStrings ?? []));
    return langExt;
};
const appendAll = (langs: Map<string, LanguageConf>, defs: { [id: string]: Partial<LanguageConf> }) => {
    Object.entries(defs).forEach(v => append(langs, v[0], v[1]));
};

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
                    totalCount += languages.length;
                    languages.forEach(async (l) => {
                        try {
                            const langExt = append(langs, l.id, l);
                            if (l.configuration) {
                                const confUrl = vscode.Uri.file(path.join(ex.extensionPath, l.configuration));
                                const langConf = await readJsonFile<VscodeLanguageConfiguration>(confUrl, {});
                                // log(`"${confUrl.fsPath}" :${l.id}\n aliases:${l.aliases}\n extensions:${l.extensions}\n filenames:${l.filenames}`, l);
                                if (langConf.comments) {
                                    if (langConf.comments.lineComment) {
                                        langExt.lineComments.push(langConf.comments.lineComment);
                                    }
                                    if (langConf.comments.blockComment && langConf.comments.blockComment.length >= 2) {
                                        langExt.blockComments.push(langConf.comments.blockComment);
                                    }
                                }
                                if (langConf.autoClosingPairs) {
                                    const maybeString = langConf.autoClosingPairs
                                        .map(v => Array.isArray(v) ? v : [v.open, v.close])
                                        .filter((v): v is [string, string] => v && typeof v[0] === 'string' && typeof v[1] === 'string' && !'[{('.includes(v[0]));
                                    // log(`${l.id}`, langConf.autoClosingPairs, maybeString);
                                    langExt.lineStrings.push(...maybeString);
                                }
                            }
                        } catch (reason: any) {
                            log(`error ${reason}`);
                        } finally {
                            if (++finishedCount >= totalCount) {
                                resolve(langs);
                            }
                        }
                    });
                }
            });
        }
    });
};


const previewFiles = new Map<string, string>([
    ['text', 'results.txt'],
    ['diff-text', 'diff.txt'],
    ['csv', 'results.csv'],
    ['diff-csv', 'diff.csv'],
    ['markdown', 'results.md'],
    ['diff-markdown', 'diff.md'],
]);
const outputResults = async (date: Date, targetDirUri: vscode.Uri, results: Result[], outputDir: vscode.Uri, prevOutputDir: vscode.Uri | undefined, conf: Config) => {
    await vscode.workspace.fs.createDirectory(outputDir);
    writeTextFile(vscode.Uri.joinPath(outputDir, `results.json`), resultsToJson(results));

    const resultTable = new ResultFormatter(targetDirUri, results, conf);
    log(`OutputDir : ${outputDir}, count ${results.length} files`);

    const diffs: Result[] = [];
    if (prevOutputDir) {
        try {
            const prevResults = await readJsonFile<{ [uri: string]: Count & { language: string } }>(vscode.Uri.joinPath(prevOutputDir, 'results.json'), {});
            log(`Previous OutputDir : ${prevOutputDir}, count ${Object.keys(prevResults).length} files`);
            results.forEach(r => {
                const p = prevResults[r.uri.toString()];
                delete prevResults[r.uri.toString()];
                const diff = p ? r.clone().sub(p) : r;
                if (!diff.isEmpty) {
                    diffs.push(diff);
                }
            });
            log(` removed ${Object.keys(prevResults).length} files`);
            Object.entries(prevResults).forEach(v => {
                const diff = new Result(vscode.Uri.parse(v[0]), v[1].language, new Count().sub(v[1]));
                if (!diff.isEmpty) {
                    diffs.push(diff);
                }
            });
        } catch (e: any) {
            log(`failed to access previous "results.json"`);
            diffs.length = 0;
        }
    }
    const diffTable = new ResultFormatter(targetDirUri, diffs, conf);

    if (conf.outputAsText) {
        await writeTextFile(vscode.Uri.joinPath(outputDir, 'results.txt'), resultTable.toTextLines(date));
        await writeTextFile(vscode.Uri.joinPath(outputDir, 'diff.txt'), diffTable.toTextLines(date));
    }
    if (conf.outputAsCSV) {
        await writeTextFile(vscode.Uri.joinPath(outputDir, 'results.csv'), resultTable.toCSVLines());
        await writeTextFile(vscode.Uri.joinPath(outputDir, 'diff.csv'), diffTable.toCSVLines());
    }
    if (conf.outputAsMarkdown) {
        const mds = [
            { title: 'Summary', path: 'results.md', table: resultTable, detail: false },
            { title: 'Details', path: 'details.md', table: resultTable, detail: true },
            { title: 'Diff Summary', path: 'diff.md', table: diffTable, detail: false },
            { title: 'Diff Details', path: 'diff-details.md', table: diffTable, detail: true },
        ];
        await Promise.all(mds.map(({ title, path, table, detail }, index) => {
            return writeTextFile(vscode.Uri.joinPath(outputDir, path), table.toMarkdown(date, title, detail, mds.map((f, i) => [f.title, i === index ? undefined : f.path])));
        }));
    }
    const previewFile = previewFiles.get(conf.outputPreviewType);
    if (previewFile) {
        showTextPreview(vscode.Uri.joinPath(outputDir, previewFile));
    }
};

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
};
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

const escapeMarkdown = (text: string): string => text.replace(/([\\`*_\[\]])/g, '\\$1');

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
            return `[${escapeMarkdown(relativePath)}](/${encodeURI(relativePath)})`;
        }).join(' | ') + ' |';
    }
}

const stringCompare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
const nameCompare = <T extends { name: string }>(a: T, b: T) => stringCompare(a.name, b.name);
const filenameCompare = <T extends { filename: string }>(a: T, b: T) => stringCompare(a.filename, b.filename);

class ResultFormatter {
    private dirResultTable = new Map<string, Statistics>();
    private langResultTable = new Map<string, Statistics>();
    private total = new Statistics('Total');
    private endOfLine: string;
    private valueToString: (obj: any) => string;

    constructor(private targetDirUri: vscode.Uri, private results: Result[], conf: { countDirectLevelFiles: boolean, endOfLine: string, printNumberWithCommas: boolean }) {
        this.endOfLine = conf.endOfLine;
        this.valueToString = conf.printNumberWithCommas ? toStringWithCommas : (obj: any) => obj.toString();

        const directLevelResultTable = new Map<string, Statistics>();
        results.forEach((result) => {
            let parent = path.dirname(path.relative(this.targetDirUri.fsPath, result.filename));
            getOrSet(directLevelResultTable, parent, () => new Statistics(parent + " (Files)")).add(result);
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
        if (conf.countDirectLevelFiles) {
            [...directLevelResultTable.entries()].filter(([key, value]) => {
                log(`  dir[${value.name}] total=${value.total}  ${(this.dirResultTable.get(key)?.total ?? 0)}`);
                return value.total !== (this.dirResultTable.get(key)?.total ?? 0);
            }).forEach(([, value]) => this.dirResultTable.set(value.name, value));
        }
    }
    toCSVLines() {
        const languages = [...this.langResultTable.keys()];
        return [
            `"filename", "language", "${languages.join('", "')}", "comment", "blank", "total"`,
            ...this.results.sort(filenameCompare)
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
            ...[...this.dirResultTable.values()].sort(nameCompare)
                .map(v => dirFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            ...dirFormat.footerLines,
            '',
            'Files',
            ...resultFormat.headerLines,
            ...this.results.sort(filenameCompare)
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
            `Directory ${this.targetDirUri.fsPath.replace(/\\/g, '\\\\')}`,
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
            ...[...this.dirResultTable.values()].sort(nameCompare)
                .map(v => dirFormat.line(v.name.replace(/\\/g, '\\\\'), v.files, v.code, v.comment, v.blank, v.total)),
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
            ...this.results.sort(filenameCompare)
                .map(v => resultFormat.line(v.uri, v.language, v.code, v.comment, v.blank, v.total)),
        ];
    }
}


const mapToObject = <T>(map: Map<string, T>) => {
    const obj: { [key: string]: T } = {};
    map.forEach((v, id) => {
        obj[id] = v;
    });
    return obj;
};

const getOrSet = <K, V>(map: Map<K, V>, key: K, otherwise: () => V) => {
    let v = map.get(key);
    if (v === undefined) {
        v = otherwise();
        map.set(key, v);
    }
    return v;
};
