import { describe, it, expect } from 'vitest';
import {LineCounter} from '../LineCounter';

describe('Extension activation', () => {
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

        /**
          comment
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
    expect(counter.count(code)).toEqual({blank: 4, code: 15, comment: 11});

    // 実際のデータ
    const counter2 = new LineCounter('cpp', ["//"], [['/*', '*/']], [['R"(', ')"']], [["'","'"],["\"","\""],["/*","*/"],["/**"," */"]]);
    expect(counter2.count(code)).toEqual({blank: 4, code: 15, comment: 11});
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
    expect(counter.count(code)).toEqual({blank: 8, code: 11, comment: 9});


/*
const patterns = {
  original: /"(?:\\.|[^"\\])*"/g,
  improved: /(?<!\\)"((?:[^"\\]|\\.)*?)(?<!\\)"/g,
};
const testCases = [
  { desc: '通常の文字列', code: `"hello world"` },
  { desc: 'エスケープされたクオート', code: `"say \\"hi\\""` },
  { desc: 'バックスラッシュ終わり', code: `"string with escaped quote at end \\"` },
  { desc: '三重引用符', code: `"""this is triple"""` },
  { desc: '改行入り（不正）', code: `"line1\nline2"` },
  { desc: 'raw string', code: `r"\\n is newline"` },
  { desc: 'Unicode escape', code: `"\\u30C6\\u30B9\\u30C8"` },
  // → 間違って閉じたように見えてしまうか確認
  { desc: 'エスケープクオート終端崩壊', code: `"string with escaped quote at end \\" more"` },
  // → 両パターンが誤って部分マッチしていることがわかるはず
  { desc: '三重引用符全体を1文字列として無視すべき', code: `"""multiline\nstring"""` },
  { desc: "2個のバックスラッシュ → クオート有効", code: `"abc\\\\\"def"` } , // 有効なクオート
  { desc: "3個のバックスラッシュ → クオート無効", code: `"abc\\\\\\\"def"` } , // クオートは閉じじゃない
  { desc: "4個のバックスラッシュ → クオート有効", code: `"abc\\\\\\\\\"def"` }, // 有効
];
function testRegex(pattern: RegExp, code: string): string[] {
  // RegExp は g フラグがついてるため、毎回新規インスタンス化
  const matches: string[] = [];
  const cloned = new RegExp(pattern.source, pattern.flags);
  let match;
  while ((match = cloned.exec(code)) !== null) {
    matches.push(match[0]);
  }
  return matches;
}
for (const [label, regex] of Object.entries(patterns)) {
  console.log(`\n=== Testing pattern: ${label} ===`);
  for (const { desc, code } of testCases) {
    const matches = testRegex(regex, code);
    console.log(`- ${desc.padEnd(20)} → Matches: ${JSON.stringify(matches)}`);
  }
}
*/
  });
});
