export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

export async function fetchTopCoins(): Promise<CryptoPrice[]> {
  try {
    // Fetch top coins plus specific LUNC and USTC IDs
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=terra-luna,terrausd,bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,polkadot&order=market_cap_desc&sparkline=true&price_change_percentage=24h"
    );
    if (!response.ok) throw new Error("Failed to fetch");
    const data: CryptoPrice[] = await response.json();
    
    // Sort to ensure LUNC and USTC are at the top if desired, or just keep market cap order
    // Let's bring LUNC and USTC to the very top for the user
    const prioritized = data.sort((a, b) => {
      const priorityIds = ['terra-luna', 'terrausd'];
      const aIndex = priorityIds.indexOf(a.id);
      const bIndex = priorityIds.indexOf(b.id);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0; // Keep original order for others
    });

    return prioritized;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    // Return mock data including LUNC and USTC if API fails
    return [
      {
        id: "terra-luna",
        symbol: "lunc",
        name: "Terra Luna Classic",
        current_price: 0.00009234,
        price_change_percentage_24h: 5.67,
        market_cap: 534000000,
        total_volume: 45000000,
        sparkline_in_7d: { price: Array.from({ length: 24 }, () => 0.00008 + Math.random() * 0.00002) }
      },
      {
        id: "terrausd",
        symbol: "ustc",
        name: "TerraClassicUSD",
        current_price: 0.0214,
        price_change_percentage_24h: -2.1,
        market_cap: 190000000,
        total_volume: 12000000,
        sparkline_in_7d: { price: Array.from({ length: 24 }, () => 0.02 + Math.random() * 0.005) }
      },
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        current_price: 65432.12,
        price_change_percentage_24h: 2.4,
        market_cap: 1200000000000,
        total_volume: 35000000000,
        sparkline_in_7d: { price: Array.from({ length: 24 }, () => 60000 + Math.random() * 10000) }
      }
    ];
  }
}
