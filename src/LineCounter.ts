'use strict';

export default class LineCounter
{
    public readonly name: string;
    private lineComments: string[];
    private blockComments: [string, string][];
    private blockStrings: [string, string][];

    constructor(name:string, lineComments:string[], blockComments:[string,string][], blockStrings:[string,string][]) {
        this.name = name;
        this.lineComments = lineComments;
        this.blockComments = blockComments;
        this.blockStrings = blockStrings;
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
                    if (this.lineComments.some(lc => line.startsWith(lc))) {
                        type = LineType.Comment;
                        break;
                    }
                    {
                        let index = -1;
                        const range = this.blockComments.find(bc => { index = line.indexOf(bc[0], i); return index >= 0; });
                        if (range !== undefined) {
                            // start block comment
                            type = index === 0 ? LineType.Comment : LineType.Code;
                            blockCommentEnd = range[1];
                            i = index + range[0].length;
                            continue;
                        }
                    }
                    type = LineType.Code;
                    {
                        let index = -1;
                        const range = this.blockStrings.find(bc => { index = line.indexOf(bc[0], i); return index >= 0; });
                        if (range !== undefined) {
                            blockStringEnd = range[1];
                            i = index + range[0].length;
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
