import {
    adminTelemetryEventsHandler,
    createAdminTelemetryHandler,
} from "../backend/ai/telemetry/adminRoute.js";

const handlers = {
    overview: createAdminTelemetryHandler("overview"),
    intelligence: createAdminTelemetryHandler("intelligence"),
    "data-operations": createAdminTelemetryHandler("dataOperations"),
    "customer-activity": createAdminTelemetryHandler("customerActivity"),
    events: adminTelemetryEventsHandler,
};

export default async function handler(req, res) {
    const rawSection = req.query?.section;
    const section = Array.isArray(rawSection) ? rawSection[0] : rawSection;
    const routeHandler = handlers[section];

    if (!routeHandler) {
        return res.status(404).json({
            ok: false,
            error: { code: "ADMIN_TELEMETRY_ROUTE_NOT_FOUND" },
        });
    }

    return routeHandler(req, res);
}
