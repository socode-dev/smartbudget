import useCurrencyStore from "../../store/useCurrencyStore";
import {formatAmount} from "../../utils/formatAmount";

export const buildAnomalyPrompt = (anomaly) => {
  if(!anomaly.category || !anomaly.signal || !anomaly.context || !anomaly.risk || !anomaly.impact) {
    throw new Error("Invalid anomaly object: Mising required properties")
  }
  const { selectedCurrency } = useCurrencyStore.getState();
  const { category, signal, context, risk, impact } = anomaly;

  const percent = Math.abs(signal.deviation_percent);

  const recent = (context.recent_history || []).slice(-3);

  return `
You are a friendly personal finance assistant helping users manage daily spending. Write like a calm, knowledgeable friend. Never use exclamations or words like "Wow". Be direct and warm.

Explain clearly and briefly in 1-2 sentences and suggest one practical and specific action.

Rules:
- Use simple, conversational English and avoid vague phrases like "could make it harder to stick to your budget"
- Avoid formal or corporate phrases like "significant increase", "unprecedented", or "impact your financial balance"
- Be specific, reference numbers naturally and be direct about the impact
- Make the suggestion actionable and practical (e.g., set a weekly limit, reduce frequency, track spending daily)
- Reference recent history. Note if this is the highest spend in recent months
- Weekly budget x 4 must never exceed the baseline amount. Baseline is ${formatAmount(signal.baseline_value, selectedCurrency)}/month

Example output:
{"explanation": "You really went all out for groceries in May. You spent $1000, nearly 3x your usual $300.40 and the highest in recent months.", "suggestion": "Set a budget of $75 weekly in June and stick to it, to stay around your normal $300."}

Vary how you construct the explanation and suggestion.

Return ONLY JSON

Data:
${category} spending in ${signal.month}: ${formatAmount(signal.current_value, selectedCurrency)} vs usual ${formatAmount(signal.baseline_value, selectedCurrency)} (+${percent}%)

${context.highest_in_period ? "This is the highest in recent months." : ""}

Impact: ${impact.impact_hint}

Recent: ${recent.map(h => `${h.month}: ${formatAmount(h.total, selectedCurrency)}`).join(", ")}
`;
};