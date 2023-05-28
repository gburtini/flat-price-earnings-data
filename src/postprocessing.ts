import {
  writeJSON,
  readTXT,
  removeFile,
} from "https://deno.land/x/flat@0.0.15/mod.ts";

import { cheerio, CheerioAPI } from "https://deno.land/x/cheerio@1.0.7/mod.ts";

const outputFilename = Deno.args[0].split(".")[0] + ".json";
const inputFileName = Deno.args[0];

try {
  const html = await readTXT(inputFileName);
  const $ = await (cheerio as CheerioAPI).load(html);

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

      const divisor = value.includes("%") ? 100 : 1;
      const valueFormatted =
        parseFloat(value.replace(",", "").replace("%", "")) / divisor;
      return {
        date: dateFormatted,
        value: valueFormatted,
        note,
      };
    })
    .get();

  console.log("Successfully processed", data.length, "rows.");

  await writeJSON("./data/" + outputFilename, data, null, 2);
  await removeFile(inputFileName);
} catch (error) {
  console.log(error);
}
