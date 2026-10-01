import { auth } from "../firebase/firebase";

const getAdminIdToken = async () => {
    const user = auth.currentUser;

    if (!user) throw new Error("AUTH_REQUIRED");

    return user.getIdToken();
};

const buildQuery = params => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.set(key, value);
        }
    });

    return query.toString();
};

const sectionPaths = {
    overview: "overview",
    intelligence: "intelligence",
    dataOperations: "data-operations",
    customerActivity: "customer-activity",
};

const requestAdmin = async (path, params = {}) => {
    const idToken = await getAdminIdToken();
    const query = buildQuery(params);
    const response = await fetch(`${path}${query ? `?${query}` : ""}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok || body?.ok !== true) {
        const error = new Error(body?.error?.code || "ADMIN_REQUEST_FAILED");
        error.status = response.status;
        throw error;
    }

    return body;
};

export const fetchAdminTelemetry = ({
    section,
    startDate,
    endDate,
    institutionId,
    pilotId,
} = {}) => requestAdmin(`/api/admin/telemetry/${sectionPaths[section] || section}`, {
    startDate,
    endDate,
    institutionId,
    pilotId,
});

export const fetchAdminTelemetryEvents = params =>
    requestAdmin("/api/admin/telemetry/events", params);
