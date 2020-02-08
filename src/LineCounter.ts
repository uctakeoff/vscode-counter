'use strict';

export default class LineCounter
{
    private id: string;
    private aliases: string[] = [];
    private lineComment: string[] = [];
    public blockComment: {begin:string, end:string}[] = [];
    public blockString: {begin:string, end:string}[] = [];

    get languageId(): string {
        return this.aliases.length > 0 ? this.aliases[0] : this.id;
    }

    constructor(id:string) {
        this.id = id;
    }
    public addAlias(aliases: string[]) {
        this.aliases.push(...aliases);
    }
    public addLineCommentRule(...tokens: string[]) {
        this.lineComment.push(...tokens);
    }
    public addBlockCommentRule(...tokenPairs: {begin:string, end:string}[]) {
        this.blockComment.push(...tokenPairs);
    }
    public addBlockStringRule(...tokenPairs: {begin:string, end:string}[]) {
        this.blockString.push(...tokenPairs);
    }
    public addCommentRule(rule: any) {
        if (rule) {
            if (typeof(rule.lineComment) === 'string' && rule.lineComment.length > 0) {
                this.lineComment.push(rule.lineComment as string);
            }
            if (rule.blockComment && (rule.blockComment.length >= 2)) {
                this.addBlockCommentRule({begin: rule.blockComment[0], end: rule.blockComment[1]});
            }
        }
    }

    public count(text: string): {code:number, comment:number, blank:number} {
        enum LineType {Code, Comment, Blank}

        const nextIndexOf = (str: string, searchValue: string, fromIndex = 0) => {
            const index = str.indexOf(searchValue, fromIndex);
            return (index >= 0) ? index + searchValue.length : index;
        };
        let result = [0, 0, 0];
        let blockCommentEnd = '';
        let blockStringEnd = '';
        text.split(/\r\n|\r|\n/).map(line => line.trim()).forEach((line, lineIndex) => {
            let type = (blockCommentEnd.length > 0) ? LineType.Comment : (blockStringEnd.length > 0) ? LineType.Code : LineType.Blank;
            let i = 0;
            while (i < line.length) {
                // now in block comment
                if (blockCommentEnd.length > 0) {
                    const index = nextIndexOf(line, blockCommentEnd, i);
                    if (index >= 0) {
                        blockCommentEnd = '';
                        i = index;
                    } else {
                        break;
                    }
                // now in block string (here document)
                } else if (blockStringEnd.length > 0) {
                    const index = nextIndexOf(line, blockStringEnd, i);
                    if (index >= 0) {
                        blockStringEnd = '';
                        i = index;
                    } else {
                        break;
                    }
                } else {
                    // now is line comment.
                    if (this.lineComment.some(lc => line.startsWith(lc))) {
                        type = LineType.Comment;
                        break;
                    }
                    {
                        let index = -1;
                        const range = this.blockComment.find(bc => { index = line.indexOf(bc.begin, i); return index >= 0; });
                        if (range !== undefined) {
                            // start block comment
                            type = index === 0 ? LineType.Comment : LineType.Code;
                            blockCommentEnd = range.end;
                            i = index + range.begin.length;
                            continue;
                        }
                    }
                    type = LineType.Code;
                    {
                        let index = -1;
                        const rabge = this.blockString.find(bc => { index = line.indexOf(bc.begin, i); return index >= 0; });
                        if (rabge !== undefined) {
                            blockStringEnd = rabge.end;
                            i = index + rabge.begin.length;
                            continue;
                        }
                    }
                    break;
                }
            }
            result[type]++;
            // console.log(`${lineIndex+1} [${LineType[type]}]   ${line}`);
        });
        return { code: result[LineType.Code], comment: result[LineType.Comment], blank: result[LineType.Blank], };
    }
}
