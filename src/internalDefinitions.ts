'use strict';
import { LanguageConf } from './LineCounterTable';

export const internalDefinitions: { [id: string]: Partial<LanguageConf> } = {
    cpp: {
        blockStrings: [['R("', '")']],
    },
    javascriptreact: {
        blockStrings: [['`', '`']],
        blockComments: [['{/*', '*/}']],
    },
    typescriptreact: {
        blockStrings: [['`', '`']],
        blockComments: [['{/*', '*/}']],
    },
    bat: {
        lineComments: [
            '::',
            'REM',
            '@REM',
            'rem',
            '@rem',
        ]
    }
};