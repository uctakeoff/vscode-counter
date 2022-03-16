'use strict';
import * as path from 'path';
import * as minimatch from 'minimatch';
import { LineCounter } from './LineCounter';

export type LanguageConf = {
    aliases: string[]
    filenames: string[]
    extensions: string[]
    lineComments: string[]
    blockComments: [string, string][]
    blockStrings: [string, string][]
}
const uniqueLanguageConf = (conf: LanguageConf) => {
    // console.log(`1langExtensions : `, conf);
    conf.aliases = [...new Set(conf.aliases)];
    conf.filenames = [...new Set(conf.filenames)];
    conf.extensions = [...new Set(conf.extensions)];
    conf.lineComments = [...new Set(conf.lineComments)];
    conf.blockComments = [...new Set(conf.blockComments)];
    conf.blockStrings = [...new Set(conf.blockStrings)];
    // console.log(`2langExtensions : `, conf);
};
export class LineCounterTable {
    private langIdTable: Map<string, LineCounter> = new Map();
    private aliasTable: Map<string, LineCounter> = new Map();
    private fileextRules: Map<string, LineCounter> = new Map();
    private filenameRules: Map<string, LineCounter> = new Map();

    constructor(private langExtensions: Map<string, LanguageConf>, private associations: [string, string][]) {
        // log(`associations : ${this.associations.length}\n[${this.associations.join("],[")}]`);
        this.langExtensions.forEach(v => uniqueLanguageConf(v));
        langExtensions.forEach((lang, id) => {
            const langName = lang.aliases.length > 0 ? lang.aliases[0] : id;
            const lineCounter = new LineCounter(langName, lang.lineComments, lang.blockComments, lang.blockStrings);
            lang.aliases.forEach(v => this.aliasTable.set(v, lineCounter));
            lang.extensions.forEach(v => this.fileextRules.set(v.startsWith('.') ? v : `.${v}`, lineCounter));
            lang.filenames.forEach(v => this.filenameRules.set(v, lineCounter));
        });
    }
    public entries = () => this.langExtensions;

    public getCounter(filePath: string, langId?: string) {
        // priority
        return this.getByAssociations(filePath)
            || this.filenameRules.get(path.basename(filePath))
            || this.getById(langId)
            || this.fileextRules.get(filePath)
            || this.fileextRules.get(path.extname(filePath))
            ;
    }

    private getById(langId?: string) {
        return !langId ? undefined : (this.langIdTable.get(langId) || this.aliasTable.get(langId));
    }
    private getByAssociations(filePath: string) {
        const patType = this.associations.find(([pattern,]) => minimatch(filePath, pattern, { matchBase: true }));
        // log(`## ${filePath}: ${patType}`);
        return (patType !== undefined) ? this.getById(patType[1]) : undefined;
    }
}