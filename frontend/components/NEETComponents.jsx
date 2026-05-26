// React components for NEET preparation

// components/NEETChapters.jsx
import React, { useState, useEffect } from 'react';
import { neetApi } from '../utils/supabaseClient';

export const NEETChapters = ({ onSelectTopic }) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [topicsMap, setTopicsMap] = useState({});

  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    setLoading(true);
    const data = await neetApi.getChapters();
    setChapters(data);
    setLoading(false);
  };

  const loadTopics = async (chapterId) => {
    if (topicsMap[chapterId]) {
      setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
      return;
    }
    const topics = await neetApi.getTopics(chapterId);
    setTopicsMap(prev => ({ ...prev, [chapterId]: topics }));
    setExpandedChapter(chapterId);
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="space-y-3 p-4">
      <h2 className="text-2xl font-bold mb-4">📚 NEET Chapters</h2>
      {chapters.map((chapter) => (
        <div key={chapter.id} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => loadTopics(chapter.id)}
            className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-left hover:from-blue-600 hover:to-blue-700 flex justify-between items-center"
          >
            <div>
              <div className="font-bold">{chapter.name}</div>
              <div className="text-sm opacity-90">{chapter.subject}</div>
            </div>
            <span className="text-xl">{expandedChapter === chapter.id ? '▼' : '▶'}</span>
          </button>

          {expandedChapter === chapter.id && topicsMap[chapter.id] && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 space-y-2">
              {topicsMap[chapter.id].map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => onSelectTopic(topic.id, topic.name, chapter.name)}
                  className="w-full p-3 text-left bg-white dark:bg-gray-700 rounded hover:bg-blue-50 dark:hover:bg-gray-600 transition"
                >
                  <span className="font-semibold">{topic.name}</span>
                  <span className="float-right text-gray-400">→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// components/NEETQuestionViewer.jsx
export const NEETQuestionViewer = ({ topicId, topicName, chapterName, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [result, setResult] = useState(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    loadQuestions();
  }, [topicId]);

  const loadQuestions = async () => {
    setLoading(true);
    const data = await neetApi.getQuestions(topicId, 10, offset);
    setQuestions(prev => [...prev, ...data.questions]);
    setLoading(false);
  };

  const currentQuestion = questions[currentIndex];

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    const result = await neetApi.submitAnswer(currentQuestion.id, selectedAnswer);
    if (result) {
      setResult(result);
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setResult(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (currentIndex < (questions[0]?.total || 10)) {
      // Load more questions
      setOffset(offset + 10);
      loadQuestions();
    }
  };

  if (loading && questions.length === 0) {
    return <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (questions.length === 0) {
    return <div className="p-4 text-center text-gray-500">No questions found</div>;
  }

  return (
    <div className="p-4 space-y-4" data-protected>
      <button
        onClick={onBack}
        className="text-blue-500 hover:text-blue-700 flex items-center gap-2 mb-2"
      >
        ← Back
      </button>

      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-300">{chapterName} → {topicName}</div>
        <div className="text-sm font-semibold">
          Question {currentIndex + 1} of {Math.min(questions.length + (Math.ceil(offset / 10) * 10), currentQuestion?.total || questions.length)}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        {currentQuestion?.image_url && (
          <img
            src={currentQuestion.image_url}
            alt="Question"
            className="w-full mb-4 rounded max-h-48 object-cover"
          />
        )}
        <h3 className="text-lg font-semibold mb-4">{currentQuestion?.question_text}</h3>

        <div className="space-y-2 mb-4">
          {currentQuestion?.options?.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!showExplanation) setSelectedAnswer(idx);
              }}
              disabled={showExplanation}
              className={`w-full p-3 text-left rounded border-2 transition ${
                selectedAnswer === idx
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
              } ${
                showExplanation && result?.correctAnswer === idx
                  ? 'border-green-500 bg-green-50 dark:bg-green-900'
                  : showExplanation && selectedAnswer === idx && !result?.isCorrect
                  ? 'border-red-500 bg-red-50 dark:bg-red-900'
                  : ''
              }`}
            >
              <div className="font-semibold">{String.fromCharCode(65 + idx)}. {option}</div>
            </button>
          ))}
        </div>

        {!showExplanation && (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="w-full p-3 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
        )}

        {showExplanation && (
          <div className="space-y-4">
            <div className={`p-4 rounded ${
              result?.isCorrect
                ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100'
                : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100'
            }`}>
              <div className="font-bold text-lg">
                {result?.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </div>
              <div className="text-sm mt-1">
                Correct answer: {String.fromCharCode(65 + result?.correctAnswer)}
              </div>
            </div>

            {result?.explanation && (
              <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded">
                <div className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  💡 Explanation
                </div>
                <div className="text-yellow-800 dark:text-yellow-100">{result.explanation}</div>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full p-3 bg-green-500 text-white rounded font-semibold hover:bg-green-600"
            >
              Next Question →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// components/NEETStats.jsx
export const NEETStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await neetApi.getUserStats();
    setStats(data);
    setLoading(false);
  };

  if (loading) return <div>Loading stats...</div>;

  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
          {stats?.totalAttempts || 0}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Attempted</div>
      </div>

      <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-green-600 dark:text-green-300">
          {stats?.correctAnswers || 0}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
      </div>

      <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
          {stats?.accuracy || 0}%
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
      </div>
    </div>
  );
};
