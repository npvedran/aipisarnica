import { apiURL } from "./config.js";
import chalk from "chalk";

const getDocs = async (account) => {
  return fetch(`${apiURL}/docs/${account}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .catch((error) => {
      return Promise.reject();
    });
};

const postData = async (url, postData, token) => {
  return fetch(`${apiURL}/${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .catch((error) => {
      return Promise.reject();
    });
};

await getDocs("vedran@net-projekt.hr").then((data) => {
  if (data.length == 0) {
    console.log(chalk.red("No documents found"));
    return;
  }
  for (const d of data) {
    let date = new Date(d.created);
    console.log(chalk.green(date.toLocaleString("hr-HR")));
    console.log(`${chalk.yellow(d.origin)} --> ${chalk.red(d.destination)}`);
    console.log(chalk.blue(decodeURI(d.title)));
    console.log(chalk.white(d.content));
    console.log(chalk.magenta(d.attachments));
    console.log("\n");
  }
  //console.log(data);
});
