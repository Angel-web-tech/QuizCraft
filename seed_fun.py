import os
import subprocess

sql_content = r"""-- Fun Seeding Script
USE quiz_maker;

-- Additional Fun Quizzes
INSERT INTO quizzes (user_id, title, description, category, time_limit) VALUES 
(1, 'Superhero Challenge!', 'Are you a real Marvel and DC expert? Test your powers!', 'Entertainment', 5),
(1, 'Animal Kingdom', 'Fun facts about the coolest creatures on Earth.', 'Nature', 8),
(1, 'Video Game Trivia', 'From Mario to Minecraft, how much do you know?', 'Gaming', 10);

-- Superhero Challenge Questions
INSERT INTO questions (quiz_id, question_text) VALUES 
(2, 'Who is the god of thunder?'),
(2, 'What is Batmans real name?'),
(2, 'Which metal is Capatin Americas shield made of?');

-- Q1 Options
INSERT INTO options (question_id, option_text, is_correct) VALUES 
(4, 'Thor', 1), (4, 'Iron Man', 0), (4, 'Loki', 0), (4, 'Hulk', 0);
-- Q2 Options
INSERT INTO options (question_id, option_text, is_correct) VALUES 
(5, 'Bruce Wayne', 1), (5, 'Clark Kent', 0), (5, 'Peter Parker', 0), (5, 'Tony Stark', 0);
-- Q3 Options
INSERT INTO options (question_id, option_text, is_correct) VALUES 
(6, 'Vibranium', 1), (6, 'Adamantium', 0), (6, 'Silver', 0), (6, 'Gold', 0);

-- Animal Kingdom Questions
INSERT INTO questions (quiz_id, question_text) VALUES 
(3, 'What is the fastest land animal?'),
(3, 'How many hearts does an octopus have?');

-- Q1 Options
INSERT INTO options (question_id, option_text, is_correct) VALUES 
(7, 'Cheetah', 1), (7, 'Lion', 0), (7, 'Horse', 0), (7, 'Elephant', 0);
-- Q2 Options
INSERT INTO options (question_id, option_text, is_correct) VALUES 
(8, 'Three', 1), (8, 'One', 0), (8, 'Two', 0), (8, 'Eight', 0);
"""

with open('fun_seed.sql', 'w') as f:
    f.write(sql_content)

mysql_bin = "/usr/local/mysql-9.7.0-macos15-arm64/bin/mysql"
cmd = f"{mysql_bin} -u root -p'Mine$5bezAl' < fun_seed.sql"
subprocess.run(cmd, shell=True)
