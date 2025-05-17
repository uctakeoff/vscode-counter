import * as assert from 'assert';
import {describe, it, before} from 'mocha';
// import * as vscode from 'vscode';
import {LineCounter} from '../LineCounter';

describe('LineCounter', () => {
  // before(() => {
  //   vscode.window.showInformationMessage('Start all tests.');
  // });

  it('standard', () => {
    const code = /* cpp*/`
      void main () {
        int x = 0;
        int y = 0; // code line

        // comment
        const char* str = "text";

        /*
          comment
          comment
        */
        int z = 100; /* code line
          comment
        */

        const char* hstr = R"(
          // not comment
          text

          /*
           not comment
          */

        )";
      }
    `;
    const counter = new LineCounter('cpp', ["//"], [['/*', '*/']], [['R"(', ')"']], [['"', '"']]);
    assert.deepEqual(counter.count(code), {blank: 4, code: 15, comment: 7});
  });

  it('Bug : blockComments character in a line of code falsifies the counts #88', () => {
    const code = /* cs*/`
      Console.WriteLine("line 1");
      Console.WriteLine("line 2 /*");
      Console.WriteLine("line 3");
      Console.WriteLine("line 4");
    `;
    const counter = new LineCounter('c#', ["//"], [['/*', '*/']], [], [['"', '"']]);
    expect(counter.count(code)).toEqual({blank: 1, code: 4, comment: 0});
  });

  it('Python block comments not being detected #110', () => {
    const code = /*python*/`
"""
Module docsstring

Blaahblaah
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class MyContainer:
     """A custom container"""

    field_a: int
    """Field a blaah blaah"""

    field_b: str
    """Field b has a very long
    docstring"""


def __main__():
    print("""
        This is a very long text
        that is multiline
        it should be counted as code.
        """)
`;
    const counter = new LineCounter('python', ["#"], [['"""', '"""']], [['"""', '"""']], [['"', '"']], true);
    assert.deepEqual(counter.count(code), {blank: 8, code: 11, comment: 9});
  });
});