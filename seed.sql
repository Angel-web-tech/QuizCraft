-- Sample Data Seeding Script
USE quiz_maker;

-- Insert a sample creator (password is 'password123' hashed)
INSERT INTO users (name, email, password, role) VALUES 
('John Creator', 'creator@example.com', '$2a$10$XmO9YfExG6Yg4Y1vB8/YueS8V8vL.nJ8L.M3o0vG0l.J7.J7.J7.J', 'creator'),
('Jane Participant', 'user@example.com', '$2a$10$XmO9YfExG6Yg4Y1vB8/YueS8V8vL.nJ8L.M3o0vG0l.J7.J7.J7.J', 'participant');

-- Insert a sample quiz
INSERT INTO quizzes (user_id, title, description, category, time_limit) VALUES 
(1, 'General Science Quiz', 'Test your knowledge on basic science concepts.', 'Science', 10);

-- Insert questions for the quiz
INSERT INTO questions (quiz_id, question_text) VALUES 
(1, 'What is the chemical symbol for Water?'),
(1, 'Which planet is known as the Red Planet?'),
(1, 'What is the powerhouse of the cell?');

-- Insert options for the questions
-- Q1 Options
INSERT INTO options (question_id, option_text, is_correct) VALUES 
(1, 'H2O', 1),
(1, 'CO2', 0),
(1, 'O2', 0),
(1, 'NaCl', 0);

-- Q2 Options
INSERT INTO options (question_id, option_text, is_correct) VALUES 
(2, 'Venus', 0),
(2, 'Mars', 1),
(2, 'Jupiter', 0),
(2, 'Saturn', 0);

-- Q3 Options
INSERT INTO options (question_id, option_text, is_correct) VALUES 
(3, 'Nucleus', 0),
(3, 'Ribosome', 0),
(3, 'Mitochondria', 1),
(3, 'Endoplasmic Reticulum', 0);
