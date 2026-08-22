import { db } from "../../lib/firebaseAdmin.js";

export const loadPilotContext = async ({ userId } = {}) => {
    if (!userId) return {};

    const userSnap = await db.collection("users").doc(userId).get();

    if (!userSnap.exists) return {};

    const pilot = userSnap.data()?.pilot ?? {};

    return {
        institutionId: pilot.institutionId ?? null,
        pilotId: pilot.pilotId ?? null,
        cohortId: pilot.cohortId ?? null,
        dataSource: pilot.dataSource ?? null,
        enrollmentSource: pilot.enrollmentSource ?? null
    }
}