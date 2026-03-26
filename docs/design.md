# Pedagogical Design

## Lesson Flow

### Overall Structure

This prototype is designed around the idea that a ai assistant should feel like a **guided teacher**, not an open-ended chat.  
The learner is first placed in a structured learning environment and then moved through a sequence of explanation, practice, diagnosis, and reinforcement.

A simplified flow looks like this:

```text
Learning Map
   ↓
Select a lesson node
   ↓
Orientation
   ↓
Choose path:
  - Ask conceptual questions
  - Start practice
  - Skip forward
   ↓
Practice attempt
   ↓
AI diagnosis
   ├── Incorrect → remediate → retry
   ├── Correct but shallow → micro-quiz
   └── Correct and sufficient → advance
   ↓
Transition summary
   ↓
Next node on the map
```

### Sub-topic Breakdown

For this part, I didn't work on this part thoroughly. This job is suitaable for LLM, while according to my experience, it's necessary to design a thorough, rigor, integral prompt, which 
would be too consuming for me to design on time. But this part is important in terms of tutoring. I'll mention this in the last section.

## Adaptive Logic

The adaptive layer uses structured LLM output instead of free-form feedback.  
For each learner response, the model returns:

- correctness
- likely error type
- pedagogical action (like giving micro-quiz or skip)
- review flag
- suggested UI action

### Progression Logic

- **Incorrect answer:** explain the mistake and keep the learner on the same question.
- **Correct but shallow answer:** ask a short follow-up concept check.
- **Correct and sufficient answer:** move to the next question or next lesson part.

### Retry Policy

The learner is not forced forward after a fixed number of attempts.  
Instead, the system supports retries, hints, and worked answers, while marking weak areas for future review.

## Content Integration

Each lesson uses a **split-screen layout**.

#### Left Panel
Contains learning materials:
- embedded video
- textbook excerpt
- formulas and notation

#### Right Panel
Contains the proactive AI tutor:
- chatbox
- buttons for different action (liek practice or skip)

The learner can read, watch, solve, and receive feedback in one place.  

### Quiz Design

Different stages use different question types:

- **Early stage:** terminology and formula recognition
- **Middle stage:** procedural calculations
- **Later stage:** conceptual transfer and assumptions

## AI Prompt Design

The LLM is prompted as a **proactive finance tutor**, not as a generic assistant.  
Its role is to explain, diagnose, and decide what the learner should do next.
This is the most important part, since we want LLM know historical conversations while clearly aware of current requirement, 
which is hard for LLM to perform perfectly but decisive towards a satisfied overall performaance.

### Structured Output

The model must return strict JSON with fields such as:

- `is_correct`
- `diagnosis`
- `pedagogical_action`
- `tutor_response`
- `should_mark_review`
- `suggested_ui_action`

There are also a basic instruction to make LLM more proactive to user's answer and a rule for math output. 
This makes the backend response usable for both feedback and UI control.

### Prompt Types

The backend handles several tutoring actions:

- `ask_question`
- `practice_answer`
- `hint`
- `show_answer`
- `concept_check_answer`
- `transition_summary`

Each action type supports a different teaching goal, such as explanation, remediation, verification, or summary.

## What I'd Do Next

Given more time, I would improve the system in the following ways:

1. **prompts可以更精确，在尝试中找到平衡**

2. **接受图片回复，以便判断错误类型**

3. **跟踪错误类型，并提示**

4. **不保留所有历史消息，将有效信息（如错误类型与数量）记录后，在结束该节点后抛弃信息**

5. **将Mastery分数加入回顾与前进的判断依据**

6. **随学习完成的时间（天），降低分数，以督促复习**

7. **更细化的章节拆分prompts，使LLM能同时作为输入端的一环，更好的是用RAG，让教材称为能随时查看的参考**
