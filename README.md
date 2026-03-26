# Project Structure
```text
.
├── docs/
│   └── design.md                  # Pedagogical design document
├── src/
│   └── app/
│       ├── api/
│       │   └── chat/
│       │       └── route.ts       # LLM orchestration and structured pedagogical decisions
│       ├── learn/
│       │   ├── ddm/
│       │   │   └── page.tsx       # DDM Basics lesson page
│       │   └── ggm/
│       │       └── page.tsx       # Gordon Growth Model lesson page
│       ├── globals.css            # Global styling
│       ├── layout.tsx             # Root app layout
│       └── page.tsx               # Knowledge map / module entry page
├── .gitignore
├── package.json
└── README.md


# AI Tutor for Equity Learning Module 2: Discounted Dividend Valuation

This project is a proof-of-concept AI tutoring application for **Equity Learning Module 2 — Discounted Dividend Valuation**.  
Instead of behaving like a passive chatbot, the system is designed to act as a **proactive tutor** that guides the learner through concepts, checks understanding, provides remediation, and decides when the learner is ready to move forward.

The current prototype focuses on two interactive lesson nodes:

- **DDM Basics**
- **The Gordon Growth Model (GGM)**

A third node, **Multistage DDM**, is shown on the learning map as the next conceptual step but is intentionally left locked in this prototype.

---

## Quick Start

### Prerequisites

- **Node.js 20+**
- **npm**
- A valid **DeepSeek API key** (the current backend uses DeepSeek's chat completion endpoint)

### Environment Setup

Create a local environment file:

```bash
cp .env.example .env.local
