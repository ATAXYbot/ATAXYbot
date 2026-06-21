            const renderQuestionsView = () => {
                try {
                    const isNeet = activePracticeBatch?.type === 'neet';
                    const isJee = activePracticeBatch?.type === 'jee';
                    const themeText = isNeet ? 'text-[#00418d]' : isJee ? 'text-[#0ea5e9]' : 'text-gray-800 dark:text-gray-200';
                    const themeBg = isNeet ? 'bg-[#00418d]' : isJee ? 'bg-[#0f172a]' : 'bg-gray-800';
                    const themeBorder = isNeet ? 'border-[#00418d]' : isJee ? 'border-[#0ea5e9]' : 'border-gray-800';
                    const themeHoverBorder = isNeet ? 'hover:border-[#00418d] dark:hover:border-[#00418d]' : isJee ? 'hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9]' : 'hover:border-gray-400 dark:hover:border-gray-500';
                    const themeHoverText = isNeet ? 'group-hover:text-[#00418d]' : isJee ? 'group-hover:text-[#0ea5e9]' : 'group-hover:text-gray-600 dark:group-hover:text-gray-300';
                    const themeGroupHoverBg = isNeet ? 'group-hover:bg-[#00418d]' : isJee ? 'group-hover:bg-[#0ea5e9]' : 'group-hover:bg-gray-700';
                    const themeLightBg = isNeet ? 'bg-blue-50 dark:bg-blue-900/20' : isJee ? 'bg-slate-900 dark:bg-slate-900' : 'bg-gray-50 dark:bg-gray-900/20';
                    const themeLightBorder = isNeet ? 'border-blue-200 dark:border-blue-800' : isJee ? 'border-slate-700 dark:border-slate-700' : 'border-gray-200 dark:border-gray-800';
                    const themeRing = isNeet ? 'ring-[#00418d]' : isJee ? 'ring-[#0ea5e9]' : 'ring-gray-800';
                    const themeIcon = isNeet ? 'fa-stethoscope' : isJee ? 'fa-microchip' : 'fa-book';
                    const themeActiveBg = isNeet ? 'bg-[#003370]' : isJee ? 'bg-[#020617]' : 'bg-gray-900';

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

                                    <h3 className={`font-semibold ${themeText} mb-3 uppercase tracking-wider text-xs ${themeLightBg} border ${themeLightBorder} inline-block px-2 py-1 rounded-md`}>Select Question Type</h3>

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
                                                <div key={i} onClick={() => { if (qCount > 0) { setActiveQuestionType(type); setPracticeSelectedTopic(null); setCurrentQuestionIndex(0); setShowQuiz(true); } }} className={`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm transition-all group ${qCount > 0 ? 'cursor-pointer ' + themeHoverBorder : 'opacity-60'}`}>
                                                    <div className="flex-1 mr-4">
                                                        <h4 className={`font-semibold text-sm text-gray-800 dark:text-gray-200 ${themeHoverText} transition-colors`}>{type}</h4>
                                                        <p className="text-[10px] font-semibold text-gray-500 mt-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 inline-block px-2 py-0.5 rounded-sm">{qCount} Qs</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 ${qCount > 0 ? themeGroupHoverBg + ' group-hover:text-white' : ''} transition-colors flex items-center justify-center shrink-0`}>
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
                                <div className={`px-4 py-3 flex items-center justify-between ${themeBg} text-white shadow-md relative z-20`}>
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
                                        <button 
                                            onClick={() => setPracticeShowTopicModal(true)}
                                            className={`flex items-center gap-2 border rounded-sm transition-all px-3 py-1.5 ${practiceSelectedTopic ? themeBorder + ' ' + themeLightBg : 'border-gray-300 bg-white hover:border-gray-400'}`}
                                        >
                                            <i className={`fa-solid fa-filter text-[10px] ${practiceSelectedTopic ? themeText : 'text-gray-400'}`}></i>
                                            <span className={`text-xs font-bold truncate max-w-[120px] md:max-w-[160px] ${practiceSelectedTopic ? themeText : 'text-gray-600'}`}>
                                                {practiceSelectedTopic ? safeRenderText(practiceSelectedTopic) : 'All Topics'}
                                            </span>
                                            <i className={`fa-solid fa-chevron-down text-[10px] ${practiceSelectedTopic ? themeText : 'text-gray-400'}`}></i>
                                        </button>
                                        <div className="h-4 w-px bg-gray-300 mx-1 shrink-0"></div>
                                        <button onClick={() => { setQuestionFilter('all'); setCurrentQuestionIndex(0); }} className={`px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors border ${questionFilter === 'all' ? themeBg + ' text-white ' + themeBorder : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>All Qs</button>
                                        <button onClick={() => { setQuestionFilter('bookmarked'); setCurrentQuestionIndex(0); }} className={`px-3 py-1 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors border ${questionFilter === 'bookmarked' ? themeBg + ' text-white ' + themeBorder : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Bookmarked</button>
                                        <button onClick={() => { setQuestionFilter('incorrect'); setCurrentQuestionIndex(0); }} className={`px-3 py-1 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors border ${questionFilter === 'incorrect' ? themeBg + ' text-white ' + themeBorder : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Incorrect</button>
                                    </div>
                                    <button onClick={() => setPracticeShowPalette(true)} className={`ml-2 ${themeBg} text-white px-3 py-1.5 rounded-sm text-xs font-bold shrink-0 shadow-sm active:scale-95 transition-transform`}><i className="fa-solid fa-grip mr-1"></i> Palette</button>
                                </div>

                                {/* Question Content */}
                                <div data-qa-card className="p-3 md:p-5 max-w-4xl mx-auto">
                                    {displayedQuestions.length === 0 ? (
                                        <div className="bg-white border border-gray-300 shadow-sm py-12 text-center px-4 rounded-sm mt-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl"><i className="fa-solid fa-box-open"></i></div>
                                            <h3 className="font-bold text-gray-900 mb-2">No questions found</h3>
                                            <p className="text-sm text-gray-500 mb-4">Adjust your filters to see questions.</p>
                                            <button onClick={() => { setQuestionFilter('all'); setPracticeSelectedTopic(null); }} className={`text-white font-semibold text-sm px-4 py-2 rounded-sm mt-2 transition-colors ${themeBg} ${themeHoverBorder}`}>Clear Filters</button>
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
                                                            btnClass = `${themeBg} ${themeBorder} text-white ring-2 ${themeRing} ring-offset-2 z-10`;
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

                                

                                {/* Stunning Custom Topic Modal */}
                                {practiceShowTopicModal && (
                                    <div className="fixed inset-0 z-[99999] flex flex-col justify-end items-center sm:items-center sm:justify-center">
                                        {/* Backdrop */}
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setPracticeShowTopicModal(false)}></div>
                                        
                                        {/* Modal Body */}
                                        <div className={`relative w-full sm:w-[400px] sm:rounded-3xl rounded-t-3xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300 pb-safe`}>
                                            {/* Header */}
                                            <div className={`p-5 ${themeBg} text-white flex justify-between items-center shrink-0`}>
                                                <h3 className="font-bold text-lg tracking-wide flex items-center gap-2"><i className="fa-solid fa-list-ul"></i> Select Topic</h3>
                                                <button onClick={() => setPracticeShowTopicModal(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-95"><i className="fa-solid fa-xmark"></i></button>
                                            </div>
                                            
                                            {/* Scrollable List */}
                                            <div className="p-2 overflow-y-auto max-h-[60vh] bg-gray-50 flex flex-col gap-1">
                                                <button 
                                                    onClick={() => { setPracticeSelectedTopic(null); setCurrentQuestionIndex(0); setPracticeShowTopicModal(false); }}
                                                    className={`p-4 rounded-xl flex items-center justify-between transition-all active:scale-98 ${!practiceSelectedTopic ? themeLightBg + ' ' + themeBorder + ' border shadow-sm' : 'bg-white border border-transparent hover:border-gray-200 hover:bg-gray-100 text-gray-700'}`}
                                                >
                                                    <span className={`font-bold ${!practiceSelectedTopic ? themeText : ''}`}>All Topics Combined</span>
                                                    {!practiceSelectedTopic && <i className={`fa-solid fa-circle-check ${themeText} text-lg`}></i>}
                                                </button>

                                                {activePracticeChapter.topics?.map((top, i) => {
                                                    const isSelected = practiceSelectedTopic === top.name;
                                                    const qCount = top.questions?.length || 0;
                                                    return (
                                                        <button 
                                                            key={i}
                                                            onClick={() => { setPracticeSelectedTopic(top.name); setCurrentQuestionIndex(0); setPracticeShowTopicModal(false); }}
                                                            className={`p-4 rounded-xl flex items-center justify-between transition-all active:scale-[0.98] ${isSelected ? themeLightBg + ' ' + themeBorder + ' border shadow-sm' : 'bg-white border border-transparent hover:border-gray-200 hover:bg-gray-100 text-gray-700'}`}
                                                        >
                                                            <div className="flex flex-col items-start text-left">
                                                                <span className={`font-bold text-sm line-clamp-2 ${isSelected ? themeText : ''}`}>{safeRenderText(top.name)}</span>
                                                                <span className="text-[10px] font-semibold text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded-sm">{qCount} Qs</span>
                                                            </div>
                                                            {isSelected && <i className={`fa-solid fa-circle-check ${themeText} text-lg shrink-0 ml-3`}></i>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* CBT Palette Slide-over Modal */}
                                {showPalette && (
                                    <div className="fixed inset-0 bg-black/60 z-[99999] flex flex-col justify-center items-end animate-in fade-in" onClick={() => setPracticeShowPalette(false)}>
                                        <div className="bg-[#f0f4f7] dark:bg-gray-900 h-full w-[80vw] sm:w-[380px] shadow-2xl pb-safe flex flex-col border-l border-gray-300 dark:border-gray-800 transform transition-transform animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
                                            <div className={`${themeBg} text-white p-3 flex justify-between items-center shadow-md z-10 shrink-0`}>
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
                                                            <button key={q.id} onClick={() => scrollToQuestion(qIdx)} className={`w-full aspect-square border flex items-center justify-center font-bold text-sm shadow-sm transition-transform hover:scale-105 active:scale-95 ${shapeClass} ${safeQuestionIndex === qIdx ? `ring-2 ${themeRing} ring-offset-1` : ''}`}>
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
                                <h3 className={`font-semibold ${themeText} mb-3 uppercase tracking-wider text-xs ${themeLightBg} border ${themeLightBorder} inline-block px-2 py-1 rounded-md`}>Chapter Selection</h3>
                                <div className="space-y-3">
                                    {activePracticeSubject.chapters && activePracticeSubject.chapters.length > 0 ? (
                                        activePracticeSubject.chapters.map((chap, i) => (
                                            <div key={i} onClick={() => { setActivePracticeChapter(chap); setShowQuiz(false); }} className={`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm cursor-pointer ${themeHoverBorder} transition-all group`}>
                                                <div>
                                                    <h4 className={`font-semibold text-sm text-gray-800 dark:text-gray-200 ${themeHoverText} transition-colors`}>{safeRenderText(chap.name)}</h4>
                                                    <p className="text-[10px] font-semibold text-gray-500 mt-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 inline-block px-2 py-0.5 rounded-sm">{chap.topics?.length || 0} Topics</p>
                                                </div>
                                                <i className={`fa-solid fa-chevron-right text-gray-400 ${themeHoverText} transition-colors`}></i>
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
                                            <div key={sub.id} onClick={() => setActivePracticeSubject(sub)} className={`bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-md cursor-pointer ${themeHoverBorder} active:scale-[0.98] transition-all duration-300 flex flex-col items-center justify-center text-center group relative overflow-hidden`}>
                                                <span className="text-4xl mb-3 group-hover:-translate-y-1 transition-transform duration-300 z-10">{sub.icon}</span>
<i className={`fa-solid ${themeIcon} absolute -right-6 -bottom-6 text-[80px] opacity-5 group-hover:opacity-10 transition-opacity`}></i>
                                                <h3 className={`font-bold text-gray-800 dark:text-gray-200 mt-2 z-10 ${themeHoverText} transition-colors`}>{safeRenderText(sub.name)}</h3>
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
                                    <div onClick={() => setActivePracticeMode('practice')} className={`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer ${themeHoverBorder} transition-all group overflow-hidden relative`}>
                                        <div className={`w-12 h-12 rounded-xl ${themeLightBg} border ${themeLightBorder} ${themeText} flex items-center justify-center text-xl z-10`}><i className="fa-solid fa-book-open"></i></div>
                                        <div className="flex-1 relative z-10">
                                            <h3 className={`font-bold text-lg text-gray-800 dark:text-gray-200 ${themeHoverText} transition-colors z-10 relative`}>Practice Modules</h3>
                                            <p className="text-xs text-gray-500 font-medium">Chapter-wise structured practice</p>
                                        </div>
                                        <i className={`fa-solid fa-chevron-right text-gray-400 ${themeHoverText} transition-colors`}></i>
                                    </div>
                                    <div onClick={() => setActivePracticeMode('tests')} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-500 flex items-center justify-center text-xl"><i className="fa-solid fa-stopwatch"></i></div>
                                        <div className="flex-1 relative z-10">
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-purple-500 transition-colors">Tests</h3>
                                            <p className="text-xs text-gray-500 font-medium">Full-length & part syllabus tests</p>
                                        </div>
                                        <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-purple-500 transition-colors"></i>
                                    </div>
                                    <div onClick={() => setActivePracticeMode('custom')} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-500 flex items-center justify-center text-xl"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                                        <div className="flex-1 relative z-10">
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
                                    if (batch.type === 'neet') {
                                        return (
                                            <div key={batch.id} onClick={() => setActivePracticeBatch(batch)} className="group relative w-full h-[180px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-[0_10px_40px_-10px_rgba(0,65,141,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(0,65,141,0.7)] hover:-translate-y-2 transition-all duration-500 ease-out">
                                                {/* Gaming/Premium Blue Gradient Base */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#00418d] via-[#003370] to-[#001a3d] z-0"></div>
                                                
                                                {/* Animated Medical Patterns */}
                                                <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] mix-blend-overlay z-0"></div>
                                                
                                                {/* Glowing Orbs */}
                                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl group-hover:bg-blue-300/30 transition-all duration-700 z-0"></div>
                                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl group-hover:bg-teal-300/30 transition-all duration-700 z-0"></div>
                                                
                                                {/* Floating Medical Icons (Gaming Style) */}
                                                <i className="fa-solid fa-stethoscope absolute -right-4 -bottom-4 text-[120px] text-white/5 group-hover:text-blue-400/10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 z-10 drop-shadow-2xl"></i>
                                                <i className="fa-solid fa-pills absolute top-6 right-24 text-3xl text-blue-300/10 group-hover:text-teal-300/20 group-hover:-translate-y-4 transition-all duration-1000 z-10"></i>
                                                <i className="fa-solid fa-hospital absolute bottom-8 right-32 text-4xl text-blue-200/5 group-hover:text-blue-200/15 group-hover:-translate-x-4 transition-all duration-1000 z-10"></i>
                                                <i className="fa-solid fa-staff-snake absolute top-1/2 right-12 -translate-y-1/2 text-6xl text-white/5 group-hover:text-blue-100/10 group-hover:scale-125 transition-all duration-1000 z-10"></i>

                                                {/* Content */}
                                                <div className="relative z-20 h-full flex flex-col justify-center px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner group-hover:bg-white/20 transition-all duration-500">
                                                            <i className="fa-solid fa-user-doctor text-2xl text-blue-100 group-hover:text-white group-hover:scale-110 transition-transform duration-500"></i>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md">NEET Bank</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/30 text-[10px] font-black text-blue-200 uppercase tracking-widest backdrop-blur-sm">Medical Track</span>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.8)]"></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else if (batch.type === 'jee') {
                                        return (
                                            <div key={batch.id} onClick={() => setActivePracticeBatch(batch)} className="group relative w-full h-[180px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-[0_10px_40px_-10px_rgba(15,23,42,0.8)] hover:shadow-[0_20px_50px_-10px_rgba(6,182,212,0.4)] hover:-translate-y-2 transition-all duration-500 ease-out mt-4">
                                                {/* Gaming/Premium Engineer Base */}
                                                <div className="absolute inset-0 bg-[#0b0f19] z-0"></div>
                                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-transparent to-purple-900/40 z-0"></div>
                                                
                                                {/* Grid Pattern */}
                                                <div className="absolute inset-0 opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] mix-blend-overlay z-0"></div>
                                                
                                                {/* Hacker/Cyberpunk Glows */}
                                                <div className="absolute top-0 right-0 w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#06b6d4_100%)] opacity-0 group-hover:opacity-10 group-hover:animate-spin-slow transition-opacity duration-1000 z-0 pointer-events-none"></div>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-400/20 transition-all duration-700 z-0"></div>
                                                
                                                {/* Floating Engineer Icons (Gaming Style) */}
                                                <i className="fa-solid fa-microchip absolute -right-6 -bottom-6 text-[130px] text-cyan-500/5 group-hover:text-cyan-400/15 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 z-10 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]"></i>
                                                <i className="fa-solid fa-laptop-code absolute top-8 right-24 text-3xl text-cyan-300/10 group-hover:text-cyan-200/30 group-hover:-translate-y-3 transition-all duration-1000 z-10"></i>
                                                <i className="fa-solid fa-compass-drafting absolute bottom-8 right-36 text-4xl text-purple-400/10 group-hover:text-purple-300/30 group-hover:rotate-12 transition-all duration-1000 z-10"></i>
                                                <i className="fa-solid fa-ruler-combined absolute top-1/2 right-12 -translate-y-1/2 text-5xl text-white/5 group-hover:text-cyan-100/20 group-hover:scale-110 transition-all duration-1000 z-10"></i>

                                                {/* Content */}
                                                <div className="relative z-20 h-full flex flex-col justify-center px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-[#1e293b] border border-cyan-500/30 flex items-center justify-center shadow-[inset_0_0_15px_rgba(6,182,212,0.2)] group-hover:shadow-[inset_0_0_25px_rgba(6,182,212,0.4)] group-hover:border-cyan-400 transition-all duration-500">
                                                            <i className="fa-solid fa-helmet-safety text-2xl text-cyan-500 group-hover:text-cyan-300 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"></i>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md">JEE Bank</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="px-2 py-0.5 rounded bg-cyan-900/40 border border-cyan-500/40 text-[10px] font-black text-cyan-400 uppercase tracking-widest backdrop-blur-sm">Engineer Track</span>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]"></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div key={batch.id} onClick={() => setActivePracticeBatch(batch)} className="group relative w-full h-[100px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out mt-4">
                                                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 z-0"></div>
                                                <i className="fa-solid fa-vial absolute -right-2 -bottom-2 text-[60px] text-white/5 group-hover:scale-110 transition-all duration-500 z-10"></i>
                                                <div className="relative z-20 h-full flex items-center px-6 gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center">
                                                        <i className="fa-solid fa-flask text-gray-300"></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white tracking-tight">{batch.name}</h3>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Standard Track</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
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
