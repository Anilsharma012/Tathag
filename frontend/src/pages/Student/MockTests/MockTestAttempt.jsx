import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MockTestAttempt.css';

const MockTestAttempt = () => {
  const { testId, attemptId } = useParams();
  const navigate = useNavigate();
  
  // Test data and state
  const [testData, setTestData] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sectionTimeRemaining, setSectionTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [showCalculator, setShowCalculator] = useState(false);
  const [showScratchPad, setShowScratchPad] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [calculatorValue, setCalculatorValue] = useState('0');
  const [scratchPadContent, setScratchPadContent] = useState('');
  const [drawingMode, setDrawingMode] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Section result states
  const [showSectionResult, setShowSectionResult] = useState(false);
  const [currentSectionResult, setCurrentSectionResult] = useState(null);
  const [completedSections, setCompletedSections] = useState([]);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  
  const timerRef = useRef(null);

  useEffect(() => {
    fetchTestData();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
        
        setSectionTimeRemaining(prev => {
          if (prev <= 1 && currentSection < testData?.sections?.length - 1) {
            handleNextSection();
            return 3600; // 60 minutes
          }
          return prev > 0 ? prev - 1 : 0;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining, currentSection, testData]);

  const fetchTestData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken || authToken === 'null') {
        navigate('/Login');
        return;
      }

      // Check if attemptId exists, if so, try to get existing attempt
      if (attemptId) {
        // Try to get existing attempt data
        const attemptResponse = await fetch(`/api/mock-tests/attempt/${attemptId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (attemptResponse.ok) {
          const attemptData = await attemptResponse.json();
          if (attemptData.success) {
            setTestData(attemptData.test);
            setTimeRemaining(attemptData.timeRemaining || attemptData.test.duration * 60);
            setSectionTimeRemaining(3600);
            setResponses(attemptData.responses || {});
            setLoading(false);
            return;
          }
        }
      }

      // If no existing attempt or failed to get it, start new
      const response = await fetch(`/api/mock-tests/test/${testId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setTestData(data.test);
        setTimeRemaining(data.test.duration * 60); // Convert to seconds
        setSectionTimeRemaining(3600); // 60 minutes per section

        // If this is a resume, redirect with correct attempt ID
        if (data.resuming && data.attempt) {
          navigate(`/student/mock-test/${testId}/attempt/${data.attempt._id}`, { replace: true });
          return;
        }
      } else {
        alert(data.message || 'Failed to start test');
        navigate('/student/mock-tests');
      }
    } catch (error) {
      console.error('Error fetching test data:', error);
      alert('Failed to load test. Please try again.');
      navigate('/student/mock-tests');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuestionSelect = (questionIndex) => {
    setCurrentQuestion(questionIndex);
    setVisitedQuestions(prev => new Set([...prev, questionIndex]));
  };

  const handleAnswerSelect = (answer) => {
    const questionId = getCurrentQuestion()?._id;
    if (questionId) {
      setResponses(prev => ({
        ...prev,
        [questionId]: answer
      }));
      
      // Save response to backend
      saveResponse(questionId, answer);
    }
  };

  const saveResponse = async (questionId, selectedAnswer) => {
    try {
      const authToken = localStorage.getItem('authToken');
      await fetch(`/api/mock-tests/attempt/${attemptId}/response`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionId,
          selectedAnswer,
          isMarkedForReview: markedForReview.has(currentQuestion)
        })
      });
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const handleClearResponse = () => {
    const questionId = getCurrentQuestion()?._id;
    if (questionId) {
      setResponses(prev => {
        const newResponses = { ...prev };
        delete newResponses[questionId];
        return newResponses;
      });
      saveResponse(questionId, null);
    }
  };

  const handleNextQuestion = () => {
    const totalQuestions = testData?.sections[currentSection]?.questions?.length || 0;
    if (currentQuestion < totalQuestions - 1) {
      handleQuestionSelect(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      handleQuestionSelect(currentQuestion - 1);
    }
  };

  const calculateSectionResult = (sectionIndex) => {
    const section = testData.sections[sectionIndex];
    const sectionQuestions = section.questions || [];

    let answered = 0;
    let markedCount = 0;
    let visited = visitedQuestions.size; // Current section visited questions

    // For current section, use current visitedQuestions state
    // For other sections, we'd need to track separately (simplified for now)

    sectionQuestions.forEach((questionId, localIndex) => {
      const response = responses[questionId];
      const globalQuestionIndex = localIndex; // Simplified - using local index

      if (markedForReview.has(globalQuestionIndex)) {
        markedCount++;
      }

      if (response && response.trim() !== '') {
        answered++;
      }
    });

    const notAnswered = sectionQuestions.length - answered;
    const notVisited = Math.max(0, sectionQuestions.length - visited);

    return {
      sectionName: section.name,
      totalQuestions: sectionQuestions.length,
      answered,
      notAnswered,
      markedForReview: markedCount,
      visited: Math.min(visited, sectionQuestions.length),
      notVisited,
      correct: 0, // Will be calculated on backend
      incorrect: 0, // Will be calculated on backend
      score: answered * 3, // Simplified calculation (no negative marking for now)
      maxScore: sectionQuestions.length * 3
    };
  };

  const handleNextSection = () => {
    // Calculate current section result
    const sectionResult = calculateSectionResult(currentSection);
    setCurrentSectionResult(sectionResult);
    setCompletedSections(prev => [...prev, sectionResult]);

    // Show section result modal
    setShowSectionResult(true);
  };

  const proceedToNextSection = () => {
    setShowSectionResult(false);
    setCurrentSectionResult(null);

    if (currentSection < testData?.sections?.length - 1) {
      setCurrentSection(prev => prev + 1);
      setCurrentQuestion(0);
      setVisitedQuestions(new Set([0]));
      setSectionTimeRemaining(3600);
    } else {
      // Last section completed, proceed to final submission
      handleSubmitTest();
    }
  };

  const handleSubmitTest = async () => {
    try {
      // Calculate final section result if not already calculated
      if (currentSectionResult === null || currentSectionResult.sectionName !== testData.sections[currentSection].name) {
        const sectionResult = calculateSectionResult(currentSection);
        setCompletedSections(prev => {
          const updated = [...prev];
          const existingIndex = updated.findIndex(s => s.sectionName === sectionResult.sectionName);
          if (existingIndex >= 0) {
            updated[existingIndex] = sectionResult;
          } else {
            updated.push(sectionResult);
          }
          return updated;
        });
      }

      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`/api/mock-tests/attempt/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Calculate combined results
        const allSections = [...completedSections];
        if (!allSections.find(s => s.sectionName === testData.sections[currentSection].name)) {
          allSections.push(calculateSectionResult(currentSection));
        }

        const combinedResult = {
          sections: allSections,
          totalScore: allSections.reduce((sum, section) => sum + section.score, 0),
          maxTotalScore: allSections.reduce((sum, section) => sum + section.maxScore, 0),
          totalAnswered: allSections.reduce((sum, section) => sum + section.answered, 0),
          totalQuestions: allSections.reduce((sum, section) => sum + section.totalQuestions, 0),
          percentage: 0,
          backendScore: data.score
        };

        combinedResult.percentage = (combinedResult.totalScore / combinedResult.maxTotalScore) * 100;

        setFinalResult(combinedResult);
        setShowFinalResult(true);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };

  const getCurrentQuestion = () => {
    if (!testData?.sections?.[currentSection]?.questions) {
      console.warn('No questions found for current section:', currentSection);
      return null;
    }
    return testData.sections[currentSection].questions[currentQuestion];
  };

  const getQuestionStatus = (questionIndex) => {
    const question = testData?.sections[currentSection]?.questions[questionIndex];
    const questionId = question?._id;
    const isAnswered = questionId && responses[questionId];
    const isMarked = markedForReview.has(questionIndex);
    const isVisited = visitedQuestions.has(questionIndex);

    if (isAnswered && isMarked) return 'answered-marked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    if (isVisited) return 'visited';
    return 'not-visited';
  };

  // Drawing functions
  const startDrawing = (e) => {
    if (!drawingMode) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing || !drawingMode) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!drawingMode) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Calculator functions
  const handleCalculatorInput = (value) => {
    if (value === 'C') {
      setCalculatorValue('0');
    } else if (value === '=') {
      try {
        const result = eval(calculatorValue.replace(/×/g, '*').replace(/÷/g, '/'));
        setCalculatorValue(result.toString());
      } catch {
        setCalculatorValue('Error');
      }
    } else if (value === '⌫') {
      setCalculatorValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else {
      setCalculatorValue(prev => prev === '0' ? value : prev + value);
    }
  };

  if (loading) {
    return (
      <div className="cat-exam-loading">
        <div className="loading-spinner"></div>
        <p>Loading your test...</p>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="cat-exam-error">
        <h3>Test not found</h3>
        <button onClick={() => navigate('/student/mock-tests')}>
          Back to Mock Tests
        </button>
      </div>
    );
  }

  const currentQuestionData = getCurrentQuestion();
  const totalQuestions = testData?.sections[currentSection]?.questions?.length || 0;

  return (
    <div className="cat-exam-interface">
      {/* Header */}
      <div className="cat-exam-header">
        <div className="exam-header-left">
          <div className="cat-logos">
            <span className="logo-item">CAT</span>
            <span className="logo-item">2024</span>
            <span className="logo-separator">|</span>
            <span className="logo-item">IIM</span>
            <span className="logo-item">AHMEDABAD</span>
            <span className="logo-item">BANGALORE</span>
            <span className="logo-item">CALCUTTA</span>
            <span className="logo-item">KOZHIKODE</span>
            <span className="logo-item">LUCKNOW</span>
            <span className="logo-item">INDORE</span>
            <span className="logo-item">TATHAGAT</span>
          </div>
        </div>
        <div className="exam-header-right">
          <div className="candidate-info">
            <div className="candidate-avatar">
              <span>👤</span>
            </div>
            <div className="candidate-details">
              <span className="candidate-name">John Smith</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="cat-exam-content">
        {/* Left Panel - Question */}
        <div className="cat-question-panel">
          <div className="question-header">
            <div className="section-info">
              <h3>Section {currentSection + 1}: {testData.sections[currentSection].name}</h3>
              <span>Question No. {currentQuestion + 1}</span>
            </div>
            <div className="question-navigation">
              <button 
                className="nav-btn"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                ← Previous
              </button>
              <button 
                className="nav-btn"
                onClick={handleNextQuestion}
                disabled={currentQuestion === totalQuestions - 1}
              >
                Next →
              </button>
            </div>
          </div>

          <div className="question-content">
            <div className="question-text">
              {currentQuestionData?.questionText ? (
                currentQuestionData.questionText.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))
              ) : (
                <p>Loading question...</p>
              )}
            </div>

            {currentQuestionData?.images?.map((image, index) => (
              <img key={index} src={image} alt={`Question ${index + 1}`} className="question-image" />
            ))}

            <div className="question-options">
              {currentQuestionData?.options && currentQuestionData.options.length > 0 ? (
                currentQuestionData.options.map((option, index) => {
                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                  const questionId = currentQuestionData._id;
                  const optionText = typeof option === 'object' ? option.optionText : option;
                  const isSelected = responses[questionId] === optionText;

                  return (
                    <label key={index} className={`option-label ${isSelected ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name={`question-${questionId}`}
                        value={optionText}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(optionText)}
                      />
                      <span className="option-indicator">{optionLabel}</span>
                      <span className="option-text">
                        {optionText}
                      </span>
                      {typeof option === 'object' && option.optionImage && (
                        <img src={option.optionImage} alt="option" className="option-image" />
                      )}
                    </label>
                  );
                })
              ) : (
                <p>Loading options...</p>
              )}
            </div>
          </div>

          <div className="question-actions">
            <button className="action-btn secondary" onClick={handleClearResponse}>
              Clear Response
            </button>
            <button 
              className={`action-btn ${markedForReview.has(currentQuestion) ? 'marked' : 'secondary'}`}
              onClick={handleMarkForReview}
            >
              {markedForReview.has(currentQuestion) ? 'Unmark for Review' : 'Mark for Review & Next'}
            </button>
            <button className="action-btn primary" onClick={handleNextQuestion}>
              Save & Next
            </button>
          </div>
        </div>

        {/* Right Panel - Question Palette & Tools */}
        <div className="cat-sidebar-panel">
          {/* Timer */}
          <div className="timer-section">
            <div className="timer-item">
              <span className="timer-label">Time Left</span>
              <span className="timer-value">{formatTime(timeRemaining)}</span>
            </div>
            <div className="timer-item">
              <span className="timer-label">Section Time</span>
              <span className="timer-value">{formatTime(sectionTimeRemaining)}</span>
            </div>
          </div>

          {/* Tools */}
          <div className="tools-section">
            <button 
              className="tool-btn"
              onClick={() => setShowInstructions(true)}
            >
              📋 Instructions
            </button>
            <button 
              className="tool-btn"
              onClick={() => setShowCalculator(!showCalculator)}
            >
              🧮 Calculator
            </button>
            <button 
              className="tool-btn"
              onClick={() => setShowScratchPad(!showScratchPad)}
            >
              📝 Scratch Pad
            </button>
          </div>

          {/* Question Status Legend */}
          <div className="status-legend">
            <h4>Question Status</h4>
            <div className="legend-items">
              <div className="legend-item">
                <span className="status-indicator answered"></span>
                <span>Answered</span>
              </div>
              <div className="legend-item">
                <span className="status-indicator not-answered"></span>
                <span>Not Answered</span>
              </div>
              <div className="legend-item">
                <span className="status-indicator marked"></span>
                <span>Marked for Review</span>
              </div>
              <div className="legend-item">
                <span className="status-indicator answered-marked"></span>
                <span>Answered & Marked</span>
              </div>
              <div className="legend-item">
                <span className="status-indicator visited"></span>
                <span>Not Visited</span>
              </div>
            </div>
          </div>

          {/* Question Palette */}
          <div className="question-palette">
            <h4>Choose a Question</h4>
            <div className="palette-grid">
              {testData.sections[currentSection]?.questions?.length > 0 ? (
                testData.sections[currentSection].questions.map((_, index) => (
                  <button
                    key={index}
                    className={`palette-btn ${getQuestionStatus(index)} ${currentQuestion === index ? 'current' : ''}`}
                    onClick={() => handleQuestionSelect(index)}
                  >
                    {index + 1}
                  </button>
                ))
              ) : (
                <p>No questions available for this section</p>
              )}
            </div>
          </div>

          {/* Section Navigation */}
          <div className="section-navigation">
            <div className="section-tabs">
              {testData.sections.map((section, index) => (
                <button
                  key={index}
                  className={`section-tab ${currentSection === index ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentSection(index);
                    setCurrentQuestion(0);
                    setVisitedQuestions(new Set([0]));
                  }}
                >
                  {section.name}
                </button>
              ))}
            </div>
            
            <div className="section-actions">
              {currentSection < testData.sections.length - 1 ? (
                <button className="section-btn primary" onClick={handleNextSection}>
                  Next Section →
                </button>
              ) : (
                <button className="section-btn danger" onClick={handleSubmitTest}>
                  Submit Test
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="modal-overlay">
          <div className="calculator-modal">
            <div className="calculator-header">
              <h4>Calculator</h4>
              <button onClick={() => setShowCalculator(false)}>×</button>
            </div>
            <div className="calculator-display">
              {calculatorValue}
            </div>
            <div className="calculator-buttons">
              {[
                ['C', '⌫', '÷', '×'],
                ['7', '8', '9', '-'],
                ['4', '5', '6', '+'],
                ['1', '2', '3', '='],
                ['0', '.', '', '']
              ].map((row, rowIndex) => (
                <div key={rowIndex} className="calculator-row">
                  {row.map((btn, btnIndex) => (
                    btn && (
                      <button
                        key={btnIndex}
                        className={`calc-btn ${btn === '=' ? 'equals' : ''} ${['C', '⌫'].includes(btn) ? 'function' : ''}`}
                        onClick={() => handleCalculatorInput(btn)}
                      >
                        {btn}
                      </button>
                    )
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scratch Pad Modal */}
      {showScratchPad && (
        <div className="modal-overlay">
          <div className="scratchpad-modal">
            <div className="scratchpad-header">
              <h4>Scratch Pad</h4>
              <div className="scratchpad-controls">
                <button
                  className={`mode-btn ${!drawingMode ? 'active' : ''}`}
                  onClick={() => setDrawingMode(false)}
                >
                  📝 Text
                </button>
                <button
                  className={`mode-btn ${drawingMode ? 'active' : ''}`}
                  onClick={() => setDrawingMode(true)}
                >
                  ✏️ Draw
                </button>
              </div>
              <button onClick={() => setShowScratchPad(false)}>×</button>
            </div>

            {drawingMode ? (
              <canvas
                ref={canvasRef}
                className="scratchpad-canvas"
                width={460}
                height={300}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            ) : (
              <textarea
                className="scratchpad-textarea"
                value={scratchPadContent}
                onChange={(e) => setScratchPadContent(e.target.value)}
                placeholder="Use this space for your rough work..."
              />
            )}

            <div className="scratchpad-actions">
              {drawingMode ? (
                <button onClick={clearCanvas}>Clear Drawing</button>
              ) : (
                <button onClick={() => setScratchPadContent('')}>Clear Text</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="modal-overlay">
          <div className="instructions-modal">
            <div className="instructions-header">
              <h4>Test Instructions</h4>
              <button onClick={() => setShowInstructions(false)}>×</button>
            </div>
            <div className="instructions-content">
              {Array.isArray(testData.instructions) && testData.instructions.length > 0 ? (
                testData.instructions.map((instruction, index) => (
                  <p key={index}>
                    {typeof instruction === 'object' ? JSON.stringify(instruction) : String(instruction)}
                  </p>
                ))
              ) : (
                <p>No instructions available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section Result Modal */}
      {showSectionResult && currentSectionResult && (
        <div className="modal-overlay">
          <div className="section-result-modal">
            <div className="section-result-header">
              <h3>Section Result - {currentSectionResult.sectionName}</h3>
            </div>
            <div className="section-result-content">
              <div className="result-summary">
                <div className="result-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Questions:</span>
                    <span className="stat-value">{currentSectionResult.totalQuestions}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Answered:</span>
                    <span className="stat-value answered">{currentSectionResult.answered}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Not Answered:</span>
                    <span className="stat-value not-answered">{currentSectionResult.notAnswered}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Marked for Review:</span>
                    <span className="stat-value marked">{currentSectionResult.markedForReview}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Not Visited:</span>
                    <span className="stat-value not-visited">{currentSectionResult.notVisited}</span>
                  </div>
                </div>

                <div className="score-summary">
                  <h4>Section Performance</h4>
                  <div className="score-item">
                    <span>Attempted: {currentSectionResult.answered} questions</span>
                  </div>
                  <div className="score-item">
                    <span>Percentage: {((currentSectionResult.answered / currentSectionResult.totalQuestions) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="section-result-actions">
              {currentSection < testData?.sections?.length - 1 ? (
                <button className="result-btn primary" onClick={proceedToNextSection}>
                  Continue to Next Section →
                </button>
              ) : (
                <button className="result-btn primary" onClick={proceedToNextSection}>
                  Continue to Submit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Final Result Modal */}
      {showFinalResult && finalResult && (
        <div className="modal-overlay">
          <div className="final-result-modal">
            <div className="final-result-header">
              <h3>Test Complete - Final Results</h3>
            </div>
            <div className="final-result-content">
              <div className="overall-summary">
                <div className="overall-stats">
                  <div className="big-stat">
                    <span className="big-stat-label">Overall Score</span>
                    <span className="big-stat-value">{finalResult.totalAnswered}/{finalResult.totalQuestions}</span>
                    <span className="big-stat-percentage">{finalResult.percentage.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="section-wise-results">
                  <h4>Section-wise Performance</h4>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Section</th>
                        <th>Questions</th>
                        <th>Answered</th>
                        <th>Not Answered</th>
                        <th>Marked</th>
                        <th>Not Visited</th>
                        <th>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finalResult.sections.map((section, index) => (
                        <tr key={index}>
                          <td className="section-name">{section.sectionName}</td>
                          <td>{section.totalQuestions}</td>
                          <td className="answered">{section.answered}</td>
                          <td className="not-answered">{section.notAnswered}</td>
                          <td className="marked">{section.markedForReview}</td>
                          <td className="not-visited">{section.notVisited}</td>
                          <td>{((section.answered / section.totalQuestions) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="final-result-actions">
              <button className="result-btn primary" onClick={() => navigate('/student/mock-tests')}>
                Back to Mock Tests
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTestAttempt;
