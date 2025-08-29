import * as fs from "fs";
import pdfParse from "pdf-parse";
import { summarize } from "./aiengine.js";

/***********************************************************/

export async function processPDF(filePath, account) {
  const fileBuffer = fs.readFileSync(filePath);
  const created=fs.
  const parsed = await pdfParse(fileBuffer, { max: 1 });
  const text = parsed.text;
  if (text.length < 10) {
    console.log(`${filePath}: Invalid PDF content...`);
    return;
  }

  const content = await summarize(text);

  let fileNameShort = filePath.substring(filePath.lastIndexOf("\\") + 1);
  let file = await getQuery(
    `SELECT * FROM files WHERE idfile="${fileNameShort}"`
  );
  let idfile = etUUID();
  if (file.length == 0) {
    await getQuery(
      `INSERT INTO files (idfile, path, filename, created, processed, timestamp)
        VALUES
        ("${idfile}", "${filePath}", "${fileNameShort}", "${sqlDate(
        new Date()
      )}", 0, "${sqlDate(new Date())}");`
    );
  }

  let doc = await getQuery(`SELECT * FROM docs WHERE idref="${idfile}" AND source="F"`);
  if (doc.length == 0) {
    await getQuery(
      `INSERT INTO docs (iddoc, idref, source, account, title, content, attachments, origin, destination, created, processed) 
        VALUES 
        ("${getUUID()}", "${idfile}", "F", "${account.user}", "${
        fileNameShort
      }", "${content}", "", "", "${
        
      }", "${sqlDate(new Date(email.created))}", "${sqlDate(new Date())}");`
    );
    await getQuery(
      `UPDATE emails SET processed=1 WHERE idemail="${email.idemail}"`
    );
  } else {
    await getQuery(
      `UPDATE docs SET title="${
        email.subject
      }", content="${content}", attachments="${email.attachments}", origin="${
        email.origin
      }", destination="${email.destination}", processed="${sqlDate(new Date())}"
        WHERE idref="${email.idemail}";`
    );
    await getQuery(
      `UPDATE emails SET processed=1 WHERE idemail="${email.idemail}"`
    );
  }
}
