import Papa from "papaparse";

export const parseCsv = ({ fileContent } = {}) => {
    if (!fileContent) {
        return {
            rows: [],
            errors: [
                {
                    code: "EMPTY_FILE",
                    message: "CSV file is empty",
                },
            ],
        };
    }

    const parsed = Papa.parse(String(fileContent), {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (header) => String(header || "").trim().toLowerCase(),
        transform: (value) => 
            typeof value === "string" ? value.trim() : value,
    });

    return {
        rows: parsed.data,
        errors: parsed.errors.map(error => ({
            code: "CSV_PARSE_ERROR",
            message: error.message,
            rowNumber: error.row ? error.row + 2 : null,
        })),
    };
};
