import fs from "fs/promises";
import path from "path";

export const readFixture = async filename => {
    const filePath = path.resolve(
        "backend/integrations/import/__tests__/fixtures",
        filename
    );

    return fs.readFile(filePath, "utf8");
};