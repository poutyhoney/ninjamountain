# Experiments

A log of A/B tests on the store. Each entry says what we expected, how it
was measured, what happened, and what we decided.

## 1. Offer card layout: CTA first

| | |
| --- | --- |
| Status | Done (simulated traffic, local only) |
| GrowthBook | Feature `offer-card-layout`, experiment `exp_3ryijdmveao6b9` |
| Variations | `control` (0), `cta-first` (1) |
| Split | 50/50, hashed on the visitor ID |
| Visitors | 5,000 |

### Hypothesis

On each offer card, the "Choose" button sits below the perk list. On small
screens, visitors have to scroll past the perks to reach it. If the button
comes right after the price, more visitors will start checkout, because the
next step is visible as soon as they see the price.

We expected checkout starts to go up, without pushing people toward cheaper
belts.

### Design

- **Control:** name, price, perks, then the button (the current card).
- **CTA first:** name, price, the button, then perks. Same content and
  styles; only the order changes. The card's `data-layout` attribute shows
  which one rendered.
- **Assignment:** `proxy.ts` gives each visitor a random ID in the `nm_vid`
  cookie. GrowthBook hashes that ID, so a visitor sees the same layout on
  every visit.
- **Exposure:** when the pricing page renders, the store records an
  `experiment_viewed` event (experiment and variation) in Postgres. Only a
  visitor's first exposure counts.
- **Conversion:** the checkout server action records `checkout_started`
  (offer and price) before redirecting to Stripe. Only conversions after the
  visitor's first exposure count.
- **Analysis:** GrowthBook reads the events table with a read-only Postgres
  role. Bayesian engine, default settings.

### Metrics

| Metric | Type | Definition |
| --- | --- | --- |
| Checkout started | Primary (goal) | Share of exposed visitors with at least one `checkout_started` |
| Average checkout value | Guardrail | Total checkout price divided by number of checkouts |

The guardrail checks that a higher checkout rate doesn't come from people
picking cheaper belts.

### Results

| Variation | Visitors | Checkouts | Rate |
| --- | --- | --- | --- |
| Control | 2,509 | 186 | 7.41% |
| CTA first | 2,491 | 242 | 9.72% |

- **Primary:** +31% relative lift, 99.4% chance to beat control. A
  frequentist check gives the same answer (z about 2.9, p about 0.004).
- **Guardrail:** average checkout value was 5.9% lower for CTA first, with a
  2% chance to beat control. See "The guardrail alarm" below.
- **SRM check:** 2,509 vs 2,491 on a 50/50 split (p about 0.80). No sample
  ratio mismatch, so assignment and exposure tracking look healthy.

### The guardrail alarm

The simulation used the same belt mix for both groups (70% Brown, 30%
Black), so the true effect on checkout value is zero. Breaking the metric
down by belt shows what happened:

| Variation | Black Belt share of checkouts |
| --- | --- |
| Control | 37.6% |
| CTA first | 28.5% |

CTA first is close to the expected 30%. Control drew an unusually high share
of Black Belt checkouts by chance, which made its average look higher. The
treatment did not move people to the cheaper belt.

This is a false alarm. Each extra metric is another chance for noise to look
like a result (the multiple comparisons problem). With real traffic, the
right move would be to break the metric down like this, compare each group to
the normal belt mix, and run longer before blocking a launch.

### Decision

Ship CTA first. It clearly raised checkout starts, and the guardrail drop is
explained by noise in the control group.

With real traffic, I would first re-check the guardrail with more visitors.

### Caveats

- **Simulated data.** `apps/api/scripts/simulate_traffic.py` loads the real
  store page (real assignment, real exposure event), then converts at 8% for
  control and 10% for CTA first. The true lift was +25%; the measured +31% is
  within sampling noise. This tests the pipeline and the analysis, not real
  user behavior.
- **Checkout started, not purchase.** The conversion is the click into
  Stripe, not a completed payment. Revenue would need Stripe webhooks.
- **Exposure ordering bug, fixed.** The first run counted only 191 of 433
  checkouts. The store records exposures with `after()`, which runs once the
  response is sent, and the script clicked in 0 ms. Many checkouts landed in
  the table before their exposure, so GrowthBook dropped them. A 0.5 second
  think time in the script fixed it. Real visitors take longer than that, but
  a production setup should record client timestamps or allow for some clock
  skew.
- **Local only.** GrowthBook runs in Docker on this machine. Production and
  CI don't set `GROWTHBOOK_CLIENT_KEY`, so every live visitor sees control.

## How to run an experiment here

1. Start Postgres, the API, and GrowthBook (see the README).
2. Add a feature with an experiment rule in GrowthBook. Use `id` as the hash
   attribute.
3. Read the variation in the page with `lib/growthbook.ts` and record
   exposure with `recordEvent("experiment_viewed", ...)`.
4. Pick the primary metric and guardrails before looking at results.
5. Work out how many visitors you need (GrowthBook's power calculator).
6. Check SRM first. If the split is off, fix tracking before reading any
   metric.
