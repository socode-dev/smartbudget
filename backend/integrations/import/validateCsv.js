import { IMPORT_FILE_TYPES } from "./importTypes.js";
import { validateCustomerRow } from "./schemas/customerSchema.js";
import { validateTransactionRow } from "./schemas/transactionSchema.js";

const MAX_ROWS = 10000;
const MAX_COLUMNS = 30;
const MAX_CELL_LENGTH = 500;

export const validateCsv = ({ rows, fileType } = {}) => {
    const errors = [];

    if (!Array.isArray(rows) || rows.length === 0) {
        return [
            {
                code: "EMPTY_FILE",
                message: "CSV file has no rows",
            },
        ];
    }

    if (rows.length > MAX_ROWS) {
        errors.push({
            code: "ROW_LIMIT_EXCEEDED",
            maxRows: MAX_ROWS,
            actualRows: rows.length,
        });
    }

    rows.forEach((row, rowIndex) => {
        const columns = Object.keys(row);

        if (columns.length > MAX_COLUMNS) {
            errors.push({
                code: "COLUMN_LIMIT_EXCEEDED",
                rowNumberL: rowIndex + 2,
                maxColumns: MAX_COLUMNS,
                actualColumns: columns.length,
            });
        }

        for (const [column, value] of Object.entries(row)) {
            if (String(value ?? "").length > MAX_CELL_LENGTH) {
                errors.push({
                    code: "CELL_TOO_LONG",
                    rowNumber: rowIndex + 2,
                    column,
                });
            }
        }

        errors.push(...validateRowByType({ row, rowIndex, fileType }));
    });

    return errors;
};

const validateRowByType = ({ row, rowIndex, fileType }) => {
    switch (fileType) {
        case IMPORT_FILE_TYPES.CUSTOMERS:
            return validateCustomerRow(row, rowIndex);

        case IMPORT_FILE_TYPES.TRANSACTIONS:
            return validateTransactionRow(row, rowIndex);

        default: 
            return [
                {
                    code: "UNSUPPORTED_FILE_TYPE",
                    fileType,
                },
            ];
    }
};