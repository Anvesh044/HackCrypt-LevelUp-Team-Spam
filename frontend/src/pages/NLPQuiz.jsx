import React, { useEffect, useState } from "react";

const CATEGORY_MAP = {
  "Computer Science": 18,
  Mathematics: 19,
  Science: 17,
  "General Knowledge": 9,
};

const TOTAL_TIME = 15;

const TriviaQuiz = () => {
  // USER CONTROLS
  const [amount, setAmount] = useState(5);
  const [category, setCategory] = useState(18);
  const [difficulty, setDifficulty] = useState("");

  // QUIZ STATE
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]); // ✅ NEW
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);

  // TIMER
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [totalTime, setTotalTime] = useState(0);

  // FLAGS
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [disabled, setDisabled] = useState(false);

  // ⏳ TIMER EFFECT
  useEffect(() => {
    if (!quizStarted || quizEnded || !questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          handleAnswer(null);
          return TOTAL_TIME;
        }
        return prev - 1;
      });
      setTotalTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizEnded, currentIndex]);

  // 🔁 GENERATE OPTIONS ON QUESTION CHANGE (ONLY ONCE)
  useEffect(() => {
    if (!questions.length) return;

    const q = questions[currentIndex];
    const shuffled = [...q.incorrect_answers, q.correct_answer].sort(
      () => Math.random() - 0.5
    );

    setOptions(shuffled); // ✅ STABLE OPTIONS
  }, [currentIndex, questions]);

  // FETCH QUESTIONS
  const startQuiz = async () => {
    setQuizStarted(false);
    setQuizEnded(false);

    let url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&type=multiple`;
    if (difficulty) url += `&difficulty=${difficulty}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.response_code !== 0) {
      alert("Not enough questions available");
      return;
    }

    setQuestions(data.results);
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setTimeLeft(TOTAL_TIME);
    setTotalTime(0);
    setSelected(null);
    setDisabled(false);

    setQuizStarted(true);
  };

  // HANDLE ANSWER
  const handleAnswer = (option) => {
    if (disabled) return;

    setDisabled(true);
    setSelected(option);

    const q = questions[currentIndex];
    const correct = q.correct_answer;
    const isCorrect = option === correct;

    if (isCorrect) setScore((s) => s + 1);

    setAnswers((prev) => [
      ...prev,
      {
        question: q.question,
        selected: option,
        correct,
        isCorrect,
      },
    ]);

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        setTimeLeft(TOTAL_TIME);
        setSelected(null);
        setDisabled(false);
      } else {
        setQuizEnded(true);
      }
    }, 1000);
  };

  // ---------------- UI ----------------

  if (!quizStarted) {
    return (
      <div style={styles.page}>
        <h1>🧠 Trivia Quiz</h1>

        <label>
          Number of Questions:
          <input
            type="number"
            min="1"
            max="20"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>

        <label>
          Topic:
          <select onChange={(e) => setCategory(Number(e.target.value))}>
            {Object.entries(CATEGORY_MAP).map(([name, id]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Difficulty:
          <select onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">Any</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <button onClick={startQuiz}>Generate Quiz 🚀</button>
      </div>
    );
  }

  if (quizEnded) {
    return (
      <div style={styles.page}>
        <h1>📊 Quiz Summary</h1>
        <p>
          ✅ Correct: {score} / {questions.length}
        </p>
        <p>⏱️ Total Time Taken: {totalTime}s</p>

        <hr />

        {answers.map((a, i) => (
          <div key={i} style={styles.resultCard}>
            <p dangerouslySetInnerHTML={{ __html: a.question }} />
            <p>
              Your Answer:{" "}
              <span style={{ color: a.isCorrect ? "lime" : "red" }}>
                {a.selected || "No Answer"}
              </span>
            </p>
            {!a.isCorrect && (
              <p style={{ color: "cyan" }}>Correct Answer: {a.correct}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div style={styles.page}>
        <h2>Loading questions...</h2>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / TOTAL_TIME) * circumference;

  return (
    <div style={styles.page}>
      <h2>
        Question {currentIndex + 1} / {questions.length}
      </h2>

      {/* ⏳ TIMER */}
      <svg width="120" height="120">
        <circle cx="60" cy="60" r={radius} stroke="#555" strokeWidth="8" fill="none" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#00ffcc"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
        <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="20">
          {timeLeft}
        </text>
      </svg>

      <h3 dangerouslySetInnerHTML={{ __html: currentQ.question }} />

      {options.map((opt) => (
        <button
          key={opt} // ✅ STABLE KEY
          disabled={disabled}
          onClick={() => handleAnswer(opt)}
          style={{
            ...styles.optionBtn,
            background:
              selected === opt
                ? opt === currentQ.correct_answer
                  ? "green"
                  : "red"
                : "",
            opacity: disabled && selected !== opt ? 0.6 : 1,
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: opt }} />
        </button>
      ))}
    </div>
  );
};

// ---------------- STYLES ----------------

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1d2671, #c33764)",
    color: "#fff",
    padding: "30px",
    textAlign: "center",
  },
  optionBtn: {
    display: "block",
    margin: "10px auto",
    padding: "12px",
    width: "80%",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
  },
  resultCard: {
    background: "rgba(255,255,255,0.15)",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "15px",
  },
};

export default TriviaQuiz;
