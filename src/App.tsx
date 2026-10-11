/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  PRACTICE_SENTENCES,
  GRADED_TESTS,
  TestGroup,
  QuestionLevel,
  SentenceItem,
  getRandomTestGroup,
} from './data/sentences';

type ExperimentPhase = 'intro' | 'running' | 'complete';
type TrialStage = 'level_notice' | 'ready' | 'reading' | 'question';

export interface TrialResult {
  trialNumber: number;
  isPractice: boolean;
  testGroup: TestGroup;
  level: QuestionLevel;
  wordCount: number; // $l
  totalTime: number; // $totalTime (ms)
  sentence: string; // %sentence
  words: string[]; // %%words
  reactionTimes: number[]; // &&reactionTimes (ms)
}

interface QueuedTrial {
  item: SentenceItem;
  isPractice: boolean;
  trialNumber: number; // 1-2 for practice, 1-8 for graded
}

export default function App() {
  const [testGroup, setTestGroup] = useState<TestGroup>(() => getRandomTestGroup());
  const [phase, setPhase] = useState<ExperimentPhase>('intro');
  const [currentTrialIndex, setCurrentTrialIndex] = useState<number>(0);
  const [trialStage, setTrialStage] = useState<TrialStage>('ready');
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [currentReactionTimes, setCurrentReactionTimes] = useState<number[]>([]);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [showCopyScreen, setShowCopyScreen] = useState<boolean>(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [includePracticeInOutput, setIncludePracticeInOutput] = useState<boolean>(false);

  const wordStartTimeRef = useRef<number>(0);
  const lastPointerTimeRef = useRef<number>(0);

  // Build the 10-trial sequence:
  // 2 practice tests (not graded) + 8 graded tests (4 Level 1 followed by 4 Level 2)
  const trialQueue: QueuedTrial[] = useMemo(() => {
    const practiceTrials: QueuedTrial[] = PRACTICE_SENTENCES.map((item, idx) => ({
      item,
      isPractice: true,
      trialNumber: idx + 1,
    }));
    const gradedTrials: QueuedTrial[] = GRADED_TESTS[testGroup].map((item, idx) => ({
      item,
      isPractice: false,
      trialNumber: idx + 1,
    }));
    return [...practiceTrials, ...gradedTrials];
  }, [testGroup]);

  const currentTrial = trialQueue[currentTrialIndex];
  const currentWords = useMemo(() => {
    if (!currentTrial) return [];
    return currentTrial.item.sentence.trim().split(/\s+/);
  }, [currentTrial]);

  // Guard against accidental double-triggers within 35ms while supporting rapid clicking/tapping
  const isValidPointerTrigger = (e: React.PointerEvent<HTMLElement>): boolean => {
    if (e.pointerType === 'mouse' && e.button !== 0) {
      return false; // Only allow left-click on mouse
    }
    const now = performance.now();
    if (now - lastPointerTimeRef.current < 35) {
      return false;
    }
    lastPointerTimeRef.current = now;
    return true;
  };

  const handleStartExperiment = () => {
    setResults([]);
    setCurrentTrialIndex(0);
    setTrialStage('ready');
    setWordIndex(0);
    setCurrentReactionTimes([]);
    setShowCopyScreen(false);
    setCopyStatus('idle');
    setPhase('running');
  };

  const handleRestartWithNewRandomGroup = () => {
    const nextGroup = getRandomTestGroup();
    setTestGroup(nextGroup);
    setResults([]);
    setCurrentTrialIndex(0);
    setTrialStage('ready');
    setWordIndex(0);
    setCurrentReactionTimes([]);
    setShowCopyScreen(false);
    setCopyStatus('idle');
    setPhase('intro');
  };

  const handleReadingSurfacePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isValidPointerTrigger(e)) return;

    if (trialStage === 'ready') {
      // Transition from instructions to first word (index 0)
      setWordIndex(0);
      setCurrentReactionTimes([]);
      setTrialStage('reading');
      wordStartTimeRef.current = performance.now();
      return;
    }

    if (trialStage === 'reading') {
      const now = performance.now();
      const rt = Math.max(1, Math.round(now - wordStartTimeRef.current));
      const updatedReactionTimes = [...currentReactionTimes, rt];
      setCurrentReactionTimes(updatedReactionTimes);

      if (wordIndex + 1 < currentWords.length) {
        setWordIndex(wordIndex + 1);
        wordStartTimeRef.current = performance.now();
      } else {
        // Finished the last word of the sentence -> show the post-sentence question
        setTrialStage('question');
      }
    }
  };

  // Answered post-sentence question (Level 1 Yes/No or Level 2 4-option theme question)
  const handleAnswerQuestion = () => {
    const totalTime = currentReactionTimes.reduce((sum, val) => sum + val, 0);

    const completedRecord: TrialResult = {
      trialNumber: currentTrial.trialNumber,
      isPractice: currentTrial.isPractice,
      testGroup,
      level: currentTrial.item.level,
      wordCount: currentWords.length,
      totalTime,
      sentence: currentTrial.item.sentence,
      words: currentWords,
      reactionTimes: currentReactionTimes,
    };

    const nextResults = [...results, completedRecord];
    setResults(nextResults);

    if (currentTrialIndex + 1 < trialQueue.length) {
      const nextTrial = trialQueue[currentTrialIndex + 1];
      setCurrentTrialIndex(currentTrialIndex + 1);
      setWordIndex(0);
      setCurrentReactionTimes([]);

      // Boundary between Graded Question #4 (end of Level 1) and Question #5 (start of Level 2)
      if (
        !currentTrial.isPractice &&
        currentTrial.trialNumber === 4 &&
        !nextTrial.isPractice &&
        nextTrial.trialNumber === 5
      ) {
        setTrialStage('level_notice');
      } else {
        setTrialStage('ready');
      }
    } else {
      setPhase('complete');
    }
  };

  const gradedResults = useMemo(
    () => results.filter((r) => !r.isPractice),
    [results]
  );

  const displayedResults = useMemo(
    () => (includePracticeInOutput ? results : gradedResults),
    [results, gradedResults, includePracticeInOutput]
  );

  // Format data for clipboard & "copy data to clipboard" screen
  // Includes Test Type (R1~R4) and Level (Level 1 / Level 2) plus baseline save fields: $l $totalTime %sentence &&reactionTimes
  const clipboardText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`Test Type: ${testGroup}`);
    lines.push(
      `Columns:\tTest_Type\tLevel\tTrial\tWord_Count($l)\tTotal_Time_ms($totalTime)\tSentence(%sentence)\tReaction_Times_ms(&&reactionTimes)`
    );

    displayedResults.forEach((row) => {
      const trialLabel = row.isPractice
        ? `Practice_${row.trialNumber}`
        : `${row.testGroup}_${row.trialNumber}`;
      const levelLabel = row.isPractice ? 'Practice' : `Level_${row.level}`;
      const rtString = row.reactionTimes.join(' ');
      lines.push(
        `${row.testGroup}\t${levelLabel}\t${trialLabel}\t${row.wordCount}\t${row.totalTime}\t"${row.sentence}"\t${rtString}`
      );
    });

    lines.push('');
    lines.push(`--- Baseline Save Format (Test: ${testGroup}) ---`);
    displayedResults.forEach((row) => {
      const levelTag = row.isPractice ? 'Practice' : `L${row.level}`;
      const rtString = row.reactionTimes.join(' ');
      lines.push(
        `${row.testGroup} [${levelTag}] ${row.wordCount} ${row.totalTime} "${row.sentence}" ${rtString}`
      );
    });

    return lines.join('\n');
  }, [testGroup, displayedResults]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2500);
    } catch {
      // Fallback for restricted iframe clipboard permissions
      const textArea = document.createElement('textarea');
      textArea.value = clipboardText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2500);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  // 1. INTRO SCREEN
  if (phase === 'intro') {
    return (
      <main className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl border border-black p-8 sm:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight">
            A self-paced reading task.
          </h1>

          <div className="space-y-4 text-[18px] sm:text-[20px] leading-relaxed mb-8">
            <p>
              This experiment consists of <strong>2 practice sentences</strong> (not graded)
              followed by <strong>8 graded sentences</strong> divided into two levels:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Level 1 (Sentences 1–4):</strong> Followed by a Yes / No word check
                question.
              </li>
              <li>
                <strong>Level 2 (Sentences 5–8):</strong> Followed by a 4-option comprehension
                question about the theme of the sentence.
              </li>
            </ul>
            <p>
              During each sentence, all words are hidden with lines (
              <span className="font-mono">----</span>) except the word you are currently reading.
            </p>
            <p>
              <strong>How to advance:</strong> Use a <strong>left click</strong> (laptop/desktop)
              or <strong>tap on the screen</strong> (mobile device) to reveal the first word and
              each following word at your natural reading pace.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartExperiment}
            className="w-full sm:w-auto px-8 py-4 bg-black text-white text-[18px] sm:text-[20px] font-medium border border-black hover:bg-neutral-800 active:bg-neutral-900 cursor-pointer transition-colors"
          >
            Left-Click or Tap Here to Start
          </button>
        </div>
      </main>
    );
  }

  // 2. RUNNING EXPERIMENT SCREEN (LEVEL NOTICE / READY / READING / QUESTION)
  if (phase === 'running' && currentTrial) {
    const sectionLabel = currentTrial.isPractice
      ? `Practice Test ${currentTrial.trialNumber} of ${PRACTICE_SENTENCES.length} (Not Graded)`
      : `Graded Test ${currentTrial.trialNumber} of ${GRADED_TESTS[testGroup].length} — Level ${currentTrial.item.level}`;

    // Stage 0: Boundary Notice between Graded Sentence #4 (Level 1) and Graded Sentence #5 (Level 2)
    if (trialStage === 'level_notice') {
      return (
        <main className="min-h-screen w-full bg-white text-black flex flex-col justify-between px-6 py-8 select-none">
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between text-sm text-black border-b border-black/20 pb-3">
            <span>Level Transition Notice</span>
            <span>Up Next: Sentence 5 of 8 (Level 2)</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto my-8">
            <div className="w-full border-2 border-black p-8 sm:p-10 text-center space-y-6">
              <p className="text-sm font-bold uppercase tracking-widest">
                Notice: Level Change (Level 1 &rarr; Level 2)
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Entering Level 2 — Higher Focus Required
              </h2>
              <p className="text-[18px] sm:text-[20px] leading-relaxed">
                You have completed the 4 Level 1 sentences. The remaining 4 sentences (Sentences
                5 to 8) are <strong>Level 2</strong>.
              </p>
              <p className="text-[18px] sm:text-[20px] leading-relaxed">
                After each Level 2 sentence, you will answer a{' '}
                <strong>4-option question (a, b, c, d)</strong> about the theme and meaning of the
                sentence. Please read carefully with heightened focus.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setTrialStage('ready')}
                  className="px-8 py-4 text-[18px] sm:text-[20px] font-medium bg-black text-white border-2 border-black hover:bg-neutral-800 active:bg-neutral-900 cursor-pointer transition-colors"
                >
                  Continue to Level 2 (Sentence 5 of 8)
                </button>
              </div>
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto text-center text-sm text-black pt-3 border-t border-black/20">
            Click or tap the button above when you are ready to focus on Level 2
          </div>
        </main>
      );
    }

    // Stage A & B: 'ready' or 'reading' -> clicking/tapping anywhere on the screen advances
    if (trialStage === 'ready' || trialStage === 'reading') {
      return (
        <main
          onPointerDown={handleReadingSurfacePointerDown}
          className="experiment-touch-surface min-h-screen w-full bg-white text-black flex flex-col justify-between px-6 py-8 cursor-pointer select-none"
          role="button"
          tabIndex={0}
          aria-label="Self-paced reading surface. Left-click or tap to advance to the next word."
        >
          {/* Quiet top trial counter */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between text-sm text-black border-b border-black/20 pb-3">
            <span>{sectionLabel}</span>
            <span>
              {trialStage === 'reading'
                ? `Word ${wordIndex + 1} of ${currentWords.length}`
                : 'Ready'}
            </span>
          </div>

          {/* Center Reading Canvas */}
          <div className="flex-1 flex items-center justify-center w-full max-w-5xl mx-auto my-8">
            {trialStage === 'ready' ? (
              <div className="text-center space-y-6 max-w-2xl">
                {!currentTrial.isPractice && currentTrial.trialNumber === 1 && (
                  <p className="text-[18px] sm:text-[20px] font-bold pb-2 border-b border-black inline-block px-4">
                    Practice complete. Beginning Graded Test — Level 1 (Sentences 1–4).
                  </p>
                )}
                {!currentTrial.isPractice && currentTrial.trialNumber === 5 && (
                  <p className="text-[18px] sm:text-[20px] font-bold pb-2 border-b border-black inline-block px-4">
                    Graded Test — Level 2 (Sentences 5–8): High Focus Mode
                  </p>
                )}
                <p className="text-[20px] sm:text-[22px] leading-relaxed">
                  Left-click or tap the screen to see the first word.
                </p>
                <p className="text-[20px] sm:text-[22px] leading-relaxed">
                  Then left-click or tap the screen each time for the following words.
                </p>
              </div>
            ) : (
              <div
                className="w-full text-left sm:text-center leading-[1.6] tracking-normal break-words"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                <p className="text-[28px] sm:text-[36px] md:text-[40px] font-normal">
                  {currentWords.map((word, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && ' '}
                      <span className="inline-block">
                        {idx === wordIndex ? word : '----'}
                      </span>
                    </React.Fragment>
                  ))}
                </p>
              </div>
            )}
          </div>

          {/* Subtle footer prompt */}
          <div className="w-full max-w-4xl mx-auto text-center text-sm text-black pt-3 border-t border-black/20">
            Left-click (laptop/desktop) or tap anywhere on the screen (mobile) to continue
          </div>
        </main>
      );
    }

    // Stage C: 'question' ->
    // Practice & Level 1: Yes/No word check ("Did the word ~~~ appear in the sentence?")
    // Level 2: 4-option comprehension question about the theme of the sentence (a, b, c, d)
    const isLevel2Question =
      !currentTrial.isPractice &&
      currentTrial.item.level === 2 &&
      Boolean(currentTrial.item.themeQuestion);

    return (
      <main className="min-h-screen w-full bg-white text-black flex flex-col justify-between px-6 py-8 select-none">
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between text-sm text-black border-b border-black/20 pb-3">
          <span>{sectionLabel}</span>
          <span>{isLevel2Question ? 'Level 2 Theme Question' : 'Question'}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto my-8 text-center">
          {isLevel2Question && currentTrial.item.themeQuestion ? (
            <div className="w-full">
              <p
                className="text-[22px] sm:text-[26px] font-bold mb-8 leading-relaxed"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                {currentTrial.item.themeQuestion.prompt}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mx-auto text-left">
                {currentTrial.item.themeQuestion.options.map((optionText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={handleAnswerQuestion}
                    className="py-4 px-6 text-[18px] sm:text-[20px] font-medium bg-white text-black border-2 border-black hover:bg-black hover:text-white active:bg-black active:text-white cursor-pointer transition-colors text-left"
                  >
                    {optionText}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <p
                className="text-[22px] sm:text-[26px] mb-10 leading-relaxed"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                Did the word <strong>&ldquo;{currentTrial.item.targetWord}&rdquo;</strong> appear in
                the sentence?
              </p>

              <div className="flex items-center justify-center gap-6 sm:gap-10 w-full max-w-md">
                <button
                  type="button"
                  onClick={handleAnswerQuestion}
                  className="flex-1 py-4 px-8 text-[20px] font-medium bg-white text-black border-2 border-black hover:bg-black hover:text-white active:bg-black active:text-white cursor-pointer transition-colors"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={handleAnswerQuestion}
                  className="flex-1 py-4 px-8 text-[20px] font-medium bg-white text-black border-2 border-black hover:bg-black hover:text-white active:bg-black active:text-white cursor-pointer transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-4xl mx-auto text-center text-sm text-black pt-3 border-t border-black/20">
          {isLevel2Question
            ? 'Please select one of the four options (a, b, c, or d) to proceed to the next sentence'
            : 'Please select Yes or No to proceed to the next sentence'}
        </div>
      </main>
    );
  }

  // 3. END SCREEN & "COPY DATA TO CLIPBOARD" SCREEN
  return (
    <main className="min-h-screen bg-white text-black px-4 sm:px-8 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Summary Banner with prominent Test Group (R1~R4) */}
        <div className="border-2 border-black p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wider font-bold mb-1">
              Experiment Complete
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Assigned Graded Test: <span className="underline">{testGroup}</span>
            </h1>
            <p className="text-base mt-1">
              Subject completed 2 practice tests and 8 graded tests (4 Level 1 + 4 Level 2) from
              group <strong>{testGroup}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCopyScreen((prev) => !prev)}
              className="px-5 py-3 text-base font-medium border-2 border-black bg-white text-black hover:bg-black hover:text-white cursor-pointer transition-colors"
            >
              {showCopyScreen ? 'View Results Table' : 'Open Copy Data to Clipboard Screen'}
            </button>
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="px-5 py-3 text-base font-medium border-2 border-black bg-black text-white hover:bg-neutral-800 cursor-pointer transition-colors"
            >
              {copyStatus === 'copied'
                ? `Copied (${testGroup}) Data!`
                : 'Copy Data to Clipboard'}
            </button>
          </div>
        </div>

        {/* Dedicated "Copy Data to Clipboard" Screen / Box */}
        <section className="border border-black p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-4 border-b border-black">
            <div>
              <h2 className="text-xl font-bold">
                Copy Data to Clipboard — Test Type: {testGroup}
              </h2>
              <p className="text-sm mt-1">
                Includes test group (<strong>{testGroup}</strong>), level (Level 1 / Level 2), word
                count (<code className="font-mono">$l</code>), total reading time in ms (
                <code className="font-mono">$totalTime</code>), sentence (
                <code className="font-mono">%sentence</code>), and word-by-word reaction times in
                ms (<code className="font-mono">&amp;&amp;reactionTimes</code>).
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includePracticeInOutput}
                  onChange={(e) => setIncludePracticeInOutput(e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <span>Include 2 practice trials</span>
              </label>

              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="px-4 py-2 text-sm font-bold border border-black bg-black text-white hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                {copyStatus === 'copied' ? 'Copied!' : 'Copy Data to Clipboard'}
              </button>
            </div>
          </div>

          <div className="mb-3 text-base font-bold">
            Test Taken: {testGroup}
          </div>

          <textarea
            readOnly
            value={clipboardText}
            rows={12}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            aria-label="Formatted experiment data for clipboard"
            className="w-full font-mono text-xs sm:text-sm p-4 bg-white text-black border border-black focus:outline-none"
          />
        </section>

        {/* Detailed Trial-by-Trial Results Table */}
        {!showCopyScreen && (
          <section className="border border-black p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-black">
              <h2 className="text-xl font-bold">
                Recorded Reading Times — Graded Test: {testGroup}
              </h2>
              <span className="text-sm font-mono">
                {displayedResults.length} sentences shown
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="py-3 pr-4 font-bold">Test</th>
                    <th className="py-3 px-3 font-bold">Level</th>
                    <th className="py-3 px-3 font-bold">Trial</th>
                    <th className="py-3 px-3 font-bold">Words ($l)</th>
                    <th className="py-3 px-3 font-bold">Total Time ($totalTime)</th>
                    <th className="py-3 px-3 font-bold">
                      Sentence (%sentence) &amp; Word RTs (&amp;&amp;reactionTimes)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/30">
                  {displayedResults.map((row, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-4 pr-4 font-mono font-bold whitespace-nowrap">
                        {row.isPractice ? `${row.testGroup} (Practice)` : row.testGroup}
                      </td>
                      <td className="py-4 px-3 font-mono whitespace-nowrap">
                        {row.isPractice ? 'Practice' : `Level ${row.level}`}
                      </td>
                      <td className="py-4 px-3 font-mono whitespace-nowrap">
                        {row.isPractice ? `P${row.trialNumber}` : `#${row.trialNumber}`}
                      </td>
                      <td className="py-4 px-3 font-mono tabular-nums whitespace-nowrap">
                        {row.wordCount}
                      </td>
                      <td className="py-4 px-3 font-mono tabular-nums whitespace-nowrap font-bold">
                        {row.totalTime} ms
                      </td>
                      <td className="py-4 px-3">
                        <p className="font-medium text-base mb-2">{row.sentence}</p>
                        <div className="flex flex-wrap gap-2">
                          {row.words.map((w, wIdx) => (
                            <span
                              key={wIdx}
                              className="inline-flex items-baseline gap-1.5 border border-black px-2 py-1 text-xs font-mono"
                            >
                              <span className="font-bold">{w}</span>
                              <span>{row.reactionTimes[wIdx]}ms</span>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Restart Option */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleRestartWithNewRandomGroup}
            className="px-5 py-2.5 text-sm font-medium border border-black bg-white text-black hover:bg-black hover:text-white cursor-pointer transition-colors"
          >
            Run New Session (Randomly Assign R1–R4)
          </button>
        </div>
      </div>
    </main>
  );
}
