import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import { normalizeCustomerId } from "./normalizeIdentity.js";
import { BUSINESS_EVENTS } from "./importTypes.js";
import {
    logCustomerBusinessEvent,
    logImportBusinessEvent
} from "./telemetry.js";
import {
    getAllInChunks,
    commitInChunks
} from "./utils.js";
import { createInvites } from "../invites/createInvites.js";
import { PILOT_IDENTITY_STATUSES } from "../invites/inviteTypes.js";


export const processCustomers = async ({
    rows,
    institutionId,
    pilotId,
    cohortId = null,
    importId,
    source,
    hmacSecret,
    activationBaseUrl = process.env.SMARTBUDGET_ACTIVATION_BASE_URL
}) => {
    const normalizedCustomers = rows.map(row =>
        normalizeCustomer({
            row,
            institutionId,
            hmacSecret
        })
    );

    const identifyRefs = normalizedCustomers.map(customer => 
        db.collection("pilotIdentities").doc(customer.importCustomerId)
    )

    const pilotCustomerRefs = normalizedCustomers.map(customer => 
        db.collection("pilotCustomers").doc(customer.importCustomerId)
    );

    const identitySnapshots = await getAllInChunks(identifyRefs);
    const pilotCustomerSnapshots = await getAllInChunks(pilotCustomerRefs);

    const writes = [];
    const newImportCustomerIds = [];
    const inviteCandidates = [];
    const skippedClaimedImportCustomerIds = [];

    normalizedCustomers.forEach((customer, index) => {
        const identitySnapshot = identitySnapshots[index];

        if (
            identitySnapshot.exists &&
            [
                PILOT_IDENTITY_STATUSES.CLAIMED,
                PILOT_IDENTITY_STATUSES.MIGRATING,
            ].includes(identitySnapshot.data().status)
        ) {
            skippedClaimedImportCustomerIds.push(customer.importCustomerId);
            return;
        }

        const pilotSnapshot = pilotCustomerSnapshots[index];
        const existingData = pilotSnapshot.exists
            ? pilotSnapshot.data()
            : {};
            
        const isNewPilotCustomer = !pilotSnapshot.exists;

        writes.push({
            ref: pilotCustomerRefs[index],

            data: {
                importCustomerId: customer.importCustomerId,
                institutionId,
                pilotId,
                cohortId,
                status: existingData.status ?? "PENDING_ACTIVATION",
                profile: {
                    firstName: 
                        existingData.profile?.firstName ?? 
                        customer.profile.firstName,
                    lastName: 
                        existingData.profile?.lastName ?? 
                        customer.profile.lastName,
                    fullName: 
                        existingData.profile?.fullName ?? 
                        customer.profile.fullName,
                },
                source,
                importedAtMs:
                    existingData.importedAtMs ??
                    Date.now(),
                updatedAt: FieldValue.serverTimestamp(),
                createdAt: 
                    existingData.createdAt ??
                    FieldValue.serverTimestamp(),
            },
            options: {
                merge: true
            }
        });

        if (isNewPilotCustomer) {
            newImportCustomerIds.push(customer.importCustomerId);
        }

        inviteCandidates.push(customer);
    });

    await commitInChunks(writes);

    const inviteResult = await createInvites({
        customers: inviteCandidates,
        institutionId,
        pilotId,
        cohortId,
        importId,
        activationBaseUrl,
    });

    await Promise.all(
        newImportCustomerIds.map(importCustomerId =>
            logCustomerBusinessEvent({
                userId: importCustomerId,
                institutionId,
                pilotId,
                cohortId,
                importId,
                eventType: BUSINESS_EVENTS.CUSTOMER_IMPORTED,
                metadata: {
                    identityState: "PRE_ACTIVATION"
                },
            })
        )
    );

    await logImportBusinessEvent({
        institutionId,
        pilotId,
        cohortId,
        importId,
        eventType: BUSINESS_EVENTS.SFTP_CUSTOMER_IMPORTED,
        metadata: {
            customerCount: normalizedCustomers.length,
            newCustomerCount: newImportCustomerIds.length,
            inviteCreatedCount: inviteResult.createdInvites.length,
            inviteSkippedCount: inviteResult.skippedInvites.length,
            skippedClaimedImportCustomerCount:
                skippedClaimedImportCustomerIds.length,
        }
    });

    return {
        acceptedRows: normalizedCustomers.length,
        skippedRows: skippedClaimedImportCustomerIds.length,
        duplicateRows: 0,
        rejectedRows: 0,
        affectedImportCustomerIds:
            normalizedCustomers.map(
                customer => customer.importCustomerId
            ),
        newImportCustomerIds,
        skippedClaimedImportCustomerIds,
        inviteExports: inviteResult.inviteExports,
        createdInvites: inviteResult.createdInvites,
        skippedInvites: inviteResult.skippedInvites,
    };
};

const normalizeCustomer = ({
    row,
    institutionId,
    hmacSecret
}) => {
    const importCustomerId = normalizeCustomerId({
        institutionId,
        customerId: row.customer_id,
        secret: hmacSecret
    });

    const nameParts = String(row.name ?? "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    return {
        rawCustomerId: String(row.customer_id).trim(),
        importCustomerId,
        profile: {
            firstName: nameParts[0] ?? "",
            lastName: nameParts.slice(1).join(" "),
            fullName: nameParts.join(" "),
        }
    };
};
