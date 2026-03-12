import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Brain, 
  BarChart3, 
  RefreshCw, 
  Search,
  ChevronRight,
  Zap,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { fetchTopCoins, CryptoPrice } from './services/marketData';
import { analyzeMarket, MarketAnalysis } from './services/geminiService';
import { connectKeplr, connectGalaxyStation, connectLuncdash, WalletInfo } from './services/walletService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [coins, setCoins] = useState<CryptoPrice[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<CryptoPrice | null>(null);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const handleConnectWallet = async (type: 'keplr' | 'galaxy' | 'luncdash') => {
    setWalletError(null);
    try {
      let info: WalletInfo;
      if (type === 'keplr') {
        info = await connectKeplr();
      } else if (type === 'galaxy') {
        info = await connectGalaxyStation();
      } else {
        info = await connectLuncdash();
      }
      setWallet(info);
      setShowWalletModal(false);
    } catch (err: any) {
      setWalletError(err.message || "Failed to connect wallet");
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchTopCoins();
    setCoins(data);
    if (!selectedCoin && data.length > 0) {
      setSelectedCoin(data[0]);
    }
    setLoading(false);
  };

  const handleAnalyze = async () => {
    if (!selectedCoin) return;
    setAnalyzing(true);
    const result = await analyzeMarket(selectedCoin.name, selectedCoin.sparkline_in_7d?.price || []);
    setAnalysis(result);
    setAnalyzing(false);
  };

  useEffect(() => {
    if (selectedCoin) {
      setAnalysis(null);
    }
  }, [selectedCoin]);

  const chartData = selectedCoin?.sparkline_in_7d?.price.map((price, index) => ({
    time: index,
    price: price
  })) || [];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight">KNEEL</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#" className="hover:text-white transition-colors">Markets</a>
            <a href="#" className="hover:text-white transition-colors">Predictions</a>
            <a href="#" className="hover:text-white transition-colors">Portfolio</a>
            <a href="#" className="hover:text-white transition-colors">Signals</a>
          </div>
          
          {wallet ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{wallet.walletType}</span>
                <span className="text-xs font-bold text-emerald-500">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
              </div>
              <button 
                onClick={disconnectWallet}
                className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white/10 transition-all"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowWalletModal(true)}
              className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-400 transition-all"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      {/* Wallet Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWalletModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md glass-card p-8 space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Connect to KNEEL</h2>
                <p className="text-sm text-white/40">Select your wallet (Desktop or Mobile In-App Browser)</p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-1">Keplr Ecosystem</div>
                <button 
                  onClick={() => handleConnectWallet('keplr')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1e1e1e] rounded-xl flex items-center justify-center">
                      <img src="https://raw.githubusercontent.com/chainapsis/keplr-wallet/master/packages/extension/src/public/assets/img/icon-128.png" className="w-6 h-6" alt="Keplr" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Keplr Wallet</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Desktop & Mobile</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-emerald-500 transition-colors" />
                </button>

                <div className="text-[10px] uppercase tracking-widest text-white/20 font-bold mt-4 mb-1">Terra Classic Native</div>
                <button 
                  onClick={() => handleConnectWallet('galaxy')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1e1e1e] rounded-xl flex items-center justify-center overflow-hidden">
                      <img src="https://assets.terra.money/icon/station-extension/icon.png" className="w-full h-full object-cover" alt="Galaxy Station" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Galaxy Station</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Desktop & Mobile</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-emerald-500 transition-colors" />
                </button>

                <div className="text-[10px] uppercase tracking-widest text-white/20 font-bold mt-4 mb-1">Community Wallets</div>
                <button 
                  onClick={() => handleConnectWallet('luncdash')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1e1e1e] rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Luncdash Wallet</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Mobile App</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-emerald-500 transition-colors" />
                </button>
              </div>

              {walletError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
                  <p className="text-rose-500 text-xs font-bold text-center">{walletError}</p>
                  {walletError.includes("Mobile App browser") && (
                    <div className="pt-2 border-t border-rose-500/10 flex flex-col gap-2">
                      <p className="text-[10px] text-white/60 text-center">To connect on mobile, copy this URL and paste it into the browser inside your Wallet App.</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert("URL copied to clipboard!");
                        }}
                        className="text-[10px] bg-white/10 py-1 rounded hover:bg-white/20 transition-colors"
                      >
                        Copy App URL
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={() => setShowWalletModal(false)}
                className="w-full text-xs text-white/40 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Market List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                Live Markets
              </h2>
              <button onClick={loadData} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <RefreshCw className={cn("w-4 h-4 text-white/40", loading && "animate-spin")} />
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            <div className="space-y-1 max-h-[600px] overflow-y-auto custom-scrollbar">
              {coins.map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => setSelectedCoin(coin)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                    selectedCoin?.id === coin.id ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                      {coin.symbol.toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm">{coin.name}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider font-mono">{coin.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">${coin.current_price.toLocaleString()}</div>
                    <div className={cn(
                      "text-[10px] font-bold flex items-center justify-end gap-1",
                      coin.price_change_percentage_24h >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chart & Analysis */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Chart Section */}
          <div className="glass-card p-6 min-h-[400px] flex flex-col">
            {selectedCoin ? (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-3xl font-bold">{selectedCoin.name}</h1>
                      <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono text-white/60 uppercase tracking-widest">{selectedCoin.symbol} / USD</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-mono text-emerald-400">${selectedCoin.current_price.toLocaleString()}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold",
                        selectedCoin.price_change_percentage_24h >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}{selectedCoin.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="flex items-center gap-2 bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all disabled:opacity-50"
                    >
                      {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                      AI Analysis
                    </button>
                  </div>
                </div>

                <div className="flex-1 h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        orientation="right" 
                        tick={{fill: '#ffffff40', fontSize: 10}} 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `$${val.toLocaleString()}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#10b981' }}
                        labelStyle={{ display: 'none' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/20">
                Select an asset to view analysis
              </div>
            )}
          </div>

          {/* AI Insights Section */}
          <AnimatePresence mode="wait">
            {analysis ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/[0.02]">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold">Prediction Engine</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/40">Market Outlook</span>
                      <span className={cn(
                        "px-3 py-1 rounded-lg font-bold text-sm",
                        analysis.prediction === 'Bullish' ? 'bg-emerald-500/20 text-emerald-500' : 
                        analysis.prediction === 'Bearish' ? 'bg-rose-500/20 text-rose-500' : 'bg-white/10 text-white'
                      )}>
                        {analysis.prediction}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/40">Confidence Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-1000" 
                            style={{ width: `${analysis.confidence}%` }} 
                          />
                        </div>
                        <span className="font-mono text-sm">{analysis.confidence}%</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-sm text-white/70 leading-relaxed italic">
                        "{analysis.reasoning}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold">Key Technical Levels</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Resistance Zones</span>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keyLevels.resistance.map((level, i) => (
                          <span key={i} className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg font-mono text-xs border border-rose-500/20">
                            ${level.toLocaleString()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Support Zones</span>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keyLevels.support.map((level, i) => (
                          <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg font-mono text-xs border border-emerald-500/20">
                            ${level.toLocaleString()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/40">Market Sentiment</span>
                        <span className="text-emerald-400 font-medium">{analysis.sentiment}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : analyzing ? (
              <div className="glass-card p-12 flex flex-col items-center justify-center gap-4 text-white/40">
                <Activity className="w-12 h-12 animate-pulse text-emerald-500" />
                <div className="text-center">
                  <h3 className="text-white font-bold mb-1">Gemini AI is processing...</h3>
                  <p className="text-xs">Analyzing historical patterns and market sentiment</p>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 flex flex-col items-center justify-center gap-4 text-white/20 border-dashed">
                <Brain className="w-12 h-12" />
                <div className="text-center">
                  <h3 className="font-bold mb-1">No Active Analysis</h3>
                  <p className="text-xs max-w-xs mx-auto">Click the "AI Analysis" button above to generate a market prediction for {selectedCoin?.name || 'the selected asset'}.</p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Market Cap', value: `$${(selectedCoin?.market_cap || 0).toLocaleString()}`, icon: Globe },
              { label: '24h Volume', value: `$${(selectedCoin?.total_volume || 0).toLocaleString()}`, icon: Activity },
              { label: 'Circulating Supply', value: '19.6M BTC', icon: ShieldCheck },
              { label: 'All-Time High', value: '$73,737', icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2 text-white/40">
                  <stat.icon className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">{stat.label}</span>
                </div>
                <div className="font-mono text-sm truncate">{stat.value}</div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <footer className="border-t border-white/5 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Zap className="w-5 h-5 text-emerald-500 fill-current" />
            <span className="font-bold text-lg tracking-tight">KNEEL</span>
          </div>
          <div className="flex gap-8 text-xs font-medium text-white/40">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">API Reference</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
          <div className="text-[10px] font-mono text-white/20">
            &copy; 2026 KNEEL AI ENGINE. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
