const METRIC_SHARD_COUNT = 100;

export const getDateKey = ( timestampMs ) => new Date(timestampMs).toISOString().slice(0, 10);

export const getDailyMetricId = ({ dateKey, category }) => `${dateKey}__${category}`;

export const getMetricShardId = (value) => {
    const input = String(value ?? "");
    let hash = 0;;

    for(let i =0; i < input.length; i++) {
        hash = ((hash << 5) - hash) + input.charCodeAt(i);
        hash |= 0;
    }

    return String(Math.abs(hash) % METRIC_SHARD_COUNT);
}