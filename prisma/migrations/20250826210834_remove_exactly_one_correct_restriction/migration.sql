-- Remove the constraint trigger that enforces exactly one correct alternative
DROP TRIGGER IF EXISTS trg_exactly_one_correct ON "alternative";

-- Remove the function that enforces exactly one correct alternative
DROP FUNCTION IF EXISTS enforce_exactly_one_correct();

-- Remove the unique index that prevents multiple correct alternatives per question
DROP INDEX IF EXISTS alternative_one_true_per_question;