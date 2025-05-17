import * as path from 'path';
import { minimatch } from 'minimatch';
import { LineCounter } from './LineCounter';

export type LanguageConf = {
    aliases: string[];
    filenames: string[];
    extensions: string[];
    lineComments: string[];
    blockComments: [string, string][];
    blockStrings: [string, string][];
    lineStrings: [string, string][];
    blockStringAsComment?: boolean;
}
const uniqueLanguageConf = (conf: LanguageConf) => {
    // console.log(`1langExtensions : `, conf);
    conf.aliases = [...new Set(conf.aliases)];
    conf.filenames = [...new Set(conf.filenames)];
    conf.extensions = [...new Set(conf.extensions)];
    conf.lineComments = [...new Set(conf.lineComments)];
    conf.blockComments = [...new Map(conf.blockComments)];
    conf.blockStrings = [...new Map(conf.blockStrings)];
    conf.lineStrings = [...new Map(conf.lineStrings)];
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
            // console.log(id, lang);
            const lineCounter = new LineCounter(langName, lang.lineComments, lang.blockComments, lang.blockStrings, lang.lineStrings, lang.blockStringAsComment);
            lang.aliases.forEach(v => this.aliasTable.set(v, lineCounter));
            lang.extensions.forEach(v => this.fileextRules.set((v.startsWith('.') ? v : `.${v}`).toLowerCase(), lineCounter));
            lang.filenames.forEach(v => this.filenameRules.set(v.toLowerCase(), lineCounter));
        });
    }
    public entries = () => this.langExtensions;

    public getCounter(filePath: string, langId?: string) {
        const filePathL = filePath.toLowerCase();
        // priority
        return this.getByAssociations(filePathL)
            || this.filenameRules.get(path.basename(filePathL))
            || this.getById(langId)
            || this.fileextRules.get(filePathL)
            || this.fileextRules.get(path.extname(filePathL))
            ;
    }

    private getById(langId?: string) {
        return !langId ? undefined : (this.langIdTable.get(langId) || this.aliasTable.get(langId));
    }
    private getByAssociations(filePath: string) {
        const patType = this.associations.find(([pattern,]) => minimatch(filePath, pattern, { matchBase: true }));
        return (patType !== undefined) ? this.getById(patType[1]) : undefined;
    }
}