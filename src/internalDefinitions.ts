'use strict';
import { LanguageConf } from './LineCounterTable';

export const internalDefinitions: {[id:string]: Partial<LanguageConf>} = {
    cpp: {
        blockStrings: [['R("', '")']]
    },
    javascriptreact: {
        blockComments: [['{/*', '*/}']]
    },
    typescriptreact: {
        blockComments: [['{/*', '*/}']]
    },
};