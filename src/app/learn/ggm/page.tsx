"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type Message = { role: "assistant" | "user"; content: string };         // 控制右侧UI显示对话
type LearningMode = "orientation" | "ask" | "practice" | "micro_quiz" | "transition" | "completed";     // 学习的不同环节

type NodeState = {
  score: number;      // 掌握程度
  needsReview: boolean;     // 是否需要复习，空值主页面可视化与LLM输出
  lastDiagnosis: string;    // 错误类型，控制LLM后续输出
};

const STORAGE_KEY = "ggm-proactive-state-v1";

const DEFAULT_STATE: NodeState = { score: 0, needsReview: false, lastDiagnosis: "none" };

const PRACTICE_QUESTIONS = [    // 题目
  { id: "ggm-q1", prompt: "Practice Question 1: A company just paid a dividend ($D_0$) of $1.35$. Shareholders expect a $9.8\\%$ return ($r$). The company has a retention rate ($b$) of $55\\%$ and an $ROE$ of $12\\%$. What is the intrinsic value ($V_0$)?" },
  { id: "ggm-q2", prompt: "Practice Question 2: A company has just paid a dividend ($D_0$) of $2.00$. The required return is $11\\%$, and dividends are expected to grow forever at $4\\%$. Using the Gordon Growth Model, what is the intrinsic value ($V_0$)?" },
];

export default function GGMPage() {
  const [messages, setMessages] = useState<Message[]>([]);      // 保存上下文
  const [inputValue, setInputValue] = useState("");         
  const [isLoading, setIsLoading] = useState(false);            // 避免重复点击
  const [isReady, setIsReady] = useState(false);
  const [mode, setMode] = useState<LearningMode>("orientation");    // 教学阶段，决定按钮展示
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);    // 当前题目
  const [nodeState, setNodeState] = useState<NodeState>(DEFAULT_STATE);

  const currentQuestion = useMemo(() => PRACTICE_QUESTIONS[currentQuestionIndex], [currentQuestionIndex]);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);         // 分数与复习标记
    const loadedState = raw ? JSON.parse(raw) : DEFAULT_STATE;    // 区别复习与新学习
    setNodeState(loadedState);
    
    setMessages([{ 
      role: "assistant", 
      content: "Welcome to the Gordon Growth Model module! In this session, we'll learn how to value mature companies with stable dividend growth.\n\nI am your AI tutor. I won't just test you—I'll guide your reasoning. Would you like to **Ask a conceptual question**, **Start practice**, or **Move to the next part**?" 
    }]);
    setIsReady(true);
  }, []);

  const updateNodeState = (updates: Partial<NodeState>) => {      // 统一更新节点
    const newState = { ...nodeState, ...updates };
    newState.score = Math.max(0, Math.min(10, newState.score));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    setNodeState(newState);
  };

  const appendAssistantMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  };

  const executeUIAction = (action: string, tutorResponse: string) => {    // 对于不同教学模式，给出不同输出
    appendAssistantMessage(tutorResponse);
    
    switch (action) {
      case "show_followup_check":
        setMode("micro_quiz");
        break;
      case "move_to_next_question":
        if (currentQuestionIndex < PRACTICE_QUESTIONS.length - 1) {
          const nextIdx = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIdx);
          setMode("practice");
          setTimeout(() => appendAssistantMessage(PRACTICE_QUESTIONS[nextIdx].prompt), 800);
        } else {
          executeUIAction("move_to_next_part", "You've finished the practice set! Let's wrap up.");
        }
        break;
      case "move_to_next_part":
        setMode("transition");
        handleTransitionSummary();
        break;
      case "stay_on_current_question":
      case "stay_in_ask_mode":
      default:
        // Mode remains the same, learner tries again or asks another question
        break;
    }
  };

  const handleAction = async (actionType: "ask_question" | "practice_answer" | "hint" | "show_answer" | "concept_check_answer", forcedText?: string) => {
    // 核心交互
    if (isLoading) return;
    const userText = forcedText || inputValue;
    if (!userText.trim() && actionType !== "hint" && actionType !== "show_answer") return;

    let newMessages = messages;
    if (actionType === "practice_answer" || actionType === "ask_question" || actionType === "concept_check_answer" || actionType === "show_answer") {
      // 需要显示在聊天框，并作为LLM的输入的action类型
      newMessages = [...messages, { role: "user", content: userText }];
      setMessages(newMessages);
      setInputValue("");
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {     // 向后端发送请求
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, action_type: actionType, current_question: currentQuestion.prompt }),
      });

      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      
      // Update State based on AI Diagnosis
      let newScore = nodeState.score;
      if (actionType === "practice_answer" || actionType === "concept_check_answer") {    
        // 打分
        if (data.is_correct) newScore += (actionType === "concept_check_answer" ? 2 : 3);
        else newScore -= 1;
      }
      
      updateNodeState({
        score: newScore,
        needsReview: data.should_mark_review || nodeState.needsReview,
        lastDiagnosis: data.diagnosis?.error_type || "none"
      });

      executeUIAction(data.suggested_ui_action, data.tutor_response);     // ai决定下一步
    } catch (error) {
      appendAssistantMessage("I encountered a network error. Let's try that again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransitionSummary = async () => {
    // 知识点结束
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, action_type: "transition_summary" }),
      });
      const data = await response.json();
      appendAssistantMessage(data.tutor_response);
      setMode("completed");
    } catch {
      appendAssistantMessage("You are ready to move on to the next module. (Placeholder)");
      setMode("completed");
    } finally {
      setIsLoading(false);
    }
  };

  const enterPractice = () => {       // 练习模式
    setMode("practice");
    appendAssistantMessage("Let's test your understanding. " + PRACTICE_QUESTIONS[currentQuestionIndex].prompt);
  };

  if (!isReady) return <div className="min-h-screen bg-slate-50" />;

  const showInput = ["ask", "practice", "micro_quiz"].includes(mode);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      {/* Left Panel: Content */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto border-r border-slate-200 bg-white p-6 md:p-10">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center mb-4">← Back to Knowledge Map</Link>
          <h1 className="text-3xl font-extrabold text-slate-900">The Gordon Growth Model</h1>
          <div className="flex items-center gap-4 mt-3">
            <p className="text-sm font-semibold text-indigo-600">Mastery: {nodeState.score}/10</p>
            {nodeState.needsReview && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">Marked for Review</span>}
          </div>
        </div>

        {/* Multimodal Content */}
        <div className="mb-10 rounded-xl overflow-hidden shadow-lg border border-slate-100">
          <div className="aspect-w-16 aspect-h-9 relative" style={{ paddingBottom: "56.25%" }}>
            <iframe className="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowFullScreen></iframe>
          </div>
          <div className="bg-slate-50 p-3 text-sm text-slate-500 border-t border-slate-100">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{`🎥 **Video:** Solving for $g$ using Retention Rate ($b$) and $ROE$.`}</ReactMarkdown>
          </div>
        </div>

        {/* Textbook */}
        <div className="prose prose-slate max-w-none">
          <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Textbook Excerpt</h3>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
            <p className="text-sm text-amber-900 font-medium mb-2">Key Formula:</p>
            <div className="text-lg text-center mb-2 overflow-visible h-auto not-prose">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{"$$V_0 = \\frac{D_1}{r - g}$$"}</ReactMarkdown>
            </div>
            <div className="text-sm text-amber-800">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{`- $V_0$ : Value today\n- $D_1$ : Expected dividend ($D_0 \\times (1+g)$)\n- $r$ : Required return\n- $g$ : Growth rate ($b \\times ROE$)`}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Proactive AI Tutor */}
      <div className="w-full md:w-1/2 h-full flex flex-col bg-slate-50 relative">
        <div className="h-16 border-b border-slate-200 bg-white flex items-center px-6 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">AI</div>
            <div>
              <h2 className="font-bold text-slate-800">Proactive AI Tutor</h2>
              <p className="text-xs text-green-600 font-medium capitalize">{mode.replace('_', ' ')} Stage</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === "assistant" ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none" : "bg-indigo-600 text-white rounded-tr-none"}`}>
                <div className={`text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none ${msg.role === "user" ? "text-white" : ""}`}>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && <div className="text-sm text-slate-500 animate-pulse">Diagnosing and formulating next step...</div>}
        </div>

        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {mode === "orientation" && (
              <>
                <button onClick={() => setMode("ask")} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Ask Question</button>
                <button onClick={enterPractice} className="text-xs font-semibold px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">Start Practice</button>
                <button onClick={() => { setMode("transition"); handleTransitionSummary(); }} className="text-xs font-semibold px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200">Skip to Next Part</button>
              </>
            )}
            {mode === "ask" && (
              <>
                <button onClick={enterPractice} className="text-xs font-semibold px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">Start Practice</button>
                <button onClick={() => { setMode("transition"); handleTransitionSummary(); }} className="text-xs font-semibold px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200">Skip to Next Part</button>
              </>
            )}
            {mode === "practice" && (
              <>
                <button onClick={() => handleAction("hint", "Please give me a hint.")} disabled={isLoading} className="text-xs font-semibold px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 disabled:opacity-50">💡 Need a Hint</button>
                <button onClick={() => handleAction("show_answer", "Show me the full answer.")} disabled={isLoading} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50">📖 Show Answer</button>
              </>
            )}
            {mode === "completed" && (
              <button disabled className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg">Proceed to Next Module (Placeholder)</button>
            )}
          </div>

          {showInput && (
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAction(mode === "ask" ? "ask_question" : mode === "micro_quiz" ? "concept_check_answer" : "practice_answer");
                }}
                disabled={isLoading}
                placeholder={mode === "ask" ? "Ask your conceptual question..." : mode === "micro_quiz" ? "Answer the AI's concept check..." : "Type your answer or reasoning..."}
                className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button onClick={() => handleAction(mode === "ask" ? "ask_question" : mode === "micro_quiz" ? "concept_check_answer" : "practice_answer")} disabled={isLoading} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50">
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}