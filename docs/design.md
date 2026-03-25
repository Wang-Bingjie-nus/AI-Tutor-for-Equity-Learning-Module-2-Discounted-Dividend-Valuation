# Pedagogical Design: AI Tutor for Discounted Dividend Valuation

## 1. Lesson Flow
For this proof-of-concept, the AI Tutor focuses on a specific, foundational concept from the textbook: **The Gordon Growth Model (GGM)**. [cite_start]This model assumes that dividends grow indefinitely at a constant rate[cite: 423]. 

The pedagogical flow is designed as a state machine:
1. [cite_start]**Concept Introduction (Multimodal):** Introduce the core idea that a stock's value is the present value of its expected future cash flows[cite: 56]. [cite_start]Present the GGM formula $V_0 = \frac{D_1}{r - g}$ [cite: 441] using a short text excerpt and an embedded explainer video.
2. **Knowledge Check (Application):** Ask the user to solve a practical problem (e.g., calculating the intrinsic value given $D_0$, $g$, and $r$). 
3. **Evaluation & Transition:** - If correct: Validate the success, briefly explain *why* it's correct, and transition to the next topic (e.g., Multistage DDM).
   - If incorrect: Trigger the **Adaptive Logic** phase (Remediation).

## 2. Adaptive Logic
The AI acts as a proactive tutor rather than a passive answer engine. Error handling is treated as a classification task to provide targeted remediation.

* **Error Classification:** The LLM analyzes the user's wrong answer to identify specific conceptual gaps:
  - *Gap A:* Using the current dividend ($D_0$) instead of the expected next-period dividend ($D_1$).
  - *Gap B:* Miscalculating the denominator ($r - g$).
  - *Gap C:* Calculation/Arithmetic error.
* **Remediation Strategy:** The AI does not reveal the final answer immediately. Instead, it provides a tailored hint based on the identified gap and asks the user to try again.
* **Retry Threshold:** The user is allowed **2 retries** per question. 
  - *Why 2?* It balances productive struggle with user frustration.
  - *Fallback:* If the user fails the second retry, the AI steps in, provides a complete step-by-step breakdown of the solution, and generates a **parallel question** (same logic, different numbers) to verify mastery before moving forward.

## 3. Content Integration
The lesson seamlessly blends different modalities to cater to various learning styles:
* **Textbook Passages:** Extracted key definitions from the provided PDF to ground the AI's knowledge in the official curriculum.
* **Video Content:** An embedded YouTube video serves as the primary visual and auditory explanation of the GGM mechanics.
* **Interactive Quiz:** A dynamic input field where users submit their calculations. The interface visually updates (e.g., showing a "Thinking..." state or highlighting a specific formula variable) based on the AI's structured JSON feedback.

## 4. AI Prompt Design
The core innovation in this architecture is forcing the LLM to output structured JSON. This allows the Next.js frontend to programmatically control the UI state based on the AI's pedagogical decisions.

**System Prompt Strategy:**
> "You are an expert CFA finance tutor. Evaluate the user's answer to the Gordon Growth Model question. Do NOT give away the answer if they are wrong. 
> You MUST respond in the following strict JSON format:
> {
>   "is_correct": boolean,
>   "error_type": "string (e.g., 'Confused D0 and D1', 'Math Error', 'None')",
>   "tutor_response": "string (Your conversational, encouraging feedback and hints)",
>   "action": "string (either 'advance', 'remediate', or 'explain_and_replace')"
> }"

## 5. What I'd Do Next
Given more time, I would expand this prototype into a production-ready application by implementing:
1. **Retrieval-Augmented Generation (RAG):** Instead of hardcoding textbook snippets, I would chunk the entire 50-page PDF, store it in a vector database (like Pinecone or Qdrant), and allow the AI to dynamically pull relevant passages for any concept in Module 2.
2. **Learning Analytics Dashboard:** Track the specific `error_type` frequencies over time to identify which concepts the user struggles with the most, allowing the system to automatically adjust the difficulty of future modules.
3. **Session Persistence:** Implement a real database (e.g., PostgreSQL via Prisma) to save user progress, allowing them to resume the lesson exactly where they left off.
