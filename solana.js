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

function start(mint) {
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
