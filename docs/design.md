# Pedagogical Design: AI Tutor for Discounted Dividend Valuation

## 1. Lesson Flow (Graph-Based Knowledge Map)
Traditional linear learning limits user autonomy. This AI Tutor employs a **Graph-based Knowledge Map** to visualize the relationships between concepts in Equity Learning Module 2. 

* **Nodes:** The map consists of three primary nodes:
  1. DDM Basics (Discounted Dividend Model)
  2. GGM Formula (Gordon Growth Model)
  3. Multistage DDM
* **Edges (Relationships):** - *Solid arrows* indicate prerequisites (e.g., DDM Basics must be completed before Multistage DDM).
  - *Dotted lines* indicate conceptual associations without strict sequential requirements.
  - *Parallel nodes* allow learners to choose their own starting point.

**PoC Scope Constraint:** For this prototype, the graph is rendered visually to demonstrate the pedagogical vision, but only the **GGM Formula** node is fully interactive. Full graph state management is deferred to future iterations.

## 2. Adaptive Logic (Autonomy & Remediation)
The system respects the learner's autonomy. In the modern era of ubiquitous information, rote memorization of formulas is less critical than deep conceptual understanding. 

* **Error Classification:** The LLM diagnoses errors by classifying them (e.g., confusing $D_0$ with $D_1$, or miscalculating the denominator $r - g$).
* **Infinite Retries & Learner Agency:** There is no hard cap on retries. Instead, the UI provides explicit **"Hint"** and **"Show Answer"** buttons. 
* **Remediation Flagging:** If a user struggles (multiple incorrect attempts) or relies heavily on the "Hint" / "Show Answer" buttons, the AI flags this specific knowledge node for *remediation*. The tutor will dynamically inject a follow-up conceptual question or a parallel calculation task to ensure actual comprehension rather than just rewarding a brute-force correct answer.

## 3. Content Integration
The learning interface uses a split-screen Dashboard design to seamlessly blend modalities:
* **Visual Map:** A top or side navigation area displaying the Knowledge Graph.
* **Core Material:** The main viewing area embeds relevant textbook passages (extracted from the CFA PDF) and a relevant YouTube video for auditory/visual learners.
* **Interactive Tutor:** A side panel dedicated to the AI chat and quiz interface, which updates dynamically based on the learner's progress through the GGM node.

## 4. AI Prompt Design
The backend utilizes OpenAI's API, forcing the LLM to output structured JSON to act as a definitive decision engine for the frontend UI.

**System Prompt Strategy:**
> "You are an expert finance tutor evaluating a student's answer for the Gordon Growth Model. 
> You MUST respond in the following strict JSON format:
> {
>   "is_correct": boolean,
>   "error_type": "string (e.g., 'Confused D0 and D1', 'Calculation Error', 'None')",
>   "tutor_response": "string (Explain the concept or provide the hint requested)",
>   "action": "string ('advance', 'remediate', 'provide_hint', or 'show_answer')",
>   "needs_future_review": boolean (Set to true if they relied on hints or failed multiple times)
> }"

## 5. What I'd Do Next
Given more time, I would expand this prototype into a production-ready application by implementing:
1. **Full Graph State Management:** Implement a global state provider (e.g., Redux or React Context) to track completion status across all nodes in the Knowledge Map, unlocking solid-arrow nodes only when prerequisites are met.
2. **Retrieval-Augmented Generation (RAG):** Instead of hardcoding textbook snippets, chunk the entire 50-page PDF into a vector database to allow the AI to dynamically pull relevant passages for any node on the graph.
3. **Learning Analytics Dashboard:** Track `needs_future_review` flags and `error_type` frequencies over time to identify conceptual blind spots and automatically adjust the difficulty curve of future modules.