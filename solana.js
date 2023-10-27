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

let solscanData = [];

async function createSolScanSnapshot(mint, offset = 0, size = 50) {
  try {
    const URL = `https://api.solscan.io/token/holders?token=${mint}&offset=${offset}&size=${size}`;
    const response = await axios.get(URL);
    const holderData = response.data.data.result;
    if (holderData.length > 0) {
      solscanData.push(...holderData);
      createSolScanSnapshot(mint, offset + size, size);
    } else {
      let total = 0;
      let totalSats = 0;
      solscanData.forEach((holder) => {
        if (Number(holder.amount) > 0) {
          total += Number(holder.amount / (10 ** holder.decimals));
          totalSats += Number(holder.amount);
        }
      });
      const homeDirPath = path.join(__dirname, './export/');
      const filepath = `${homeDirPath}solscan.json`;
      console.log(`Done Solana SOLSCAN - ${solscanData.length} records found. Exported at ${filepath}. Total Flux-SOL: ${total.toLocaleString()} (${total}). Sats: ${totalSats.toLocaleString()} (${totalSats})`);
      writeToFileSync(filepath, JSON.stringify(solscanData, null, 2));
    }
  } catch (error) {
    console.log(error);
  }
}

function start(mint) {
  solscanData = [];
  createSolScanSnapshot(mint);
  axios.post('https://frequent-tame-diamond.solana-mainnet.quiknode.pro', {
    jsonrpc: '2.0',
    id: 1,
    method: 'getProgramAccounts',
    params: [
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      {
        encoding: 'jsonParsed',
        filters: [
          {
            dataSize: 165,
          },
          {
            memcmp: {
              offset: 0,
              bytes: mint,
            },
          },
        ],
      },
    ],
  }).then((response) => {
    let total = 0;
    response.data.result.forEach((holder) => {
      if (Number(holder.account.data.parsed.info.tokenAmount.amount) > 0) {
        total += Number(holder.account.data.parsed.info.tokenAmount.amount / (10 ** holder.account.data.parsed.info.tokenAmount.decimals));
        holders.push(
          {
            address: holder.pubkey,
            owner: holder.account.data.parsed.info.owner,
            amount: Number(holder.account.data.parsed.info.tokenAmount.amount),
            decimals: holder.account.data.parsed.info.tokenAmount.decimals,
          },
        );
      }
    });
    const homeDirPath = path.join(__dirname, './export/');
    const filepath = `${homeDirPath}solanalist.json`;
    console.log(`Done Solana - ${holders.length} records found. Exported at ${filepath}. Total Flux-SOL: ${total.toLocaleString()} (${total})`);
    writeToFileSync(filepath, JSON.stringify(holders, null, 2));
  });
}

module.exports = { start };
