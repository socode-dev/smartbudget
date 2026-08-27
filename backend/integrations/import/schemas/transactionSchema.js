const REQUIRED_TRANSACTION_COLUMNS = [
    "transaction_id",
    "customer_id",
    "category",
    "type",
    "amount",
    "date"
];

const VALID_TRANSACTION_TYPES = new Set(["income", "expense"]);

export const validateTransactionRow = (row, rowIndex) => {
    const errors = [];

    for (const column of REQUIRED_TRANSACTION_COLUMNS) {
        if(!String(row[column] ?? "").trim()) {
            errors.push({
                code: "MISSING_REQUIRED_VALUE",
                rowNumber: rowIndex + 2,
                column,
            });
        }
    }
    
    const type = String(row.type || "").toLowerCase();
    if (row.type && !VALID_TRANSACTION_TYPES.has(type)) {
        errors.push({
            code: "INVALID_TRANSACTION_TYPE",
            rowNumber: rowIndex + 2,
            column: "type",
        });
    }
    
    const rawAmount = String(row.amount ?? "").trim();

    if (rawAmount) {
        const amount = Number(rawAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            errors.push({
                code: "INVALID_AMOUNT",
                rowNumber: rowIndex + 2,
                column: "amount",
            });
        }
    }

    if (row.date && !isValidDate(row.date)) {
        errors.push({
            code: "INVALID_DATE",
            rowNumber: rowIndex + 2,
            column: "date",
        });
    }

    if (row.description && String(row.description).length > 160) {
        errors.push({
            code: "DESCRIPTION_TOO_LONG",
            rowNumber: rowIndex + 2,
            column: "description",
        });
    }

    return errors;
};

const isValidDate = (value) => {
    const date = String(value ?? "");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const [year, month, day] = date
        .split("-")
        .map(Number);

    const parsed = new Date(
        Date.UTC(year, month - 1, day)
    );

    return (
        parsed.getUTCFullYear() === year &&
        parsed.getUTCMonth() === month - 1 &&
        parsed.getUTCDate() === day
    );
};