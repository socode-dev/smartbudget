import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../writeTelemetryEvent.js", () => ({
    writeTelemetryEvent: vi.fn(() => Promise.resolve(true)),
}));

import { logBusinessEvent } from "../businessLogger.js";
import { writeTelemetryEvent } from "../writeTelemetryEvent.js";

describe("logBusinessEvent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("writes supported business event types", async () => {
        await expect(logBusinessEvent({
            userId: "user-1",
            eventType: "insight_viewed",
        })).resolves.toBe(true);

        expect(writeTelemetryEvent).toHaveBeenCalledWith(expect.objectContaining({
            userId: "user-1",
            category: "businessEvents",
            payload: expect.objectContaining({
                eventType: "insight_viewed",
            }),
        }));
    });

    it("rejects unsupported event types before writing telemetry", async () => {
        await expect(logBusinessEvent({
            userId: "user-1",
            eventType: "unsupported_metric",
        })).resolves.toBe(false);

        expect(writeTelemetryEvent).not.toHaveBeenCalled();
    });
});
