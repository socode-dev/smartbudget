# SmartBudget Overview

SmartBudget is an AI-powered personal finance platform that helps users track financial activity, manage budgets,, monitor spending behaviour and receive personalized financial insights in real time.

**Users can:**
- track transactions and expenses
- create and monitor budgets
- analyze spending patterns
- monitor financial health
- receive AI-assisted financial insights

**The goal is not only to track transactions, but to help users:**
- understand unusual spending behavior
- detect financial pressure early
- improve budget discipline
- anticipate cash flow problems
- make clearer financial decisions

The platform combines deterministic financial analysis with AI-powered explanation systems to help users better understant their financial behaviour.

**Rather than allowing AI to independently determine financial conditions, SmartBudget uses deterministic financial engines to calculate signals such as:**
- anomalies
- budget compliance
- cash flow pressure
- financial risk

**AI then translate those structured signals into clear, human-readable explanations that helps users understand:**
- what happened
- why it matters
- what acttions they can take

This architecture keeps financial calculations predictable and explainable while still benefiting from AI-driven communication and personalization.

## Product Vision

SmartBudget is designed to evolve into an intelligent financial operating system that can reason across a user's financial context while preserving trust and explainability.

**The long-term direction includes:**
- contextual financial reasoning
- adaptive insight prioritization
- agentic orchestration
- long-term behavioral understanding
- proactive financial guidance

The core principle is that AI should support financial understanding, not independently decide financial truth.

For more detail on how that principle shapes the AI system, see [SmartBudget AI Architecture](./AI-ARCHITECTURE.md#core-architecture-philosophy).

## System Architecture

SmartBudget uses a hybrid deterministic + AI architecture.

**The system is split into two main responsibilities:**
- deterministic financial signal generation
- AI reasoning, explanation, and orchestration

Financial signal engines analyze transaction and budget data to produce structured signals such as anomalies, budget compliance, cash flow projections, and financial risk scores.

Specialized AI Financial Intelligence Services then turn those structured signals into clear, user-friendly insights and recommendations. Each intelligence service focuses on one financial domain, such as anomalies, budgets, cash flow, or overall financial risk. For the detailed AI services breakdown, see [Specialized AI Financial Intelligence Services](./AI-ARCHITECTURE.md#specialized-ai-financial-intelligence-services).

An orchestration layer is being developed to evaluate signals across domains, prioritize the most useful insights, suppress redundant insights, and decide which outputs should be shown to users. For the planned orchestration flow, see [Planned Orchestrator Flow](./AI-ARCHITECTURE.md#planned-orchestrator-flow).

For the detailed AI pipeline, specialized AI services responsibilities, backend structure, fallback behavior, and planned orchestration flow, see [SmartBudget AI Architecture](./AI-ARCHITECTURE.md).

## Architecture Evolution

SmartBudget started as a rule-based insight system where insights were generated directly from frontend logic and persisted through the app state and Firestore.

AI was later introduced to improve explanation quality, personalization, readability, and user engagement. Importantly, AI was added after deterministic signal generation rather than replacing it.

As the system grew, the AI layer moved from a single generalized prompt toward specialized AI financial intelligence services. This improved modularity, prompt maintainability, domain isolation, and scalability.

The AI pipeline is now migrating into backend infrastructure so model execution, prompts, fallback logic, and future orchestration can be centralized and secured. For implementation details, see [Backend AI Migration](./AI-ARCHITECTURE.md#backend-ai-migration) and [Current Backend AI Structure](./AI-ARCHITECTURE.md#current-backend-ai-structure).

The next major step is orchestration: a coordination layer that reasons across all financial signals, chooses the most relevant insights, and prepares the system for future tool-calling workflows.

## Core Principle

SmartBudget intentionally avoids fully autonomous financial decision-making.

Financial analysis remains deterministic. AI handles reasoning and communication.

**This balances:**
- trust
- consistency
- explainability
- personalization
- scalability
