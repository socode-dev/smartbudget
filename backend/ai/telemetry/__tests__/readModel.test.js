import { describe, expect, it, vi } from "vitest";

vi.mock("../../../../lib/firebaseAdmin.js", () => ({
    db: {},
}));

import {
    getDateKeysInRange,
    sumMetricShards,
} from "../readModel.js";
import { TELEMETRY_METRIC_DEFINITIONS } from "../readModelDefinitions.js";

describe("telemetry read model helpers", () => {
    it("builds an inclusive UTC date range", () => {
        expect(getDateKeysInRange({
            startDate: "2026-09-28",
            endDate: "2026-09-30",
        })).toEqual([
            "2026-09-28",
            "2026-09-29",
            "2026-09-30",
        ]);
    });

    it("rejects reversed or invalid date ranges", () => {
        expect(() => getDateKeysInRange({
            startDate: "2026-09-30",
            endDate: "2026-09-28",
        })).toThrow("INVALID_TELEMETRY_DATE_RANGE");

        expect(() => getDateKeysInRange({
            startDate: "2026-09-31",
            endDate: "2026-10-01",
        })).toThrow("INVALID_TELEMETRY_DATE");
    });

    it("combines sharded counters without inventing missing values", () => {
        const snapshots = [
            { data: () => ({ totalPipelineRuns: 2, successfulPipelineRuns: 1 }) },
            { data: () => ({ totalPipelineRuns: 3, failedPipelineRuns: 1 }) },
        ];

        expect(sumMetricShards({
            category: "aiPipelineRuns",
            snapshots,
        })).toMatchObject({
            totalPipelineRuns: 5,
            successfulPipelineRuns: 1,
            failedPipelineRuns: 1,
            blockedPipelineRuns: 0,
        });
    });

    it("exposes metric units for consumers", () => {
        expect(TELEMETRY_METRIC_DEFINITIONS.activeCustomers).toMatchObject({
            area: "customer_activity",
            unit: "daily_unique_customer_events",
        });
        expect(TELEMETRY_METRIC_DEFINITIONS.totalPipelineDurationMs.unit)
            .toBe("milliseconds_total");
    });
});
