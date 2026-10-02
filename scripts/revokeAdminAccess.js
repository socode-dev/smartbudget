import { revokeAdminAccess } from "../backend/auth/adminAccess.js";

const uid = process.argv[2];

if (!uid) {
    console.error("Usage: node scripts/revokeAdminAccess.js <firebase-uid>");
    process.exitCode = 1;
} else {
    try {
        const result = await revokeAdminAccess({ uid });
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error(error.message || "ADMIN_REVOKE_FAILED");
        process.exitCode = 1;
    }
}
