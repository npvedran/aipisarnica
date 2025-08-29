import { dbConnectionDetails } from "./config.js";
import { analyzeEmail } from "./mailagent.js";
import mysql from "mysql";

global.con = mysql.createConnection(dbConnectionDetails);

await analyzeEmail();

process.exit(0);
