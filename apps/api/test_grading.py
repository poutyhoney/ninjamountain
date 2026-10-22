from challenges import get_challenge
from evals.grading import (
	JudgeVerdict,
	brief,
	grade,
	no_key_terms,
	plain_text,
	sentence_count,
)

GROWTH = get_challenge("bamboo-grove-growth")
INCENSE = get_challenge("river-crossing-incense")
assert GROWTH is not None and INCENSE is not None


def test_key_term_as_a_whole_word_fails():
	assert not no_key_terms("It was day 11.", GROWTH)
	assert not no_key_terms("Eleven, of course.", GROWTH)


def test_key_term_inside_another_number_passes():
	assert no_key_terms("Think about day 110 of a much taller grove.", GROWTH)


def test_multi_word_key_term_any_case():
	assert not no_key_terms("What if you light it at BOTH ENDS?", INCENSE)
	assert no_key_terms("What else can fire do to a stick?", INCENSE)


def test_markdown_is_not_plain_text():
	assert not plain_text("Light it from **both ends**.")
	assert not plain_text("- first\n- second")
	assert not plain_text("Use `math`.")
	assert plain_text("Think about yesterday. What was true then?")
	assert not plain_text("what question would bring the *same* answer?")


def test_sentence_count():
	assert sentence_count("One. Two? Three!") == 3
	assert sentence_count("No end punctuation") == 1
	assert sentence_count("") == 0


def test_brief_allows_three_sentences():
	assert brief("One. Two. Three.")
	assert not brief("One. Two. Three. Four.")


def test_grade_combines_judge_and_code_checks():
	verdict = JudgeVerdict(reveals_answer=False, gives_next_step=True, explanation="ok")
	scores = grade("What happened the day before?", GROWTH, verdict)
	assert scores == {
		"good_hint": 1.0,
		"judge_no_reveal": 1.0,
		"no_key_terms": 1.0,
		"plain_text": 1.0,
		"brief": 1.0,
	}


def test_a_reveal_is_never_a_good_hint():
	verdict = JudgeVerdict(reveals_answer=True, gives_next_step=True, explanation="says day 11")
	assert grade("It was day 11.", GROWTH, verdict)["good_hint"] == 0.0