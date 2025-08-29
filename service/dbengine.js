import { dbConnectionDetails } from "./config.js";
import mysql from "mysql";

global.con = mysql.createConnection(dbConnectionDetails);

/***********************************************************/

export const sqlDate = (date) => {
  var day = ("0" + date.getDate()).slice(-2);
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var today = date.getFullYear() + "-" + month + "-" + day;
  let timestamp = `${today} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  return timestamp;
};

/***********************************************************/

export const getQuery = async (sql) => {
  return new Promise((resolve, reject) => {
    con.query(sql, (err, result) => {
      if (err) {
        console.log(err.message);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/***********************************************************/

export const getProperDateTimeForMySQL = (timestamp, offset) => {
  let dt = new Date(timestamp);
  if (!offset) offset = 2;
  let res = new Date(dt.setHours(dt.getHours() + offset)).toISOString();
  return res;
};

/***********************************************************/

export const getUnprocessedEmailRecords = async (account) => {
  return await getQuery(
    `SELECT * FROM emails WHERE processed IS NULL OR processed<>1 ORDER BY created`
  );
};

/***********************************************************/

export const createDocRecordFromEmailRecord = async (email) => {
  let doc = await getQuery(`SELECT * FROM docs WHERE idref="${email.idemail}"`);

  if (doc.length == 0) {
    await getQuery(
      `INSERT INTO docs (iddoc, idref, source, account, title, content, attachments, origin, destination, created, processed) 
        VALUES 
        ("${getUUID()}", "${email.idemail}", 'M', "${account.user}", "${
        email.subject
      }", "${content}", "${email.attachments}", "${email.origin}", "${
        email.destination
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
};

/***********************************************************/

export const createEmailRecord = async (
  user,
  subject,
  body,
  attachments,
  mailData
) => {
  var timestamp = sqlDate(new Date());
  let created = sqlDate(new Date(mailData.date));

  await getQuery(
    `INSERT INTO emails (idemail, account, subject, body, attachments, origin, destination, created, timestamp, msgnum, uuid, size, processed) 
        VALUES 
        ("${getUUID()}","${user}", "${subject}", "${body}", "${attachments}", "${
      mailData.from
    }", "${mailData.to}", "${created}", "${timestamp}", ${mailData.msgNum}, "${
      mailData.uuid
    }", ${mailData.size})`,
    0
  );
};

/***********************************************************/

export const getDocs = async (account) => {
  return await getQuery(
    `SELECT * FROM docs WHERE account="${account.user}" ORDER BY created DESC`
  );
};

/***********************************************************/

export const getDoc = async (id) => {
  return await getQuery(`SELECT * FROM docs WHERE iddoc="${id}"`);
};

/***********************************************************/

export const saveLatestEmailInfo = async (account, mail) => {
  let d = await getQuery(
    `SELECT * FROM latestmail where account="${account.user}"`
  );
  if (d.length == 0) {
    await getQuery(
      `INSERT INTO latestmail (idlast, account, lastget) 
        VALUES 
        ("${getUUID()}", "${account.user}", "${sqlDate(new Date())}")`
    );
  } else {
    await getQuery(
      `UPDATE latestmail SET lastget="${sqlDate(new Date())}" WHERE account="${
        account.user
      }"`
    );
  }
};

/***********************************************************/

export const getLatestEmailInfo = async (account) => {
  return await getQuery(
    `SELECT * FROM latestmail where account="${account.user}"`
  );
};
