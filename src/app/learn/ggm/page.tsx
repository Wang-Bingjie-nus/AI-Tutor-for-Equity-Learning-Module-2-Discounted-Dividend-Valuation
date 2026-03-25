"use client";

import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function GGMPage() {
  // 预设一个简单的对话状态，稍后我们会将其与后端大模型打通
  const [messages, setMessages] = useState([
    {
      role: "tutor",
      content: "Welcome to the Gordon Growth Model! Based on the material on the left, if a company just paid a dividend ($D_0$) of 2.00, and we expect dividends to grow at a constant rate of 5% indefinitely, what is the expected dividend next year ($D_1$)?",
    }
  ]);
  const [inputValue, setInputValue] = useState("");

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
            // {/* 注意：YouTube 的嵌入链接需要使用 /embed/ 路径 */}
            src="https://www.youtube.com/embed/u68C_yL1zIs" 
            title="Gordon Growth Model - Solving for g" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen>
            </iframe>
        </div>
        <div className="bg-slate-50 p-3 text-sm text-slate-500 border-t border-slate-100">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {`🎥 **Video:** Solving for $g$ using Retention Rate ($b$) and $ROE$.`}
            </ReactMarkdown>
        </div>
        </div>

        {/* 教材：PDF 文本提取 */}
        <div className="prose prose-slate max-w-none">
          <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Textbook Excerpt</h3>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
            <p className="text-sm text-amber-900 font-medium mb-2">Key Formula:</p>
            
            {/* 渲染独立居中的大公式 */}
            <div className="text-lg text-center mb-2 overflow-x-auto">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {"$$V_0 = \\frac{D_1}{r - g}$$"}
              </ReactMarkdown>
            </div>
            
            {/* 渲染带数学符号的列表 */}
            <div className="text-sm text-amber-800">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {`
- **$V_0$** = Value of the stock today
- **$D_1$** = Expected dividend in the next period ($D_0 \\times (1+g)$)
- **$r$** = Required rate of return
- **$g$** = Constant growth rate of dividends
                `}
              </ReactMarkdown>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                The Gordon growth model assumes that dividends grow indefinitely at a constant rate. This model is particularly useful for valuing mature companies with a history of stable dividend growth. A critical requirement for the model's mathematical validity is that the required rate of return ($r$) must be strictly greater than the expected growth rate ($g$).
            </ReactMarkdown>
            </p>
        </div>
      </div>

      {/* ================= 右侧：AI 互动与练习区 ================= */}
      <div className="w-full md:w-1/2 h-full flex flex-col bg-slate-50 relative">
        
        {/* 顶部标识 */}
        <div className="h-16 border-b border-slate-200 bg-white flex items-center px-6 shadow-sm z-10">
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
            <div key={idx} className={`flex ${msg.role === 'tutor' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'tutor' 
                  ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' 
                  : 'bg-indigo-600 text-white rounded-tr-none'
              }`}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                >
                    {msg.content}
                </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 底部输入与操作区 */}
        <div className="p-4 bg-white border-t border-slate-200">
          
          {/* 自主权按钮组 (Hint / Show Answer) */}
          <div className="flex gap-2 mb-3">
            <button className="text-xs font-semibold px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors">
              💡 Need a Hint
            </button>
            <button className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
              📖 Show Answer
            </button>
          </div>

          {/* 输入框 */}
          <div className="flex gap-3">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your calculation or answer here..." 
              className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800"
            />
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md">
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