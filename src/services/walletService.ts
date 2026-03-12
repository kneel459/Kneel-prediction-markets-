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
  // Check if we are on mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (!window.keplr) {
    if (isMobile) {
      // If on mobile and no keplr object, we might need to redirect to the in-app browser
      // or suggest using the Keplr app. 
      // For now, we'll throw a specific error that we can handle in the UI.
      throw new Error("Keplr not detected. If you are on mobile, please open this site inside the Keplr Mobile App browser.");
    }
    throw new Error("Keplr extension not found. Please install it from keplr.app");
  }

  try {
    await window.keplr.experimentalSuggestChain(LUNC_CONFIG);
  } catch (e) {
    console.warn("Failed to suggest chain", e);
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
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const station = window.station || window.terraStation;
  
  if (!station) {
    if (isMobile) {
      throw new Error("Galaxy Station not detected. Please open this site inside the Galaxy Station Mobile App browser.");
    }
    throw new Error("Galaxy Station extension not found. Please install it from the Chrome Web Store.");
  }

  try {
    const info = await station.connect();
    if (!info || !info.address) {
      throw new Error("Connection rejected or failed");
    }

    return {
      address: info.address,
      name: "Galaxy User",
      walletType: 'galaxy'
    };
  } catch (e: any) {
    throw new Error(e.message || "Failed to connect to Galaxy Station");
  }
}

export async function connectLuncdash(): Promise<WalletInfo> {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  // Luncdash often uses the station provider or its own injected provider
  const provider = (window as any).luncdash || window.station || window.terraStation;
  
  if (!provider) {
    if (isMobile) {
      throw new Error("Luncdash not detected. Please open KNEEL inside the Luncdash Mobile App browser.");
    }
    throw new Error("Luncdash provider not found.");
  }

  try {
    const info = await provider.connect();
    return {
      address: info.address,
      name: "Luncdash User",
      walletType: 'galaxy' // Reusing galaxy type for styling
    };
  } catch (e: any) {
    throw new Error(e.message || "Failed to connect to Luncdash");
  }
}
