            const renderQuestionsView = () => {
                try {
                                        if (activePracticeChapter) {
                        if (!showQuiz) {
                            const questionTypesSet = new Set();
                            activePracticeChapter.topics?.forEach(t => t.questions?.forEach(q => questionTypesSet.add(q.questionType || 'Main module (recommended)')));
                            const availableTypes = Array.from(questionTypesSet);
                            if (!availableTypes.includes('All combined')) availableTypes.unshift('All combined');

                            return (
                                <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <button onClick={handleBack} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"><i className="fa-solid fa-arrow-left"></i></button>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{safeRenderText(activePracticeChapter.name)}</h2>
                                        </div>
                                        <button onClick={() => setConfirmClearScope({ type: 'chapter', data: activePracticeChapter })} className="shrink-0 w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" title="Clear Chapter Progress"><i className="fa-solid fa-trash-can"></i></button>
                                    </div>

                                    <h3 className="font-semibold text-[#00a651] mb-3 uppercase tracking-wider text-xs bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 inline-block px-2 py-1 rounded-md">Select Question Type</h3>

                                    <div className="space-y-3">
                                        {availableTypes.map((type, i) => {
                                            let qCount = 0;
                                            if (type === 'All combined') {
                                                activePracticeChapter.topics?.forEach(t => qCount += t.questions?.length || 0);
                                            } else {
                                                activePracticeChapter.topics?.forEach(t => t.questions?.forEach(q => {
                                                    if ((q.questionType || 'Main module (recommended)') === type) qCount++;
                                                }));
                                            }

                                            return (
                                                <div key={i} onClick={() => { if (qCount > 0) { setActiveQuestionType(type); setPracticeSelectedTopic(null); setCurrentQuestionIndex(0); setShowQuiz(true); } }} className={`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm transition-all group ${qCount > 0 ? 'cursor-pointer hover:border-[#00a651] dark:hover:border-[#00a651]' : 'opacity-60'}`}>
                                                    <div className="flex-1 mr-4">
                                                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-[#00a651] transition-colors">{type}</h4>
                                                        <p className="text-[10px] font-semibold text-gray-500 mt-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 inline-block px-2 py-0.5 rounded-sm">{qCount} Qs</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 ${qCount > 0 ? 'group-hover:bg-[#00a651] group-hover:text-white' : ''} transition-colors flex items-center justify-center shrink-0`}>
                                                            <i className="fa-solid fa-play ml-0.5 text-xs"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }

                        const selectedTopic = practiceSelectedTopic;
                        const attempts = practiceAttempts;
                        const showPalette = practiceShowPalette;
                        const allQuestions = loadedQuestions;

                        let displayedQuestions = selectedTopic ? allQuestions.filter(q => q.topicName === selectedTopic) : allQuestions;

                        if (questionFilter === 'bookmarked') {
                            displayedQuestions = displayedQuestions.filter(q => bookmarks.includes(q.id));
                        } else if (questionFilter === 'incorrect') {
                            displayedQuestions = displayedQuestions.filter(q => {
                                const ansIdx = attempts[q.id];
                                return ansIdx !== undefined && ['A', 'B', 'C', 'D'][ansIdx] !== q.correctOption;
                            });
                        }

                        const safeQuestionIndex = Math.min(currentQuestionIndex, Math.max(0, displayedQuestions.length - 1));
                        const currentQuestion = displayedQuestions[safeQuestionIndex] || {};

                        const triggerHaptic = (type = 'light') => {
                            try {
                                if (window.Telegram?.WebApp?.HapticFeedback) {
                                    if (type === 'success' && window.Telegram.WebApp.HapticFeedback.notificationOccurred) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                                    else if (type === 'error' && window.Telegram.WebApp.HapticFeedback.notificationOccurred) window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
                                    else if (window.Telegram.WebApp.HapticFeedback.impactOccurred) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                                }
                            } catch (e) { }
                        };

                        const toggleBookmark = (qId) => {
                            setBookmarks(prev => prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]);
                            triggerHaptic('light');
                        };

                        const handleAttempt = (qId, optionIdx) => {
                            const options = ['A', 'B', 'C', 'D'];
                            const selectedOption = options[optionIdx];
                            const isCorrect = currentQuestion && selectedOption === currentQuestion.correctOption;
                            setPracticeAttempts({ ...attempts, [qId]: optionIdx });
                            if (isCorrect) triggerHaptic('success');
                            else triggerHaptic('error');
                        };

                        const handleClear = (qId) => {
                            const newAttempts = { ...attempts };
                            delete newAttempts[qId];
                            setPracticeAttempts(newAttempts);
                        };

                        const handleNext = () => {
                            if (safeQuestionIndex < displayedQuestions.length - 1) {
                                setCurrentQuestionIndex(safeQuestionIndex + 1);
                                setTimeout(() => {
                                    try {
                                        document.querySelector('[data-qa-card]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    } catch (e) {
                                        document.querySelector('[data-qa-card]')?.scrollIntoView();
                                    }
                                }, 50);
                            }
                        };

                        const handlePrevious = () => {
                            if (safeQuestionIndex > 0) {
                                setCurrentQuestionIndex(safeQuestionIndex - 1);
                                setTimeout(() => {
                                    try {
                                        document.querySelector('[data-qa-card]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    } catch (e) {
                                        document.querySelector('[data-qa-card]')?.scrollIntoView();
                                    }
                                }, 50);
                            }
                        };

                        const scrollToQuestion = (idx) => {
                            setPracticeShowPalette(false);
                            setCurrentQuestionIndex(idx);
                            setTimeout(() => {
                                try {
                                    document.querySelector('[data-qa-card]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                } catch (e) {
                                    document.querySelector('[data-qa-card]')?.scrollIntoView();
                                }
                            }, 50);
                        };

                        if (questionsLoading) {
                            return <GlobalLoader text="Extracting Database..." />;
                        }

                        const isAnswered = currentQuestion ? attempts[currentQuestion.id] !== undefined : false;
                        const selectedOptionIdx = currentQuestion ? attempts[currentQuestion.id] : -1;
                        const isCorrect = currentQuestion && isAnswered && ['A', 'B', 'C', 'D'][selectedOptionIdx] === currentQuestion.correctOption;

                        return (
                            <>

                            <div className="pb-32 animate-pop-in relative min-h-screen bg-[#F3F4F6] text-gray-900 font-sans">
                                {/* CBT Header */}
                                <div className="px-4 py-3 flex items-center justify-between bg-[#00418d] text-white shadow-md relative z-20">
                                    <div className="flex items-center gap-3 w-full">
                                        <button onClick={handleBack} className="w-8 h-8 rounded-full hover:bg-white/20 text-white flex items-center justify-center shrink-0 transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                                        <div className="flex-1 overflow-hidden">
                                            <h2 className="text-base font-bold text-white leading-tight truncate">{safeRenderText(activePracticeChapter.name)}</h2>
                                            <p className="text-xs text-blue-100 opacity-90">Question {displayedQuestions.length > 0 ? safeQuestionIndex + 1 : 0} of {displayedQuestions.length}</p>
                                        </div>
                                        <div className="shrink-0 bg-black/20 px-3 py-1.5 rounded-sm border border-white/10 font-mono text-sm tracking-widest font-bold">
                                            <PracticeTimer active={true} questionId={currentQuestion?.id} isAnswered={isAnswered} />
                                        </div>
                                    </div>
                                </div>

                                {/* Optional Filters & Topic Selector */}
                                <div className="bg-white px-4 py-2 border-b border-gray-300 shadow-sm flex items-center justify-between z-10 relative">
                                    <div className="flex gap-2 items-center overflow-x-auto no-scrollbar flex-1 mr-2">
                                        <select
                                            value={practiceSelectedTopic || ""}
                                            onChange={(e) => {
                                                setPracticeSelectedTopic(e.target.value || null);
                                                setCurrentQuestionIndex(0);
                                            }}
                                            className="border border-gray-300 rounded-sm text-xs font-semibold px-2 py-1.5 bg-gray-50 text-gray-800 outline-none hover:border-[#00418d] focus:border-[#00418d] max-w-[140px] md:max-w-[200px] shrink-0 cursor-pointer transition-colors"
                                        >
                                            <option value="">All Topics</option>
                                            {activePracticeChapter.topics?.map((top, i) => (
                                                <option key={i} value={top.name}>{top.name}</option>
                                            ))}
                                        </select>
                                        <div className="h-4 w-px bg-gray-300 mx-1 shrink-0"></div>
                                        <button onClick={() => { setQuestionFilter('all'); setCurrentQuestionIndex(0); }} className={`px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors border ${questionFilter === 'all' ? 'bg-[#00418d] text-white border-[#00418d]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>All Qs</button>
                                        <button onClick={() => { setQuestionFilter('bookmarked'); setCurrentQuestionIndex(0); }} className={`px-3 py-1 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors border ${questionFilter === 'bookmarked' ? 'bg-[#00418d] text-white border-[#00418d]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Bookmarked</button>
                                        <button onClick={() => { setQuestionFilter('incorrect'); setCurrentQuestionIndex(0); }} className={`px-3 py-1 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors border ${questionFilter === 'incorrect' ? 'bg-[#00418d] text-white border-[#00418d]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Incorrect</button>
                                    </div>
                                    <button onClick={() => setPracticeShowPalette(true)} className="ml-2 bg-[#00418d] text-white px-3 py-1.5 rounded-sm text-xs font-bold shrink-0 shadow-sm active:scale-95 transition-transform"><i className="fa-solid fa-grip mr-1"></i> Palette</button>
                                </div>

                                {/* Question Content */}
                                <div data-qa-card className="p-3 md:p-5 max-w-4xl mx-auto">
                                    {displayedQuestions.length === 0 ? (
                                        <div className="bg-white border border-gray-300 shadow-sm py-12 text-center px-4 rounded-sm mt-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl"><i className="fa-solid fa-box-open"></i></div>
                                            <h3 className="font-bold text-gray-900 mb-2">No questions found</h3>
                                            <p className="text-sm text-gray-500 mb-4">Adjust your filters to see questions.</p>
                                            <button onClick={() => { setQuestionFilter('all'); setPracticeSelectedTopic(null); }} className="bg-[#00418d] text-white font-semibold text-sm px-4 py-2 rounded-sm mt-2 transition-colors hover:bg-blue-800">Clear Filters</button>
                                        </div>
                                    ) : (
                                        <div className="bg-white border border-gray-300 shadow-md rounded-sm mt-2">
                                            <div className="p-4 md:p-6">
                                                <div className="flex justify-between items-start mb-3 gap-4">
                                                    <div className="text-black text-[15px] md:text-base leading-relaxed font-medium">
                                                        <span className="font-bold mr-2 text-[#00418d]">Q{safeQuestionIndex + 1}.</span> <FormattedText text={currentQuestion.text} className="inline" />
                                                    </div>
                                                    {/* Enhanced Bookmark Button */}
                                                    <div className="shrink-0">
                                                        <button onClick={() => toggleBookmark(currentQuestion.id)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm border ${bookmarks.includes(currentQuestion.id) ? 'bg-gradient-to-r from-amber-100 to-yellow-50 border-amber-300 text-amber-700 shadow-amber-200/50' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'} active:scale-95 group`}>
                                                            <i className={`fa-${bookmarks.includes(currentQuestion.id) ? 'solid text-amber-500 scale-110' : 'regular'} fa-bookmark group-hover:scale-110 transition-transform`}></i> 
                                                            <span className="hidden sm:inline">{bookmarks.includes(currentQuestion.id) ? 'Bookmarked' : 'Bookmark'}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                {currentQuestion.imageUrl && (
                                                    <div className="mb-6 rounded-sm overflow-hidden bg-white flex items-center justify-center border border-gray-200 p-2">
                                                        <img src={currentQuestion.imageUrl} alt="Question Image" className="max-w-full max-h-[40vh] object-contain" onError={(e) => { e.target.style.display = 'none' }} />
                                                    </div>
                                                )}

                                                {/* Options Display */}
                                                <div className="flex flex-col border border-gray-300 rounded-sm overflow-hidden mb-6">
                                                    {Array.isArray(currentQuestion.options) ? currentQuestion.options.map((opt, idx) => {
                                                        return (
                                                            <div key={idx} className="w-full text-left flex items-stretch border-b border-gray-300 last:border-b-0 bg-white">
                                                                <div className="w-10 flex items-center justify-center shrink-0 font-semibold text-[15px] border-r border-gray-300 bg-gray-50 text-gray-700">({idx + 1})</div>
                                                                <div className="p-3 text-[14px] md:text-[15px] text-black w-full break-words leading-relaxed"><FormattedText text={opt} /></div>
                                                            </div>
                                                        );
                                                    }) : null}
                                                </div>

                                                {/* CBT Options Selection Bar */}
                                                <div className="flex justify-center gap-4 mb-5">
                                                    {Array.isArray(currentQuestion.options) ? currentQuestion.options.map((_, idx) => {
                                                        const isSelected = selectedOptionIdx === idx;
                                                        const isCorrectChoice = ['A', 'B', 'C', 'D'][idx] === currentQuestion.correctOption;
                                                        let btnClass = "bg-white border-gray-400 text-gray-800 hover:bg-blue-50 hover:border-blue-300";
                                                        if (isAnswered) {
                                                            if (isCorrectChoice) btnClass = "bg-[#1e7e34] border-[#1e7e34] text-white ring-2 ring-[#1e7e34] ring-offset-2 z-10";
                                                            else if (isSelected) btnClass = "bg-[#c5221f] border-[#c5221f] text-white ring-2 ring-[#c5221f] ring-offset-2 z-10";
                                                            else btnClass = "bg-gray-100 border-gray-300 text-gray-400";
                                                        } else if (isSelected) {
                                                            btnClass = "bg-[#00418d] border-[#00418d] text-white ring-2 ring-[#00418d] ring-offset-2 z-10";
                                                        }
                                                        return (
                                                            <button
                                                                key={`cbt-opt-${idx}`}
                                                                disabled={isAnswered}
                                                                onClick={() => handleAttempt(currentQuestion.id, idx)}
                                                                className={`w-12 h-12 flex items-center justify-center border-2 rounded-full font-bold text-lg transition-all duration-200 disabled:cursor-default ${btnClass} ${!isAnswered ? 'active:scale-95 cursor-pointer shadow-sm' : ''}`}
                                                            >
                                                                {idx + 1}
                                                            </button>
                                                        );
                                                    }) : null}
                                                </div>

                                                        {/* Premium White/Grey Personal Notes UI */}
                                                        <div className="mt-8 mb-4">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <h4 className="text-[15px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2.5">
                                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shadow-inner shadow-blue-200/50">
                                                                        <i className="fa-solid fa-pen-nib text-[#00418d] text-sm"></i>
                                                                    </div>
                                                                    My Personal Notes
                                                                </h4>
                                                                {!(showNoteInput[currentQuestion.id] || questionNotes[currentQuestion.id]) && (
                                                                    <button 
                                                                        onClick={() => setShowNoteInput(prev => ({ ...prev, [currentQuestion.id]: true }))} 
                                                                        className="group relative px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-[#00418d] hover:border-blue-200 shadow-sm hover:shadow-md hover:shadow-blue-100 active:scale-95 overflow-hidden"
                                                                    >
                                                                        <div className="absolute inset-0 bg-blue-50/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                                                        <i className="fa-solid fa-plus relative z-10 group-hover:rotate-90 transition-transform duration-300"></i> 
                                                                        <span className="relative z-10">Add Note</span>
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {(showNoteInput[currentQuestion.id] || questionNotes[currentQuestion.id]) && (
                                                                <div className="bg-white border border-slate-200 p-5 rounded-3xl animate-in fade-in zoom-in-95 duration-300 ease-out relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                                                                    {/* Subtle Top Gradient Accent */}
                                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00418d] via-blue-400 to-[#00a651] opacity-80"></div>
                                                                    
                                                                    {(!showNoteInput[currentQuestion.id] && questionNotes[currentQuestion.id]) ? (
                                                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-[15px] text-slate-700 mb-4 whitespace-pre-wrap font-medium leading-relaxed shadow-inner">
                                                                            {questionNotes[currentQuestion.id]}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="relative mb-4 group">
                                                                            <textarea
                                                                                className="w-full text-[15px] p-5 border-2 border-slate-100 rounded-2xl bg-white text-slate-800 focus:outline-none focus:border-[#00418d] focus:ring-4 focus:ring-[#00418d]/10 transition-all min-h-[120px] resize-y placeholder-slate-400 font-medium shadow-sm z-10 relative"
                                                                                placeholder="Type your brilliant thoughts here... (auto-saved)"
                                                                                value={questionNotes[currentQuestion.id] || ''}
                                                                                onChange={(e) => setQuestionNotes(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                                                                                autoFocus
                                                                            ></textarea>
                                                                            {/* Glowing effect on focus */}
                                                                            <div className="absolute inset-0 rounded-2xl bg-[#00418d] opacity-0 group-focus-within:opacity-[0.03] blur-xl transition-opacity duration-500 pointer-events-none"></div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="flex justify-end gap-3 relative z-10">
                                                                        {questionNotes[currentQuestion.id] && (
                                                                            <button 
                                                                                onClick={() => {
                                                                                    const newNotes = { ...questionNotes };
                                                                                    delete newNotes[currentQuestion.id];
                                                                                    setQuestionNotes(newNotes);
                                                                                    setShowNoteInput(prev => ({ ...prev, [currentQuestion.id]: false }));
                                                                                }} 
                                                                                className="text-slate-500 hover:text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 active:scale-95 border border-transparent hover:border-red-100"
                                                                            >
                                                                                <i className="fa-solid fa-trash-can"></i> Delete
                                                                            </button>
                                                                        )}
                                                                        
                                                                        {showNoteInput[currentQuestion.id] ? (
                                                                            <button 
                                                                                onClick={() => setShowNoteInput(prev => ({ ...prev, [currentQuestion.id]: false }))} 
                                                                                className="bg-[#00418d] hover:bg-[#003370] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_0_rgba(0,65,141,0.39)] hover:shadow-[0_6px_20px_rgba(0,65,141,0.23)] hover:-translate-y-0.5 flex items-center gap-2 active:scale-95"
                                                                            >
                                                                                <i className="fa-solid fa-check"></i> Save Note
                                                                            </button>
                                                                        ) : (
                                                                            <button 
                                                                                onClick={() => setShowNoteInput(prev => ({ ...prev, [currentQuestion.id]: true }))} 
                                                                                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] hover:-translate-y-0.5 flex items-center gap-2 active:scale-95"
                                                                            >
                                                                                <i className="fa-solid fa-pen-to-square"></i> Edit Note
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                {isAnswered && (
                                                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm mt-6 animate-in fade-in slide-in-from-top-2">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <i className={`fa-solid ${isCorrect ? 'fa-circle-check text-[#1e7e34]' : 'fa-circle-xmark text-[#c5221f]'} text-lg`}></i>
                                                            <span className={`font-bold text-sm ${isCorrect ? 'text-[#1e7e34]' : 'text-[#c5221f]'}`}>
                                                                {isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
                                                            </span>
                                                        </div>
                                                        {currentQuestion.explanation && currentQuestion.explanation.trim().toLowerCase() !== 'no explanation' && (
                                                            <div className="text-sm text-gray-700 mt-2 bg-white p-3 border border-gray-200 rounded-sm">
                                                                <span className="font-semibold text-black">Explanation:</span> <FormattedText text={currentQuestion.explanation} />
                                                            </div>
                                                        )}
                                                        <div className="mt-4">
                                                            <QuestionAIAssistant q={currentQuestion} attemptIdx={selectedOptionIdx} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                            </div>
                                    )}
                                </div>

                                

                                {/* CBT Palette Slide-over Modal */}
                                {showPalette && (
                                    <div className="fixed inset-0 bg-black/60 z-[99999] flex flex-col justify-center items-end animate-in fade-in" onClick={() => setPracticeShowPalette(false)}>
                                        <div className="bg-[#f0f4f7] dark:bg-gray-900 h-full w-[80vw] sm:w-[380px] shadow-2xl pb-safe flex flex-col border-l border-gray-300 dark:border-gray-800 transform transition-transform animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
                                            <div className="bg-[#00418d] text-white p-3 flex justify-between items-center shadow-md z-10 shrink-0">
                                                <h3 className="font-bold text-sm uppercase tracking-wider"><i className="fa-solid fa-grip mr-2"></i> Question Palette</h3>
                                                <button onClick={() => setPracticeShowPalette(false)} className="w-8 h-8 rounded-sm hover:bg-white/20 flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark text-lg"></i></button>
                                            </div>
                                            <div className="p-4 bg-white border-b border-gray-300 shadow-sm flex flex-wrap justify-between gap-y-3 text-[11px] font-semibold text-gray-700 shrink-0">
                                                <div className="flex items-center gap-1.5 w-[48%]"><div className="w-5 h-5 flex items-center justify-center bg-white border border-gray-400 rounded-sm text-[10px] shadow-sm">1</div> Not Visited</div>
                                                <div className="flex items-center gap-1.5 w-[48%]"><div className="w-5 h-5 flex items-center justify-center bg-[#fce8e6] border border-[#c5221f] text-[#c5221f] rounded-bl-[10px] rounded-br-[4px] rounded-t-[4px] text-[10px] shadow-sm">2</div> Not Answered</div>
                                                <div className="flex items-center gap-1.5 w-[48%]"><div className="w-5 h-5 flex items-center justify-center bg-[#e6f4ea] border border-[#1e7e34] text-[#1e7e34] rounded-tl-[10px] rounded-tr-[4px] rounded-b-[4px] text-[10px] shadow-sm">3</div> Answered</div>
                                                <div className="flex items-center gap-1.5 w-[48%]"><div className="w-5 h-5 flex items-center justify-center bg-purple-100 border border-purple-600 text-purple-700 rounded-full text-[10px] shadow-sm">4</div> Marked for Review</div>
                                                <div className="flex items-center gap-1.5 w-full mt-1"><div className="w-5 h-5 flex items-center justify-center bg-purple-100 border border-purple-600 text-purple-700 rounded-full text-[10px] relative shadow-sm"><div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#1e7e34] rounded-full ring-1 ring-white"></div></div> Answered & Marked for Review</div>
                                            </div>
                                            <div className="p-4 flex-1 overflow-y-auto bg-gray-50">
                                                <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                                                    {displayedQuestions.map((q, qIdx) => {
                                                        const isAns = attempts[q.id] !== undefined;
                                                        const isRev = practiceReview.includes(q.id);

                                                        const isCorrectAns = isAns && ['A', 'B', 'C', 'D'][attempts[q.id]] === q.correctOption;

                                                        let shapeClass = "bg-white border-gray-300 text-gray-700 rounded-md shadow-sm"; // Not visited
                                                        if (isAns && isCorrectAns) {
                                                            shapeClass = "bg-emerald-50 border-emerald-500 text-emerald-600 rounded-md ring-1 ring-emerald-500/30 font-black shadow-sm";
                                                        } else if (isAns && !isCorrectAns) {
                                                            shapeClass = "bg-rose-50 border-rose-500 text-rose-600 rounded-md ring-1 ring-rose-500/30 font-black shadow-sm";
                                                        } else if (practiceVisited.includes(q.id)) {
                                                            shapeClass = "bg-amber-50 border-amber-400 text-amber-700 rounded-md shadow-sm";
                                                        }
                                                        
                                                        if (isRev) {
                                                            shapeClass += " !bg-purple-100 !border-purple-500 !text-purple-700 !rounded-full";
                                                        }

                                                        return (
                                                            <button key={q.id} onClick={() => scrollToQuestion(qIdx)} className={`w-full aspect-square border flex items-center justify-center font-bold text-sm shadow-sm transition-transform hover:scale-105 active:scale-95 ${shapeClass} ${safeQuestionIndex === qIdx ? 'ring-2 ring-[#00418d] ring-offset-1' : ''}`}>
                                                                {qIdx + 1}
                                                                {isAns && isRev && <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-[#1e7e34] rounded-full ring-1 ring-white"></div>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                                {/* CBT Bottom Bar */}
                                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full md:max-w-screen-xl max-w-md bg-gray-100 border-t border-gray-300 px-2 py-3 z-[45] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom,_12px)]">
                                    <div className="max-w-4xl mx-auto flex flex-wrap gap-2 justify-between items-center">
                                        <div className="flex gap-2 flex-1 md:flex-none">
                                            <button onClick={() => handleClear(currentQuestion?.id)} className="flex-1 md:flex-none bg-white border border-gray-400 text-gray-800 hover:bg-gray-50 text-[10px] sm:text-xs font-semibold px-2 sm:px-4 py-2.5 rounded-sm shadow-sm transition-colors uppercase tracking-wide active:scale-95">
                                                Clear<span className="hidden sm:inline"> Response</span>
                                            </button>
                                            <button onClick={() => {
                                                if (currentQuestion) setPracticeReview(prev => prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]);
                                                handleNext();
                                            }} className="flex-1 md:flex-none bg-orange-500 border border-orange-600 text-white hover:bg-orange-600 text-[10px] sm:text-xs font-semibold px-2 sm:px-4 py-2.5 rounded-sm shadow-sm transition-colors uppercase tracking-wide active:scale-95">
                                                Review & Next
                                            </button>
                                        </div>
                                        <div className="flex gap-2 flex-1 md:flex-none justify-end mt-2 md:mt-0 w-full md:w-auto">
                                            <button onClick={handlePrevious} disabled={safeQuestionIndex === 0} className="flex-1 md:flex-none bg-white border border-gray-400 text-gray-800 hover:bg-gray-50 disabled:opacity-50 text-[10px] sm:text-xs font-semibold px-3 sm:px-4 py-2.5 rounded-sm shadow-sm transition-colors uppercase tracking-wide active:scale-95">
                                                &lt;&lt; Back
                                            </button>
                                            <button onClick={() => {
                                                if (currentQuestion && practiceReview.includes(currentQuestion.id)) setPracticeReview(prev => prev.filter(id => id !== currentQuestion.id));
                                                handleNext();
                                            }} disabled={safeQuestionIndex >= displayedQuestions.length - 1} className="flex-1 md:flex-none bg-[#1ea020] border border-[#187f1a] text-white hover:bg-[#187f1a] disabled:opacity-50 text-[10px] sm:text-xs font-semibold px-4 sm:px-6 py-2.5 rounded-sm shadow-sm transition-colors uppercase tracking-wide active:scale-95">
                                                Save & Next &gt;&gt;
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    
                    }

                    if (activePracticeSubject) {
                        return (
                            <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <button onClick={handleBack} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"><i className="fa-solid fa-arrow-left"></i></button>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{safeRenderText(activePracticeSubject.name)}</h2>
                                    </div>
                                    <button onClick={() => setConfirmClearScope({ type: 'subject', data: activePracticeSubject })} className="shrink-0 w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" title="Clear Subject Progress"><i className="fa-solid fa-trash-can"></i></button>
                                </div>
                                <h3 className="font-semibold text-[#00a651] mb-3 uppercase tracking-wider text-xs bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 inline-block px-2 py-1 rounded-md">Chapter Selection</h3>
                                <div className="space-y-3">
                                    {activePracticeSubject.chapters && activePracticeSubject.chapters.length > 0 ? (
                                        activePracticeSubject.chapters.map((chap, i) => (
                                            <div key={i} onClick={() => { setActivePracticeChapter(chap); setShowQuiz(false); }} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm cursor-pointer hover:border-[#00a651] dark:hover:border-[#00a651] transition-all group">
                                                <div>
                                                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-[#00a651] transition-colors">{safeRenderText(chap.name)}</h4>
                                                    <p className="text-[10px] font-semibold text-gray-500 mt-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 inline-block px-2 py-0.5 rounded-sm">{chap.topics?.length || 0} Topics</p>
                                                </div>
                                                <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-[#00a651] transition-colors"></i>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center mt-8">No chapters available</p>
                                    )}
                                </div>
                            </div>
                        );
                    }

                                        if (activePracticeMode === 'practice') {
                        return (
                            <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={handleBack} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activePracticeBatch?.name || 'Practice Modules'}</h2>
                                </div>

                                {qbankError && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-5 shadow-sm text-sm text-red-800 dark:text-red-200">
                                        <div className="font-bold flex items-center gap-2 mb-2">
                                            <i className="fa-solid fa-cloud"></i> Network Issue
                                        </div>
                                        <p className="mb-2 opacity-90">{qbankError}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    {(() => {
                                        const activeData = activePracticeBatch && activePracticeBatch.sourceTable
                                            ? (qbankDataByTable[activePracticeBatch.sourceTable] || [])
                                            : qbankData;
                                        return activeData.length > 0 ? activeData.map(sub => (
                                            <div key={sub.id} onClick={() => setActivePracticeSubject(sub)} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-md cursor-pointer hover:border-[#00a651] dark:hover:border-[#00a651] active:scale-[0.98] transition-all duration-300 flex flex-col items-center justify-center text-center group">
                                                <span className="text-4xl mb-3 group-hover:-translate-y-1 transition-transform duration-300">{sub.icon}</span>
                                                <h3 className="font-bold text-gray-800 dark:text-gray-200 mt-2 group-hover:text-[#00a651] transition-colors">{safeRenderText(sub.name)}</h3>
                                                <p className="text-[10px] text-gray-500 mt-1">{sub.chapters?.length || 0} Chapters</p>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-gray-500 text-center col-span-2 py-8">Loading subjects...</p>
                                        );
                                    })()}
                                </div>
                            </div>
                        );
                    }

                    if (activePracticeBatch) {
                        if (activePracticeBatch.type === 'jee') {
                            return (
                                <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen flex flex-col">
                                    <div className="flex items-center gap-3 mb-6">
                                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActivePracticeBatch(null); }} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{safeRenderText(activePracticeBatch.name)}</h2>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
                                        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse-soft border border-blue-500/30">
                                            <i className="fa-solid fa-rocket text-4xl text-blue-500 animate-pop-bounce delay-150"></i>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Coming Soon!</h3>
                                        <p className="text-sm text-gray-500 max-w-[250px] mx-auto">We are working hard to bring you the best JEE questions. Stay tuned!</p>
                                    </div>
                                </div>
                            );
                        }
                    
                        return (
                            <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActivePracticeBatch(null); }} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{safeRenderText(activePracticeBatch.name)}</h2>
                                </div>
                                <div className="space-y-3">
                                    <div onClick={() => setActivePracticeMode('practice')} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer hover:border-[#00a651] dark:hover:border-[#00a651] transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-[#00a651] flex items-center justify-center text-xl"><i className="fa-solid fa-book-open"></i></div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-[#00a651] transition-colors">Practice Modules</h3>
                                            <p className="text-xs text-gray-500 font-medium">Chapter-wise structured practice</p>
                                        </div>
                                        <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-[#00a651] transition-colors"></i>
                                    </div>
                                    <div onClick={() => setActivePracticeMode('tests')} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-500 flex items-center justify-center text-xl"><i className="fa-solid fa-stopwatch"></i></div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-purple-500 transition-colors">Tests</h3>
                                            <p className="text-xs text-gray-500 font-medium">Full-length & part syllabus tests</p>
                                        </div>
                                        <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-purple-500 transition-colors"></i>
                                    </div>
                                    <div onClick={() => setActivePracticeMode('custom')} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-500 flex items-center justify-center text-xl"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-blue-500 transition-colors">Custom Generator</h3>
                                            <p className="text-xs text-gray-500 font-medium">Create personalized practice sets</p>
                                        </div>
                                        <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-blue-500 transition-colors"></i>
                                    </div>
                                </div>
                            </div>
                        );
                    }

const PRACTICE_BATCHES = [
                        { id: 'pb_neet_bank', name: 'NEET Bank', type: 'neet', sourceTable: 'basic_mathmatics_&_vector', files: [{ id: 'pf_basic_math_1', name: 'Basic Math' }] },
                        { id: 'pb_jee_bank', name: 'JEE Bank', type: 'jee', sourceTable: 'coming_soon', files: [] },
                        { id: 'pb_checking', name: 'Checking', type: 'checking', sourceTable: 'Raceee_testttingg_checkinggg', files: [{ id: 'pf_race', name: 'Race' }] }
                    ];

                    return (
                        <div className="pb-24 pt-6 px-5 animate-in fade-in min-h-screen">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <AtaxyLogo className="w-10 h-10 rounded-full shadow-md border border-gray-200" />
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-wider">ATAXY BANK</h2>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {PRACTICE_BATCHES.map(batch => {
                                    let bgClass = '';
                                    let iconClass = '';
                                    let iconName = '';
                                    
                                    if (batch.type === 'neet') {
                                        bgClass = 'bg-gradient-to-br from-[#00a651] to-[#008c44] border border-[#008c44]/50 shadow-[0_8px_20px_rgba(0,166,81,0.3)] text-white';
                                        iconClass = 'text-green-800/30';
                                        iconName = 'fa-stethoscope';
                                    } else if (batch.type === 'jee') {
                                        bgClass = 'bg-gradient-to-br from-[#00418d] to-[#002f6c] border border-[#00418d]/50 shadow-[0_8px_20px_rgba(0,65,141,0.3)] text-white';
                                        iconClass = 'text-blue-900/40';
                                        iconName = 'fa-microchip';
                                    } else {
                                        bgClass = 'bg-gradient-to-br from-gray-900 to-black dark:from-gray-800 dark:to-gray-950 border border-gray-800 shadow-[0_8px_20px_rgba(0,0,0,0.2)] text-white';
                                        iconClass = 'text-white/5';
                                        iconName = 'fa-vial';
                                    }

                                    return (
                                        <div key={batch.id} onClick={() => setActivePracticeBatch(batch)} className={`p-6 rounded-3xl cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 relative overflow-hidden ${bgClass}`}>
                                            <div className="relative z-10">
                                                <h3 className="text-xl font-black mb-1 text-white">{batch.name}</h3>
                                                <p className={`text-xs font-medium ${batch.type === 'jee' ? 'text-blue-200' : batch.type === 'neet' ? 'text-green-100' : 'text-gray-400'}`}>
                                                    {batch.type === 'jee' ? 'Future Engineer Track' : batch.type === 'neet' ? 'Future Doctor Track' : 'Standard Practice Track'}
                                                </p>
                                            </div>
                                            <i className={`fa-solid ${iconName} ${iconClass} absolute -right-4 -bottom-4 text-6xl`}></i>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                } catch (err) {
                    return (
                        <div className="min-h-screen bg-red-600 text-white flex flex-col items-center justify-center p-10 z-[9999999] relative">
                            <h1 className="text-5xl font-black mb-4"><i className="fa-solid fa-bomb"></i> UI CRASH</h1>
                            <p className="text-xl font-bold mb-4">Please screenshot this!</p>
                            <div className="bg-red-900/50 p-4 rounded-xl text-left w-full overflow-auto max-h-[50vh] font-mono text-sm break-words shadow-inner">
                                <p><strong>Message:</strong> {String(err.message)}</p>
                                <p className="mt-4"><strong>Stack:</strong> {String(err.stack)}</p>
                            </div>
                            <button onClick={() => { setActivePracticeChapter(null); setShowQuiz(false); }} className="mt-8 bg-white text-red-600 px-6 py-3 rounded-xl font-black shadow-lg active:scale-95 transition-transform">Go Back</button>
                        </div>
                    );
                }
            };
