import { buildPilotBusinessReport } from "../../backend/ai/telemetry/businessReport.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            ok: false,
            error: {
                code: "METHOD_NOT_ALLOWED",
                message: "Api method is not allowed"
            }
        });
    }

    const {
        institutionId,
        pilotId,
        baselineStart,
        baselineEnd,
        pilotStart,
        pilotEnd
    } = req.query;

    if ( 
        !institutionId ||
        !pilotId ||
        !baselineStart ||
        !baselineEnd ||
        !pilotStart ||
        !pilotEnd
    ) {
        return res.status(400).json({
            ok: false,
            error: {
                code: "MISSING_REPORT_RANGE",
                message: "Report range is incomplete"
            }
        });
    }

    try {
        const report = await buildPilotBusinessReport({
            institutionId,
            pilotId,
            baselineStart,
            baselineEnd,
            pilotStart,
            pilotEnd
        });

        return res.status(200).json({
            ok: true,
            report
        });
    } catch (err) {
        console.error("BUSINESS_REPORT_FAILED:", err);

        return res.status(500).json({
            ok: false,
            error: {
                code: "BUSINESS_REPORT_FAILED",
                message: "Error getting business report"
            }
        });
    }
}