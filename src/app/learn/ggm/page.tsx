"use client";

import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function GGMPage() {
  // 1. 初始化对话状态（与视频中的参数保持一致，作为实战演练）
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Let's practice what we just learned! A company just paid a dividend ($D_0$) of $1.35$. Shareholders expect a $9.8\\%$ return ($r$). The company has a retention rate ($b$) of $55\\%$ and an $ROE$ of $12\\%$. What is the intrinsic value ($V_0$)?",
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  
  // 2. 新增一个 loading 状态，防止用户重复点击发送
  const [isLoading, setIsLoading] = useState(false);

  // 专门用于清洗 AI 输出格式的拦截器
  const formatMathText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\\\(/g, '$')    // 把 \( 替换成 $
      .replace(/\\\)/g, '$')    // 把 \) 替换成 $
      .replace(/\\\[/g, '$$$')  // 把 \[ 替换成 $$
      .replace(/\\\]/g, '$$$'); // 把 \] 替换成 $$
  };

  // 3. 核心通信函数：负责把消息发给后端，并接收大模型的 JSON 返回
  const handleChat = async (type: 'chat' | 'hint' | 'show_answer', text?: string) => {
    if (isLoading) return;
    
    const userMessage = text || inputValue;
    if (!userMessage.trim() && type === 'chat') return; // 防止发送空消息

    setIsLoading(true);

    // 把用户的新消息加入当前对话历史
    const newMessages = [...messages, { role: "user", content: userMessage }];
    if (type === 'chat') setMessages(newMessages);

    try {
      // 请求我们刚才写好的后端 API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          action_type: type 
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      // 解析后端传回来的 JSON 对象
      const data = await response.json();
      
      // 把 AI 导师的回复追加到屏幕上
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.tutor_response 
      }]);
      setInputValue(""); // 清空输入框
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered a network error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      
      {/* ================= 左侧：教材与多模态内容区 ================= */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto border-r border-slate-200 bg-white p-6 md:p-10">
        
        {/* 返回按钮 & 标题 */}
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center mb-4">
            ← Back to Knowledge Map
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900">The Gordon Growth Model</h1>
          <p className="text-slate-500 mt-2">Equity Learning Module 2 - Discounted Dividend Valuation</p>
        </div>

        {/* 多模态：YouTube 视频嵌入 */}
        <div className="mb-10 rounded-xl overflow-hidden shadow-lg border border-slate-100">
          <div className="aspect-w-16 aspect-h-9 relative" style={{ paddingBottom: '56.25%' }}>
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/watch?v=KrL4hoPlSWo" 
              title="Gordon Growth Model Tutorial" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
          <div className="bg-slate-50 p-3 text-sm text-slate-500 border-t border-slate-100">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {`🎥 **Video:** Solving for $g$ using Retention Rate ($b$) and $ROE$.`.trim()}
            </ReactMarkdown>
          </div>
        </div>

        {/* 教材：PDF 文本提取 */}
        <div className="prose prose-slate max-w-none">
          <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Textbook Excerpt</h3>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
            <p className="text-sm text-amber-900 font-medium mb-2">Key Formula:</p>
            
            <div className="text-lg text-center mb-2 overflow-visible h-auto not-prose">
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {"$$V_0 = \\frac{D_1}{r - g}$$"}
              </ReactMarkdown>
            </div>
            
            <div className="text-sm text-amber-800">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {`
- $V_0$ : **Value of the stock today**
- $D_1$ : **Expected dividend in the next period** ($D_0 \\times (1+g)$)
- $r$ : **Required rate of return**
- $g$ : **Growth rate** (If not given: $g = b \\times ROE$)
                `.trim()}
              </ReactMarkdown>
            </div>
          </div>
          <div className="text-sm text-slate-700 leading-relaxed mb-4">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                The Gordon growth model assumes that dividends grow indefinitely at a constant rate. This model is particularly useful for valuing mature companies with a history of stable dividend growth. A critical requirement for the model&apos;s mathematical validity is that the required rate of return ($r$) must be strictly greater than the expected growth rate ($g$).
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* ================= 右侧：AI 互动与练习区 ================= */}
      <div className="w-full md:w-1/2 h-full flex flex-col bg-slate-50 relative">
        
        {/* 顶部标识 */}
        <div className="h-16 border-b border-slate-200 bg-white flex items-center px-6 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">AI</div>
            <div>
              <h2 className="font-bold text-slate-800">Proactive AI Tutor</h2>
              <p className="text-xs text-green-600 font-medium">● Online</p>
            </div>
          </div>
        </div>

        {/* 聊天消息流 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'assistant' 
                  ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' 
                  : 'bg-indigo-600 text-white rounded-tr-none'
              }`}>
                <div className={`text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none ${msg.role === 'user' ? 'text-white' : ''}`}>
                  <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                  >
                      {formatMathText(msg.content)}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          
          {/* 思考中的动画提示 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-2 items-center">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* 底部输入与操作区 */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          
          {/* 自主权按钮组：绑定 Hint 和 Show Answer 事件 */}
          <div className="flex gap-2 mb-3">
            <button 
              onClick={() => handleChat('hint', "I'm stuck, can you give me a conceptual hint?")}
              disabled={isLoading}
              className="text-xs font-semibold px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50">
              💡 Need a Hint
            </button>
            <button 
              onClick={() => handleChat('show_answer', "Please show me the full step-by-step answer.")}
              disabled={isLoading}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50">
              📖 Show Answer
            </button>
          </div>

          {/* 输入框：绑定回车键和 Send 按钮 */}
          <div className="flex gap-3">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChat('chat')}
              disabled={isLoading}
              placeholder="Type your calculation or answer here..." 
              className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 disabled:bg-slate-50"
            />
            <button 
              onClick={() => handleChat('chat')}
              disabled={isLoading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50">
              Send
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-3">
            The AI evaluates your reasoning, not just the final number.
          </p>
        </div>

      </div>
    </div>
  );
}