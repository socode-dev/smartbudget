const REQUIRED_CUSTOMER_COLUMNS = ["customer_id", "name"];

export const validateCustomerRow = (row, rowIndex) => {
    const errors = [];

    for (const column of REQUIRED_CUSTOMER_COLUMNS) {
        if (!String(row[column] ?? "").trim()) {
            errors.push({
                code: "MISSING_REQUIRED_VALUE",
                rowNumber: rowIndex + 2,
                column,
            });
        }
    }

    return errors;
}