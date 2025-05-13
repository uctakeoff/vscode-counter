import * as vscode from 'vscode';
import * as path from 'path';
import * as JSONC from 'jsonc-parser';
import { TextDecoder, TextEncoder } from 'util';

const log = (message: string, ...items: any[]) => console.log(`${new Date().toISOString()}   ${message}`, ...items);

export const compileTemplate = (template: string, variables: Record<string, string>) => {
    // ${xxx} or $$
    const regexp = /\$\{([^$\{\}]*)\}|(\$\$)/g;
    const ret: string[] = [];
    let startIndex = 0;
    let match;
    while ((match = regexp.exec(template)) !== null) {
        const s = template.substring(startIndex, regexp.lastIndex - match[0].length);
        startIndex = regexp.lastIndex;
        if (match[1]) {
            ret.push(s, variables[match[1]]);
        } else if (match[2]) {
            ret.push(s, '$');
        }
    }
    ret.push(template.substring(startIndex));
    return ret.join('');
};

export const currentWorkspaceFolder = async () => {
    const folders = vscode.workspace.workspaceFolders ?? [];
    if (folders.length === 1) {
        return folders[0];
    } else if (folders.length > 1) {
        const folder = await vscode.window.showWorkspaceFolderPick();
        if (folder) {return folder;}
    }
    throw Error('workspace not open.');
};

export const buildUri = (uri: vscode.Uri, ...uriOrPaths: string[]) => {
    return uriOrPaths.reduce((baseUri, uriOrPath) => {
        const u = vscode.Uri.parse(uriOrPath);
        // log(`[${baseUri}]+[${uriOrPath}](abs=${path.isAbsolute(uriOrPath)}) parse=[${u}], file=[${vscode.Uri.file(uriOrPath)}]`, u);
        return path.isAbsolute(uriOrPath) ? vscode.Uri.file(uriOrPath)
            : (!baseUri || uriOrPath.startsWith(u.scheme + '://')) ? vscode.Uri.file(uriOrPath)
                : vscode.Uri.joinPath(baseUri, uriOrPath);
    }, uri);
};
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

export const readUtf8File = async (uri: vscode.Uri): Promise<{ uri: vscode.Uri, data: string, error?: any }> => {
    try {
        const bin = await vscode.workspace.fs.readFile(uri);
        // log(`read ${uri} : ${bin.length}B`);
        const data = decoderU8.decode(bin);
        return { uri, data };
    } catch (error: any) {
        log(`readUtf8File(${uri}) failed. : ${error}`);
        return { uri, data: '', error };
    }
};

export const readUtf8Files = async (uris: vscode.Uri[]) => {
    const ret: { uri: vscode.Uri, data: string, error?: any }[] = [];
    for (const uri of uris) {
        ret.push(await readUtf8File(uri));
    }
    return ret;
};

export const checkJsonType = <T extends boolean | number | string | Array<any> | { [key: string]: any }>(json: any, defaultValue: T): T => {
    if (json === null || json === undefined) {return defaultValue;}
    const typeOfT = Array.isArray(defaultValue) ? 'array' : typeof defaultValue;
    const type = Array.isArray(json) ? 'array' : typeof json;
    if ((type === typeOfT) && ['object', 'number', 'boolean', 'string', 'array'].some(t => t === type)) {
        return json as T;
    }
    return defaultValue;
};

export const readJsonFile = async <T extends boolean | number | string | Array<any> | { [key: string]: any }>(uri: vscode.Uri, defaultValue: T): Promise<T> => {
    try {
        const text = await readUtf8File(uri);
        if (text.error) {return defaultValue;}
        const json = JSONC.parse(text.data);
        return checkJsonType(json, defaultValue);
    } catch (e: any) {
        log(`readJsonFile(${uri}) failed. : ${e}`);
    }
    return defaultValue;
};

export const showTextFile = async (uri: vscode.Uri) => {
    const doc = await vscode.workspace.openTextDocument(uri);
    return await vscode.window.showTextDocument(doc, vscode.ViewColumn.One, true);
};
export const showTextPreview = async (uri: vscode.Uri) => {
    if (uri.path.endsWith('.md')) {
        await vscode.commands.executeCommand("markdown.showPreview", uri);
    } else {
        await showTextFile(uri);
    }
};
export const writeTextFile = async (uri: vscode.Uri, text: string, option?: { recursive?: boolean }) => {
    if (option?.recursive) {
        await vscode.workspace.fs.createDirectory(dirUri(uri));
    }
    await vscode.workspace.fs.writeFile(uri, encoderU8.encode(text));
};
