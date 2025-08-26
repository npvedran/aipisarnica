import { analyzeMail } from "./mailagent.js"
import mysql from "mysql";

global.con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Zeljka3609d3ebd5d",
  database: "repo",
});

await analyzeMail();

process.exit(0);

