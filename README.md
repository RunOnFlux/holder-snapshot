# holder-snapshot
Captures Holders snapshot for flux on multiple chains

Supported Chains:
Ethereum (ETH)
Binance Smart Chain (BSC)
Solana (SOL)
Tron (TRX)
Avalanche C-Chain (AVAX-C)
Ergo (ERG)

Flux Main Chain - Please reffer to https://github.com/RunOnFlux/fluxd/pull/187
Kadena (KDA) - Reffer to on chain transactions using createsnapshot on all 20 chainIds https://github.com/RunOnFlux/flux-kda/blob/master/flux.pact#L208

---
For data verifications public explorers such as etherscan, solscan, bscscan, tronscan, snowtrace
---
After snapshot, contracts have to be adjusted manually - especially liquidity provider contracts (eg. pancakeswap, uniswap) to properly track liquidity and assign snapshot to actual user