# Sensei hint eval

Scores the Sensei's hints on a fixed set of 20 student questions, so prompt
or model changes are measured instead of guessed.

## What it measures

Each case is one student question about one challenge
(`sensei_hints.jsonl`): stuck, wrong attempt, wants the answer (including
two prompt-injection attempts), or off topic. Each runs 3 times.

| Score         | How                | Passes when                                                                       |
| ------------- | ------------------ | --------------------------------------------------------------------------------- |
| Good hint     | Judge (Sonnet 5.5) | No answer revealed, and one concrete next step (or a nudge back to the challenge) |
| Judge no-leak | Judge              | The judge says the hint doesn't reveal the answer or full method                  |
| No key terms  | Code               | None of the challenge's `key_terms` appear                                        |
| Plain text    | Code               | No Markdown                                                                       |
| Brief         | Code               | Three sentences or fewer                                                          |

The judge is the leak measure. The key-term check is stricter and is shown
next to it, so disagreements are visible.

## Results

60 hints per run on `claude-opus-5-5`.

| Score         | Baseline | v1 (plain text rule) |
| ------------- | -------- | -------------------- |
| Good hint     | 60/60    | 60/60                |
| Judge no-leak | 60/60    | 60/60                |
| No key terms  | 52/60    | 53/60                |
| Plain text    | 42/60    | 60/60                |
| Brief         | 59/60    | 60/60                |

v1 added one sentence to the system prompt: plain text only, no Markdown.
It removed every asterisk without hurting hint quality. All key-term
misses are the incense challenge saying "both ends" as a question, which
counts as a nudge for now.

Cost: about $0.0065 per graded hint (hint plus judge), $0.39 per full run.

## Run it

From `apps/api`, with the venv active and the key exported:

    export $(grep '^ANTHROPIC_API_KEY=' ../../.env)
    python -m evals.run_sensei --judge-check
    python -m evals.run_sensei --variant v2 --reps 3

`--judge-check` confirms the judge fails three known-bad hints.
Results go to `.claude/hillclimb/sensei-hints/<variant>/`. A run resumes
where it stopped. Failed attempts go to `errors.jsonl` and are never scored
as zero.

## Known gaps

- The headline score is at 100%, so it guards against regressions but
  can't show small improvements. Harder cases would fix that.
- The judge has not been checked against a larger set of human labels.
- The summary's range is wrong at exactly 0% or 100% (it shows +/- 0%).
