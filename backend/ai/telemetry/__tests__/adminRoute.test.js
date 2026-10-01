import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../auth/requireAdmin.js", () => ({
    requireAdmin: vi.fn(),
    sendAdminAuthError: vi.fn((res, result) =>
        res.status(result.status).json({ ok: false, error: result.error })
    ),
}));

vi.mock("../adminReadModel.js", () => ({
    readAdminTelemetry: vi.fn(),
}));

vi.mock("../readModel.js", () => ({
    listTelemetryEvents: vi.fn(),
}));

import { requireAdmin } from "../../../auth/requireAdmin.js";
import { readAdminTelemetry } from "../adminReadModel.js";
import { listTelemetryEvents } from "../readModel.js";
import {
    adminTelemetryEventsHandler,
    createAdminTelemetryHandler,
} from "../adminRoute.js";

const createResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
});

describe("admin telemetry routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        requireAdmin.mockResolvedValue({ ok: true, uid: "admin-1", claims: { admin: true } });
        readAdminTelemetry.mockResolvedValue({ section: "overview" });
        listTelemetryEvents.mockResolvedValue([]);
    });

    it("rejects unauthenticated telemetry reads before accessing the model", async () => {
        requireAdmin.mockResolvedValueOnce({
            ok: false,
            status: 401,
            error: { code: "AUTH_REQUIRED" },
        });

        const res = createResponse();
        await createAdminTelemetryHandler("overview")({
            method: "GET",
            headers: {},
            query: {},
        }, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(readAdminTelemetry).not.toHaveBeenCalled();
    });

    it("reads a scoped telemetry section for an authorized admin", async () => {
        const res = createResponse();
        await createAdminTelemetryHandler("intelligence")({
            method: "GET",
            headers: { authorization: "Bearer token" },
            query: {
                startDate: "2026-09-01",
                endDate: "2026-09-30",
                institutionId: "institution-1",
                pilotId: "pilot-1",
            },
        }, res);

        expect(readAdminTelemetry).toHaveBeenCalledWith({
            section: "intelligence",
            startDate: "2026-09-01",
            endDate: "2026-09-30",
            institutionId: "institution-1",
            pilotId: "pilot-1",
            includeUniqueCustomers: false,
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("reads protected detail events with an explicit scope", async () => {
        const res = createResponse();
        await adminTelemetryEventsHandler({
            method: "GET",
            headers: { authorization: "Bearer token" },
            query: {
                subjectType: "institution",
                subjectId: "institution-1",
                category: "businessEvents",
                limit: "25",
            },
        }, res);

        expect(listTelemetryEvents).toHaveBeenCalledWith({
            subjectType: "institution",
            subjectId: "institution-1",
            category: "businessEvents",
            startAtMs: null,
            endAtMs: null,
            limit: 25,
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
