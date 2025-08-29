import Pop3Command from "node-pop3";
import { simpleParser } from "mailparser";
import { convert } from "html-to-text";
import mailAccounts from "./mailaccounts.json" with { type: "json" };
import { summarize } from "./aiengine.js";
import {
  readData,
  writeData,
  fileExists,
} from "./utils.js";
import { createDocRecordFromEmailRecord, createEmailRecord, getUnprocessedEmailRecords, saveLatestEmailInfo } from "./dbengine.js";

//let oldmail = [{ msgNum: 441, uid: "UID740-1747990756", size: 101245 }]; // from database

/***********************************************************/

export const analyzeEmail = async () => {
  for (const account of mailAccounts) {
    console.log("\n");
    console.log(`Mail account: ${account.user}`);
    let m = await downloadEmails(account);
    console.log(`New emails: ${m.length}`);
    await processEmail(account);
    console.log(`Done with ${account.user}.\n`);
  }
  console.log(`Done all...`);
};

/***********************************************************/

export const processEmail = async (account) => {
  let emails = await getUnprocessedEmailRecords(account);
  console.log(`Unprocessed emails: ${emails.length}`);
  if (emails.length > 0) console.log("Processing emails...");
  for (const email of emails) {
    let text = decodeURI(email.body);
    let content = (await summarize(text)).replaceAll(`"`, `'`);

    console.log(`${email.origin}\n${content}`);
    if (email.attachments.length > 0)
      console.log(`Attachments: ${email.nAttachments}`);
    console.log("\n");

    createDocRecordFromEmailRecord(email);
  }
};

/***********************************************************/

export const saveEmails = async (account, mails) => {
  if (mails && mails.length > 0) {
    for (const m of mails) {

      let subject = m.subject
        .replace(/"/g, "'")
        .replace(/\\/g, "\\\\")
        .replace(/\0/g, "\\0");
      subject = encodeURI(subject);

      let body = "";
      if (m.body)
        body = m.body
          .substring(0, 2000)
          .replace(/#/g, "'")
          .replace(/\\/g, "\\\\")
          .replace(/\0/g, "\\0");
      body = encodeURI(body).substring(0, 4000);

      let attachments = m.attachments.map((a) => {
        if (a.filename && a.filename.indexOf(".") > 1) return a.filename;
        else return false;
      });
      attachments = attachments.filter((a) => a !== false).join(",");

      await createEmailRecord(
        account.user,
        subject,
        body,
        attachments,
        m
      );
    }
  }
};

/***********************************************************/

export const downloadEmails = async (account) => {
  let newEmails = new Array();
  let pop3 = new Pop3Command(account);
  let newEmailIDs = await downloadEmailsIDs(pop3);
  if (newEmailIDs.length > 0) {
    let n = await readMailMessages(pop3, newEmailIDs);
    newEmails = newEmails.concat(n);
  }
  await pop3.QUIT();
  if (newEmailIDs.length > 0) {
    let latest = newEmailIDs[0];
    await saveLatestEmailInfo(account, latest);
    await saveEmails(account, newEmails);
  }
  return newEmails;
};

/***********************************************************/

export const downloadEmailsIDs = async (pop3) => {
  const list = await pop3.LIST();
  const uidl = await pop3.UIDL();
  const uidlFile = `./data/uidl_${pop3.user}.json`;
  if (!fileExists(uidlFile)) writeData([], uidlFile);

  uidl.forEach((x) => {
    x.msgNum = x[0];
    x.uuid = x[1];
  });

  list.forEach((x) => {
    x.msgNum = x[0];
    x.size = x[1];
    x.uuid = uidl.filter((y) => y.msgNum == x[0])[0].uuid;
  });

  const res = list
    .map(({ msgNum, size, uuid }) => ({
      msgNum,
      size,
      uuid,
    }))
    .sort((a, b) => {
      return b.msgNum - a.msgNum;
    });

  let uidlOld = readData(uidlFile);
  let uidlNew = new Array();

  res.forEach((e) => {
    if (uidlOld.filter((val) => val.uuid === e.uuid).length == 0) {
      uidlNew.push(e);
    }
  });

  uidlOld.push(...uidlNew);
  writeData(uidlOld, uidlFile);

  return uidlNew;
};

/***********************************************************/

export const readMailHeaders = async (pop3, mails) => {
  let newmail = [];
  for (let i = 0; i < mails.length; i++) {
    const str = await pop3.RETR(mails[i].msgNum);
    let parsedEmail = await simpleParser(str);
    newmail.push({
      msgNum: mails[i].msgNum,
      uuid: mails[i].uuid,
      from: parsedEmail.from.value[0].address,
      subject: parsedEmail.subject,
      date: parsedEmail.date,
    });
  }
  return newmail;
};

/***********************************************************/

export const readMailMessages = async (pop3, mails) => {
  let newmail = [];
  for (let i = 0; i < mails.length; i++) {
    const str = await pop3.RETR(mails[i].msgNum);
    let parsedEmail = await simpleParser(str);
    newmail.push({
      msgNum: mails[i].msgNum,
      uuid: mails[i].uuid,
      size: mails[i].size,
      from: parsedEmail.from.value[0].address,
      to: parsedEmail.to.value[0].address,
      subject: parsedEmail.subject,
      date: parsedEmail.date,
      body:
        parsedEmail.text?.trim() != ""
          ? parsedEmail.text.trim()
          : convert(parsedEmail.html, {
              wordwrap: 130,
            }),
      attachments: parsedEmail.attachments,
    });
    console.log(`Reading email from: ${parsedEmail.from.value[0].address}`);
  }
  return newmail;
};

/***********************************************************/

export const getSingleHeader = async (pop3, msgNum) => {
  const str = await pop3.TOP(msgNum, 0);
  let parsedEmail = await simpleParser(str);
  return parsedEmail;
};

/***********************************************************/

export const getSingleMail = async (pop3, msgNum) => {
  const str = await pop3.RETR(msgNum);
  let parsedEmail = await simpleParser(str);
  return parsedEmail;
};

/***********************************************************/

export const uidlMail = async (pop3) => {
  const list = await pop3.UIDL();
  return list;
};

/***********************************************************/

export const listMail = async (pop3) => {
  const list = await pop3.LIST();
  return list;
};
