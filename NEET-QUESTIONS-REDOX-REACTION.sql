-- NEET Chemistry - Redox Reaction Questions
-- Run this in Supabase SQL Editor to add all questions

-- First, ensure the Chemistry chapter exists
INSERT INTO chapters (name, subject, description, order_index) 
VALUES ('Redox Reaction', 'Chemistry', 'Master oxidation, reduction, and redox reactions', 1)
ON CONFLICT DO NOTHING;

-- Get the chapter ID (we'll use it for topic creation)
-- For topics, we need to insert them and reference the chapter

-- Insert topics for Redox Reaction chapter
INSERT INTO topics (chapter_id, name, order_index) VALUES
((SELECT id FROM chapters WHERE name = 'Redox Reaction' AND subject = 'Chemistry'), 'Oxidation and Reduction', 1),
((SELECT id FROM chapters WHERE name = 'Redox Reaction' AND subject = 'Chemistry'), 'Oxidation State', 2),
((SELECT id FROM chapters WHERE name = 'Redox Reaction' AND subject = 'Chemistry'), 'Equivalent Weight', 3),
((SELECT id FROM chapters WHERE name = 'Redox Reaction' AND subject = 'Chemistry'), 'Types of Redox Reaction', 4),
((SELECT id FROM chapters WHERE name = 'Redox Reaction' AND subject = 'Chemistry'), 'Oxidation Number', 5),
((SELECT id FROM chapters WHERE name = 'Redox Reaction' AND subject = 'Chemistry'), 'Disproportionation', 6),
((SELECT id FROM chapters WHERE name = 'Redox Reaction' AND subject = 'Chemistry'), 'Oxidant and Reductant', 7),
((SELECT id FROM chapters WHERE name = 'Redox Reaction' AND subject = 'Chemistry'), 'Balancing of Redox Reaction', 8),
((SELECT id FROM chapters WHERE name = 'Redox Reaction' AND subject = 'Chemistry'), 'Previous Year Questions', 9),
((SELECT id FROM chapters WHERE name = 'Redox Reaction' AND subject = 'Chemistry'), 'Analytical Questions', 10),
((SELECT id FROM chapters WHERE name = 'Redox Reaction' AND subject = 'Chemistry'), 'ALLEN RACE', 11)
ON CONFLICT DO NOTHING;

-- Now insert all questions
-- Topic: Oxidation and Reduction
INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation and Reduction' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Oxidation is defined as -',
  '["Gain of electrons", "Decrease in positive valency", "Loss of electrons", "Addition of electropositive element"]'::jsonb,
  2,
  'Oxidation is the loss of electrons from an atom or molecule.',
  'easy'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text = 'Oxidation is defined as -');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation and Reduction' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Reduction is defined as -',
  '["Increase in positive valency", "Gain of electrons", "Loss of protons", "Decrease in negative valency"]'::jsonb,
  1,
  'Reduction is the gain of electrons by an atom or molecule.',
  'easy'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text = 'Reduction is defined as -');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation and Reduction' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'In the reaction MnO₄⁻ + SO₃²⁻ + H⁺ → SO₄²⁻ + Mn²⁺ + H₂O',
  '["MnO₄⁻ and H⁺ both are reduced", "MnO₄⁻ is reduced and H⁺ is oxidised", "MnO₄⁻ is reduced and SO₃²⁻ is oxidised", "MnO₄⁻ is oxidised and SO₃²⁻ is reduced"]'::jsonb,
  2,
  'MnO₄⁻ is reduced from +7 to +2, and SO₃²⁻ is oxidised to SO₄²⁻.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'In the reaction MnO₄%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation and Reduction' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Which of the following halogen always show only one oxidation state in its compounds?',
  '["Cl", "F", "Br", "I"]'::jsonb,
  1,
  'Fluorine is the most electronegative element and always shows -1 oxidation state in its compounds.',
  'easy'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Which of the following halogen always%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation and Reduction' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Which of the following reactions do not involve oxidation-reduction?',
  '["2Rb+2H₂O→2RbOH+H₂", "2CuI₂→2CuI+I₂", "NH₄Cl+NaOH→NaCl+NH₃+H₂O", "3Mg+N₂→Mg₃N₂"]'::jsonb,
  2,
  'Acid-base reactions do not involve change in oxidation states. NH₄Cl+NaOH is an acid-base reaction.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Which of the following reactions do not%');

-- Topic: Oxidation State
INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation State' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'In which of the following compounds, the oxidation state of I-atom is highest?',
  '["KI₃", "KIO₄", "KIO₃", "IF₅"]'::jsonb,
  1,
  'In KIO₄, iodine has +7 oxidation state, which is the highest among all given options.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'In which of the following compounds, the oxidation state of I%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation State' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'The oxidation number of phosphorus in Ba(H₂PO₂)₂ is',
  '["+3", "+2", "+1", "-1"]'::jsonb,
  2,
  'In H₂PO₂⁻, phosphorus has +1 oxidation state.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'The oxidation number of phosphorus in Ba%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation State' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Positive oxidation state of an element indicates that it is -',
  '["Elementry form", "Oxidised", "Reduced", "Only reductant"]'::jsonb,
  1,
  'A positive oxidation state indicates that the element has lost electrons and is therefore oxidised.',
  'easy'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Positive oxidation state%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation State' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'The oxidation state of oxygen atom in potassium superoxide is -',
  '["Zero", "-1/2", "-1", "-2"]'::jsonb,
  1,
  'In KO₂ (potassium superoxide), oxygen has -1/2 oxidation state.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'The oxidation state of oxygen atom in potassium superoxide%');

-- Topic: Oxidation Number
INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation Number' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'In [Ni(CO)₄], the oxidation state of Ni is:',
  '["4", "0", "2", "8"]'::jsonb,
  1,
  'In [Ni(CO)₄], CO is a neutral ligand, so Ni has 0 oxidation state.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'In [Ni(CO)%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation Number' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'The oxidation number of nitrogen in NH₂OH is:',
  '["0", "+1", "-1", "-2"]'::jsonb,
  2,
  'In NH₂OH (hydroxylamine), nitrogen has -1 oxidation state.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'The oxidation number of nitrogen in NH₂OH%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation Number' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Of the following elements, which one has the same oxidation state in all of its compounds?',
  '["Hydrogen", "Fluorine", "Carbon", "Oxygen"]'::jsonb,
  1,
  'Fluorine always shows -1 oxidation state in all its compounds.',
  'easy'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Of the following elements, which one has the same oxidation state%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation Number' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Oxidation number of fluorine in OF₂ is:',
  '["+1", "+2", "-1", "-2"]'::jsonb,
  2,
  'In OF₂, fluorine has -1 oxidation state because it is more electronegative than oxygen.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Oxidation number of fluorine in OF₂%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidation Number' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Oxidation state of oxygen in hydrogen peroxide is',
  '["-1", "+1", "0", "-2"]'::jsonb,
  0,
  'In H₂O₂, oxygen has -1 oxidation state.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Oxidation state of oxygen in hydrogen peroxide%');

-- Types of Redox Reaction
INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Types of Redox Reaction' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Choose the redox reaction from the following-',
  '["Cu+2H₂SO₄→CuSO₄+SO₂+2H₂O", "BaCl₂+H₂SO₄→BaSO₄+2HCl", "2NaOH+H₂SO₄→Na₂SO₄+2H₂O", "KNO₃+H₂SO₄→HNO₃+K₂SO₄"]'::jsonb,
  0,
  'Cu+2H₂SO₄→CuSO₄+SO₂+2H₂O is a redox reaction where Cu is oxidised and S is reduced.',
  'easy'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Choose the redox reaction from the following%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Types of Redox Reaction' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Which of the following is not a redox reaction?',
  '["MnO₄⁻→MnO₂+O₂", "Cl₂+H₂O→HCl+HClO", "2CrO₄²⁻+2H⁺→Cr₂O₇²⁻+H₂O", "MnO₄⁻+8H⁺+5Ag→Mn²⁺+4H₂O+5Ag⁺"]'::jsonb,
  2,
  '2CrO₄²⁻+2H⁺→Cr₂O₇²⁻+H₂O is not a redox reaction; it\'s just a condensation reaction.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Which of the following is not a redox reaction%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Types of Redox Reaction' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'In the reaction 6Li+N₂→2Li₃N',
  '["Li undergoes reduction", "Li undergoes oxidation", "N undergoes oxidation", "Li is oxidant"]'::jsonb,
  1,
  'Li undergoes oxidation from 0 to +1, and N undergoes reduction from 0 to -3.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'In the reaction 6Li+N₂%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Types of Redox Reaction' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'H₂O₂+H₂O₂→2H₂O+O₂ is an example of disproportionation because',
  '["Oxidation number of oxygen only decreases", "Oxidation number of oxygen only increases", "Oxidation number of oxygen decreases as well as increases", "Oxidation number of oxygen neither decreases nor increases"]'::jsonb,
  2,
  'In H₂O₂, oxygen is -1, in H₂O it is -2 (decreased), and in O₂ it is 0 (increased).',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'H₂O₂+H₂O₂%');

-- Disproportionation
INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Disproportionation' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Which of the following example does not represent disproportionation -',
  '["MnO₂+4HCl→MnCl₂+Cl₂+2H₂O", "2H₂O₂→2H₂O+O₂", "4KClO₃→3KClO₄+KCl", "3Cl₂+6NaOH→5NaCl+NaClO₃+3H₂O"]'::jsonb,
  0,
  'MnO₂+4HCl is a redox reaction but not disproportionation as two different elements are involved.',
  'hard'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Which of the following example does not represent disproportionation%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Disproportionation' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Which of the following change represents a disproportionation reaction(s):',
  '["Cl₂+2OH⁻→ClO⁻+Cl⁻+H₂O", "Cu₂O+2H⁺→Cu+Cu²⁺+H₂O", "2HCuCl₂→Cu+Cu²⁺+4Cl⁻+2H⁺", "All of the above"]'::jsonb,
  3,
  'All three reactions are examples of disproportionation where a single element shows both oxidation and reduction.',
  'hard'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Which of the following change represents a disproportionation%');

-- Oxidant and Reductant
INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidant and Reductant' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'A reducing agent is a substance which can :',
  '["Accept electrons", "Donate electrons", "Accept protons", "Donate protons"]'::jsonb,
  1,
  'A reducing agent donates electrons and undergoes oxidation.',
  'easy'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'A reducing agent is a substance which can%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidant and Reductant' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'The reaction H₂S+H₂O₂→S+2H₂O manifests:',
  '["Oxidising action of H₂O₂", "Reducing nature of H₂O₂", "Acidic nature of H₂O₂", "Alkaline nature of H₂O₂"]'::jsonb,
  0,
  'H₂O₂ acts as an oxidising agent, oxidising S²⁻ to S⁰.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'The reaction H₂S+H₂O₂%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Oxidant and Reductant' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'The compound that can work both as an oxidising as well as reducing agent is:',
  '["KMnO₄", "H₂O₂", "Fe₂(SO₄)₃", "K₂Cr₂O₇"]'::jsonb,
  1,
  'H₂O₂ can act as both an oxidising and reducing agent depending on the reaction.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'The compound that can work both%');

-- Balancing of Redox Reaction
INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Balancing of Redox Reaction' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'In the reaction: MnO₄⁻+xH⁺+ne⁻→Mn²⁺+yH₂O What is the value of n:',
  '["5", "8", "6", "3"]'::jsonb,
  0,
  'Mn in MnO₄⁻ goes from +7 to +2, requiring 5 electrons.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'In the reaction: MnO₄%xH%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Balancing of Redox Reaction' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'The number of electrons required to balance the following equation - NO₃⁻+4H⁺+e⁻→2H₂O+NO is:',
  '["5", "4", "3", "2"]'::jsonb,
  2,
  'N in NO₃⁻ goes from +5 to +2 in NO, requiring 3 electrons.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'The number of electrons required to balance%NO₃%');

-- Equivalent Weight (selected questions)
INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Equivalent Weight' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Molecular weight of KMnO₄ in acidic medium and neutral medium will be respecitvely',
  '["7 x equivalent weight and 2 x equivalent weight", "5 x equivalent weight and 3 x equivalent weight", "4 x equivalent weight and 5 x equivalent weight", "2 x equivalent weight and 4 x equivalent weight"]'::jsonb,
  1,
  'In acidic medium, KMnO₄ has n-factor 5, in neutral medium n-factor is 3.',
  'hard'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Molecular weight of KMnO₄%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Equivalent Weight' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'In acidic medium, equivalent weight of K₂Cr₂O₇ (Molecular weight = M) is -',
  '["M/3", "M/4", "M/6", "M/2"]'::jsonb,
  2,
  'Cr in K₂Cr₂O₇ goes from +6 to +3, with 2 Cr atoms, n-factor = 6.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'In acidic medium, equivalent weight of K₂Cr₂O₇%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Equivalent Weight' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Equivalent weight of N₂ in the change N₂→NH₃ is :-',
  '["28/6", "28", "28/2", "28/3"]'::jsonb,
  0,
  'N in N₂ goes from 0 to -3 in NH₃, with 2 N atoms, n-factor = 6.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Equivalent weight of N₂ in the change%');

-- Previous Year Questions (selected)
INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Previous Year Questions' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'For the redox reaction MnO₄⁻+C₂O₄²⁻+H⁺→Mn²⁺+CO₂+H₂O the correct coefficients of the reactants for the balanced equation are',
  '["16, 5, 2", "2, 5, 16", "2, 16, 5", "5, 16, 2"]'::jsonb,
  1,
  'The balanced equation is 2MnO₄⁻+5C₂O₄²⁻+16H⁺→2Mn²⁺+10CO₂+8H₂O',
  'hard'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'For the redox reaction MnO₄%C₂O₄%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Previous Year Questions' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'The reaction of aqueous KMnO₄ with H₂O₂ in acidic conditions gives :-',
  '["Mn⁴⁺ and O₂", "Mn²⁺ and O₂", "Mn²⁺ and O₃", "Mn⁴⁺ and MnO₂"]'::jsonb,
  1,
  'KMnO₄ is reduced to Mn²⁺ and H₂O₂ is oxidised to O₂.',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'The reaction of aqueous KMnO₄%');

-- Analytical Questions (selected)
INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Analytical Questions' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'The oxidation state of iodine in H₄IO₆⁻ is:-',
  '["+7", "-1", "+5", "+1"]'::jsonb,
  0,
  'In H₄IO₆⁻, iodine has the highest oxidation state of +7.',
  'hard'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'The oxidation state of iodine in H₄IO₆%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'Analytical Questions' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Oxidation number of sodium in sodium amalgam is',
  '["+1", "0", "-1", "+2"]'::jsonb,
  2,
  'In sodium amalgam, sodium has -1 oxidation state as it forms an alloy with mercury.',
  'hard'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Oxidation number of sodium in sodium amalgam%');

-- ALLEN RACE (selected)
INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'ALLEN RACE' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Which of the following can only acts as oxidising agent?',
  '["KMnO₄", "K₂MnO₄", "H₂O₂", "SO₂"]'::jsonb,
  0,
  'KMnO₄ in acidic medium can only act as an oxidising agent, not as a reducing agent.',
  'hard'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Which of the following can only acts as oxidising agent%');

INSERT INTO questions (topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty) 
SELECT 
  (SELECT id FROM topics WHERE name = 'ALLEN RACE' LIMIT 1),
  (SELECT id FROM chapters WHERE name = 'Redox Reaction'),
  'Oxidation number of all three Fe atom in Fe₃O₄ is:-',
  '["3, 3, 3", "2, 2, 2", "2, 2, 3", "2, 3, 3"]'::jsonb,
  2,
  'Fe₃O₄ is FeO·Fe₂O₃, so it contains Fe²⁺ and Fe³⁺ with oxidation states 2, 3, 3.',
  'hard'
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE 'Oxidation number of all three Fe atom%');

-- Print completion message
SELECT 'All Redox Reaction questions inserted successfully!' as status;
