import admin from "firebase-admin";

const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.VITEST;
const SAFE_TEST_PROJECT_IDS = new Set(["demo-smartbudget"]);

const getProjectId = () =>
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    "demo-smartbudget";

if(!admin.apps.length) {
    if (process.env.FIRESTORE_EMULATOR_HOST) {
        const projectId = getProjectId();

        if (isTestEnvironment && !SAFE_TEST_PROJECT_IDS.has(projectId)) {
            throw new Error(
                `Firebase Admin refused to initialize test Firestore with project "${projectId}"`
            );
        }

        admin.initializeApp({
            projectId,
        });
    } else {
        if (isTestEnvironment) {
            throw new Error(
                "Firebase Admin refused to initialize outside the Firestore emulator during tests"
            );
        }

        admin.initializeApp({
            credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,           
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            })
        });
    }
}

const db = admin.firestore();
const adminAuth = admin.auth();

if (process.env.FIRESTORE_EMULATOR_HOST) {
    db.settings({
        host: process.env.FIRESTORE_EMULATOR_HOST,
        ssl: false,
    });
}

export { db, adminAuth };

export const FieldValue = admin.firestore.FieldValue;
export const QUOTA_LIMIT = process.env.AI_QUOTA_LIMIT;
