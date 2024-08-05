import { readTXT, writeJSON } from "https://deno.land/x/flat@0.0.15/mod.ts";
import { cheerio, CheerioAPI } from "https://deno.land/x/cheerio@1.0.7/mod.ts";

const inputFileName = Deno.args[0];
const outputFileName = inputFileName.replace(".html", ".json");

try {
  const html = await readTXT(inputFileName);
  const $ = cheerio.load(html);

  const table = $("table").first();
  if (table.length !== 1) {
    throw new Error(`Expected exactly one table, but found ${table.length}`);
  }

  const rows = table.find("tr");
  const data = rows
    .map((i, row) => {
      const columns = $(row).find("td");
      if (columns.length === 0) return null;

      const year = $(columns[0]).text().trim();
      const limit = $(columns[1]).text().trim().replace(/[^0-9.]/g, "");

      return {
        year,
        limit: parseFloat(limit),
      };
    })
    .get()
    .filter((row) => row !== null);

  await writeJSON(outputFileName, data, null, 2);
  console.log(`Successfully written to ${outputFileName}`);
} catch (error) {
  console.error(error);
}
