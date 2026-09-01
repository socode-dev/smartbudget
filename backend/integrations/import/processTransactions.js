import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import { normalizeCustomerId, normalizeTransactionId } from "./normalizeIdentity.js";
import { BUSINESS_EVENTS } from "./importTypes.js";
import { logImportBusinessEvent } from "./telemetry.js";
import { getAllInChunks, commitInChunks } from "./utils.js";
import { PILOT_IDENTITY_STATUSES } from "../invites/inviteTypes.js";
import { generateCategoryKey } from "../../../src/utils/generateKey.js";

export const processTransactions = async ({
    rows,
    institutionId,
    pilotId,
    cohortId = null,
    importId,
    hmacSecret
} = {}) => {
    const normalizedTransactions = rows.map(row =>
        normalizeTransaction({
            row,
            institutionId,
            hmacSecret
        })
    );

    const uniqueImportCustomerIds = [
        ...new Set(
            normalizedTransactions.map(item => item.importCustomerId)
        )
    ];

    const identityRefs = uniqueImportCustomerIds.map(id =>
        db.collection("pilotIdentities").doc(id)
    );

    const pilotCustomerRefs = uniqueImportCustomerIds.map(id =>
        db.collection("pilotCustomers").doc(id)
    );

    const identitySnapshots = await getAllInChunks(identityRefs);
    const pilotCustomerSnapshots = await getAllInChunks(pilotCustomerRefs);

    const destinationByImportCustomerId = new Map();

    uniqueImportCustomerIds.forEach((id, index) => {
        const identitySnapshot = identitySnapshots[index];

        if (
            identitySnapshot.exists &&
            [
                PILOT_IDENTITY_STATUSES.CLAIMED,
                PILOT_IDENTITY_STATUSES.MIGRATING,
            ].includes(identitySnapshot.data().status) &&
            identitySnapshot.data().userId
        ) {
            destinationByImportCustomerId.set(id, {
                ownerId: identitySnapshot.data().userId,
                ownerType: "USER",
                collectionRef: db
                .collection("users")
                .doc(identitySnapshot.data().userId)
                .collection("transactions"),
            });

            return;
        }

        const pilotCustomerSnapshot = pilotCustomerSnapshots[index];

        if (pilotCustomerSnapshot.exists) {
            destinationByImportCustomerId.set(id, {
                ownerId: id,
                ownerType: "PILOT_CUSTOMER",
                collectionRef: db
                .collection("pilotCustomers")
                .doc(id)
                .collection("transactions"),
            });
        }
    });

    const transactionRefs = normalizedTransactions.map(item => {
        const destination =
            destinationByImportCustomerId.get(item.importCustomerId);

            return destination
                ? destination.collectionRef.doc(item.transactionId)
                : null;
    });

    const existingTransactionSnapshots = await getAllInChunks(
        transactionRefs.filter(Boolean)
    );

    
    let existingIndex = 0;
    const writes = [];
    const affectedImportCustomerIds = new Set();
    const affectedUserIds = new Set();

    let acceptedRows = 0;
    let duplicateRows = 0;
    let rejectedRows = 0;

    normalizedTransactions.forEach(
        (item, index) => {
            const destination = destinationByImportCustomerId.get(item.importCustomerId);

            if (!destination) {
                rejectedRows += 1;
                return;
            }

            const transactionRef = transactionRefs[index];
            const existingTransactionSnapshot = 
                existingTransactionSnapshots[existingIndex];

            existingIndex += 1;
            
            if (existingTransactionSnapshot?.exists) {
                duplicateRows += 1;
                return;
            }

            writes.push({
                ref: transactionRef,
                data: {
                    ...item.transaction,
                    id: item.transactionId,
                    importId,
                    importCustomerId: item.importCustomerId,
                    ownerType: destination.ownerType,
                    createdAt: FieldValue.serverTimestamp()
                },
                options: { merge: true }
            });

            acceptedRows += 1;
            affectedImportCustomerIds.add(item.importCustomerId);

            if (destination.ownerType === "USER") {
                affectedUserIds.add(destination.ownerId);
            }
        }
    );

    await commitInChunks(writes);

    await logImportBusinessEvent({
        institutionId,
        pilotId,
        cohortId,
        importId,
        eventType: BUSINESS_EVENTS.SFTP_FINANCIAL_DATA_IMPORTED,
        metadata: {
            transactionCount: acceptedRows,
            duplicateRows,
            rejectedRows,
            affectedImportCustomerCount: affectedImportCustomerIds.size,
            affectedUserCount: affectedUserIds.size,
        }
    });

    return {
        acceptedRows,
        duplicateRows,
        rejectedRows,
        affectedImportCustomerIds: [...affectedImportCustomerIds],
        affectedUserIds: [...affectedUserIds]
    };
};
const normalizeTransaction = ({
    row,
    institutionId,
    hmacSecret
}) => {
    const importCustomerId = normalizeCustomerId({
        institutionId,
        customerId: row.customer_id,
        secret: hmacSecret
    });

    const transactionId = normalizeTransactionId({
        institutionId,
        transactionId: row.transaction_id,
        secret: hmacSecret
    });

    const category = String(row.category ?? "").trim();
    const type = String(row.type ?? "").trim().toLowerCase();

    return {
        importCustomerId,
        transactionId,
        transaction: {
            name: category,
            category,
            categoryKey: generateCategoryKey({ prefix: type, category }),
            amount: Number(row.amount),
            type,
            date: String(row.date ?? "").trim(),
            description: row.description
                ? String(row.description).trim().slice(0, 160)
                : "",
            source: "sftp_import"
        }
    };
};
