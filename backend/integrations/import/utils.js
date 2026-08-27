import { db } from "../../../lib/firebaseAdmin.js";

export const getAllInChunks = async (
    refs,
    chunkSize = 400
) => {
    const snapshots = [];

    for (
        let index = 0;
        index < refs.length;
        index += chunkSize
    ) {
        const chunk = refs.slice(
            index,
            index + chunkSize
        );

        const result = await db.getAll(...chunk);

        snapshots.push(...result);
    }

    return snapshots;
};

export const commitInChunks = async (writes, size = 400) => {
    for (let index = 0; index < writes.length; index += size) {
        const batch = db.batch();
        const chunk = writes.slice(index, index + size);

        chunk.forEach(write => 
            batch.set(write.ref, write.data, write.options)
        );

        await batch.commit();
    }
};
