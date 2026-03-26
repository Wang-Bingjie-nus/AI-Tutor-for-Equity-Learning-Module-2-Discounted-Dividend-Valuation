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

For this part, I didn't thoroughly consider about. Because if I want to manually do this, it will be too consuming.

## Adaptive Logic

The adaptive layer uses structured LLM output instead of free-form feedback.  
For each learner response, the model returns:

- correctness
- likely error type
- pedagogical action
- review flag
- suggested UI action

### Progression Logic

- **Incorrect answer:** explain the mistake and keep the learner on the same question.
- **Correct but shallow answer:** ask a short follow-up concept check.
- **Correct and sufficient answer:** move to the next question or next lesson part.

### Progress Tracking

Each lesson stores:

- `score`
- `needsReview`
- `lastDiagnosis`

This state is saved in `localStorage`, so the knowledge map can reflect mastery and review needs.

### Retry Policy

The learner is not forced forward after a fixed number of attempts.  
Instead, the system supports retries, hints, and worked answers, while marking weak areas for future review.

## Content Integration

Each lesson uses a **split-screen layout**.

### Left Panel
Contains learning materials:
- embedded video
- textbook excerpt
- formulas and notation

### Right Panel
Contains the proactive AI tutor:
- orientation
- conceptual Q&A
- practice evaluation
- concept checks
- transition summary

### Why This Design

The learner can read, watch, solve, and receive feedback in one place.  
This reduces context switching and makes the tutoring flow feel structured.

### Quiz Design

Different stages use different question types:

- **Early stage:** terminology and formula recognition
- **Middle stage:** procedural calculations
- **Later stage:** conceptual transfer and assumptions

## AI Prompt Design

The LLM is prompted as a **proactive finance tutor**, not as a generic assistant.  
Its role is to explain, diagnose, and decide what the learner should do next.

### Structured Output

The model must return strict JSON with fields such as:

- `is_correct`
- `diagnosis`
- `pedagogical_action`
- `tutor_response`
- `should_mark_review`
- `suggested_ui_action`

This makes the backend response usable both for feedback and UI control.

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

1. **Implement Multistage DDM**  
   Complete the curriculum path beyond DDM Basics and GGM.

2. **Add Retrieval-Based Content**  
   Replace hardcoded excerpts with relevant textbook retrieval.

3. **Improve Mastery Tracking**  
   Track attempts, hint usage, and recurring error types.

4. **Persist User Progress**  
   Store learning progress in a database instead of only `localStorage`.

5. **Use Better Learning Assets**  
   Replace placeholder videos with curated lesson material.
