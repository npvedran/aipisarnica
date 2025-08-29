import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

const __filename = ".";
const __dirname = path.dirname(__filename);

export const getUUID = () => {
  var id = uuidv4().substring(24, 36);
  return id;
};

export const readFile = (filePath) => {
  const data = fs.readFileSync(path.join(__dirname, `.`, filePath));
  return data;
};

export const writeFile = (data, filePath) => {
  fs.writeFileSync(filePath, data);
};

export const readData = (filePath) => {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

export const writeData = (data, filePath) => {
  const dataJSON = JSON.stringify(data);
  fs.writeFileSync(filePath, dataJSON);
};

export const copyFile = (f1, f2) => {
  fs.copyFileSync(
    path.join(__dirname, ".", f1),
    path.join(__dirname, ".", f2),
    fs.constants.COPYFILE_EXCL
  );
};

export const deleteFile = (f1) => {
  fs.unlinkSync(path.join(__dirname, ".", f1));
};

export const fileExists = (f1) => {
  return fs.existsSync(path.join(__dirname, ".", f1));
};

export const deleteFolder = (d1) => {
  fs.rmSync(path.join(__dirname, ".", d1), { recursive: true, force: true });
};

export const createFolder = (d1) => {
  if (!fs.existsSync(path.join(__dirname, ".", d1))) {
    fs.mkdirSync(path.join(__dirname, ".", d1));
  }
};

export const testDate = (date) => {
  var m = date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  return m ? new Date(m[3], m[2] - 1, m[1]) : null;
};

export const getFiles = (d) => {
  let filePath = path.join(__dirname, `.`, d, `/`);
  const ret = [];
  fs.readdirSync(filePath, { withFileTypes: true })
    .filter((item) => !item.isDirectory())
    .filter((item) => item.name.indexOf(" copy") < 0)
    .map((item) => ret.push({ name: `${item.name}` }));
  return ret;
};
