'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import OpportunityCard from '@/components/OpportunityCard';
import { ArbitrageOpportunity } from '@/lib/types';
import { 
  Zap, 
  TrendingUp, 
  Calculator, 
  Clock, 
  DollarSign,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Shield,
  Smartphone
} from 'lucide-react';

export default function Home() {
  const [featuredDeals, setFeaturedDeals] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/opportunities?demo=true');
        const data = await res.json();
        // Get top 3 profitable deals
        setFeaturedDeals(data.opportunities.filter((o: ArbitrageOpportunity) => o.netProfit > 5).slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);
  
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-green-900/20"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6">
              <Zap size={16} />
              Pokemon Card Arbitrage Tool
            </div>
            
            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find Profitable
              <span className="gradient-text"> Pokemon Card </span>
              Flips Instantly
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Stop wasting hours comparing prices. DealFlow automatically finds cards 
              selling cheap on TCGPlayer that flip for profit on eBay — with real 
              profit numbers after all fees.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/opportunities"
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl text-white font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                Find Deals Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/calculator"
                className="flex items-center gap-2 px-8 py-4 bg-gray-800 rounded-xl text-white font-semibold text-lg hover:bg-gray-700 transition-colors"
              >
                <Calculator size={20} />
                Profit Calculator
              </Link>
            </div>
            
            {/* Social proof */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <span>Real-time prices</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <span>Accurate fee calc</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <span>Mobile-friendly</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Value Props */}
      <section className="py-20 border-t border-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Why Flippers Love DealFlow
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Built specifically for Pokemon card arbitrage — not generic price tracking
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real Profit Numbers</h3>
              <p className="text-gray-400">
                We calculate profit after eBay&apos;s 13.25% fee, transaction fees, and shipping. 
                No surprises when you sell.
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">TCG → eBay Arbitrage</h3>
              <p className="text-gray-400">
                Compare TCGPlayer buy prices to eBay sold prices. Find the sweet spot 
                where demand exceeds supply.
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Clock className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Save Hours Daily</h3>
              <p className="text-gray-400">
                Stop manually checking prices on both sites. See all opportunities 
                at a glance, sorted by profit.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Deals Preview */}
      <section className="py-20 bg-gray-950/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                🔥 Hot Opportunities
              </h2>
              <p className="text-gray-400">Top profitable flips found right now</p>
            </div>
            <Link 
              href="/opportunities"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all deals
              <ArrowRight size={16} />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800 animate-pulse">
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="h-16 bg-gray-800 rounded"></div>
                    <div className="h-16 bg-gray-800 rounded"></div>
                  </div>
                  <div className="h-12 bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {featuredDeals.map((deal) => (
                <OpportunityCard key={deal.id} opportunity={deal} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 border-t border-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How DealFlow Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: BarChart3, title: 'Scan Prices', desc: 'We monitor TCGPlayer listings and eBay sold prices' },
              { step: '2', icon: Calculator, title: 'Calculate Profit', desc: 'Real profit after all fees (13.25% + shipping)' },
              { step: '3', icon: Shield, title: 'Assess Risk', desc: 'See sales volume and price volatility' },
              { step: '4', icon: Smartphone, title: 'Buy & Flip', desc: 'Execute the deal and pocket the profit' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                  <div className="relative w-16 h-16 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center">
                    <Icon className="text-blue-400" size={24} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900/30 via-gray-900 to-green-900/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Finding Profitable Flips Today
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join smart Pokemon card flippers who use data to maximize their profits
          </p>
          <Link 
            href="/opportunities"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl text-white font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            <Zap size={20} />
            Find Deals Now
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t border-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <span className="font-bold text-white">
                Deal<span className="text-green-400">Flow</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Built for Pokemon card flippers. Not affiliated with TCGPlayer or eBay.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
