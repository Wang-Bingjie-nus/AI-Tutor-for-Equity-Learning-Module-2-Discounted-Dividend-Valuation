export const maxDuration = 30;

type ActionType = "ask_question" | "practice_answer" | "hint" | "show_answer";

function buildSystemPrompt(actionType: ActionType, currentQuestion?: string) {
  if (actionType === "ask_question") {
    return `You are an expert CFA finance tutor.
Respond to the user's conceptual question about the Gordon Growth Model.
Return a raw JSON object with exactly these keys:
{
  "is_correct": false,
  "tutor_response": "string",
  "action": "advance"
}
Use clear teaching language and LaTeX when useful.`;
  }

  if (actionType === "hint") {
    return `You are an expert CFA finance tutor.
The student is working on this question:
${currentQuestion}
Give a conceptual hint without revealing the full final answer.
Return a raw JSON object with exactly these keys:
{
  "is_correct": false,
  "tutor_response": "string",
  "action": "provide_hint"
}
Use clear teaching language and LaTeX when useful.`;
  }

  if (actionType === "show_answer") {
    return `You are an expert CFA finance tutor.
The student is working on this question:
${currentQuestion}
Show the full step-by-step solution.
Return a raw JSON object with exactly these keys:
{
  "is_correct": false,
  "tutor_response": "string",
  "action": "show_answer"
}
Use clear teaching language and LaTeX when useful.`;
  }

  return `You are an expert CFA finance tutor evaluating a student's answer for the Gordon Growth Model.
The current practice question is:
${currentQuestion}
Evaluate whether the student's answer is correct.
Mark is_correct as true if the student's final value is correct or very close numerically, even if the formatting differs.
If the answer is incorrect, explain the likely mistake and guide the student without revealing unnecessary extra content.
Return a raw JSON object with exactly these keys:
{
  "is_correct": boolean,
  "tutor_response": "string",
  "action": "advance" | "remediate"
}
Use clear teaching language and LaTeX when useful.`;
}

export async function POST(req: Request) {
  try {
    const {
      messages = [],
      action_type,
      current_question,
    }: {
      messages?: Array<{ role: "assistant" | "user"; content: string }>;
      action_type?: ActionType;
      current_question?: string;
    } = await req.json();

    const actionType: ActionType = action_type ?? "practice_answer";

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
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
      throw new Error(`DeepSeek API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const contentString = data?.choices?.[0]?.message?.content;

    if (!contentString) {
      throw new Error("DeepSeek API returned an empty response.");
    }

    const parsed = JSON.parse(contentString);

    return Response.json({
      is_correct: Boolean(parsed.is_correct),
      tutor_response: parsed.tutor_response ?? "Sorry, I could not generate a response.",
      action: parsed.action ?? "remediate",
    });
  } catch (error) {
    console.error("Native Fetch API Error:", error);
    return Response.json({ error: "Failed to fetch from native API" }, { status: 500 });
  }
}
