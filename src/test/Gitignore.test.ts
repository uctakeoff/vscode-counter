import * as assert from 'assert';
import {describe, it, before} from 'mocha';
import * as vscode from 'vscode';
import Gitignore from '../Gitignore';

describe('Gitignore', () => {
  before(() => {
    vscode.window.showInformationMessage('Start all tests.');
  });

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

    assert.ok(parser.includes('node_modules/express')); // true
    assert.ok(!parser.includes('src/index.ts')); // false
    assert.ok(parser.includes('.vscode/settings.json')); // true
    assert.ok(!parser.includes('.vscode/extensions.json')); // false

    assert.ok(parser.includes('src/api/temp/debug.log')); // true
    assert.ok(parser.includes('src/api/config.local.js')); // true
    assert.ok(!parser.includes('src/web/config.local.js')); // false
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
    assert.ok(parser.includes('test.log'));        // true (ルートルールによる)
    assert.ok(!parser.includes('important.log'));   // false (ルートの否定ルールによる)
    assert.ok(!parser.includes('src/debug.log'));   // false (src/の否定ルールによる)
    assert.ok(parser.includes('src/error.log'));   // true (src/の後続ルールによる)
  });
});