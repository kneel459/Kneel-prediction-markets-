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
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h"
    );
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    // Return mock data if API fails or rate limited
    return [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        current_price: 65432.12,
        price_change_percentage_24h: 2.4,
        market_cap: 1200000000000,
        total_volume: 35000000000,
        sparkline_in_7d: { price: Array.from({ length: 24 }, () => 60000 + Math.random() * 10000) }
      },
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        current_price: 3456.78,
        price_change_percentage_24h: -1.2,
        market_cap: 400000000000,
        total_volume: 15000000000,
        sparkline_in_7d: { price: Array.from({ length: 24 }, () => 3000 + Math.random() * 1000) }
      }
    ];
  }
}
