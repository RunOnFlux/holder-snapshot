const axios = require('axios');
const path = require('path');
const fs = require('fs');

const holders = [];

function writeToFileSync(filepath, args) {
  const flag = 'w';
  const fd = fs.openSync(filepath, flag);
  fs.writeSync(fd, args);
  fs.closeSync(fd);
}

const node = 'https://mainnet-idx.algonode.cloud';
async function start(assetId) {
  try {
    const url = `${node}/v2/assets/${assetId}/balances?limit=100000`;
    const response = await axios.get(url);
    let total = 0;
    console.log(response.data.balances.length);
    response.data.balances.forEach((holder) => {
      if (Number(holder.amount) > 0) {
        total += Number(holder.amount / (10 ** 8));
        holders.push(
          {
            address: holder.address,
            amount: holder.amount,
          },
        );
      }
    });
    const homeDirPath = path.join(__dirname, './export/');
    const filepath = `${homeDirPath}algolist.json`;
    console.log(`Done Algorand - ${holders.length} records found. Exported at ${filepath}. Total Flux-ALGO: ${total.toLocaleString()} (${total})`);
    writeToFileSync(filepath, JSON.stringify(holders, null, 2));
  } catch (error) {
    console.log('ERRORED ALGO');
    console.log(error);
  }
}

module.exports = { start };
