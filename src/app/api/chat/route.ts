export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 手动构造请求体，开启 JSON 强制输出模式
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        response_format: { type: 'json_object' }, // 要求返回 JSON
        messages: [
          {
            role: 'system',
            content: `You are an expert CFA finance tutor. Evaluate the user's answer for the Gordon Growth Model. 
            You MUST return a raw JSON object with exactly these keys:
            {
              "is_correct": boolean,
              "error_type": "string describing the error",
              "tutor_response": "your detailed tutorial response using LaTeX",
              "action": "advance" | "remediate" | "provide_hint" | "show_answer",
              "needs_future_review": boolean
            }`
          },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const contentString = data.choices[0].message.content;
    
    // 解析返回的纯字符串为 JSON 对象并返回给前端
    return Response.json(JSON.parse(contentString));
    
  } catch (error) {
    console.error("Native Fetch API Error:", error);
    return Response.json({ error: "Failed to fetch from native API" }, { status: 500 });
  }
}