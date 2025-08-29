import { dbConnectionDetails } from "./config.js";
import { analyzeMail } from "./mailagent.js";
import mysql from "mysql";

global.con = mysql.createConnection(dbConnectionDetails);

await analyzeMail();

process.exit(0);
