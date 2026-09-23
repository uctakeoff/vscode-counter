import ignore, { type Ignore } from 'ignore';

/**
 * The rules of a single `.gitignore` file, together with the directory they are relative to.
 */
type Section = {
  /** Directory the patterns apply to. Either empty, or normalized to end with '/'. */
  dir: string;
  /** Number of path segments in `dir`. Used to apply shallower files before deeper ones. */
  depth: number;
  rules: Ignore;
};

/** Normalizes to '/' separators and guarantees a trailing '/' so it can be used as a path prefix. */
const normalizeDir = (dir: string): string => {
  const normalized = dir.replace(/\\/g, '/');
  return (normalized === '' || normalized.endsWith('/')) ? normalized : `${normalized}/`;
};

/** Mirrors git's own parsing: blank lines and lines starting with '#' carry no pattern. */
const hasPatterns = (gitignoreData: string): boolean => {
  return gitignoreData.split(/\r\n|\r|\n/).some(line => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith('#');
  });
};

/**
 * Pattern matching is delegated to the `ignore` package, which implements git's own
 * specification, so `?`, character classes, escapes and negations behave as git does.
 */
export default class Gitignore {
  private sections: Section[];

  constructor(gitignoreData: string, gitignoreCurrentDir = '') {
    const dir = normalizeDir(gitignoreCurrentDir);
    // A file with no patterns would still match every path as a prefix, so skip it entirely.
    this.sections = hasPatterns(gitignoreData)
      ? [{ dir, depth: (dir.match(/\//g) ?? []).length, rules: ignore().add(gitignoreData) }]
      : [];
  }

  /**
   * Returns true when `filepath` is ignored.
   * Sections are applied from the shallowest `.gitignore` to the deepest, so a deeper file
   * overrides a shallower one, and within one file the last matching pattern wins.
   */
  public includes(filepath: string): boolean {
    const target = filepath.replace(/\\/g, '/');
    let ignored = false;
    for (const section of this.sections) {
      if (!target.startsWith(section.dir)) { continue; }
      const relative = target.slice(section.dir.length);
      // `ignore` rejects anything that is not a `path.relative()`d string.
      if (!relative || !ignore.isPathValid(relative)) { continue; }
      const result = section.rules.test(relative);
      if (result.ignored) {
        ignored = true;
      } else if (result.unignored) {
        ignored = false;
      }
    }
    return ignored;
  }

  public excludes(filepath: string): boolean {
    return !this.includes(filepath);
  }

  public merge(...subrules: Gitignore[]): Gitignore {
    const merged = new Gitignore('');
    // A stable sort keeps `.gitignore` files at the same depth in the order they were given.
    merged.sections = [...this.sections, ...subrules.flatMap(g => g.sections)]
      .sort((a, b) => a.depth - b.depth);
    return merged;
  }

  get debugString(): string {
    return this.sections.map(s => `[${s.dir || '.'}] depth:${s.depth}`).join('\n');
  }
}
