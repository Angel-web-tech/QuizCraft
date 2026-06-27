-- ============================================================
--  QuizMaster  —  Built-in Quiz Seed
--  Password for both accounts: quizmaster123
--  bcrypt hash (cost 10): $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lMOe
-- ============================================================
USE quiz_maker;

-- ── 1. Seed accounts ────────────────────────────────────────
INSERT IGNORE INTO users (id, name, email, password, role) VALUES
(1, 'QuizMaster Admin', 'admin@quizmaster.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lMOe', 'creator'),
(2, 'Demo User',        'demo@quizmaster.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lMOe', 'participant');

-- ── 2. Quizzes ───────────────────────────────────────────────
INSERT INTO quizzes (user_id, title, description, category, time_limit) VALUES
(1, 'Science Fundamentals',         'Core concepts from biology, chemistry, and physics every student should know.',    'Science', 10),
(1, 'Tech & Programming 101',       'Test your knowledge of programming concepts, languages, and computer science.',    'Tech',     12),
(1, 'World History Highlights',     'Key events and figures that shaped the world from ancient times to modern day.',   'General',   8),
(1, 'Nature & Planet Earth',        'Fascinating facts about animals, ecosystems, and the natural world around us.',    'Nature',   10),
(1, 'Gaming Legends',               'Iconic games, characters, and milestones from the history of video gaming.',       'Gaming',    8),
(1, 'General Knowledge Blast',      'A fun mix of trivia covering geography, pop culture, sports, and everyday facts.', 'General',  12);

-- ── 3. Questions & Options ──────────────────────────────────
-- We capture the auto-incremented quiz IDs via a temp approach:
-- Quiz IDs will be sequential. We use LAST_INSERT_ID tricks via variables.

SET @q1 = (SELECT id FROM quizzes WHERE title = 'Science Fundamentals'        LIMIT 1);
SET @q2 = (SELECT id FROM quizzes WHERE title = 'Tech & Programming 101'      LIMIT 1);
SET @q3 = (SELECT id FROM quizzes WHERE title = 'World History Highlights'    LIMIT 1);
SET @q4 = (SELECT id FROM quizzes WHERE title = 'Nature & Planet Earth'       LIMIT 1);
SET @q5 = (SELECT id FROM quizzes WHERE title = 'Gaming Legends'              LIMIT 1);
SET @q6 = (SELECT id FROM quizzes WHERE title = 'General Knowledge Blast'     LIMIT 1);

-- ════════════════════════════════════════════════════════════
--  QUIZ 1 — Science Fundamentals (8 questions)
-- ════════════════════════════════════════════════════════════
INSERT INTO questions (quiz_id, question_text) VALUES
(@q1, 'What is the chemical formula for water?'),
(@q1, 'Which planet is known as the Red Planet?'),
(@q1, 'What is the powerhouse of the cell?'),
(@q1, 'What force keeps planets in orbit around the Sun?'),
(@q1, 'At what temperature does water boil at sea level (°C)?'),
(@q1, 'What is the most abundant gas in Earth''s atmosphere?'),
(@q1, 'How many bones are in the adult human body?'),
(@q1, 'What particle has a negative electrical charge?');

-- Q1-1
SET @qs = LAST_INSERT_ID() - 7;
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs,   'H2O',        1), (@qs,   'CO2',       0), (@qs,   'O2',        0), (@qs,   'NaCl',      0);
-- Q1-2
SET @qs = @qs + 1;
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs,   'Venus',      0), (@qs,   'Mars',       1), (@qs,   'Jupiter',   0), (@qs,   'Saturn',    0);
-- Q1-3
SET @qs = @qs + 1;
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs,   'Nucleus',    0), (@qs,   'Ribosome',   0), (@qs,   'Mitochondria', 1), (@qs, 'Golgi Body', 0);
-- Q1-4
SET @qs = @qs + 1;
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs,   'Magnetism',  0), (@qs,   'Friction',   0), (@qs,   'Gravity',   1), (@qs,   'Inertia',   0);
-- Q1-5
SET @qs = @qs + 1;
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs,   '90°C',       0), (@qs,   '100°C',      1), (@qs,   '110°C',     0), (@qs,   '80°C',      0);
-- Q1-6
SET @qs = @qs + 1;
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs,   'Oxygen',     0), (@qs,   'Carbon dioxide', 0), (@qs, 'Nitrogen', 1), (@qs,  'Hydrogen',  0);
-- Q1-7
SET @qs = @qs + 1;
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs,   '196',        0), (@qs,   '206',        1), (@qs,   '216',       0), (@qs,   '186',       0);
-- Q1-8
SET @qs = @qs + 1;
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs,   'Proton',     0), (@qs,   'Neutron',    0), (@qs,   'Electron',  1), (@qs,   'Photon',    0);

-- ════════════════════════════════════════════════════════════
--  QUIZ 2 — Tech & Programming 101 (8 questions)
-- ════════════════════════════════════════════════════════════
INSERT INTO questions (quiz_id, question_text) VALUES
(@q2, 'What does "HTML" stand for?'),
(@q2, 'Which language is primarily used for styling web pages?'),
(@q2, 'What does CPU stand for?'),
(@q2, 'Which data structure operates on a LIFO (Last In, First Out) principle?'),
(@q2, 'What is the binary representation of the decimal number 10?'),
(@q2, 'Which company created the JavaScript programming language?'),
(@q2, 'What does "API" stand for?'),
(@q2, 'Which sorting algorithm has an average time complexity of O(n log n)?');

SET @qs = LAST_INSERT_ID() - 7;
-- Q2-1
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'HyperText Markup Language', 1), (@qs, 'HighText Machine Language', 0),
(@qs, 'Hyperlink and Text Markup Language', 0), (@qs, 'Home Tool Markup Language', 0);
SET @qs = @qs + 1;
-- Q2-2
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'JavaScript', 0), (@qs, 'Python', 0), (@qs, 'CSS', 1), (@qs, 'XML', 0);
SET @qs = @qs + 1;
-- Q2-3
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Central Processing Unit', 1), (@qs, 'Computer Personal Unit', 0),
(@qs, 'Central Processor Utility', 0), (@qs, 'Core Processing Unit', 0);
SET @qs = @qs + 1;
-- Q2-4
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Queue', 0), (@qs, 'Stack', 1), (@qs, 'Array', 0), (@qs, 'Tree', 0);
SET @qs = @qs + 1;
-- Q2-5
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, '1010', 1), (@qs, '1100', 0), (@qs, '1001', 0), (@qs, '0110', 0);
SET @qs = @qs + 1;
-- Q2-6
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Google', 0), (@qs, 'Microsoft', 0), (@qs, 'Netscape', 1), (@qs, 'Apple', 0);
SET @qs = @qs + 1;
-- Q2-7
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Application Programming Interface', 1), (@qs, 'Automated Program Interaction', 0),
(@qs, 'Applied Protocol Integration', 0), (@qs, 'Advanced Programming Interface', 0);
SET @qs = @qs + 1;
-- Q2-8
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Bubble Sort', 0), (@qs, 'Insertion Sort', 0), (@qs, 'Merge Sort', 1), (@qs, 'Selection Sort', 0);

-- ════════════════════════════════════════════════════════════
--  QUIZ 3 — World History Highlights (8 questions)
-- ════════════════════════════════════════════════════════════
INSERT INTO questions (quiz_id, question_text) VALUES
(@q3, 'In which year did World War II end?'),
(@q3, 'Who was the first President of the United States?'),
(@q3, 'The Great Wall of China was primarily built to protect against which group?'),
(@q3, 'Which empire was ruled by Julius Caesar?'),
(@q3, 'In what year did the Berlin Wall fall?'),
(@q3, 'Which country was the first to grant women the right to vote?'),
(@q3, 'Who wrote the "I Have a Dream" speech?'),
(@q3, 'The Renaissance period began in which country?');

SET @qs = LAST_INSERT_ID() - 7;
-- Q3-1
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, '1943', 0), (@qs, '1944', 0), (@qs, '1945', 1), (@qs, '1946', 0);
SET @qs = @qs + 1;
-- Q3-2
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Thomas Jefferson', 0), (@qs, 'Benjamin Franklin', 0),
(@qs, 'George Washington', 1), (@qs, 'John Adams', 0);
SET @qs = @qs + 1;
-- Q3-3
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Mongols', 1), (@qs, 'Vikings', 0), (@qs, 'Romans', 0), (@qs, 'Persians', 0);
SET @qs = @qs + 1;
-- Q3-4
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Greek Empire', 0), (@qs, 'Ottoman Empire', 0),
(@qs, 'Roman Empire', 1), (@qs, 'Byzantine Empire', 0);
SET @qs = @qs + 1;
-- Q3-5
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, '1987', 0), (@qs, '1988', 0), (@qs, '1989', 1), (@qs, '1990', 0);
SET @qs = @qs + 1;
-- Q3-6
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Australia', 0), (@qs, 'New Zealand', 1), (@qs, 'Finland', 0), (@qs, 'Norway', 0);
SET @qs = @qs + 1;
-- Q3-7
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Malcolm X',        0), (@qs, 'Barack Obama',    0),
(@qs, 'Martin Luther King Jr.', 1), (@qs, 'John Lewis', 0);
SET @qs = @qs + 1;
-- Q3-8
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'France', 0), (@qs, 'Spain', 0), (@qs, 'Italy', 1), (@qs, 'Germany', 0);

-- ════════════════════════════════════════════════════════════
--  QUIZ 4 — Nature & Planet Earth (8 questions)
-- ════════════════════════════════════════════════════════════
INSERT INTO questions (quiz_id, question_text) VALUES
(@q4, 'What is the largest mammal in the world?'),
(@q4, 'How many legs does a spider have?'),
(@q4, 'What is the longest river in the world?'),
(@q4, 'Which gas do plants absorb during photosynthesis?'),
(@q4, 'What is the fastest land animal?'),
(@q4, 'What percentage of Earth''s surface is covered by water?'),
(@q4, 'Which continent has the most countries?'),
(@q4, 'What is the hardest natural substance on Earth?');

SET @qs = LAST_INSERT_ID() - 7;
-- Q4-1
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Great White Shark', 0), (@qs, 'African Elephant', 0),
(@qs, 'Blue Whale', 1), (@qs, 'Colossal Squid', 0);
SET @qs = @qs + 1;
-- Q4-2
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, '6', 0), (@qs, '8', 1), (@qs, '10', 0), (@qs, '12', 0);
SET @qs = @qs + 1;
-- Q4-3
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Amazon', 0), (@qs, 'Mississippi', 0), (@qs, 'Nile', 1), (@qs, 'Yangtze', 0);
SET @qs = @qs + 1;
-- Q4-4
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Oxygen', 0), (@qs, 'Carbon Dioxide', 1), (@qs, 'Nitrogen', 0), (@qs, 'Hydrogen', 0);
SET @qs = @qs + 1;
-- Q4-5
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Lion', 0), (@qs, 'Pronghorn Antelope', 0), (@qs, 'Cheetah', 1), (@qs, 'Greyhound', 0);
SET @qs = @qs + 1;
-- Q4-6
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, '51%', 0), (@qs, '61%', 0), (@qs, '71%', 1), (@qs, '81%', 0);
SET @qs = @qs + 1;
-- Q4-7
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Asia', 0), (@qs, 'Europe', 0), (@qs, 'Africa', 1), (@qs, 'South America', 0);
SET @qs = @qs + 1;
-- Q4-8
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Gold', 0), (@qs, 'Quartz', 0), (@qs, 'Diamond', 1), (@qs, 'Titanium', 0);

-- ════════════════════════════════════════════════════════════
--  QUIZ 5 — Gaming Legends (8 questions)
-- ════════════════════════════════════════════════════════════
INSERT INTO questions (quiz_id, question_text) VALUES
(@q5, 'In which year was the original Super Mario Bros. released?'),
(@q5, 'What is the best-selling video game of all time?'),
(@q5, 'Which company developed the Legend of Zelda series?'),
(@q5, 'What is the name of the hero in The Legend of Zelda?'),
(@q5, 'In Minecraft, what material is needed to craft a diamond pickaxe?'),
(@q5, 'Which game introduced the "Battle Royale" genre to mainstream audiences?'),
(@q5, 'What does "NPC" stand for in gaming?'),
(@q5, 'Which console was released by Sony in 1994?');

SET @qs = LAST_INSERT_ID() - 7;
-- Q5-1
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, '1983', 0), (@qs, '1984', 0), (@qs, '1985', 1), (@qs, '1986', 0);
SET @qs = @qs + 1;
-- Q5-2
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Tetris', 0), (@qs, 'Grand Theft Auto V', 0),
(@qs, 'Minecraft', 1), (@qs, 'Wii Sports', 0);
SET @qs = @qs + 1;
-- Q5-3
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Sega', 0), (@qs, 'Capcom', 0), (@qs, 'Nintendo', 1), (@qs, 'Konami', 0);
SET @qs = @qs + 1;
-- Q5-4
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Zelda', 0), (@qs, 'Ganon', 0), (@qs, 'Link', 1), (@qs, 'Navi', 0);
SET @qs = @qs + 1;
-- Q5-5
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Gold', 0), (@qs, 'Diamonds', 1), (@qs, 'Iron', 0), (@qs, 'Emeralds', 0);
SET @qs = @qs + 1;
-- Q5-6
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Call of Duty: Warzone', 0), (@qs, 'PUBG', 1), (@qs, 'Fortnite', 0), (@qs, 'Apex Legends', 0);
SET @qs = @qs + 1;
-- Q5-7
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Non-Player Character', 1), (@qs, 'New Player Control', 0),
(@qs, 'Neutral Program Command', 0), (@qs, 'Network Play Channel', 0);
SET @qs = @qs + 1;
-- Q5-8
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'PlayStation 1', 1), (@qs, 'PlayStation 2', 0),
(@qs, 'PlayStation 3', 0), (@qs, 'PlayStation Portable', 0);

-- ════════════════════════════════════════════════════════════
--  QUIZ 6 — General Knowledge Blast (10 questions)
-- ════════════════════════════════════════════════════════════
INSERT INTO questions (quiz_id, question_text) VALUES
(@q6, 'What is the capital city of Australia?'),
(@q6, 'How many sides does a hexagon have?'),
(@q6, 'Which element has the chemical symbol "Au"?'),
(@q6, 'In which sport would you perform a "slam dunk"?'),
(@q6, 'What is the largest ocean on Earth?'),
(@q6, 'Who painted the Mona Lisa?'),
(@q6, 'How many players are on a standard football (soccer) team?'),
(@q6, 'What is the currency of Japan?'),
(@q6, 'Which planet is closest to the Sun?'),
(@q6, 'What is 12 × 12?');

SET @qs = LAST_INSERT_ID() - 9;
-- Q6-1
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Sydney', 0), (@qs, 'Melbourne', 0), (@qs, 'Canberra', 1), (@qs, 'Brisbane', 0);
SET @qs = @qs + 1;
-- Q6-2
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, '5', 0), (@qs, '6', 1), (@qs, '7', 0), (@qs, '8', 0);
SET @qs = @qs + 1;
-- Q6-3
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Silver', 0), (@qs, 'Aluminum', 0), (@qs, 'Gold', 1), (@qs, 'Copper', 0);
SET @qs = @qs + 1;
-- Q6-4
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Volleyball', 0), (@qs, 'Tennis', 0), (@qs, 'Basketball', 1), (@qs, 'Badminton', 0);
SET @qs = @qs + 1;
-- Q6-5
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Atlantic Ocean', 0), (@qs, 'Indian Ocean', 0),
(@qs, 'Pacific Ocean', 1), (@qs, 'Arctic Ocean', 0);
SET @qs = @qs + 1;
-- Q6-6
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Michelangelo', 0), (@qs, 'Raphael', 0),
(@qs, 'Leonardo da Vinci', 1), (@qs, 'Caravaggio', 0);
SET @qs = @qs + 1;
-- Q6-7
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, '9', 0), (@qs, '10', 0), (@qs, '11', 1), (@qs, '12', 0);
SET @qs = @qs + 1;
-- Q6-8
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Yuan', 0), (@qs, 'Won', 0), (@qs, 'Yen', 1), (@qs, 'Baht', 0);
SET @qs = @qs + 1;
-- Q6-9
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, 'Venus', 0), (@qs, 'Earth', 0), (@qs, 'Mercury', 1), (@qs, 'Mars', 0);
SET @qs = @qs + 1;
-- Q6-10
INSERT INTO options (question_id, option_text, is_correct) VALUES
(@qs, '132', 0), (@qs, '140', 0), (@qs, '144', 1), (@qs, '148', 0);
