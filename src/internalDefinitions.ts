import { LanguageConf } from './LineCounterTable';

export const internalDefinitions: { [id: string]: Partial<LanguageConf> } = {
    cpp: {
        aliases: [
            'C++',
            'Cpp',
            'cpp'
        ],
        filenames: [],
        extensions: [
            '.cpp',
            '.cppm',
            '.cc',
            '.ccm',
            '.cxx',
            '.cxxm',
            '.c++',
            '.c++m',
            '.hpp',
            '.hh',
            '.hxx',
            '.h++',
            '.h',
            '.ii',
            '.ino',
            '.inl',
            '.ipp',
            '.ixx',
            '.tpp',
            '.txx',
            '.hpp.in',
            '.h.in'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                'R("',
                '")'
            ]
        ],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    javascript: {
        aliases: [
            'JavaScript',
            'javascript',
            'js'
        ],
        filenames: [
            'jakefile'
        ],
        extensions: [
            '.js',
            '.es6',
            '.mjs',
            '.cjs',
            '.pac'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                '`',
                '`'
            ]
        ],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    typescript: {
        aliases: [
            'TypeScript',
            'ts',
            'typescript'
        ],
        filenames: [],
        extensions: [
            '.ts',
            '.cts',
            '.mts'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                '`',
                '`'
            ]
        ],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    javascriptreact: {
        aliases: [
            'JavaScript JSX',
            'JavaScript React',
            'jsx'
        ],
        filenames: [],
        extensions: [
            '.jsx'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '{/*',
                '*/}'
            ],
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                '`',
                '`'
            ]
        ],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    typescriptreact: {
        aliases: [
            'TypeScript JSX',
            'TypeScript React',
            'tsx'
        ],
        filenames: [],
        extensions: [
            '.tsx'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '{/*',
                '*/}'
            ],
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                '`',
                '`'
            ]
        ],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    bat: {
        aliases: [
            'Batch',
            'bat'
        ],
        filenames: [],
        extensions: [
            '.bat',
            '.cmd'
        ],
        lineComments: [
            '::',
            'REM',
            '@REM',
            'rem',
            '@rem'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    python: {
        aliases: [
            'Python',
            'py'
        ],
        filenames: [
            'SConstruct',
            'SConscript'
        ],
        extensions: [
            '.py',
            '.rpy',
            '.pyw',
            '.cpy',
            '.gyp',
            '.gypi',
            '.pyi',
            '.ipy',
            '.pyt'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [
            [
                '"""',
                '"""'
            ]
        ],
        blockStrings: [
            [
                '"""',
                '"""'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                'r"',
                '"'
            ],
            [
                'R"',
                '"'
            ],
            [
                'u"',
                '"'
            ],
            [
                'U"',
                '"'
            ],
            [
                'f"',
                '"'
            ],
            [
                'F"',
                '"'
            ],
            [
                'b"',
                '"'
            ],
            [
                'B"',
                '"'
            ],
            [
                "'",
                "'"
            ],
            [
                "r'",
                "'"
            ],
            [
                "R'",
                "'"
            ],
            [
                "u'",
                "'"
            ],
            [
                "U'",
                "'"
            ],
            [
                "f'",
                "'"
            ],
            [
                "F'",
                "'"
            ],
            [
                "b'",
                "'"
            ],
            [
                "B'",
                "'"
            ],
            [
                '`',
                '`'
            ]
        ],
        blockStringAsComment: true
    },
    clojure: {
        aliases: [
            'Clojure',
            'clojure'
        ],
        filenames: [],
        extensions: [
            '.clj',
            '.cljs',
            '.cljc',
            '.cljx',
            '.clojure',
            '.edn'
        ],
        lineComments: [
            ';;'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    coffeescript: {
        aliases: [
            'CoffeeScript',
            'coffeescript',
            'coffee'
        ],
        filenames: [],
        extensions: [
            '.coffee',
            '.cson',
            '.iced'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [
            [
                '###',
                '###'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    jsonc: {
        aliases: [
            'JSON with Comments'
        ],
        filenames: [
            'settings.json',
            'launch.json',
            'tasks.json',
            'mcp.json',
            'keybindings.json',
            'extensions.json',
            'argv.json',
            'profiles.json',
            'devcontainer.json',
            '.devcontainer.json',
            'babel.config.json',
            'bun.lock',
            '.babelrc.json',
            '.ember-cli',
            'typedoc.json',
            'tsconfig.json',
            'jsconfig.json',
            '.eslintrc.json'
        ],
        extensions: [
            '.code-workspace',
            'language-configuration.json',
            'icon-theme.json',
            'color-theme.json',
            '.jsonc',
            '.eslintrc',
            '.eslintrc.json',
            '.jsfmtrc',
            '.jshintrc',
            '.swcrc',
            '.hintrc',
            '.babelrc'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ],
            [
                '`',
                '`'
            ]
        ]
    },
    json: {
        aliases: [
            'JSON',
            'json'
        ],
        filenames: [
            'composer.lock',
            '.watchmanconfig'
        ],
        extensions: [
            '.code-profile',
            '.json',
            '.bowerrc',
            '.jscsrc',
            '.webmanifest',
            '.js.map',
            '.css.map',
            '.ts.map',
            '.har',
            '.jslintrc',
            '.jsonld',
            '.geojson',
            '.ipynb',
            '.vuerc',
            '.tsbuildinfo'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ],
            [
                '`',
                '`'
            ]
        ]
    },
    c: {
        aliases: [
            'C',
            'c'
        ],
        filenames: [],
        extensions: [
            '.c',
            '.i'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    'cuda-cpp': {
        aliases: [
            'CUDA C++'
        ],
        filenames: [],
        extensions: [
            '.cu',
            '.cuh'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    csharp: {
        aliases: [
            'C#',
            'csharp'
        ],
        filenames: [],
        extensions: [
            '.cs',
            '.csx',
            '.cake'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    css: {
        aliases: [
            'CSS',
            'css'
        ],
        filenames: [],
        extensions: [
            '.css'
        ],
        lineComments: [],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    dart: {
        aliases: [
            'Dart'
        ],
        filenames: [],
        extensions: [
            '.dart'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ],
            [
                '`',
                '`'
            ]
        ]
    },
    diff: {
        aliases: [
            'Diff',
            'diff'
        ],
        filenames: [],
        extensions: [
            '.diff',
            '.patch',
            '.rej'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [
            [
                '#',
                ' '
            ]
        ],
        blockStrings: [],
        lineStrings: []
    },
    dockerfile: {
        aliases: [
            'Docker',
            'Dockerfile',
            'Containerfile'
        ],
        filenames: [
            'Dockerfile',
            'Containerfile'
        ],
        extensions: [
            '.dockerfile',
            '.containerfile'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    ignore: {
        aliases: [
            'Ignore',
            'ignore'
        ],
        filenames: [
            '.vscodeignore'
        ],
        extensions: [
            '.gitignore_global',
            '.gitignore',
            '.git-blame-ignore-revs',
            '.npmignore',
            '.eslintignore'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ],
            [
                '`',
                '`'
            ],
            [
                '/**',
                ' */'
            ]
        ]
    },
    fsharp: {
        aliases: [
            'F#',
            'FSharp',
            'fsharp'
        ],
        filenames: [],
        extensions: [
            '.fs',
            '.fsi',
            '.fsx',
            '.fsscript'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '(*',
                '*)'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    'git-commit': {
        aliases: [
            'Git Commit Message',
            'git-commit'
        ],
        filenames: [
            'COMMIT_EDITMSG',
            'MERGE_MSG'
        ],
        extensions: [],
        lineComments: [
            '#'
        ],
        blockComments: [
            [
                '#',
                ' '
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ],
            [
                '`',
                '`'
            ],
            [
                '/**',
                ' */'
            ]
        ]
    },
    'git-rebase': {
        aliases: [
            'Git Rebase Message',
            'git-rebase'
        ],
        filenames: [
            'git-rebase-todo'
        ],
        extensions: [],
        lineComments: [
            '#'
        ],
        blockComments: [
            [
                '#',
                ' '
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ],
            [
                '`',
                '`'
            ],
            [
                '/**',
                ' */'
            ]
        ]
    },
    go: {
        aliases: [
            'Go'
        ],
        filenames: [],
        extensions: [
            '.go'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '`',
                '`'
            ],
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    groovy: {
        aliases: [
            'Groovy',
            'groovy'
        ],
        filenames: [
            'Jenkinsfile'
        ],
        extensions: [
            '.groovy',
            '.gvy',
            '.gradle',
            '.jenkinsfile',
            '.nf'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    handlebars: {
        aliases: [
            'Handlebars',
            'handlebars'
        ],
        filenames: [],
        extensions: [
            '.handlebars',
            '.hbs',
            '.hjs'
        ],
        lineComments: [],
        blockComments: [
            [
                '{{!--',
                '--}}'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    hlsl: {
        aliases: [
            'HLSL',
            'hlsl'
        ],
        filenames: [],
        extensions: [
            '.hlsl',
            '.hlsli',
            '.fx',
            '.fxh',
            '.vsh',
            '.psh',
            '.cginc',
            '.compute'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    html: {
        aliases: [
            'HTML',
            'htm',
            'html',
            'xhtml'
        ],
        filenames: [],
        extensions: [
            '.html',
            '.htm',
            '.shtml',
            '.xhtml',
            '.xht',
            '.mdoc',
            '.jsp',
            '.asp',
            '.aspx',
            '.jshtm',
            '.volt',
            '.ejs',
            '.rhtml'
        ],
        lineComments: [],
        blockComments: [
            [
                '<!--',
                '-->'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    ini: {
        aliases: [
            'Ini',
            'ini'
        ],
        filenames: [],
        extensions: [
            '.ini'
        ],
        lineComments: [
            ';'
        ],
        blockComments: [
            [
                ';',
                ' '
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    properties: {
        aliases: [
            'Properties',
            'properties'
        ],
        filenames: [
            'gitconfig',
            '.env'
        ],
        extensions: [
            '.conf',
            '.properties',
            '.cfg',
            '.directory',
            '.gitattributes',
            '.gitconfig',
            '.gitmodules',
            '.editorconfig',
            '.repo',
            '.npmrc'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [
            [
                '#',
                ' '
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    java: {
        aliases: [
            'Java',
            'java'
        ],
        filenames: [],
        extensions: [
            '.java',
            '.jav'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    'jsx-tags': {
        aliases: [],
        filenames: [],
        extensions: [],
        lineComments: [],
        blockComments: [
            [
                '{/*',
                '*/}'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ],
            [
                '/**',
                ' */'
            ]
        ]
    },
    jsonl: {
        aliases: [
            'JSON Lines'
        ],
        filenames: [],
        extensions: [
            '.jsonl',
            '.ndjson'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ],
            [
                '`',
                '`'
            ]
        ]
    },
    snippets: {
        aliases: [
            'Code Snippets'
        ],
        filenames: [],
        extensions: [
            '.code-snippets'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ],
            [
                '`',
                '`'
            ]
        ]
    },
    julia: {
        aliases: [
            'Julia',
            'julia'
        ],
        filenames: [],
        extensions: [
            '.jl'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [
            [
                '#=',
                '=#'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '`',
                '`'
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    juliamarkdown: {
        aliases: [
            'Julia Markdown',
            'juliamarkdown'
        ],
        filenames: [],
        extensions: [
            '.jmd'
        ],
        lineComments: [],
        blockComments: [],
        blockStrings: [],
        lineStrings: []
    },
    tex: {
        aliases: [
            'TeX',
            'tex'
        ],
        filenames: [],
        extensions: [
            '.sty',
            '.cls',
            '.bbx',
            '.cbx'
        ],
        lineComments: [
            '%'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '\\left(',
                '\\right)'
            ],
            [
                '\\left[',
                '\\right]'
            ],
            [
                '\\left\\{',
                '\\right\\}'
            ],
            [
                '\\bigl(',
                '\\bigr)'
            ],
            [
                '\\bigl[',
                '\\bigr]'
            ],
            [
                '\\bigl\\{',
                '\\bigr\\}'
            ],
            [
                '\\Bigl(',
                '\\Bigr)'
            ],
            [
                '\\Bigl[',
                '\\Bigr]'
            ],
            [
                '\\Bigl\\{',
                '\\Bigr\\}'
            ],
            [
                '\\biggl(',
                '\\biggr)'
            ],
            [
                '\\biggl[',
                '\\biggr]'
            ],
            [
                '\\biggl\\{',
                '\\biggr\\}'
            ],
            [
                '\\Biggl(',
                '\\Biggr)'
            ],
            [
                '\\Biggl[',
                '\\Biggr]'
            ],
            [
                '\\Biggl\\{',
                '\\Biggr\\}'
            ],
            [
                '\\(',
                '\\)'
            ],
            [
                '\\[',
                '\\]'
            ],
            [
                '\\{',
                '\\}'
            ],
            [
                '`',
                "'"
            ]
        ]
    },
    latex: {
        aliases: [
            'LaTeX',
            'latex'
        ],
        filenames: [],
        extensions: [
            '.tex',
            '.ltx',
            '.ctx'
        ],
        lineComments: [
            '%'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '\\left(',
                '\\right)'
            ],
            [
                '\\left[',
                '\\right]'
            ],
            [
                '\\left\\{',
                '\\right\\}'
            ],
            [
                '\\bigl(',
                '\\bigr)'
            ],
            [
                '\\bigl[',
                '\\bigr]'
            ],
            [
                '\\bigl\\{',
                '\\bigr\\}'
            ],
            [
                '\\Bigl(',
                '\\Bigr)'
            ],
            [
                '\\Bigl[',
                '\\Bigr]'
            ],
            [
                '\\Bigl\\{',
                '\\Bigr\\}'
            ],
            [
                '\\biggl(',
                '\\biggr)'
            ],
            [
                '\\biggl[',
                '\\biggr]'
            ],
            [
                '\\biggl\\{',
                '\\biggr\\}'
            ],
            [
                '\\Biggl(',
                '\\Biggr)'
            ],
            [
                '\\Biggl[',
                '\\Biggr]'
            ],
            [
                '\\Biggl\\{',
                '\\Biggr\\}'
            ],
            [
                '\\(',
                '\\)'
            ],
            [
                '\\[',
                '\\]'
            ],
            [
                '\\{',
                '\\}'
            ],
            [
                '`',
                "'"
            ]
        ]
    },
    bibtex: {
        aliases: [
            'BibTeX',
            'bibtex'
        ],
        filenames: [],
        extensions: [
            '.bib'
        ],
        lineComments: [],
        blockComments: [],
        blockStrings: [],
        lineStrings: []
    },
    cpp_embedded_latex: {
        aliases: [],
        filenames: [],
        extensions: [],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    markdown_latex_combined: {
        aliases: [],
        filenames: [],
        extensions: [],
        lineComments: [],
        blockComments: [
            [
                '<!--',
                '-->'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '\\left(',
                '\\right)'
            ],
            [
                '\\left[',
                '\\right]'
            ],
            [
                '\\left\\{',
                '\\right\\}'
            ],
            [
                '\\bigl(',
                '\\bigr)'
            ],
            [
                '\\bigl[',
                '\\bigr]'
            ],
            [
                '\\bigl\\{',
                '\\bigr\\}'
            ],
            [
                '\\Bigl(',
                '\\Bigr)'
            ],
            [
                '\\Bigl[',
                '\\Bigr]'
            ],
            [
                '\\Bigl\\{',
                '\\Bigr\\}'
            ],
            [
                '\\biggl(',
                '\\biggr)'
            ],
            [
                '\\biggl[',
                '\\biggr]'
            ],
            [
                '\\biggl\\{',
                '\\biggr\\}'
            ],
            [
                '\\Biggl(',
                '\\Biggr)'
            ],
            [
                '\\Biggl[',
                '\\Biggr]'
            ],
            [
                '\\Biggl\\{',
                '\\Biggr\\}'
            ],
            [
                '\\(',
                '\\)'
            ],
            [
                '\\[',
                '\\]'
            ],
            [
                '\\{',
                '\\}'
            ],
            [
                '`',
                "'"
            ]
        ]
    },
    less: {
        aliases: [
            'Less',
            'less'
        ],
        filenames: [],
        extensions: [
            '.less'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    log: {
        aliases: [
            'Log'
        ],
        filenames: [],
        extensions: [
            '.log',
            '*.log.?'
        ],
        lineComments: [],
        blockComments: [],
        blockStrings: [],
        lineStrings: []
    },
    lua: {
        aliases: [
            'Lua',
            'lua'
        ],
        filenames: [],
        extensions: [
            '.lua'
        ],
        lineComments: [
            '--'
        ],
        blockComments: [
            [
                '--[[',
                ']]'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    makefile: {
        aliases: [
            'Makefile',
            'makefile'
        ],
        filenames: [
            'Makefile',
            'makefile',
            'GNUmakefile',
            'OCamlMakefile'
        ],
        extensions: [
            '.mak',
            '.mk'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    markdown: {
        aliases: [
            'Markdown',
            'markdown'
        ],
        filenames: [],
        extensions: [
            '.md',
            '.mkd',
            '.mdwn',
            '.mdown',
            '.markdown',
            '.markdn',
            '.mdtxt',
            '.mdtext',
            '.workbook'
        ],
        lineComments: [],
        blockComments: [
            [
                '<!--',
                '-->'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '<',
                '>'
            ]
        ]
    },
    'markdown-math': {
        aliases: [],
        filenames: [],
        extensions: [],
        lineComments: [],
        blockComments: [],
        blockStrings: [],
        lineStrings: []
    },
    wat: {
        aliases: [
            'WebAssembly Text Format'
        ],
        filenames: [],
        extensions: [
            '.wat',
            '.wasm'
        ],
        lineComments: [
            ';;'
        ],
        blockComments: [
            [
                '(; ',
                ' ;)'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    'objective-c': {
        aliases: [
            'Objective-C'
        ],
        filenames: [],
        extensions: [
            '.m'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    'objective-cpp': {
        aliases: [
            'Objective-C++'
        ],
        filenames: [],
        extensions: [
            '.mm'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    perl: {
        aliases: [
            'Perl',
            'perl'
        ],
        filenames: [],
        extensions: [
            '.pl',
            '.pm',
            '.pod',
            '.t',
            '.PL',
            '.psgi'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ],
            [
                '`',
                '`'
            ]
        ]
    },
    raku: {
        aliases: [
            'Raku',
            'Perl6',
            'perl6'
        ],
        filenames: [],
        extensions: [
            '.raku',
            '.rakumod',
            '.rakutest',
            '.rakudoc',
            '.nqp',
            '.p6',
            '.pl6',
            '.pm6'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ],
            [
                '`',
                '`'
            ]
        ]
    },
    php: {
        aliases: [
            'PHP',
            'php'
        ],
        filenames: [],
        extensions: [
            '.php',
            '.php4',
            '.php5',
            '.phtml',
            '.ctp'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    powershell: {
        aliases: [
            'PowerShell',
            'powershell',
            'ps',
            'ps1',
            'pwsh'
        ],
        filenames: [],
        extensions: [
            '.ps1',
            '.psm1',
            '.psd1',
            '.pssc',
            '.psrc'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [
            [
                '<#',
                '#>'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "@'",
                "\n'@"
            ],
            [
                '@"',
                '\n"@'
            ],
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    prompt: {
        aliases: [
            'Prompt',
            'prompt'
        ],
        filenames: [],
        extensions: [
            '.prompt.md',
            'copilot-instructions.md'
        ],
        lineComments: [],
        blockComments: [
            [
                '<!--',
                '-->'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '<',
                '>'
            ]
        ]
    },
    instructions: {
        aliases: [
            'Instructions',
            'instructions'
        ],
        filenames: [],
        extensions: [
            '.instructions.md',
            'copilot-instructions.md'
        ],
        lineComments: [],
        blockComments: [
            [
                '<!--',
                '-->'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '<',
                '>'
            ]
        ]
    },
    jade: {
        aliases: [
            'Pug',
            'Jade',
            'jade'
        ],
        filenames: [],
        extensions: [
            '.pug',
            '.jade'
        ],
        lineComments: [
            '//-'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    r: {
        aliases: [
            'R',
            'r'
        ],
        filenames: [],
        extensions: [
            '.r',
            '.rhistory',
            '.rprofile',
            '.rt'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '`',
                '`'
            ],
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ],
            [
                '%',
                '%'
            ]
        ]
    },
    razor: {
        aliases: [
            'Razor',
            'razor'
        ],
        filenames: [],
        extensions: [
            '.cshtml',
            '.razor'
        ],
        lineComments: [],
        blockComments: [
            [
                '<!--',
                '-->'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    restructuredtext: {
        aliases: [
            'reStructuredText'
        ],
        filenames: [],
        extensions: [
            '.rst'
        ],
        lineComments: [
            '..'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '<',
                '>'
            ],
            [
                "'",
                "'"
            ],
            [
                '`',
                '`'
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    ruby: {
        aliases: [
            'Ruby',
            'rb'
        ],
        filenames: [
            'rakefile',
            'gemfile',
            'guardfile',
            'podfile',
            'capfile',
            'cheffile',
            'hobofile',
            'vagrantfile',
            'appraisals',
            'rantfile',
            'berksfile',
            'berksfile.lock',
            'thorfile',
            'puppetfile',
            'dangerfile',
            'brewfile',
            'fastfile',
            'appfile',
            'deliverfile',
            'matchfile',
            'scanfile',
            'snapfile',
            'gymfile'
        ],
        extensions: [
            '.rb',
            '.rbx',
            '.rjs',
            '.gemspec',
            '.rake',
            '.ru',
            '.erb',
            '.podspec',
            '.rbi'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [
            [
                '=begin',
                '=end'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ],
            [
                '`',
                '`'
            ]
        ]
    },
    rust: {
        aliases: [
            'Rust',
            'rust'
        ],
        filenames: [],
        extensions: [
            '.rs'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    scss: {
        aliases: [
            'SCSS',
            'scss'
        ],
        filenames: [],
        extensions: [
            '.scss'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    'search-result': {
        aliases: [
            'Search Result'
        ],
        filenames: [],
        extensions: [
            '.code-search'
        ],
        lineComments: [],
        blockComments: [],
        blockStrings: [],
        lineStrings: []
    },
    shaderlab: {
        aliases: [
            'ShaderLab',
            'shaderlab'
        ],
        filenames: [],
        extensions: [
            '.shader'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    shellscript: {
        aliases: [
            'Shell Script',
            'shellscript',
            'bash',
            'fish',
            'sh',
            'zsh',
            'ksh',
            'csh'
        ],
        filenames: [
            'APKBUILD',
            'PKGBUILD',
            '.envrc',
            '.hushlogin',
            'zshrc',
            'zshenv',
            'zlogin',
            'zprofile',
            'zlogout',
            'bashrc_Apple_Terminal',
            'zshrc_Apple_Terminal'
        ],
        extensions: [
            '.sh',
            '.bash',
            '.bashrc',
            '.bash_aliases',
            '.bash_profile',
            '.bash_login',
            '.ebuild',
            '.eclass',
            '.profile',
            '.bash_logout',
            '.xprofile',
            '.xsession',
            '.xsessionrc',
            '.Xsession',
            '.zsh',
            '.zshrc',
            '.zprofile',
            '.zlogin',
            '.zlogout',
            '.zshenv',
            '.zsh-theme',
            '.fish',
            '.ksh',
            '.csh',
            '.cshrc',
            '.tcshrc',
            '.yashrc',
            '.yash_profile'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ],
            [
                '`',
                '`'
            ]
        ]
    },
    sql: {
        aliases: [
            'MS SQL',
            'T-SQL'
        ],
        filenames: [],
        extensions: [
            '.sql',
            '.dsql'
        ],
        lineComments: [
            '--'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "N'",
                "'"
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    swift: {
        aliases: [
            'Swift',
            'swift'
        ],
        filenames: [],
        extensions: [
            '.swift'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ],
            [
                '`',
                '`'
            ]
        ]
    },
    vb: {
        aliases: [
            'Visual Basic',
            'vb'
        ],
        filenames: [],
        extensions: [
            '.vb',
            '.brs',
            '.vbs',
            '.bas',
            '.vba'
        ],
        lineComments: [
            "'"
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    xml: {
        aliases: [
            'XML',
            'xml'
        ],
        filenames: [],
        extensions: [
            '.xml',
            '.xsd',
            '.ascx',
            '.atom',
            '.axml',
            '.axaml',
            '.bpmn',
            '.cpt',
            '.csl',
            '.csproj',
            '.csproj.user',
            '.dita',
            '.ditamap',
            '.dtd',
            '.ent',
            '.mod',
            '.dtml',
            '.fsproj',
            '.fxml',
            '.iml',
            '.isml',
            '.jmx',
            '.launch',
            '.menu',
            '.mxml',
            '.nuspec',
            '.opml',
            '.owl',
            '.proj',
            '.props',
            '.pt',
            '.publishsettings',
            '.pubxml',
            '.pubxml.user',
            '.rbxlx',
            '.rbxmx',
            '.rdf',
            '.rng',
            '.rss',
            '.shproj',
            '.storyboard',
            '.svg',
            '.targets',
            '.tld',
            '.tmx',
            '.vbproj',
            '.vbproj.user',
            '.vcxproj',
            '.vcxproj.filters',
            '.wsdl',
            '.wxi',
            '.wxl',
            '.wxs',
            '.xaml',
            '.xbl',
            '.xib',
            '.xlf',
            '.xliff',
            '.xpdl',
            '.xul',
            '.xoml'
        ],
        lineComments: [],
        blockComments: [
            [
                '<!--',
                '-->'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    xsl: {
        aliases: [
            'XSL',
            'xsl'
        ],
        filenames: [],
        extensions: [
            '.xsl',
            '.xslt'
        ],
        lineComments: [],
        blockComments: [
            [
                '<!--',
                '-->'
            ]
        ],
        blockStrings: [],
        lineStrings: []
    },
    dockercompose: {
        aliases: [
            'Compose',
            'compose'
        ],
        filenames: [],
        extensions: [],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    yaml: {
        aliases: [
            'YAML',
            'yaml'
        ],
        filenames: [],
        extensions: [
            '.yaml',
            '.yml',
            '.eyaml',
            '.eyml',
            '.cff',
            '.yaml-tmlanguage',
            '.yaml-tmpreferences',
            '.yaml-tmtheme',
            '.winget'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    postcss: {
        aliases: [
            'PostCSS',
            'pcss'
        ],
        filenames: [],
        extensions: [
            '.css',
            '.pcss',
            '.postcss'
        ],
        lineComments: [],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    aspnetcorerazor: {
        aliases: [
            'ASP.NET Razor'
        ],
        filenames: [],
        extensions: [
            '.cshtml',
            '.razor'
        ],
        lineComments: [],
        blockComments: [
            [
                '@*',
                '*@'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    ssh_config: {
        aliases: [
            'SSH Config',
            'ssh_config'
        ],
        filenames: [
            'ssh.config'
        ],
        extensions: [],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    glsl: {
        aliases: [
            'GLSL',
            'glsl'
        ],
        filenames: [],
        extensions: [
            '.glsl',
            '.vert',
            '.vs',
            '.frag',
            '.fs'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: []
    },
    cmake: {
        aliases: [
            'CMake'
        ],
        filenames: [
            'CMakelists.txt'
        ],
        extensions: [
            '.cmake'
        ],
        lineComments: [],
        blockComments: [],
        blockStrings: [],
        lineStrings: []
    },
    'cmake-cache': {
        aliases: [
            'CMake Cache'
        ],
        filenames: [
            'CMakeCache.txt'
        ],
        extensions: [],
        lineComments: [],
        blockComments: [],
        blockStrings: [],
        lineStrings: []
    },
    kotlin: {
        aliases: [
            'Kotlin',
            'kotlin'
        ],
        filenames: [],
        extensions: [
            '.kt',
            '.kts'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                '"""',
                '"""'
            ]
        ],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    vue: {
        aliases: [
            'Vue',
            'vue'
        ],
        filenames: [],
        extensions: [
            '.vue'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '<!--',
                '-->'
            ],
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                '`',
                '`'
            ]
        ],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    svelte: {
        aliases: [
            'Svelte',
            'svelte'
        ],
        filenames: [],
        extensions: [
            '.svelte'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '<!--',
                '-->'
            ],
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                '`',
                '`'
            ]
        ],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    astro: {
        aliases: [
            'Astro',
            'astro'
        ],
        filenames: [],
        extensions: [
            '.astro'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '<!--',
                '-->'
            ],
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                '`',
                '`'
            ]
        ],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    sass: {
        aliases: [
            'Sass',
            'sass'
        ],
        filenames: [],
        extensions: [
            '.sass'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    stylus: {
        aliases: [
            'Stylus',
            'stylus',
            'styl'
        ],
        filenames: [],
        extensions: [
            '.styl',
            '.stylus'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    liquid: {
        aliases: [
            'Liquid',
            'liquid'
        ],
        filenames: [],
        extensions: [
            '.liquid'
        ],
        lineComments: [],
        blockComments: [
            [
                '{% comment %}',
                '{% endcomment %}'
            ],
            [
                '{%- comment -%}',
                '{%- endcomment -%}'
            ],
            [
                '<!--',
                '-->'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    twig: {
        aliases: [
            'Twig',
            'twig'
        ],
        filenames: [],
        extensions: [
            '.twig'
        ],
        lineComments: [],
        blockComments: [
            [
                '{#',
                '#}'
            ],
            [
                '<!--',
                '-->'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    jinja: {
        aliases: [
            'Jinja',
            'jinja'
        ],
        filenames: [],
        extensions: [
            '.j2',
            '.jinja',
            '.jinja2'
        ],
        lineComments: [],
        blockComments: [
            [
                '{#',
                '#}'
            ],
            [
                '<!--',
                '-->'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    blade: {
        aliases: [
            'Blade',
            'blade'
        ],
        filenames: [],
        extensions: [
            '.blade.php'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '{{--',
                '--}}'
            ],
            [
                '<!--',
                '-->'
            ],
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    scala: {
        aliases: [
            'Scala',
            'scala'
        ],
        filenames: [],
        extensions: [
            '.scala',
            '.sc',
            '.sbt'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                '"""',
                '"""'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    haskell: {
        aliases: [
            'Haskell',
            'haskell'
        ],
        filenames: [],
        extensions: [
            '.hs',
            '.lhs',
            '.hs-boot'
        ],
        lineComments: [
            '--'
        ],
        blockComments: [
            [
                '{-',
                '-}'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    elm: {
        aliases: [
            'Elm',
            'elm'
        ],
        filenames: [],
        extensions: [
            '.elm'
        ],
        lineComments: [
            '--'
        ],
        blockComments: [
            [
                '{-',
                '-}'
            ]
        ],
        blockStrings: [
            [
                '"""',
                '"""'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    purescript: {
        aliases: [
            'PureScript',
            'purescript'
        ],
        filenames: [],
        extensions: [
            '.purs'
        ],
        lineComments: [
            '--'
        ],
        blockComments: [
            [
                '{-',
                '-}'
            ]
        ],
        blockStrings: [
            [
                '"""',
                '"""'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    ocaml: {
        aliases: [
            'OCaml',
            'ocaml'
        ],
        filenames: [
            'dune',
            'dune-project'
        ],
        extensions: [
            '.ml',
            '.mli',
            '.mll',
            '.mly',
            '.eliom',
            '.eliomi'
        ],
        lineComments: [],
        blockComments: [
            [
                '(*',
                '*)'
            ]
        ],
        blockStrings: [
            [
                '{|',
                '|}'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    rescript: {
        aliases: [
            'ReScript',
            'rescript'
        ],
        filenames: [],
        extensions: [
            '.res',
            '.resi'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                '`',
                '`'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    elixir: {
        aliases: [
            'Elixir',
            'elixir'
        ],
        filenames: [
            'mix.lock'
        ],
        extensions: [
            '.ex',
            '.exs',
            '.eex',
            '.leex',
            '.heex',
            '.sface'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [
            [
                '"""',
                '"""'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    erlang: {
        aliases: [
            'Erlang',
            'erlang'
        ],
        filenames: [
            'rebar.config'
        ],
        extensions: [
            '.erl',
            '.hrl',
            '.escript',
            '.app.src'
        ],
        lineComments: [
            '%'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    racket: {
        aliases: [
            'Racket',
            'racket'
        ],
        filenames: [],
        extensions: [
            '.rkt',
            '.rktl',
            '.rktd'
        ],
        lineComments: [
            ';'
        ],
        blockComments: [
            [
                '#|',
                '|#'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    scheme: {
        aliases: [
            'Scheme',
            'scheme'
        ],
        filenames: [],
        extensions: [
            '.scm',
            '.ss',
            '.sld',
            '.sps',
            '.sls'
        ],
        lineComments: [
            ';'
        ],
        blockComments: [
            [
                '#|',
                '|#'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    lisp: {
        aliases: [
            'Lisp',
            'lisp',
            'commonlisp'
        ],
        filenames: [],
        extensions: [
            '.lisp',
            '.lsp',
            '.cl',
            '.asd'
        ],
        lineComments: [
            ';'
        ],
        blockComments: [
            [
                '#|',
                '|#'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    'emacs-lisp': {
        aliases: [
            'Emacs Lisp',
            'emacs-lisp',
            'elisp'
        ],
        filenames: [
            '.emacs',
            'init.el'
        ],
        extensions: [
            '.el'
        ],
        lineComments: [
            ';'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    zig: {
        aliases: [
            'Zig',
            'zig'
        ],
        filenames: [],
        extensions: [
            '.zig',
            '.zon'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    nim: {
        aliases: [
            'Nim',
            'nim'
        ],
        filenames: [],
        extensions: [
            '.nim',
            '.nims',
            '.nimble'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [
            [
                '#[',
                ']#'
            ]
        ],
        blockStrings: [
            [
                '"""',
                '"""'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    crystal: {
        aliases: [
            'Crystal',
            'crystal'
        ],
        filenames: [
            'shard.yml'
        ],
        extensions: [
            '.cr',
            '.ecr'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    gleam: {
        aliases: [
            'Gleam',
            'gleam'
        ],
        filenames: [],
        extensions: [
            '.gleam'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    odin: {
        aliases: [
            'Odin',
            'odin'
        ],
        filenames: [],
        extensions: [
            '.odin'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                '`',
                '`'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    d: {
        aliases: [
            'D',
            'd'
        ],
        filenames: [],
        extensions: [
            '.d',
            '.di'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ],
            [
                '/+',
                '+/'
            ]
        ],
        blockStrings: [
            [
                '`',
                '`'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    asm: {
        aliases: [
            'Assembly',
            'asm',
            'assembly',
            'nasm',
            'arm'
        ],
        filenames: [],
        extensions: [
            '.asm',
            '.s',
            '.nasm',
            '.a51',
            '.i86'
        ],
        lineComments: [
            ';',
            '#',
            '//',
            '@'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    solidity: {
        aliases: [
            'Solidity',
            'solidity'
        ],
        filenames: [],
        extensions: [
            '.sol'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    terraform: {
        aliases: [
            'Terraform',
            'terraform',
            'hcl',
            'tf'
        ],
        filenames: [],
        extensions: [
            '.tf',
            '.tfvars',
            '.hcl',
            '.nomad'
        ],
        lineComments: [
            '#',
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    nix: {
        aliases: [
            'Nix',
            'nix'
        ],
        filenames: [],
        extensions: [
            '.nix'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                "''",
                "''"
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    jsonnet: {
        aliases: [
            'Jsonnet',
            'jsonnet'
        ],
        filenames: [],
        extensions: [
            '.jsonnet',
            '.libsonnet'
        ],
        lineComments: [
            '//',
            '#'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                '|||',
                '|||'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    bicep: {
        aliases: [
            'Bicep',
            'bicep'
        ],
        filenames: [],
        extensions: [
            '.bicep',
            '.bicepparam'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [
            [
                "'''",
                "'''"
            ]
        ],
        lineStrings: [
            [
                "'",
                "'"
            ]
        ]
    },
    starlark: {
        aliases: [
            'Starlark',
            'starlark',
            'bazel',
            'bzl'
        ],
        filenames: [
            'BUILD',
            'BUILD.bazel',
            'WORKSPACE',
            'WORKSPACE.bazel',
            'MODULE.bazel'
        ],
        extensions: [
            '.bzl',
            '.bazel',
            '.star'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [
            [
                '"""',
                '"""'
            ]
        ],
        blockStrings: [
            [
                '"""',
                '"""'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ],
        blockStringAsComment: true
    },
    meson: {
        aliases: [
            'Meson',
            'meson'
        ],
        filenames: [
            'meson.build',
            'meson.options',
            'meson_options.txt'
        ],
        extensions: [],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [
            [
                "'''",
                "'''"
            ]
        ],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '"',
                '"'
            ]
        ]
    },
    toml: {
        aliases: [
            'TOML',
            'toml'
        ],
        filenames: [
            'Cargo.lock',
            'Pipfile',
            'poetry.lock',
            'uv.lock'
        ],
        extensions: [
            '.toml'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [
            [
                '"""',
                '"""'
            ],
            [
                "'''",
                "'''"
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    proto: {
        aliases: [
            'Protocol Buffers',
            'proto',
            'proto3',
            'protobuf'
        ],
        filenames: [],
        extensions: [
            '.proto'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    thrift: {
        aliases: [
            'Thrift',
            'thrift'
        ],
        filenames: [],
        extensions: [
            '.thrift'
        ],
        lineComments: [
            '//',
            '#'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    graphql: {
        aliases: [
            'GraphQL',
            'graphql',
            'gql'
        ],
        filenames: [],
        extensions: [
            '.graphql',
            '.graphqls',
            '.gql'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [
            [
                '"""',
                '"""'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ],
        blockStringAsComment: true
    },
    prisma: {
        aliases: [
            'Prisma',
            'prisma'
        ],
        filenames: [],
        extensions: [
            '.prisma'
        ],
        lineComments: [
            '///',
            '//'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    verilog: {
        aliases: [
            'Verilog',
            'verilog'
        ],
        filenames: [],
        extensions: [
            '.v',
            '.vh'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    systemverilog: {
        aliases: [
            'SystemVerilog',
            'systemverilog'
        ],
        filenames: [],
        extensions: [
            '.sv',
            '.svh'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    vhdl: {
        aliases: [
            'VHDL',
            'vhdl'
        ],
        filenames: [],
        extensions: [
            '.vhd',
            '.vhdl',
            '.vho',
            '.vht'
        ],
        lineComments: [
            '--'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    wgsl: {
        aliases: [
            'WGSL',
            'wgsl'
        ],
        filenames: [],
        extensions: [
            '.wgsl'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: []
    },
    metal: {
        aliases: [
            'Metal',
            'metal'
        ],
        filenames: [],
        extensions: [
            '.metal'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    qml: {
        aliases: [
            'QML',
            'qml'
        ],
        filenames: [],
        extensions: [
            '.qml',
            '.qbs'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    gdscript: {
        aliases: [
            'GDScript',
            'gdscript'
        ],
        filenames: [],
        extensions: [
            '.gd'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [
            [
                '"""',
                '"""'
            ]
        ],
        blockStrings: [
            [
                '"""',
                '"""'
            ]
        ],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ],
        blockStringAsComment: true
    },
    fortran: {
        aliases: [
            'Fortran',
            'fortran'
        ],
        filenames: [],
        extensions: [
            '.f90',
            '.f95',
            '.f03',
            '.f08',
            '.f18',
            '.f',
            '.for',
            '.ftn',
            '.fpp'
        ],
        lineComments: [
            '!'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    cobol: {
        aliases: [
            'COBOL',
            'cobol'
        ],
        filenames: [],
        extensions: [
            '.cbl',
            '.cob',
            '.ccp'
        ],
        lineComments: [
            '*>',
            '*'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    ada: {
        aliases: [
            'Ada',
            'ada'
        ],
        filenames: [],
        extensions: [
            '.adb',
            '.ads',
            '.ada',
            '.gpr'
        ],
        lineComments: [
            '--'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    pascal: {
        aliases: [
            'Pascal',
            'pascal',
            'objectpascal',
            'delphi'
        ],
        filenames: [],
        extensions: [
            '.pas',
            '.pp',
            '.dpr',
            '.dpk',
            '.lpr'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '{',
                '}'
            ],
            [
                '(*',
                '*)'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ]
        ]
    },
    abap: {
        aliases: [
            'ABAP',
            'abap'
        ],
        filenames: [],
        extensions: [
            '.abap'
        ],
        lineComments: [
            '*',
            '"'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ],
            [
                '`',
                '`'
            ]
        ]
    },
    tcl: {
        aliases: [
            'Tcl',
            'tcl'
        ],
        filenames: [],
        extensions: [
            '.tcl',
            '.tk',
            '.exp'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    awk: {
        aliases: [
            'AWK',
            'awk'
        ],
        filenames: [],
        extensions: [
            '.awk',
            '.gawk',
            '.mawk',
            '.nawk'
        ],
        lineComments: [
            '#'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    haxe: {
        aliases: [
            'Haxe',
            'haxe'
        ],
        filenames: [],
        extensions: [
            '.hx',
            '.hxml'
        ],
        lineComments: [
            '//'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    viml: {
        aliases: [
            'Vim Script',
            'viml',
            'vim'
        ],
        filenames: [
            '.vimrc',
            '_vimrc',
            '.gvimrc',
            '_gvimrc'
        ],
        extensions: [
            '.vim',
            '.vimrc'
        ],
        lineComments: [
            '"'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                "'",
                "'"
            ]
        ]
    },
    ahk: {
        aliases: [
            'AutoHotkey',
            'ahk',
            'autohotkey'
        ],
        filenames: [],
        extensions: [
            '.ahk',
            '.ahk2',
            '.ah2'
        ],
        lineComments: [
            ';'
        ],
        blockComments: [
            [
                '/*',
                '*/'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ],
            [
                "'",
                "'"
            ]
        ]
    },
    applescript: {
        aliases: [
            'AppleScript',
            'applescript'
        ],
        filenames: [],
        extensions: [
            '.applescript'
        ],
        lineComments: [
            '--',
            '#'
        ],
        blockComments: [
            [
                '(*',
                '*)'
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    http: {
        aliases: [
            'HTTP',
            'http',
            'rest'
        ],
        filenames: [],
        extensions: [
            '.http',
            '.rest'
        ],
        lineComments: [
            '#',
            '//'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    plantuml: {
        aliases: [
            'PlantUML',
            'plantuml',
            'puml'
        ],
        filenames: [],
        extensions: [
            '.puml',
            '.plantuml',
            '.iuml',
            '.pu',
            '.wsd'
        ],
        lineComments: [
            "'"
        ],
        blockComments: [
            [
                "/'",
                "'/"
            ]
        ],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    },
    mermaid: {
        aliases: [
            'Mermaid',
            'mermaid'
        ],
        filenames: [],
        extensions: [
            '.mmd',
            '.mermaid'
        ],
        lineComments: [
            '%%'
        ],
        blockComments: [],
        blockStrings: [],
        lineStrings: [
            [
                '"',
                '"'
            ]
        ]
    }
};