import { requireAdmin, sendAdminAuthError } from "../../auth/requireAdmin.js";
import { listTelemetryEvents } from "./readModel.js";
import { readAdminTelemetry } from "./adminReadModel.js";

const getQueryValue = value => Array.isArray(value) ? value[0] : value;

const getTelemetryQuery = req => ({
    startDate: getQueryValue(req.query?.startDate),
    endDate: getQueryValue(req.query?.endDate),
    institutionId: getQueryValue(req.query?.institutionId) || null,
    pilotId: getQueryValue(req.query?.pilotId) || null,
});

const validateTelemetryQuery = ({ startDate, endDate, institutionId, pilotId }) => {
    if (!startDate || !endDate) return "MISSING_TELEMETRY_RANGE";
    if (Boolean(institutionId) !== Boolean(pilotId)) return "INCOMPLETE_TELEMETRY_SCOPE";
    return null;
};

const sendTelemetryError = (res, error) => {
    const status = [
        "MISSING_TELEMETRY_RANGE",
        "INCOMPLETE_TELEMETRY_SCOPE",
        "INVALID_TELEMETRY_DATE",
        "INVALID_TELEMETRY_DATE_RANGE",
        "INVALID_TELEMETRY_SECTION",
        "INVALID_TELEMETRY_DETAIL_SCOPE",
    ].includes(error.message)
        ? 400
        : 500;

    return res.status(status).json({
        ok: false,
        error: {
            code: error.message || "ADMIN_TELEMETRY_FAILED",
            message: status === 400
                ? "The telemetry request is invalid."
                : "The telemetry request failed.",
        },
    });
};

export const createAdminTelemetryHandler = section => async (req, res) => {
    if (req.method !== "GET") {
        return res.status(405).json({
            ok: false,
            error: { code: "METHOD_NOT_ALLOWED" },
        });
    }

    const authResult = await requireAdmin(req);

    if (!authResult.ok) return sendAdminAuthError(res, authResult);

    const query = getTelemetryQuery(req);
    const validationError = validateTelemetryQuery(query);

    if (validationError) {
        return sendTelemetryError(res, new Error(validationError));
    }

    try {
        const telemetry = await readAdminTelemetry({
            section,
            ...query,
        });

        return res.status(200).json({
            ok: true,
            telemetry,
        });
    } catch (error) {
        console.error("ADMIN_TELEMETRY_READ_FAILED:", error);
        return sendTelemetryError(res, error);
    }
};

export const adminTelemetryEventsHandler = async (req, res) => {
    if (req.method !== "GET") {
        return res.status(405).json({
            ok: false,
            error: { code: "METHOD_NOT_ALLOWED" },
        });
    }

    const authResult = await requireAdmin(req);

    if (!authResult.ok) return sendAdminAuthError(res, authResult);

    const getNumber = value => {
        const parsed = Number(getQueryValue(value));
        return Number.isFinite(parsed) ? parsed : null;
    };

    const subjectType = getQueryValue(req.query?.subjectType) || "user";
    const subjectId = getQueryValue(req.query?.subjectId);
    const category = getQueryValue(req.query?.category);

    if (!subjectId || !category) {
        return sendTelemetryError(res, new Error("INVALID_TELEMETRY_DETAIL_SCOPE"));
    }

    try {
        const events = await listTelemetryEvents({
            subjectType,
            subjectId,
            category,
            startAtMs: getNumber(req.query?.startAtMs),
            endAtMs: getNumber(req.query?.endAtMs),
            limit: getNumber(req.query?.limit) ?? 100,
        });

        return res.status(200).json({
            ok: true,
            events,
        });
    } catch (error) {
        console.error("ADMIN_TELEMETRY_EVENTS_READ_FAILED:", error);
        return sendTelemetryError(res, error);
    }
};
