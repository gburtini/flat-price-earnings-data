import { writeJSON, readTXT } from "https://deno.land/x/flat@0.0.14/mod.ts";
import { cheerio } from "https://deno.land/x/cheerio@1.0.4/mod.ts";

const outputFilename = "./data.json";
const inputFileName = "./spx-pe.html";

try {
  const html = readTXT(inputFileName);
  const $ = cheerio.load(html);

  const rows = $("#datatable tr");
  const data = rows.each((_, row) => {
    const [left, right] = $(row).find("td");
    const note = $($(right).find("span")[0]).text();
    $(right).find("span").remove();
    const value = $(right).text();

    return {
      date: $(left).text(),
      value,
      note,
    };
  });

  console.log(data.length);

  await writeJSON(outputFilename, data);
} catch (error) {
  console.log(error);
}
