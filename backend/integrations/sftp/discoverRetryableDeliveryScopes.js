import { db } from "../../../lib/firebaseAdmin.js";

const RETRYABLE_STATUSES = [
    "PENDING_DELIVERY",
    "DELIVERY_FAILED",
];

const isNonEmptyString = value => typeof value === "string" && value.trim().length > 0;

const getScopeFromPath = ref => {
    const segments = ref.path.split("/");
    const institutionIndex = segments.indexOf("institutions");
    const pilotIndex = segments.indexOf("pilots");

    if (
        institutionIndex < 0 ||
        pilotIndex < 0 ||
        !segments[pilotIndex + 1]
    ) return null;

    return {
        institutionId: segments[institutionIndex + 1],
        pilotId: segments[pilotIndex + 1],
    };
};

const resolveSpoolScope = doc => {
    const data = doc.data();
    const pathScope = getScopeFromPath(doc.ref);

    const explicitScope =
        (isNonEmptyString(data.institutionId) && isNonEmptyString(data.pilotId))
            ? {
                institutionId: data.institutionId,
                pilotId: data.pilotId,
            }
            : null;

    if (explicitScope && pathScope) {
        const matchesPath =
            explicitScope.institutionId === pathScope.institutionId &&
            explicitScope.pilotId === pathScope.pilotId;

        if (!matchesPath) return null;
    }

    return explicitScope || pathScope;
};

export const discoverRetryableDeliveryScopes = async ({
    now = Date.now(),
    firestore = db
} = {}) => {
    const snapshot = await firestore
        .collectionGroup("deliverySpool")
        .where("type", "==", "INVITATION_EXPORT")
        .where("status", "in", RETRYABLE_STATUSES)
        .get();

    const scopes = new Map();

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const expiresAtMs = Number(data.expiresAtMs);

        if (
            !Number.isFinite(expiresAtMs) ||
            expiresAtMs <= now
        ) continue;

        const scope = resolveSpoolScope(doc);

        if (!scope) continue;

        const key = JSON.stringify([
            scope.institutionId,
            scope.pilotId
        ]);

        scopes.set(key, scope);
    }

    return [...scopes.values()].sort((a, b) => {
        const institutionComparison = a.institutionId.localeCompare(b.institutionId);

        if (institutionComparison !== 0) return institutionComparison;

        return a.pilotId.localeCompare(b.pilotId);
    });
};