import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  BarChart3, 
  Shield, 
  Zap,
  Users,
  Globe,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: "Real-Time Trading",
      description: "Trade forex, crypto, and commodities with live market data"
    },
    {
      icon: BarChart3,
      title: "Advanced Charts",
      description: "Professional trading charts with technical analysis tools"
    },
    {
      icon: Zap,
      title: "Instant Execution",
      description: "Lightning-fast trade execution with no delays"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Bank-level security with encrypted transactions"
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "24/7 customer support from trading professionals"
    },
    {
      icon: Globe,
      title: "Global Markets",
      description: "Access to international markets around the clock"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">EdgeMarket</h1>
              <p className="text-blue-200 text-sm">Multi Trading Platform</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth')}
            className="text-white hover:bg-white/10"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Trade Smarter,
            <br />
            <span className="text-blue-400">Trade Better</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of traders on EdgeMarket's advanced platform. Trade forex, crypto, 
            and commodities with professional tools and real-time market data.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg gap-2"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-600/20 p-3 rounded-lg w-fit mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">$50M+</div>
            <div className="text-slate-300">Trading Volume</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
            <div className="text-slate-300">Active Traders</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
            <div className="text-slate-300">Market Access</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur border-white/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Start Trading?
              </h3>
              <p className="text-slate-300 mb-6">
                Join EdgeMarket today and access professional trading tools, 
                real-time market data, and expert support.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 gap-2"
              >
                Create Account
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-white/20">
        <div className="text-center text-slate-400">
          <p>&copy; 2024 EdgeMarket. All rights reserved.</p>
          <p className="mt-2">Multi Trading Platform - Trade with Confidence</p>
        </div>
      </footer>
    </div>
  );
}
