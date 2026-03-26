export const maxDuration = 30;

// 数学规则
const MATH_FORMAT_RULES = `
Formatting rules for tutor_response:
- Use LaTeX only for actual mathematical expressions.
- Always wrap math with $...$.
`;

// 用户动作
type ActionType = "ask_question" | "practice_answer" | "hint" | "show_answer" | "concept_check_answer" | "transition_summary";

// 生成prompt
function buildSystemPrompt(actionType: ActionType, currentQuestion?: string) {
  // 强调模型需带有判断
  const baseInstructions = `You are a proactive, expert CFA finance tutor orchestrating a learning session about equity.
You diagnose understanding, guide the learner, insert micro-quizzes to verify knowledge, and manage the flow.
Always use clear teaching language. ${MATH_FORMAT_RULES}`;

  // 约束返回结构，json工整易于解析
  const jsonSchemaInstruction = `
You MUST return a raw JSON object with EXACTLY this structure:
{
  "is_correct": boolean,
  "diagnosis": {
    "error_type": "none | concept_error | formula_error | growth_error | d0_d1_confusion | calculation_error | interpretation_error | insufficient_reasoning",
    "mastery_estimate": number, // 0 to 10
  },
  "pedagogical_action": "advance | remediate | ask_micro_quiz | explain_concept | reinforce | mark_for_review | bridge_forward",
  "tutor_response": "string (Your actual response to the student)",
  "should_mark_review": boolean,
  "suggested_ui_action": "stay_on_current_question | show_followup_check | move_to_next_question | move_to_next_part | stay_in_ask_mode"
}`;

  if (actionType === "ask_question") {
    return `${baseInstructions}
The user is asking a conceptual question. Answer it clearly. End your response by suggesting a next step (e.g., "Would you like to try a practice problem to test this out?").
${jsonSchemaInstruction}`;
  }

  if (actionType === "hint") {
    return `${baseInstructions}
The student requested a hint for: ${currentQuestion}.
Provide a conceptual hint. DO NOT reveal the final answer. Guide them to the next logical step.
Set "suggested_ui_action" to "stay_on_current_question".
${jsonSchemaInstruction}`;
  }

  if (actionType === "show_answer") {
    return `You are a expert CFA finance tutor orchestrating a learning session about equity. The student is working on this question: ${currentQuestion}.
Show the full step-by-step solution. Return a raw JSON object with exactly these keys:
  {
    "is_correct": false,
    "tutor_response": "string",
    "action": "show_answer",
    "suggested_ui_action": "move_to_next_part"
  }
${jsonSchemaInstruction}`;
  }

  if (actionType === "concept_check_answer") {
    return `${baseInstructions}
The student is answering a proactive micro-quiz you previously asked to check their conceptual understanding.
Evaluate their reasoning. If incorrect, remediate. If correct, praise them and set "suggested_ui_action" to "move_to_next_question" or "move_to_next_part".
${jsonSchemaInstruction}`;
  }

  if (actionType === "transition_summary") {
    return `${baseInstructions}
The student is moving to the next module. Summarize what they just learned.
Set "suggested_ui_action" to "move_to_next_part".
${jsonSchemaInstruction}`;
  }

  // Default: practice_answer
  return `${baseInstructions}
The student is answering this practice question:
${currentQuestion}

Evaluate their answer carefully.
PROACTIVE BEHAVIORS TO ENFORCE:
1. If they are INCORRECT: Diagnose the exact error (e.g., "d0_d1_confusion" if they forgot to multiply D0 by 1+g). Provide targeted remediation. Do not just say "wrong". Set "suggested_ui_action" to "stay_on_current_question".
2. If they are CORRECT: Do NOT just say "Good job" and advance every time. Proactively verify understanding! Randomly (or if their reasoning is brief), set "pedagogical_action" to "ask_micro_quiz", set "suggested_ui_action" to "show_followup_check", and in "tutor_response" ask a short follow-up like "Great! But why must r be strictly greater than g in this formula?"
3. If they are CORRECT and you don't ask a micro-quiz, set "suggested_ui_action" to "move_to_next_question".
${jsonSchemaInstruction}`; //批改练习题
} 

export async function POST(req: Request) {
  // api请求
  try {
    const { messages = [], action_type, current_question } = await req.json();
    const actionType: ActionType = action_type ?? "practice_answer";

    // Use standard fetch to OpenAI/DeepSeek compatible endpoint
    const response = await fetch("https://api.deepseek.com/chat/completions", {     // 服务器不记录上下文
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat", // or gpt-4o-mini if using OpenAI
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(actionType, current_question),
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    // 获取返回的内容
    const data = await response.json();
    const contentString = data?.choices?.[0]?.message?.content;

    if (!contentString) {
      throw new Error("API returned an empty response.");
    }

    // 解析json
    const parsed = JSON.parse(contentString);

    return Response.json({
      is_correct: Boolean(parsed.is_correct),
      diagnosis: parsed.diagnosis || { error_type: "none", mastery_estimate: 5},
      pedagogical_action: parsed.pedagogical_action || "advance",
      tutor_response: parsed.tutor_response || "Sorry, I could not generate a response.",
      should_mark_review: Boolean(parsed.should_mark_review),
      suggested_ui_action: parsed.suggested_ui_action || "stay_on_current_question"
    });
  } catch (error) {
    console.error("Proactive API Error:", error);
    return Response.json({ 
      error: "Failed to fetch from API",
      tutor_response: "I encountered a cognitive glitch. Could you try that again?",
      suggested_ui_action: "stay_on_current_question"
    }, { status: 500 });
  }
}