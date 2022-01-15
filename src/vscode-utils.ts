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

export const readTextFile = async (baseUri: vscode.Uri, path?: string) => {
    const uri = path ? buildUri(baseUri, path) : baseUri;
    const data = await vscode.workspace.fs.readFile(uri);
    log(`read ${uri} : ${data.length}B`);
    return decoderU8.decode(data);
}

export const readTextFiles = async (uris: vscode.Uri[]) => {
    const ret: { uri: vscode.Uri, data?: string, error?: any }[] = [];
    for (const uri of uris) {
        try {
            const data = await readTextFile(uri);
            ret.push({ uri, data });
        } catch (error: any) {
            log(`failed to read ${uri} : ${error}`);
            ret.push({ uri, error });
        }
    }
    return ret;
}

export const readJsonFile = async (baseUri: vscode.Uri, path?: string) => {
    const data = await readTextFile(baseUri, path);
    return JSONC.parse(data);
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
       await  vscode.commands.executeCommand("markdown.showPreview", uri);
    } else {
        await showTextFile(uri);
    }
}
export const writeTextFile = async (baseUri: vscode.Uri, path: string, text: string) => {
    const uri = buildUri(baseUri, path);
    // log(`writeTextFile : ${uri} ${text.length}B`);
    await vscode.workspace.fs.writeFile(uri, encoderU8.encode(text));
    return uri;
}
