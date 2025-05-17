type SegmenterEntry = {
  lang: string;
  segmenter: Intl.Segmenter;
  regexSrc: string;
};

const defaultSegmenters: SegmenterEntry[] = [
  { lang: 'en', segmenter: new Intl.Segmenter('en', { granularity: 'word' }), regexSrc: '\\p{Script=Latin}' },
  { lang: 'ja', segmenter: new Intl.Segmenter('ja', { granularity: 'word' }), regexSrc: '\\p{Script=Hiragana}\\p{Script=Katakana}\\p{Script=Han}ー' },
  { lang: 'ko', segmenter: new Intl.Segmenter('ko', { granularity: 'word' }), regexSrc: '\\p{Script=Hangul}\\p{Script=Han}' },
  { lang: 'zh', segmenter: new Intl.Segmenter('zh', { granularity: 'word' }), regexSrc: '\\p{Script=Han}' },
  { lang: 'ru', segmenter: new Intl.Segmenter('ru', { granularity: 'word' }), regexSrc: '\\p{Script=Cyrillic}' },
  { lang: 'hi', segmenter: new Intl.Segmenter('hi', { granularity: 'word' }), regexSrc: '\\p{Script=Devanagari}' },
  { lang: 'ar', segmenter: new Intl.Segmenter('ar', { granularity: 'word' }), regexSrc: '\\p{Script=Arabic}' },
  { lang: 'he', segmenter: new Intl.Segmenter('he', { granularity: 'word' }), regexSrc: '\\p{Script=Hebrew}' },
  { lang: 'th', segmenter: new Intl.Segmenter('th', { granularity: 'word' }), regexSrc: '\\p{Script=Thai}' },
];

export const countWords = (text: string, primaryLang?: string): number => {
  let segmenters = defaultSegmenters;
  if (primaryLang) {
    const i = segmenters.findIndex(s => primaryLang.startsWith(s.lang));
    if (i >= 0) {
      segmenters = [...segmenters];
      segmenters.unshift(segmenters.splice(i, 1)[0]);
      // console.log(`primaryLang=${primaryLang}, ${i}=>0`, segmenters);
    }
  }
  const combinedRegex = new RegExp(
    segmenters.map(s => `([${s.regexSrc}\\s\\p{P}\\p{S}\\p{N}]+)`).join('|'),
    'gu'
  );
  let totalCount = 0;
  for (const match of text.matchAll(combinedRegex)) {
    const groupIndex = match.findIndex((m, i) => i > 0 && m !== undefined) - 1;
    const entry = segmenters[groupIndex];
    if (entry) {
      let count = 0;
      for (const segment of entry.segmenter.segment(match[0])) {
        if (segment.isWordLike) {
          count++;
        }
      }
      // console.log(`lang[${groupIndex}]=${entry.lang}, words=${count}:`, match[0]);
      totalCount += count;
    }
  }
  return totalCount;
};
