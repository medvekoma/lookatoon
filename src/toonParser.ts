import { decode, type JsonValue } from '@toon-format/toon';

export type ToonCell = string | number | boolean | null;

export interface PropertiesSection {
  kind: 'properties';
  name: string;
  entries: [string, string][];
}

export interface TableSection {
  kind: 'table';
  name: string;
  columns: string[];
  rows: ToonCell[][];
}

export type ToonSection = PropertiesSection | TableSection;

export interface ToonDocument {
  sections: ToonSection[];
}

function isObject(v: JsonValue): v is Record<string, JsonValue> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isTableArray(v: JsonValue): v is Record<string, JsonValue>[] {
  return Array.isArray(v) && v.length > 0 && isObject(v[0]);
}

function toCell(v: JsonValue): ToonCell {
  if (v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    return v;
  }
  return String(v);
}

export function parseToon(text: string): ToonDocument {
  let decoded: JsonValue;
  try {
    decoded = decode(text);
  } catch {
    return { sections: [] };
  }

  if (!isObject(decoded)) return { sections: [] };

  const sections: ToonSection[] = [];

  for (const [name, value] of Object.entries(decoded)) {
    if (isTableArray(value)) {
      const columns = Object.keys(value[0]);
      const rows = value.map(item =>
        columns.map(col => toCell((item as Record<string, JsonValue>)[col] ?? null))
      );
      sections.push({ kind: 'table', name, columns, rows });
    } else if (isObject(value)) {
      const entries = Object.entries(value).map(
        ([k, v]) => [k, String(v)] as [string, string]
      );
      sections.push({ kind: 'properties', name, entries });
    }
  }

  return { sections };
}
