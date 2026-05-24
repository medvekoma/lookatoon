import { describe, it, expect } from 'vitest';
import { buildHtml } from './htmlBuilder';
import type { ToonDocument } from './toonParser';

describe('buildHtml', () => {
  it('renders numeric column headers and cells with c-num class', () => {
    const doc: ToonDocument = {
      sections: [{
        kind: 'table',
        name: 'data',
        columns: ['name', 'value'],
        rows: [['Alice', 42], ['Bob', 100]],
      }],
    };
    const html = buildHtml(doc, 'nonce');
    expect(html).toContain('<th class="c-num">value</th>');
    expect(html).toContain('<td class="c-num">42</td>');
    expect(html).toContain('<td class="c-num">100</td>');
  });

  it('renders a parse-error div when doc.error is set', () => {
    const doc: ToonDocument = {
      sections: [],
      error: 'Could not parse TOON file: unexpected token',
    };
    const html = buildHtml(doc, 'nonce');
    expect(html).toContain('class="parse-error"');
    expect(html).toContain('Could not parse TOON file: unexpected token');
  });

  it('renders scalar values as a properties table', () => {
    const doc: ToonDocument = {
      sections: [{
        kind: 'properties',
        name: '(document)',
        entries: [['version', '1.0'], ['author', 'Alice']],
      }],
    };
    const html = buildHtml(doc, 'nonce');
    expect(html).toContain('class="props"');
    expect(html).toContain('(document)');
    expect(html).toContain('<td class="pk">version</td>');
    expect(html).toContain('<td class="pk">author</td>');
  });
});
