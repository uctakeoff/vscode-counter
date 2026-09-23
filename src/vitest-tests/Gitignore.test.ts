import { describe, it, expect } from 'vitest';
import Gitignore from '../Gitignore';

describe('Gitignore', () => {
  it('Simple', () => {
    const parser = new Gitignore(`
# npm packages
node_modules/
package-lock.json

# build output
dist/
build/

# IDE files
.vscode/
.idea/

# except specific files
!.vscode/extensions.json
  `).merge(new Gitignore(`
# API specific ignores
*.log
temp/
config.local.js
`, 'src/api'));

    expect(parser.includes('node_modules/express')).toBe(true);
    expect(parser.includes('src/index.ts')).toBe(false);
    expect(parser.includes('.vscode/settings.json')).toBe(true);
    // git cannot re-include a file whose parent directory is excluded, so `!.vscode/extensions.json`
    // has no effect while `.vscode/` is ignored. Verified with `git check-ignore -v`.
    expect(parser.includes('.vscode/extensions.json')).toBe(true);

    expect(parser.includes('src/api/temp/debug.log')).toBe(true);
    expect(parser.includes('src/api/config.local.js')).toBe(true);
    expect(parser.includes('src/web/config.local.js')).toBe(false);
  });

  it('Simple2', () => {
    const parser = new Gitignore(`
*.log
!important.log
`).merge(new Gitignore(`
!debug.log
error.log
`, 'src/'
    ));
    expect(parser.includes('test.log')).toBe(true); // (ルートルールによる)
    expect(parser.includes('important.log')).toBe(false); // (ルートの否定ルールによる)
    expect(parser.includes('src/debug.log')).toBe(false); // (src/の否定ルールによる)
    expect(parser.includes('src/error.log')).toBe(true); // (src/の後続ルールによる)
  });

  it('matches the `?` wildcard against exactly one character', () => {
    const parser = new Gitignore('foo?.txt');
    expect(parser.includes('foo1.txt')).toBe(true);
    expect(parser.includes('fooX.txt')).toBe(true);
    expect(parser.includes('foo.txt')).toBe(false);
    expect(parser.includes('foo12.txt')).toBe(false);
  });

  it('keeps the remaining rules when one pattern is malformed', () => {
    // An unbalanced '[' used to make the whole rule set collapse, silently counting
    // node_modules and friends.
    const parser = new Gitignore(`
node_modules/
*.log
weird[.txt
build/
dist/
`);
    expect(parser.includes('node_modules/p/index.js')).toBe(true);
    expect(parser.includes('a.log')).toBe(true);
    expect(parser.includes('build/out.o')).toBe(true);
    expect(parser.includes('dist/main.js')).toBe(true);
  });

  it('applies the deepest .gitignore last regardless of the order given', () => {
    const deep = new Gitignore('!keep.log', 'src/api');
    const shallow = new Gitignore('*.log', 'src');
    expect(new Gitignore('').merge(deep, shallow).includes('src/api/keep.log')).toBe(false);
    expect(new Gitignore('').merge(shallow, deep).includes('src/api/keep.log')).toBe(false);
    expect(new Gitignore('').merge(deep, shallow).includes('src/api/other.log')).toBe(true);
  });

  it('accepts the absolute, backslash-separated paths the extension passes in', () => {
    // `countLinesInDirectory_` filters on `uri.fsPath`, which is absolute and uses '\' on Windows.
    const parser = new Gitignore('').merge(new Gitignore('*.log\nnode_modules/', 'd:\\proj'));
    expect(parser.excludes('d:\\proj\\src\\main.ts')).toBe(true);
    expect(parser.excludes('d:\\proj\\a\\b\\debug.log')).toBe(false);
    expect(parser.excludes('d:\\proj\\node_modules\\p\\index.js')).toBe(false);
    // outside every .gitignore directory
    expect(parser.excludes('d:\\other\\debug.log')).toBe(true);
  });
});
