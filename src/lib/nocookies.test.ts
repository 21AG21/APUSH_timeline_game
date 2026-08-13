import { describe, it, expect } from 'vitest'

/**
 * PRIVACY.md, TERMS.md and the in-app notice all state plainly that this site sets
 * no cookies, and on that basis it shows no consent banner. That is a claim about
 * behaviour, so it needs a test: if someone later writes a cookie, the promise
 * silently becomes false and the missing banner becomes a real problem.
 *
 * Sources are read through Vite's glob rather than node:fs because tsconfig.app.json
 * scopes types to vite/client, so Node globals do not typecheck under `tsc -b` —
 * which is what the deploy runs.
 */
const sources = import.meta.glob(['../**/*.{ts,tsx}', '!../**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const docs = import.meta.glob('../../*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const pkgRaw = import.meta.glob('../../package.json', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const doc = (name: string) => {
  const hit = Object.entries(docs).find(([p]) => p.endsWith(`/${name}`))
  if (!hit) throw new Error(`${name} not found`)
  return hit[1]
}

describe('no-cookie guarantee', () => {
  it('finds source files to scan', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(10)
  })

  it('never writes document.cookie', () => {
    const offenders = Object.entries(sources)
      .filter(([, src]) => /document\s*\.\s*cookie\s*=/.test(src))
      .map(([p]) => p)
    expect(offenders).toEqual([])
  })

  it('never reads document.cookie either', () => {
    // Reading is not itself a cookie, but it signals cookie-based logic creeping in.
    const offenders = Object.entries(sources)
      .filter(([, src]) => /document\s*\.\s*cookie/.test(src))
      .map(([p]) => p)
    expect(offenders).toEqual([])
  })

  it('pulls in no cookie library', () => {
    const pkg = JSON.parse(Object.values(pkgRaw)[0])
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
    expect(deps.filter((d) => /cookie/i.test(d))).toEqual([])
  })

  it('keeps the documented storage keys and the code in agreement', () => {
    // Every apush-* key the app touches must be listed in PRIVACY.md and in the
    // in-app notice, so neither can drift out of date unnoticed.
    const used = new Set<string>()
    for (const src of Object.values(sources)) {
      for (const m of src.matchAll(/'(apush-[a-z-]+)'/g)) used.add(m[1])
    }
    expect(used.size).toBeGreaterThan(0)

    const privacy = doc('PRIVACY.md')
    const about = Object.entries(sources).find(([p]) => p.endsWith('AboutModal.tsx'))![1]
    for (const key of used) {
      expect(privacy, `${key} missing from PRIVACY.md`).toContain(key)
      expect(about, `${key} missing from the in-app notice`).toContain(key)
    }
  })

  it('states the no-cookie position in both legal documents', () => {
    for (const name of ['PRIVACY.md', 'TERMS.md']) {
      expect(doc(name).toLowerCase(), `${name} should address cookies`).toMatch(
        /no cookies|does not use cookies/
      )
    }
  })
})
