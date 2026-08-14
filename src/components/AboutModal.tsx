interface Props {
  analyticsOptOut: boolean
  onToggleAnalytics: () => void
  onClose: () => void
}

/** Everything written to the visitor's device, kept in sync with PRIVACY.md. */
const STORED = [
  ['apush-game-state', 'Your current game: timeline, score, attempts, streak'],
  ['apush-flashcards', 'Which flashcards you have answered and when each is next due'],
  ['apush-notes', 'Study notes you write yourself'],
  ['apush-settings', 'Preferences: dark mode, hard mode, filters, analytics choice'],
  ['apush-panel-width', 'How wide you dragged the controls panel'],
  ['apush-event-count', 'Internal bookkeeping for the event list'],
  ['apush-data-version', 'Internal bookkeeping so old saves upgrade cleanly'],
]

const REPO = 'https://github.com/21AG21/APUSH_timeline_game/blob/main'

/**
 * Combined about / legal surface: cookies, on-device storage, analytics opt-out,
 * and the terms. It is the only place a visitor can read these, so the key terms
 * are stated here in full rather than only linked — the repository markdown is
 * not served as a page.
 *
 * The College Board trademark attribution is also mirrored in a persistent
 * footer, since their guidelines say a legal page alone is not sufficient.
 */
export function AboutModal({ analyticsOptOut, onToggleAnalytics, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-om-surface border border-om-border shadow-2xl w-full max-w-lg max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 rule-double sticky top-0 bg-om-surface z-10">
          <h2 className="text-xl font-serif font-bold text-om-text">About, privacy &amp; terms</h2>
          <button
            onClick={onClose}
            aria-label="Close about"
            className="h-10 w-10 shrink-0 text-om-muted hover:text-om-text text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 text-sm leading-relaxed text-om-body">
          <section className="space-y-2">
            <h3 className="label-mono text-om-text">Cookies</h3>
            <div className="border border-om-border border-l-[3px] border-l-om-accent bg-om-bg px-4 py-3">
              {/* The headline claim of the whole notice — set as a statement, not
                  as one of the small mono labels used for section headings. */}
              <p className="font-serif text-base font-bold text-om-text">
                This site does not use cookies.
              </p>
              <p className="mt-1.5">
                No cookies are set, by us or by anyone else, so there is nothing to consent to and
                no cookie banner to dismiss. Nothing here follows you to other websites.
              </p>
            </div>
            <p className="text-xs">
              You can check this yourself: open your browser&rsquo;s developer tools, look under
              Storage or Application, and the cookie list for this site will be empty.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="label-mono text-om-text">What is saved on your device</h3>
            <p>
              Instead of cookies, the app keeps your progress in your browser&rsquo;s local
              storage. It stays on your device, is never transmitted anywhere, and is not
              readable by other websites. There are no accounts, and the app never asks for your
              name, email, or age.
            </p>
            <ul className="space-y-1 pt-1">
              {STORED.map(([key, what]) => (
                <li key={key} className="flex flex-col sm:flex-row sm:gap-2">
                  <code className="label-mono text-om-text shrink-0 normal-case tracking-normal">{key}</code>
                  <span className="text-xs">{what}</span>
                </li>
              ))}
            </ul>
            <p className="pt-1">
              To erase all of it, clear this site&rsquo;s data in your browser settings. On a
              shared or school computer, the next person using this browser could read notes you
              leave behind.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="label-mono text-om-text">Anonymous usage stats</h3>
            <p>
              We count page views and loading speed through Vercel Analytics and Speed Insights.
              They set no cookies, cannot identify you, and are served from this site&rsquo;s own
              domain rather than a third-party host. Visitors are counted with a hash that resets
              every 24 hours.
            </p>
            <button
              onClick={onToggleAnalytics}
              className={`label-mono h-11 px-4 border transition-colors ${
                analyticsOptOut
                  ? 'bg-om-accent border-om-accent text-om-accent-fg'
                  : 'border-om-border text-om-muted hover:text-om-text hover:bg-om-slot-hover'
              }`}
            >
              {analyticsOptOut ? 'Analytics off — tap to allow' : 'Turn analytics off'}
            </button>
            <p className="text-xs">
              Turning this off stops the scripts from loading at all — it is not just a flag.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="label-mono text-om-text">No third parties</h3>
            <p>
              The app loads no third-party scripts, trackers, images, or fonts. Fonts are served
              from this site&rsquo;s own domain specifically so that visiting the page does not
              disclose your IP address to anyone else. The site is hosted by Vercel, which
              processes standard server request data in order to serve the page.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="label-mono text-om-text">Terms of use</h3>
            <p>
              <span className="font-semibold text-om-text">Not affiliated with the College Board.</span>{' '}
              This is an independent, unofficial project. Nothing here is approved, reviewed, or
              endorsed by the College Board.
            </p>
            <p>
              <span className="font-semibold text-om-text">No warranty on accuracy.</span> The
              historical content is provided as is, with no warranty of accuracy or completeness.
              It is a study aid, not a source of record, and not a substitute for your course
              materials, textbook, or teacher. Dates, causes, and effects are compressed into
              short summaries for a game; real history is more complicated. Verify anything you
              plan to write on an exam against an authoritative source. Using this site does not
              guarantee any particular score.
            </p>
            <p>
              <span className="font-semibold text-om-text">Limitation of liability.</span> To the
              fullest extent permitted by law, the authors are not liable for any damages arising
              from your use of, or inability to use, this site — including lost notes or reliance
              on content that turns out to be inaccurate.
            </p>
            <p>
              <span className="font-semibold text-om-text">Your data is not backed up.</span> Progress
              and notes live only in this browser and can be lost if you clear browser data, use
              private browsing, or switch devices. Keep your own copy of anything you care about.
            </p>
            <p>
              <span className="font-semibold text-om-text">Availability.</span> The site is provided
              with no guarantee of availability and may change or be taken down at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="label-mono text-om-text">Licence &amp; full documents</h3>
            <p>
              The source code and event dataset are released under the MIT Licence, which covers
              this project&rsquo;s own work and grants no rights in any third-party trademark.
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <a
                className="label-mono underline text-om-text"
                href={`${REPO}/PRIVACY.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Full privacy policy
              </a>
              <a
                className="label-mono underline text-om-text"
                href={`${REPO}/TERMS.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Full terms of use
              </a>
              <a
                className="label-mono underline text-om-text"
                href={`${REPO}/LICENSE`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Licence
              </a>
            </p>
          </section>

          <section className="space-y-2 border-t border-om-border pt-4">
            <p className="text-xs">
              AP<sup>&reg;</sup> and Advanced Placement<sup>&reg;</sup> are trademarks registered
              by the College Board, which is not affiliated with, and does not endorse, this
              website.
            </p>
            <p className="text-xs">Last updated 13 August 2026.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
