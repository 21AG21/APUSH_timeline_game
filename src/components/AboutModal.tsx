interface Props {
  analyticsOptOut: boolean
  onToggleAnalytics: () => void
  onClose: () => void
}

/**
 * Combined about / legal surface. The College Board trademark attribution here
 * is also mirrored in a persistent footer, since their guidelines say burying
 * it in a legal page alone is not sufficient.
 */
export function AboutModal({ analyticsOptOut, onToggleAnalytics, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-om-surface rounded-t-2xl sm:rounded-lg shadow-2xl w-full max-w-lg max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-om-border sticky top-0 bg-om-surface z-10">
          <h2 className="text-xl font-serif font-bold text-om-text">About &amp; Privacy</h2>
          <button
            onClick={onClose}
            aria-label="Close about"
            className="h-10 w-10 shrink-0 rounded-full text-om-muted hover:text-om-text text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 text-sm text-om-muted">
          <section className="space-y-2">
            <h3 className="font-semibold text-om-text">Your data stays on your device</h3>
            <p>
              Your game progress, settings, and study notes are saved only in your own browser.
              They are never sent to us or to anyone else. There are no accounts, and the app
              never asks for your name, email, or age.
            </p>
            <p>
              To erase everything, clear this site&rsquo;s data in your browser settings. On a
              shared or school computer, note that the next person using this browser could read
              notes you leave behind.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-om-text">Anonymous usage stats</h3>
            <p>
              We count page views and loading speed through Vercel Analytics. It sets no cookies
              and cannot identify you or follow you to other websites. Visitors are counted with a
              hash that resets every 24 hours.
            </p>
            <button
              onClick={onToggleAnalytics}
              className={`h-11 px-4 rounded-full text-sm font-medium transition-all ${
                analyticsOptOut
                  ? 'bg-om-accent text-om-accent-fg shadow-sm'
                  : 'bg-om-bg text-om-muted border border-om-border hover:text-om-text'
              }`}
            >
              {analyticsOptOut ? 'Analytics off — tap to allow' : 'Turn analytics off'}
            </button>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-om-text">Accuracy</h3>
            <p>
              This is a free, independent study aid. Content is provided as is, with no warranty
              of accuracy or completeness, and it is not a substitute for your course materials.
              Always check anything important against your textbook or teacher.
            </p>
          </section>

          <section className="space-y-2 border-t border-om-border pt-4">
            <p className="text-xs">
              AP<sup>&reg;</sup> and Advanced Placement<sup>&reg;</sup> are trademarks registered
              by the College Board, which is not affiliated with, and does not endorse, this
              website.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
