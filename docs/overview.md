# SmartBudget Overview

SmartBudget is an AI-powered personal finance platform that helps users understand their financial behavior through deterministic analysis and AI-generated explanations.

The goal is not only to track transactions, but to help users:
- understand unusual spending behavior
- detect financial pressure early
- improve budget discipline
- anticipate cash flow problems
- make clearer financial decisions

SmartBudget keeps financial calculations predictable and controlled while using AI to explain, prioritize, and communicate insights in a more useful way.

## Product Vision

SmartBudget is designed to evolve into an intelligent financial operating system that can reason across a user's financial context while preserving trust and explainability.

The long-term direction includes:
- contextual financial reasoning
- adaptive insight prioritization
- agentic orchestration
- long-term behavioral understanding
- proactive financial guidance

The core principle is that AI should support financial understanding, not independently decide financial truth.

For more detail on how that principle shapes the AI system, see [SmartBudget AI Architecture](./ai-architecture.md#core-architecture-philosophy).

## System Architecture

SmartBudget uses a hybrid deterministic + AI architecture.

The system is split into two main responsibilities:
- deterministic financial signal generation
- AI reasoning, explanation, and orchestration

Financial signal engines analyze transaction and budget data to produce structured signals such as anomalies, budget compliance, cash flow projections, and financial risk scores.

Specialized AI agents then turn those structured signals into clear, user-friendly insights and recommendations. Each agent focuses on one financial domain, such as anomalies, budgets, cash flow, or overall financial risk. For the detailed agent breakdown, see [Specialized AI Agents](./ai-architecture.md#specialized-ai-agents).

An orchestration layer is being developed to evaluate signals across domains, prioritize the most useful insights, suppress redundant insights, and decide which outputs should be shown to users. For the planned orchestration flow, see [Planned Orchestrator Flow](./ai-architecture.md#planned-orchestrator-flow).

For the detailed AI pipeline, agent responsibilities, backend structure, fallback behavior, and planned orchestration flow, see [SmartBudget AI Architecture](./ai-architecture.md).

## Architecture Evolution

SmartBudget started as a rule-based insight system where insights were generated directly from frontend logic and persisted through the app state and Firestore.

AI was later introduced to improve explanation quality, personalization, readability, and user engagement. Importantly, AI was added after deterministic signal generation rather than replacing it.

As the system grew, the AI layer moved from a single generalized prompt toward specialized agents. This improved modularity, prompt maintainability, domain isolation, and scalability.

The AI pipeline is now migrating into backend infrastructure so model execution, prompts, fallback logic, and future orchestration can be centralized and secured. For implementation details, see [Backend AI Migration](./ai-architecture.md#backend-ai-migration) and [Current Backend AI Structure](./ai-architecture.md#current-backend-ai-structure).

The next major step is orchestration: a coordination layer that reasons across all financial signals, chooses the most relevant insights, and prepares the system for future tool-calling workflows.

## Core Principle

SmartBudget intentionally avoids fully autonomous financial decision-making.

Financial analysis remains deterministic. AI handles reasoning and communication.

This balances:

- trust
- consistency
- explainability
- personalization
- scalability
