/* eslint-disable no-param-reassign */
/* eslint-disable radix */
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const BATCH_SIZE = 40000;
const SNOWTRACE_API_KEY = '';

const urls = [
  'https://api.avax.network:443/ext/bc/C/rpc',
];

function writeToFileSync(filepath, args) {
  const flag = 'w';
  const fd = fs.openSync(filepath, flag);
  fs.writeSync(fd, args);
  fs.closeSync(fd);
}

async function getAVAXRPCResponse(method, params = []) {
  const url = urls[Math.floor(Math.random() * urls.length)];
  const data = {
    jsonrpc: '2.0',
    method,
    params,
    id: 1,
  };
  const headers = {
    'Content-Type': 'application/json',
  };
  const response = await axios.post(url, data, headers);
  // console.log(response.data);
  if (!response.data.result) {
    console.log(response.data);
  }
  if (response.data.result.length >= 1000) {
    console.log('WARNING: Max results received - lower the BATCH_SIZE');
  }
  return response.data.result;
}

async function getRPCResponse(params = []) {
  const url = 'https://api.snowtrace.io/api';
  const headers = {
    'Content-Type': 'application/json',
  };
  const response = await axios.get(url, { params }, headers);
  if (!response.data.result) {
    console.log(response.data);
  }
  return response.data.result;
}

async function getContractTransferBlock(contract, fromBlock, toBlock) {
  const transferHash = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  const params = {
    address: contract,
    fromBlock,
    toBlock,
    topic0: transferHash,
    module: 'logs',
    action: 'getLogs',
    apikey: SNOWTRACE_API_KEY,
  };
  const validResponse = false;
  while (!validResponse) {
    // console.log(`From: ${fromBlock} - to: ${toBlock}`);
    // eslint-disable-next-line no-await-in-loop
    const logs = await getRPCResponse(params);
    if (logs) {
      logs.forEach((log) => {
        log.amount = Number.parseInt(log.data);
        log.from = log.topics[1].substring(0, 2) + log.topics[1].substring(26);
        log.to = log.topics[2].substring(0, 2) + log.topics[2].substring(26);
      });
      return logs;
    }
  }
  return [];
}

async function getContractTransfers(contract, fromBlock, toBlock, batchSize = BATCH_SIZE) {
  const fromBlockNum = Number.parseInt(fromBlock);
  const toBlockNum = Number.parseInt(toBlock);
  const logs = [];
  let blockProcessStart = fromBlockNum;
  let blockProcessEnd = (blockProcessStart + batchSize) > toBlockNum ? toBlockNum : (blockProcessStart + batchSize);
  while (blockProcessStart <= toBlockNum) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const blockLogs = await getContractTransferBlock(contract, blockProcessStart, blockProcessEnd);
      if (blockLogs.length >= 1000) {
        blockProcessEnd = Math.ceil(blockProcessEnd - ((blockProcessEnd - blockProcessStart) / 2));
      } else {
        logs.push(...blockLogs);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Fetching contract AVAX TXS from block ${blockProcessStart} to block ${blockProcessEnd}. Remaining Blocks: ${Number(toBlockNum - blockProcessEnd)}`);
        blockProcessStart = blockProcessEnd + 1;
        blockProcessEnd = (blockProcessStart + batchSize) > toBlockNum ? toBlockNum : (blockProcessStart + batchSize);
      }
    } catch (error) {
      console.log('ERRORED');
      console.log(error);
    }
  }
  process.stdout.write('\n');
  return logs;
}

function getBalanceList(transfers) {
  const balances = {};
  transfers.forEach((transfer) => {
    if (transfer.from !== transfer.to) {
      let from = balances[transfer.from] || 0;
      let to = balances[transfer.to] || 0;
      from -= transfer.amount;
      to += transfer.amount;
      balances[transfer.from] = from;
      balances[transfer.to] = to;
    }
  });
  const sortedBalances = [];
  // eslint-disable-next-line no-restricted-syntax, prefer-const
  for (let address in balances) {
    if (balances[address] > 0) {
      sortedBalances.push({ address, balance: balances[address] });
    }
  }
  sortedBalances.sort((a, b) => b.balance - a.balance);
  return sortedBalances;
}

async function start(contract) {
  let balances = [];
  try {
    const blockNum = await getAVAXRPCResponse('eth_blockNumber');
    const transfers = await getContractTransfers(contract, 16826970, blockNum); // 16826970, contract created on 16826973
    balances = await getBalanceList(transfers);
  } catch (error) {
    console.log();
  }

  let total = 0;
  balances.forEach((balance) => {
    total += Number(balance.balance / (10 ** 8));
  });

  const homeDirPath = path.join(__dirname, './export/');
  const filepath = `${homeDirPath}avaxlist.json`;
  console.log(`Done AVAX - ${balances.length} records found. Exported at ${filepath}. Total Flux-AVAX: ${total.toLocaleString()} (${total}).`);
  writeToFileSync(filepath, JSON.stringify(balances, null, 2));
}

module.exports = { start };
