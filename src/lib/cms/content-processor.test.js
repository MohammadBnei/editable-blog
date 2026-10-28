import { expect, test } from 'bun:test';
import { getAllContent } from './content-processor.js';

// Node's readdirSync sorts names and Bun's does not, so without the sort in scanDir the
// order of same-date posts in the RSS feed would depend on the build's filesystem.
test('content is read in sorted path order, whatever the runtime', async () => {
  const urls = (await getAllContent()).map(e => e.url);
  expect(urls.length).toBeGreaterThan(1);
  const segments = u => u.split('/').filter(Boolean);
  // Depth-first walk over sorted names: compare segment by segment, a file's slug
  // against a sibling directory's name.
  const cmp = (a, b) => {
    const [x, y] = [segments(a), segments(b)];
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
      if (x[i] !== y[i]) {
        const nx = i === x.length - 1 ? `${x[i]}.md` : x[i];
        const ny = i === y.length - 1 ? `${y[i]}.md` : y[i];
        return nx < ny ? -1 : 1;
      }
    }
    return 0;
  };
  expect(urls).toEqual([...urls].sort(cmp));
});
