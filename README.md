# US History Timeline

A free, independent study game for AP® U.S. History. You are given a historical
event and you place it in the correct spot on a growing timeline — by dragging it
or by tapping a slot. Correct placements build a streak; every event carries its
causes, effects, and long-run significance so the ordering practice doubles as
review.

There is also a **flashcard mode** built on the same dataset: six cards per event
(date, identification, causes, effects, significance, period) on a Leitner
schedule, filterable by period and card type.

Works on phones, tablets, and desktop. Everything runs locally in the browser —
there is no account and no server.

> AP® and Advanced Placement® are trademarks registered by the College Board,
> which is not affiliated with, and does not endorse, this project.

## Running it

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npx vitest run   # tests
```

## How it works

- **`src/data/apush.json`** — the event dataset. Each event carries a year,
  description, cause/effect, significance, region, and College Board unit(s).
- **`src/lib/game.ts`** — pure game logic: placement validation, scoring by gap
  tightness, and a weighted draw that resurfaces events you have missed.
- **`src/lib/flashcards.ts`** — cards are *derived* from the event data rather than
  authored separately, so correcting an event updates every card drawn from it and
  the two cannot drift apart. Card ids are stable across rebuilds, so scheduling
  survives a deploy. Note `maskYear`: ten titles in the deck name their own year
  ("Election of 1828"), which would give away the answer on a date card.
- **`src/hooks/usePointerDrag.ts`** — placement dragging. Built on Pointer Events
  rather than HTML5 drag-and-drop, which never fires on touch devices.
- **`src/hooks/useMediaQuery.ts`** — picks the stacked or split layout from both
  viewport width *and* height, so landscape phones get the split view.

### Units and periods

Events are tagged with College Board units, whose period ranges deliberately
overlap at the edges (1865 falls in both Period 5 and Period 6). Every unit an
event is tagged with must contain that event's year — `src/data/apush.test.ts`
enforces this, along with duplicate, structural, and coverage checks. Run the
tests after any edit to the dataset.

## Dataset provenance

The event entries — descriptions, causes, effects, and significance — are
original prose written for this project. They are not transcribed or reworded
from any textbook, prep book, encyclopedia, or the College Board's Course and
Exam Description. Historical facts (dates, names, outcomes) are not
copyrightable; only specific expression is, and the expression here is the
project's own.

The dataset has been audited by independent reviewers for factual accuracy,
correct unit assignment, and curriculum relevance.

Only the nine period **date ranges** are shared with College Board materials, and
bare date boundaries are facts, not expression. No CED unit titles, topic
descriptions, or learning objectives are reproduced.

**If you add events, write them yourself.** Do not paste text from Wikipedia:
it is CC BY-SA, which would require attribution *and* force this project's
dataset to be relicensed under share-alike terms.

## Privacy guardrail

This project's privacy posture rests on one fact: **no user data ever leaves the
device.** Game state and study notes live in `localStorage` and are never
transmitted. Usage analytics are cookieless, first-party, and can be switched
off in-app.

**Do not add an age field, account system, email capture, leaderboard, or
server-side sync without a privacy review first.** Each of those changes the
analysis materially — collecting a birth year in particular would manufacture the
"actual knowledge" of a user's age that the current design deliberately lacks.

See [PRIVACY.md](./PRIVACY.md) and [TERMS.md](./TERMS.md).

## License

[MIT](./LICENSE).
