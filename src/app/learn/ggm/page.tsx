"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type Message = {
  role: "assistant" | "user";
  content: string;
};

type LearningMode = "intro" | "ask" | "practice" | "completed";
type NodeKey = "ddmBasics" | "ggm" | "multistageDdm";
type LearningStatuses = Record<NodeKey, number>;

type PracticeQuestion = {
  id: string;
  prompt: string;
};

const STORAGE_KEY = "learning-node-statuses-v1";

const DEFAULT_STATUSES: LearningStatuses = {
  ddmBasics: 0,
  ggm: 0,
  multistageDdm: 0,
};

const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: "ggm-q1",
    prompt:
      "Practice Question 1: A company just paid a dividend ($D_0$) of $1.35$. Shareholders expect a $9.8\\%$ return ($r$). The company has a retention rate ($b$) of $55\\%$ and an $ROE$ of $12\\%$. What is the intrinsic value ($V_0$)?",
  },
  {
    id: "ggm-q2",
    prompt:
      "Practice Question 2: A company has just paid a dividend ($D_0$) of $2.00$. The required return is $11\\%$, and dividends are expected to grow forever at $4\\%$. Using the Gordon Growth Model, what is the intrinsic value ($V_0$)?",
  },
];

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(10, Math.round(value)));
}

function loadStatuses(): LearningStatuses {
  if (typeof window === "undefined") return DEFAULT_STATUSES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATUSES;
    const parsed = JSON.parse(raw) as Partial<LearningStatuses>;
    return {
      ddmBasics: clampScore(parsed.ddmBasics ?? 0),
      ggm: clampScore(parsed.ggm ?? 0),
      multistageDdm: clampScore(parsed.multistageDdm ?? 0),
    };
  } catch {
    return DEFAULT_STATUSES;
  }
}

function saveStatuses(statuses: LearningStatuses) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
}

function formatMathText(text: string) {
  if (!text) return "";
  return text
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$");
}

export default function GGMPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [mode, setMode] = useState<LearningMode>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasEnteredPractice, setHasEnteredPractice] = useState(false);
  const [hasUsedHint, setHasUsedHint] = useState(false);
  const [hasUsedShowAnswer, setHasUsedShowAnswer] = useState(false);
  const [nodeScore, setNodeScore] = useState(0);

  const currentQuestion = useMemo(
    () => PRACTICE_QUESTIONS[currentQuestionIndex],
    [currentQuestionIndex]
  );

  const appendAssistantMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  };

  // 核心分数更新与日志输出函数
  const updateNodeScore = (updater: (current: number) => number, logReason: string) => {
    const statuses = loadStatuses();
    const current = clampScore(statuses.ggm ?? 0);

    if (current >= 10) {
      console.log(`[Score Log] Attempted change (${logReason}), but score is already maxed at 10.`);
      return;
    }

    let next = clampScore(updater(current));

    // 任何时刻只要数值不为0，则无法被置为0
    if (current !== 0 && next === 0) {
      next = 1;
    }

    const nextStatuses: LearningStatuses = { ...statuses, ggm: next };
    saveStatuses(nextStatuses);
    setNodeScore(next);

    console.log(`[Score Log] Score changed: ${current} -> ${next} | Reason: ${logReason}`);
  };

  const enterPractice = (questionIndex = 0) => {
    setMode("practice");
    setHasEnteredPractice(true);
    setHasUsedHint(false);
    setHasUsedShowAnswer(false);
    setCurrentQuestionIndex(questionIndex);
    setInputValue("");

    setMessages((prev) => {
      const nextMessages = [...prev];
      const questionMessage = PRACTICE_QUESTIONS[questionIndex].prompt;
      const lastMessage = nextMessages[nextMessages.length - 1];

      if (lastMessage?.role === "assistant" && lastMessage.content === questionMessage) {
        return nextMessages;
      }
      return [...nextMessages, { role: "assistant", content: questionMessage }];
    });
  };

  const handleAskQuestion = () => {
    setMode("ask");
    appendAssistantMessage("Sure — ask any question you have about the Gordon Growth Model, and I will explain it step by step.");
  };

  const handleNextPart = () => {
    if (!hasEnteredPractice) {
      updateNodeScore((current) => Math.max(current, 9), "Clicked Next Part without entering practice");
    }
    setMode("completed");
    appendAssistantMessage("Good job! You can move to the next knowledge node now. (This is a placeholder for the next module)");
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex >= PRACTICE_QUESTIONS.length - 1) return;
    enterPractice(currentQuestionIndex + 1);
  };

  const handleQuestionChat = async () => {
    if (isLoading || !inputValue.trim()) return;

    const userMessage: Message = { role: "user", content: inputValue };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          action_type: "ask_question",
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");
      const data = await response.json();
      appendAssistantMessage(data.tutor_response);
    } catch (error) {
      appendAssistantMessage("Sorry, I encountered a network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePracticeAction = async (actionType: "practice_answer" | "hint" | "show_answer") => {
    if (isLoading) return;

    const userText =
      actionType === "practice_answer" ? inputValue : actionType === "hint" ? "Please give me a hint." : "Please show me the full answer.";

    if (!userText.trim()) return;

    const shouldAppendUserMessage = actionType === "practice_answer";
    const newMessages: Message[] = shouldAppendUserMessage
      ? [...messages, { role: "user", content: userText }]
      : messages;

    if (shouldAppendUserMessage) {
      setMessages(newMessages);
      setInputValue("");
    }

    if (actionType === "hint") setHasUsedHint(true);
    if (actionType === "show_answer") setHasUsedShowAnswer(true);

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          action_type: actionType,
          current_question: currentQuestion.prompt,
          user_input: userText,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");
      const data = await response.json();
      appendAssistantMessage(data.tutor_response);

      if (actionType === "practice_answer") {
        if (data.is_correct) {
          if (!hasUsedHint && !hasUsedShowAnswer) {
            updateNodeScore(() => 10, "Answered correctly without any hints.");
          } else if (hasUsedHint && !hasUsedShowAnswer) {
            updateNodeScore((current) => current + 6, "Answered correctly after using a hint.");
          } else {
             console.log("[Score Log] Answered correctly after showing answer. No points awarded.");
          }

          setMode("completed");
          appendAssistantMessage("Good job! You have completed this knowledge node. (Placeholder for next module transition)");
        } else {
          updateNodeScore((current) => current - 1, "Incorrect practice answer.");
        }
      }
    } catch (error) {
      appendAssistantMessage("Sorry, I encountered a network error.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const statuses = loadStatuses();
    const fetchedScore = clampScore(statuses.ggm ?? 0);

    // 修复 Bug：根据获取时的分数决定流程，而不是更新后的分数
    if (fetchedScore === 0) {
      updateNodeScore(() => 1, "First time entry into the knowledge node.");
      setMessages([{ role: "assistant", content: "对于该知识点是否有不懂的问题？如果没有的话，需不需要一道练习题？" }]);
      setMode("intro");
    } else if (fetchedScore >= 1 && fetchedScore <= 4) {
      setMessages([
        { role: "assistant", content: "Your current mastery score for this knowledge node is low, so we will go directly into practice." },
        { role: "assistant", content: PRACTICE_QUESTIONS[0].prompt },
      ]);
      setMode("practice");
      setHasEnteredPractice(true);
    } else {
      setMessages([{ role: "assistant", content: "对于该知识点是否有不懂的问题？如果没有的话，需不需要一道练习题？" }]);
      setMode("intro");
    }

    setNodeScore(fetchedScore === 0 ? 1 : fetchedScore); // 确保本地UI数字同步
    setIsReady(true);
  }, []);

  if (!isReady) return <div className="min-h-screen bg-slate-50" />;

  // 严格控制按钮显示逻辑
  const showInput = mode === "ask" || mode === "practice";
  const showAskQuestionButton = mode === "intro";
  const showPracticeButton = mode === "intro" || mode === "ask";
  const showHintButton = mode === "practice";
  const showShowAnswerButton = mode === "practice";
  const showNextPartButton = mode !== "completed"; 
  const showNextQuestionButton = mode === "practice" && currentQuestionIndex < PRACTICE_QUESTIONS.length - 1;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      {/* ================= 左侧：教材与多模态内容区 (保持不变) ================= */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto border-r border-slate-200 bg-white p-6 md:p-10">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center mb-4">
            ← Back to Knowledge Map
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900">The Gordon Growth Model</h1>
          <p className="text-slate-500 mt-2">Equity Learning Module 2 - Discounted Dividend Valuation</p>
          <p className="text-sm text-slate-500 mt-3 font-semibold text-indigo-600">Current mastery score: {nodeScore}/10</p>
        </div>

        {/* 视频 */}
        <div className="mb-10 rounded-xl overflow-hidden shadow-lg border border-slate-100">
          <div className="aspect-w-16 aspect-h-9 relative" style={{ paddingBottom: "56.25%" }}>
            <iframe className="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/A_ZpYh_uH_o" allowFullScreen></iframe>
          </div>
          <div className="bg-slate-50 p-3 text-sm text-slate-500 border-t border-slate-100">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{`🎥 **Video:** Solving for $g$ using Retention Rate ($b$) and $ROE$.`}</ReactMarkdown>
          </div>
        </div>

        {/* 教材片段 */}
        <div className="prose prose-slate max-w-none">
          <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Textbook Excerpt</h3>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
            <p className="text-sm text-amber-900 font-medium mb-2">Key Formula:</p>
            <div className="text-lg text-center mb-2 overflow-visible h-auto not-prose">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{"$$V_0 = \\frac{D_1}{r - g}$$"}</ReactMarkdown>
            </div>
            <div className="text-sm text-amber-800">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {`- $V_0$ : **Value of the stock today**\n- $D_1$ : **Expected dividend in the next period** ($D_0 \\times (1+g)$)\n- $r$ : **Required rate of return**\n- $g$ : **Growth rate** (If not given: $g = b \\times ROE$)`}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 右侧：互动区 ================= */}
      <div className="w-full md:w-1/2 h-full flex flex-col bg-slate-50 relative">
        <div className="h-16 border-b border-slate-200 bg-white flex items-center px-6 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">AI</div>
            <div>
              <h2 className="font-bold text-slate-800">Proactive AI Tutor</h2>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === "assistant" ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none" : "bg-indigo-600 text-white rounded-tr-none"}`}>
                <div className={`text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none ${msg.role === "user" ? "text-white" : ""}`}>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{formatMathText(msg.content)}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && <div className="text-sm text-slate-500 animate-pulse">AI is thinking...</div>}
        </div>

        {/* 底部操作区 */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {showAskQuestionButton && <button onClick={handleAskQuestion} disabled={isLoading} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">Ask Question</button>}
            {showPracticeButton && <button onClick={() => enterPractice(0)} disabled={isLoading} className="text-xs font-semibold px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors">Practice</button>}
            {showHintButton && <button onClick={() => handlePracticeAction("hint")} disabled={isLoading} className="text-xs font-semibold px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors">💡 Need a Hint</button>}
            {showShowAnswerButton && <button onClick={() => handlePracticeAction("show_answer")} disabled={isLoading} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">📖 Show Answer</button>}
            {showNextQuestionButton && <button onClick={handleNextQuestion} disabled={isLoading} className="text-xs font-semibold px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">Next Question</button>}
            {showNextPartButton && <button onClick={handleNextPart} disabled={isLoading} className="text-xs font-semibold px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors">Next Part</button>}
          </div>

          {showInput && (
            <div className="flex gap-3">
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") mode === "ask" ? handleQuestionChat() : handlePracticeAction("practice_answer"); }} disabled={isLoading} placeholder={mode === "ask" ? "Type your question here..." : "Type your answer here..."} className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm" />
              <button onClick={() => mode === "ask" ? handleQuestionChat() : handlePracticeAction("practice_answer")} disabled={isLoading} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700">Send</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}