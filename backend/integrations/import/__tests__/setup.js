import { beforeEach } from "vitest";
import { db } from "../../../../lib/firebaseAdmin.js";

const SAFE_TEST_PROJECT_IDS = new Set([
    "demo-smartbudget",
]);

const assertUsingFirestoreEmulator = () => {
    const emulatorHost =
        process.env.FIRESTORE_EMULATOR_HOST;

    const projectId =
        process.env.GCLOUD_PROJECT ||
        process.env.FIREBASE_PROJECT_ID;

    if (!emulatorHost) {
        throw new Error(
            "Importer tests refused to clear Firestore because FIRESTORE_EMULATOR_HOST is not set"
        );
    }

    if (!SAFE_TEST_PROJECT_IDS.has(projectId)) {
        throw new Error(
            `Importer tests refused to clear Firestore because project "${projectId}" is not an approved test project`
        );
    }

    if (!emulatorHost.includes("127.0.0.1") &&
        !emulatorHost.includes("localhost")) {
        throw new Error(
            `Importer tests refused to clear Firestore because emulator host "${emulatorHost}" is not local`
        );
    }
};

const clearFirestore = async () => {
    assertUsingFirestoreEmulator();

    const collections = await db.listCollections();

    for (const collection of collections) {
        const docs = await collection.listDocuments();

        const deletions = docs.map(doc =>
            db.recursiveDelete(doc)
        );

        await Promise.all(deletions);
    }
};

beforeEach(async () => {
    await clearFirestore();
});