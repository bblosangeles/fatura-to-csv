import fs from "fs";
import path from "path";
import { PdfDataParser } from "pdf-data-parser";

const parsePdf = async (filePath) => {
  let parser = new PdfDataParser({ url: filePath });
  let rows = await parser.parse();
  const c6rowPattern = /^(\d{2}\/\d{2}\/\d{4})\s(.*);(\d{12});(.*);([A-Z])/;

  const parsedRows = rows
    .filter((row) => {
      let match = row.join(";").match(c6rowPattern);
      return match;
    })
    .map((row) => {
      let match = row.join(";").match(c6rowPattern);
      return {
        DATA: match[1],
        DESCRICAO: match[2],
        VALOR: match[4].replace(".", "").replace(",", "."),
        D_C: match[5],
      };
    });

  return parsedRows;
};

const createCSV = (data, filename) => {
  const csvHeader = ["DATA", "DESCRIÇÃO", "VALOR", "D/C"];

  const csv = [csvHeader, ...data]
    .map((row) => Object.values(row).join(";"))
    .join("\n");
  fs.writeFileSync(filename, csv);
};

const processDirectory = async (directoryPath) => {
  const files = fs.readdirSync(directoryPath);

  for (let file of files) {
    if (path.extname(file) === ".pdf") {
      let rows = await parsePdf(path.join(directoryPath, file));
      createCSV(rows, `${path.parse(file).name}.csv`);
    }
  }
};
(async () => {
  await processDirectory("../exemplos json csv/");
})();
