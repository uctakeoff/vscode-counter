export default class Gitignore {
  public rules: { pattern: RegExp, included: boolean }[];

  constructor(gitignoreData: string, gitignoreCurrentDir = '') {
    // console.log(`Gitignore(${gitignoreData.length}B, dir:${gitignoreCurrentDir})`)
    gitignoreCurrentDir = gitignoreCurrentDir.replace(/\\/g, '/').replace(/[^\/]$/, '$&/');
    this.rules = gitignoreData.split(/\r\n|\r|\n/)
      .map(line => line.trim())
      .filter(line => (line && line[0] !== '#'))
      .reverse()
      .reduce<string[][]>((lists, line) => {
        const isNegative = line[0] === '!';
        if (isNegative) {
          line = line.slice(1);
        }
        line = line.replace(/^\\#/, '#').replace(/^\\!/, '!').replace(/\\ /g, ' ').replace(/\\$/, ' ');
        const slashIndex = line.indexOf('/');
        if (slashIndex === -1 || slashIndex === line.length - 1) {
          line = gitignoreCurrentDir + '**/' + line;
        } else if (slashIndex === 0) {
          line = gitignoreCurrentDir + line.slice(1);
        } else {
          line = gitignoreCurrentDir + line;
        }
        // console.log('> ' + line);
        // positive pattern: lists[even], negative pattern: lists[odd]
        if (isNegative === (lists.length % 2 !== 0)) {
          lists.push([]);
        }
        line = line.replace(/[\{\}\(\)\+\.\^\$\|]/g, '\\$&')      // escape charactors {}()+.^$|
          .replace(/(^|[^\\])\?/g, '.')                 // '?' to '.'
          .replace(/\/\*\*/g, '([\\\\/][^\\\\/]+)?')    // '/**'    '?' is a provisional measure.
          .replace(/\*\*\//g, '([^\\\\/]+[\\\\/])?')    // '**/'    '?' is a provisional measure.
          .replace(/([^\\])\*/g, '$1([^\\\\/]?)')       // '*' to any charactors
          .replace(/\?/g, '*')                          // '?' to '*'
          .replace(/[^\/]$/, '$&(([\\\\/].*)|$)')       // When the trailing character is not '/'.
          .replace(/\/$/, '(([\\\\/].*)|$)');           // When the trailing character is '/'.
        lists[lists.length - 1].push(line);
        return lists;
      }, [[]])
      .map((list, index) => {
        return { pattern: list.length > 0 ? '^((' + list.join(')|(') + '))' : '', included: index % 2 === 0 };
      })
      .filter(rule => rule.pattern.length > 0)
      .map(rule => {
        try {
          // console.log(rule.pattern, rule.included);
          return { pattern: new RegExp(rule.pattern), included: rule.included };
        } catch (e) {
          console.warn(e);
          return undefined;
        }
      })
      .filter((v): v is { pattern: RegExp, included: boolean } => !!v);
  }
  public includes(filepath: string): boolean {
    filepath = filepath.replace(/\\/g, '/');
    const rule = this.rules.find(v => v.pattern.test(filepath));
    // if (rule) {
    //   console.log(`##GitIgnore ${filepath}: ${rule?.pattern} ${rule?.included}`);
    // }
    return (rule !== undefined) && rule.included;
  }
  public excludes(filepath: string): boolean {
    return !this.includes(filepath);
  }

  public merge(...subrules: Gitignore[]): Gitignore {
    const ret = new Gitignore('');
    ret.rules = ret.rules.concat(...subrules.reverse().map(g => g.rules), this.rules);
    return ret;
  }
  get debugString(): string {
    return this.rules.map(rule => `${rule.included ? 'include' : 'exclude'} : ${rule.pattern}`).join('\n');
  }
}
