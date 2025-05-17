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
    expect(parser.includes('.vscode/extensions.json')).toBe(false);

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
});