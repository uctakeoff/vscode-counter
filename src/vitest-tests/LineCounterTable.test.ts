import { describe, it, expect } from 'vitest';
import { LanguageConf, LineCounterTable, toStringPairs, toStrings } from '../LineCounterTable';

const languageConf = (conf: Partial<LanguageConf>): LanguageConf => ({
    aliases: [],
    filenames: [],
    extensions: [],
    lineComments: [],
    blockComments: [],
    blockStrings: [],
    lineStrings: [],
    ...conf,
});

describe('toStrings', () => {
    it('picks up strings only', () => {
        expect(toStrings('//')).toEqual(['//']);
        expect(toStrings(['//', '#'])).toEqual(['//', '#']);
        expect(toStrings(['//', null, 0, ['#']])).toEqual(['//']);
        expect(toStrings(undefined)).toEqual([]);
        expect(toStrings({ lineComment: '//' })).toEqual([]);
    });
});

describe('toStringPairs', () => {
    it('accepts a bare pair', () => {
        expect(toStringPairs(['<!--', '-->'])).toEqual([['<!--', '-->']]);
    });
    it('accepts an array of pairs', () => {
        expect(toStringPairs([['<!--', '-->'], ['{#', '#}']])).toEqual([['<!--', '-->'], ['{#', '#}']]);
    });
    it('flattens nested arrays', () => {
        expect(toStringPairs([[['<!--', '-->'], ['{#', '#}']]])).toEqual([['<!--', '-->'], ['{#', '#}']]);
    });
    it('drops malformed values', () => {
        expect(toStringPairs(undefined)).toEqual([]);
        expect(toStringPairs('<!--')).toEqual([]);
        expect(toStringPairs([['<!--'], [1, 2], { open: '{#', close: '#}' }])).toEqual([]);
    });
});

describe('LineCounterTable', () => {
    it('Bug : str.replace is not a function #119', () => {
        // `language-configuration.json` provided by other extensions does not always follow the type definition.
        const langs = new Map<string, LanguageConf>([
            ['jinja', languageConf({
                aliases: ['Jinja'],
                extensions: ['.jinja'],
                // `"blockComment": [["<!--", "-->"], ["{#", "#}"]]` is pushed as a single entry
                blockComments: [[['<!--', '-->'], ['{#', '#}']]] as unknown as [string, string][],
                lineStrings: [['"', '"']],
            })],
        ]);
        const counter = new LineCounterTable(langs, []).getCounter('template.jinja');
        expect(counter).toBeDefined();
        expect(counter?.count('{# comment #}\n<div>text</div>\n\n')).toEqual({ code: 1, comment: 1, blank: 1 });
    });

    it('ignores malformed language settings', () => {
        const langs = new Map<string, LanguageConf>([
            ['broken', languageConf({
                aliases: ['Broken', 1] as unknown as string[],
                extensions: ['.broken'],
                lineComments: '//' as unknown as string[],
                blockComments: [null, ['/*', '*/'], ['<!--']] as unknown as [string, string][],
                blockStrings: 'oops' as unknown as [string, string][],
            })],
        ]);
        const counter = new LineCounterTable(langs, []).getCounter('x.broken');
        expect(counter).toBeDefined();
        expect(counter?.count('// comment\n/* comment */\ncode();\n\n')).toEqual({ code: 1, comment: 2, blank: 1 });
    });
});
