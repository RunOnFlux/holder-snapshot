const path = require('path');
const fs = require('fs');

const solana = require('./solana');
const tron = require('./tron');
const eth = require('./eth');
const bsc = require('./bsc');
const avax = require('./avax');
const erg = require('./erg');
const matic = require('./matic');
// algo

// Create export folder if not exists
const homeDirPath = path.join(__dirname, './export');
if (!fs.existsSync(homeDirPath)) {
  fs.mkdirSync(homeDirPath);
}

// change below for correct contracts
const solanaMint = 'FLUX1wa2GmbtSB6ZGi2pTNbVCw3zEeKnaPCkPtFXxqXe'; // Flux-sol
const tronContract = 'TWr6yzukRwZ53HDe3bzcC8RCTbiKa4Zzb6'; // Flux-tron
const ethContract = '0x720cd16b011b987da3518fbf38c3071d4f0d1495';
const bscContract = '0xaff9084f2374585879e8b434c399e29e80cce635';
const avaxContract = '0xc4B06F17ECcB2215a5DBf042C672101Fc20daF55';
const ergContract = 'e8b20745ee9d18817305f32eb21015831a48f02d40980de6e849f886dca7f807';
const maticContract = '0xA2bb7A68c46b53f6BbF6cC91C865Ae247A82E99B';

// solana.start(solanaMint);
// tron.start(tronContract);
// eth.start(ethContract);
bsc.start(bscContract);
// avax.start(avaxContract);
// erg.start(ergContract);
// matic.start(maticContract);