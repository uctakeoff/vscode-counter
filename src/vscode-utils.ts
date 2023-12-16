import * as vscode from 'vscode';
import * as path from 'path';
import * as JSONC from 'jsonc-parser';
import { TextDecoder, TextEncoder } from 'util';

const log = (message: string, ...items: any[]) => console.log(`${new Date().toISOString()}   ${message}`, ...items);

export const currentWorkspaceFolder = async () => {
    const folders = vscode.workspace.workspaceFolders ?? [];
    if (folders.length === 1) {
        return folders[0];
    } else if (folders.length > 1) {
        const folder = await vscode.window.showWorkspaceFolderPick();
        if (folder) return folder;
    }
    throw Error('workspace not open.');
}

export const buildUri = (uri: vscode.Uri, ...names: string[]) => uri.with({ path: `${uri.path}/${names.join('/')}` });
export const dirUri = (uri: vscode.Uri) => uri.with({ path: path.dirname(uri.path) });
export const parseUriOrFile = (uriOrFileath: string, baseUri?: vscode.Uri) => {
    const u = vscode.Uri.parse(uriOrFileath);
    // log(uriOrFileath, u.toString(), path.isAbsolute(uriOrFileath), baseUri?.toString(), buildUri(baseUri??u, uriOrFileath).fsPath, (!baseUri || path.isAbsolute(uriOrFileath)));
    return uriOrFileath.startsWith(u.scheme + ':/') ? u 
        : (!baseUri || path.isAbsolute(uriOrFileath)) ? vscode.Uri.file(uriOrFileath)
        : buildUri(baseUri, uriOrFileath);
}
const decoderU8 = new TextDecoder('utf8');
const encoderU8 = new TextEncoder();

const vscodeEncodingTable = new Map<string, string>([
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

export const createTextDecoder = (vscodeTextEncoding: string) => new TextDecoder(vscodeEncodingTable.get(vscodeTextEncoding) || vscodeTextEncoding);

export const readUtf8File = async (baseUri: vscode.Uri, path?: string): Promise<{ uri: vscode.Uri, data: string, error?: any }> => {
    const uri = path ? buildUri(baseUri, path) : baseUri;
    try {
        const bin = await vscode.workspace.fs.readFile(uri);
        // log(`read ${uri} : ${bin.length}B`);
        const data = decoderU8.decode(bin);
        return {uri, data};
    } catch (error: any) {
        log(`readUtf8File(${baseUri}, ${path}) failed. : ${error}`);
        return { uri, data: '', error };
    }
}

export const readUtf8Files = async (uris: vscode.Uri[]) => {
    const ret: { uri: vscode.Uri, data: string, error?: any }[] = [];
    for (const uri of uris) {
        ret.push(await readUtf8File(uri));
    }
    return ret;
}

export const checkJsonType = <T extends boolean | number | string | Array<any> | { [key: string]: any }>(json: any, defaultValue: T): T => {
    if (json === null || json === undefined) return defaultValue;
    const typeOfT = Array.isArray(defaultValue) ? 'array' : typeof defaultValue;
    const type = Array.isArray(json) ? 'array' : typeof json;
    if ((type === typeOfT) && ['object', 'number', 'boolean', 'string', 'array'].some(t => t === type)) {
        return json as T;
    }
    return defaultValue;
}

export const readJsonFile = async <T extends boolean | number | string | Array<any> | { [key: string]: any }>(baseUri: vscode.Uri, path: string | undefined, defaultValue: T): Promise<T> => {
    try {
        const text = await readUtf8File(baseUri, path);
        if (text.error) return defaultValue;
        const json = JSONC.parse(text.data);
        return checkJsonType(json, defaultValue);
    } catch (e: any) {
        log(`readJsonFile(${baseUri}, ${path}) failed. : ${e}`);
    }
    return defaultValue;
}

const makeDirectories_ = (dirpath: vscode.Uri, resolve: () => void, reject: (reason: string) => void) => {
    // log(`makeDirectories(${dirpath})`);
    vscode.workspace.fs.stat(dirpath).then((fileStat) => {
        if ((fileStat.type & vscode.FileType.Directory) != 0) {
            resolve();
        } else {
            reject(`${dirpath} is not directory.`);
        }
    }, (reason) => {
        // log(`vscode.workspace.fs.stat failed: ${reason}`);
        const curPath = dirpath.path;
        const parent = path.dirname(curPath);
        if (parent !== curPath) {
            makeDirectories_(dirpath.with({ path: parent }), () => {
                log(`createDirectory ${dirpath}`);
                vscode.workspace.fs.createDirectory(dirpath).then(resolve, reject);
            }, reject);
        } else {
            reject(reason);
        }
    });
}
export const makeDirectories = (dirpath: vscode.Uri): Promise<void> => {
    return new Promise((resolve: () => void, reject: (reason: string) => void) => makeDirectories_(dirpath, resolve, reject));
}
export const showTextFile = async (uri: vscode.Uri) => {
    const doc = await vscode.workspace.openTextDocument(uri);
    return await vscode.window.showTextDocument(doc, vscode.ViewColumn.One, true);
}
export const showTextPreview = async (uri: vscode.Uri) => {
    if (uri.path.endsWith('.md')) {
        await vscode.commands.executeCommand("markdown.showPreview", uri);
    } else {
        await showTextFile(uri);
    }
}
export const writeTextFile = async (uri: vscode.Uri, text: string, option?: {recursive?: boolean}) => {
    if (option?.recursive) {
        await makeDirectories(dirUri(uri));
    }
    // log(`writeTextFile : ${uri} ${text.length}B`);
    await vscode.workspace.fs.writeFile(uri, encoderU8.encode(text));
    return uri;
}
