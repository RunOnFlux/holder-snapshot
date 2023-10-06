const axios = require('axios');
const path = require('path');
const fs = require('fs');

const headers = {
  'TRON-PRO-API-KEY': '64fcfd69-f3b3-45b0-8c56-718a4bf33e54',
  'Content-Type': 'application/json',
};

const decimals = 8;
const holders = [];

function writeToFileSync(filepath, args) {
  const flag = 'w';
  const fd = fs.openSync(filepath, flag);
  fs.writeSync(fd, args);
  fs.closeSync(fd);
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function followNext(link) {
  // eslint-disable-next-line no-await-in-loop
  await delay(50);
  const response = await axios.get(link, headers);
  holders.push(...response.data.data);
  if (response.data.meta && response.data.meta.links) {
    const nextLink = response.data.meta.links.next;
    await followNext(nextLink);
  }
}

async function start(contract) {
  axios.get(`https://api.trongrid.io/v1/contracts/${contract}/tokens?limit=200`, headers)
    .then(async (response) => {
      holders.push(...response.data.data);
      if (response.data.meta && response.data.meta.links) {
        const nextLink = response.data.meta.links.next;
        await followNext(nextLink);
      }
      let total = 0;
      holders.forEach((holder) => {
        const amount = Number(Object.values(holder)[0]);
        total += Number(amount / (10 ** decimals));
      });
      const homeDirPath = path.join(__dirname, './export/');
      const filepath = `${homeDirPath}tronlist.json`;
      console.log(`Done Tron - ${holders.length} records found. Exported at ${filepath}. Total Flux-TRON: ${total.toLocaleString()} (${total}).`);
      writeToFileSync(filepath, JSON.stringify(holders, null, 2));
    });
}

module.exports = { start };
