/**
 * Embedded panchang data for all years.
 * This file imports all panchang JSON files and exports them as a single object.
 * This avoids dynamic import issues in bundled code.
 */

import data2082 from './2082.json' assert { type: 'json' }
import data2083 from './2083.json' assert { type: 'json' }
import data2084 from './2084.json' assert { type: 'json' }
import data2085 from './2085.json' assert { type: 'json' }
import data2086 from './2086.json' assert { type: 'json' }
import data2087 from './2087.json' assert { type: 'json' }

export const PANCHANG_DATA: Record<number, typeof data2082> = {
  2082: data2082,
  2083: data2083,
  2084: data2084,
  2085: data2085,
  2086: data2086,
  2087: data2087,
}

export type { PanchangEntry } from './schema.js'
