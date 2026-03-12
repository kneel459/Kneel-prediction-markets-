import { Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
  interface Window extends KeplrWindow {
    terraStation?: any;
    station?: any;
  }
}

export interface WalletInfo {
  address: string;
  name: string;
  walletType: 'keplr' | 'galaxy';
}

const LUNC_CHAIN_ID = "columbus-5";

export const LUNC_CONFIG = {
  chainId: LUNC_CHAIN_ID,
  chainName: "Terra Luna Classic",
  rpc: "https://terra-classic-rpc.publicnode.com",
  rest: "https://terra-classic-lcd.publicnode.com",
  bip44: {
    coinType: 330,
  },
  bech32Config: {
    bech32PrefixAccAddr: "terra",
    bech32PrefixAccPub: "terrapub",
    bech32PrefixValAddr: "terravaloper",
    bech32PrefixValPub: "terravaloperpub",
    bech32PrefixConsAddr: "terravalcons",
    bech32PrefixConsPub: "terravalconspub",
  },
  currencies: [
    {
      coinDenom: "LUNC",
      coinMinimalDenom: "uluna",
      coinDecimals: 6,
      coinGeckoId: "terra-luna",
    },
    {
      coinDenom: "USTC",
      coinMinimalDenom: "uusd",
      coinDecimals: 6,
      coinGeckoId: "terrausd",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "LUNC",
      coinMinimalDenom: "uluna",
      coinDecimals: 6,
      coinGeckoId: "terra-luna",
      gasPriceStep: {
        low: 28.325,
        average: 28.325,
        high: 28.325,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "LUNC",
    coinMinimalDenom: "uluna",
    coinDecimals: 6,
    coinGeckoId: "terra-luna",
  },
};

export async function connectKeplr(): Promise<WalletInfo> {
  if (!window.keplr) {
    throw new Error("Keplr extension not found");
  }

  // Suggest chain if not added
  try {
    await window.keplr.experimentalSuggestChain(LUNC_CONFIG);
  } catch (e) {
    console.warn("Failed to suggest chain, it might already exist", e);
  }

  await window.keplr.enable(LUNC_CHAIN_ID);
  const offlineSigner = window.keplr.getOfflineSigner(LUNC_CHAIN_ID);
  const accounts = await offlineSigner.getAccounts();
  const key = await window.keplr.getKey(LUNC_CHAIN_ID);

  return {
    address: accounts[0].address,
    name: key.name,
    walletType: 'keplr'
  };
}

export async function connectGalaxyStation(): Promise<WalletInfo> {
  // Galaxy Station often uses the 'station' or 'terraStation' object
  const station = window.station || window.terraStation;
  
  if (!station) {
    throw new Error("Galaxy Station / Terra Station extension not found");
  }

  // Request connection
  const info = await station.connect();
  
  if (!info || !info.address) {
    throw new Error("Failed to connect to Galaxy Station");
  }

  return {
    address: info.address,
    name: "Galaxy User",
    walletType: 'galaxy'
  };
}
