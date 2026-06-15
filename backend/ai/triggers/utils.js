export const TRIGGER_COLLECTION = "aiSignalTriggers";

export const RESERVED_LEASE_MS = 10 * 60 * 1000;
export const FAILED_RETRY_MS = 5 * 60 * 1000;
export const REMINDER_INTERVAL_MS = 24 * 60 * 60 * 1000;

export const ANOMALY_INCREASE_THRESHOLD = 0.5;
export const ANOMALY_ABSOLUTE_THRESHOLD = 10;
export const BUDGET_PERCENT_THRESHOLD = 10;
export const CASHFLOW_PERCENT_THRESHOLD = 10;
export const CASHFLOW_RUNWAY_DROP_THRESHOLD = 3;
export const RISK_SCORE_THRESHOLD = 10;

export const toTrigger = ({ type, keyParts, snapshot }) => {
    return {
        type,
        key: keyParts.map(toKeyPart).join("__"),
        fingerprint: stableStringify(snapshot),
        snapshot,
    };
};

export const toNumber = value => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

export const nullableNumber = value => {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

export const isMeaningfulRunwayDrop = (previousRunway, currentRunway) => {
    const previous = nullableNumber(previousRunway);
    const current = nullableNumber(currentRunway);

    if (previous === null || current === null) return false;
    if (current > 7) return false;

    return previous - current >= CASHFLOW_RUNWAY_DROP_THRESHOLD;
};

const toKeyPart = value => {
    return String(value ?? "unknown")
        .trim()
        .toLowerCase()
        .replace(/[\\/]/g, "-")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80) || "unknown";
};

const stableStringify = value => {
    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(",")}]`;
    }

    if (value && typeof value === "object") {
        return `{${Object.keys(value).sort().map(key => `${key}:${stableStringify(value[key])}`).join(",")}}`;
    }

    return JSON.stringify(value);
};
