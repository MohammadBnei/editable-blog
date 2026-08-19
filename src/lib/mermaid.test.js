import { describe, expect, test } from 'bun:test';
import { hasMermaid, mermaidTheme } from './mermaid.js';

describe('hasMermaid', () => {
  test('finds the class the content-processor emits', () => {
    expect(hasMermaid('<pre class="mermaid not-prose">flowchart LR</pre>')).toBe(true);
  });

  test('ignores a plain code block and the untransformed fence', () => {
    expect(hasMermaid('<pre class="language-mermaid"><code>flowchart LR</code></pre>')).toBe(false);
    expect(hasMermaid('<p>mermaid is a library</p>')).toBe(false);
  });

  test('survives the missing content it is called with (qa turns, pauses)', () => {
    expect(hasMermaid(undefined)).toBe(false);
    expect(hasMermaid(null)).toBe(false);
  });
});

describe('mermaidTheme', () => {
  test('maps the dark daisyUI theme to mermaid dark', () => {
    expect(mermaidTheme('notebook-dark')).toBe('dark');
  });

  test('everything else, including an unset attribute, is the light default', () => {
    expect(mermaidTheme('notebook')).toBe('default');
    expect(mermaidTheme(undefined)).toBe('default');
  });
});
