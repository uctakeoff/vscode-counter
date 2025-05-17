import { LanguageConf } from './LineCounterTable';

export const internalDefinitions: { [id: string]: Partial<LanguageConf> } = {
    cpp: {
        blockStrings: [['R("', '")']],
    },
    javascript: {
        blockStrings: [['`', '`']],
    },
    typescript: {
        blockStrings: [['`', '`']],
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
    },
    python: {
        blockStrings: [[ '"""', '"""' ]],
        blockStringAsComment: true,
    },
};