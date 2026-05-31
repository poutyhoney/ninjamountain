# Triage experiments (reference snapshots)

These are the original parallel implementations from the two-week
Support Triage Assistant project — building a support ticket triage system with the
Anthropic API, exploring classification, RAG, and tool-use agents. Kept here for
reference and learning.

- **`py/`** — Python port (`client`, `models`, `parse`, `triage`, `validate`)
- **`js/`** — plain-JavaScript port
- **`data/`** — sample tickets + labels used while building the project
- **`LESSONS.md`** — notes captured along the way

> **Not wired into the build.** Nothing in the app imports these files — they are a
> frozen snapshot, not live code. The **canonical, maintained** implementation is the
> TypeScript source in [`../src`](../src) (`@ninjamountain/triage`). If you change the
> triage behavior, change it there; these copies are intentionally left as-is.

Provenance: collected in the now-archived
[`poutyhoney/support-triage-assistant`](https://github.com/poutyhoney/support-triage-assistant)
repo, then pulled in here when that repo was retired.
