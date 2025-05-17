export class Count {
    constructor(
        public code: number = 0,
        public comment: number = 0,
        public blank: number = 0
    ) {
    }
    get total() { return this.code + this.comment + this.blank; }
    get isEmpty() { return (this.code === 0) && (this.comment === 0) && (this.blank === 0); }
    add(value: Count) {
        this.code += value.code;
        this.comment += value.comment;
        this.blank += value.blank;
        return this;
    }
    sub(value: Count) {
        this.code -= value.code;
        this.comment -= value.comment;
        this.blank -= value.blank;
        return this;
    }
};

const nextIndexOf = (str: string, searchValue: string, fromIndex = 0) => {
    const index = str.indexOf(searchValue, fromIndex);
    return (index >= 0) ? index + searchValue.length : index;
};
const rxEspaceRegExpChar = /[.*+?^${}()|[\]\\]/g;
const escapeForRegexp = (str: string) => str.replace(rxEspaceRegExpChar, '\\$&');
const pickupStringLiteralRegexpSource = ([start, end]: [string, string]) => {
    const s = escapeForRegexp(start);
    const e = escapeForRegexp(end);
    return `${s}(?:\\\\.|[^${e}\\\\])*${e}`;
};
const LineType = { Code: 0, Comment: 1, Blank: 2 } as const;

export class LineCounter {
    private regex: RegExp;
    constructor(
        public readonly name: string,
        private lineComments: string[],
        private blockComments: [string, string][],
        private blockStrings: [string, string][],
        lineStrings: [string, string][] = [],
        private blockStringAsComment = false,
    ) {
        lineStrings = (lineStrings ?? []).filter(p => {
            return blockStrings.every(b => !p[0].startsWith(b[0]))
                && blockComments.every(b => !p[0].startsWith(b[0]));
        });
        const source = `(${[
            blockStrings.map(v => escapeForRegexp(v[0])).join('|'),
            blockComments.map(v => escapeForRegexp(v[0])).join('|'),
            lineStrings.map(v => pickupStringLiteralRegexpSource(v)).join('|'),
        ].map(r => !r ? '(?!x)x' : r).join(')|(')})`;
        this.regex = new RegExp(source, 'g');
        // console.log(`${name}:《${lineComments}》《${blockComments}》《${blockStrings}》《${lineStrings}》《${blockStringAsComment}》`);
        // console.log(name, this.regex.source, blockStringAsComment);
    }
    public count(text: string, includeIncompleteLine = false): Count {
        let result = [0, 0, 0];
        let blockCommentEnd = '';
        let blockStringEnd = '';
        const lines = text.split(/\r\n|\r|\n/).map(line => line.trim());
        if (!includeIncompleteLine) {
            lines.pop();
        }
        // console.log(`${this.name}: ${lines.length}lines`, this.regex.source);
        let type: number = LineType.Blank;
        lines.forEach((line, lineIndex) => {
            let i = 0;
            if (blockCommentEnd.length > 0) {
                type = LineType.Comment;
            } else if (blockStringEnd.length <= 0) {
                type = LineType.Blank;
            }
            while (i < line.length) {
                if (blockCommentEnd.length > 0) {
                    // now in block comment
                    const index = nextIndexOf(line, blockCommentEnd, i);
                    if (index >= 0) {
                        blockCommentEnd = '';
                        i = index;
                    } else {
                        break;
                    }
                } else if (blockStringEnd.length > 0) {
                    // now in block string (here document)
                    const index = nextIndexOf(line, blockStringEnd, i);
                    if (index >= 0) {
                        blockStringEnd = '';
                        i = index;
                    } else {
                        break;
                    }
                } else if (this.lineComments.some(lc => line.startsWith(lc))) {
                    // now is line comment.
                    type = LineType.Comment;
                    break;
                } else {
                    this.regex.lastIndex = i;
                    const match = this.regex.exec(line);
                    if (!match) {
                        type = LineType.Code;
                        break;
                    }
                    // console.log(`  [${i}]`, match);
                    if (match[1]) {
                        // start block string
                        type = this.blockStringAsComment && match.index === 0 ? LineType.Comment : LineType.Code;
                        // type = LineType.Code;
                        blockStringEnd = this.blockStrings.find(v => v[0] === match[1])?.[1] ?? '';
                        i = match.index + match[1].length;
                        continue;
                    }
                    if (match[2]) {
                        // start block comment
                        type = match.index === 0 ? LineType.Comment : LineType.Code;
                        blockCommentEnd = this.blockComments.find(v => v[0] === match[2])?.[1] ?? '';
                        i = match.index + match[2].length;
                        continue;
                    }
                    type = LineType.Code;
                    i += match[3]?.length ?? 1;
                    break;
                }
            }
            result[type]++;
            // console.log(`${(lineIndex+1).toString().padStart(3)}[${type}] ${line}`);
        });
        return new Count(result[LineType.Code], result[LineType.Comment], result[LineType.Blank],);
    }
}
