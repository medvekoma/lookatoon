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

  it('renders boolean cells with c-bool class', () => {
    const doc: ToonDocument = {
      sections: [{
        kind: 'table',
        name: 'data',
        columns: ['label', 'active'],
        rows: [['a', true], ['b', false]],
      }],
    };
    const html = buildHtml(doc, 'nonce');
    expect(html).toContain('<td>true</td>');
    expect(html).toContain('<td>false</td>');
  });

  it('renders null cells with c-null class', () => {
    const doc: ToonDocument = {
      sections: [{
        kind: 'table',
        name: 'data',
        columns: ['label', 'value'],
        rows: [['a', null]],
      }],
    };
    const html = buildHtml(doc, 'nonce');
    expect(html).toContain('<td class="c-null">null</td>');
  });

  it('renders formatted-number strings with c-num class', () => {
    const doc: ToonDocument = {
      sections: [{
        kind: 'table',
        name: 'data',
        columns: ['label', 'size'],
        rows: [['x', '3.3M'], ['y', '77.7K'], ['z', '-1.5%']],
      }],
    };
    const html = buildHtml(doc, 'nonce');
    expect(html).toContain('<th class="c-num">size</th>');
    expect(html).toContain('<td class="c-num">3.3M</td>');
    expect(html).toContain('<td class="c-num">77.7K</td>');
    expect(html).toContain('<td class="c-num">-1.5%</td>');
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
