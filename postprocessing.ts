import {
  writeJSON,
  readTXT,
  removeFile,
} from "https://deno.land/x/flat@0.0.14/mod.ts";
import { cheerio } from "https://deno.land/x/cheerio@1.0.4/mod.ts";

const outputFilename = "./data.json";
const inputFileName = Deno.args[0];

try {
  const html = await readTXT(inputFileName);
  const $ = await cheerio.load(html);

  const rows = $("#datatable tr");
  const data = rows
    .map((i, row) => {
      if (i === 0) return;

      const columns = $(row).find("td");
      const left = columns[0];
      const right = columns[1];

      const note = $($(right).find("span")[0]).text();
      $(right).find("span").remove();

      const value = $(right).text().trim();

      const dateFormatted = new Date($(left).text())
        .toISOString()
        .split("T")[0];
      return {
        date: dateFormatted,
        value: parseFloat(value),
        note,
      };
    })
    .get();

  console.log("Successfully processed", data.length, "rows.");

  await writeJSON(outputFilename, data);
  await removeFile(inputFileName);
} catch (error) {
  console.log(error);
}
