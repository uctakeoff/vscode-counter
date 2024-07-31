import * as assert from 'assert';
import * as mocha from 'mocha';    //①

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import Gitignore from '../../Gitignore';

mocha.describe('Extension Test Suite', () => {    //①
  before(() => {
    vscode.window.showInformationMessage('Start all tests.');
  });

  it('Sample test', () => {    //①
    const g = new Gitignore(`**/logs`);
    assert.ok(g.includes('logs/debug.log'));
  });
});