function scoreQuiz(quiz, answers) {
  const answerByQuestion = new Map(answers.map((answer) => [String(answer.questionId), String(answer.optionId)]));
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  for (const question of quiz.questions) {
    const selectedOption = answerByQuestion.get(String(question._id));
    if (!selectedOption) continue;
    if (String(question.correctOption) === selectedOption) {
      score += question.marks;
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }
  }

  const totalMarks = quiz.totalMarks;
  return {
    score,
    totalMarks,
    percentage: totalMarks ? Math.round((score / totalMarks) * 10000) / 100 : 0,
    correctCount,
    incorrectCount,
    unansweredCount: quiz.questions.length - answerByQuestion.size,
  };
}

module.exports = scoreQuiz;
