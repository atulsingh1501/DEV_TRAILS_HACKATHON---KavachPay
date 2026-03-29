import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Wallet, 
  TrendingUp, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChevronRight,
  MapPin,
  Clock,
  ArrowLeft
} from 'lucide-react';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('kavachpay_token');
    const userStr = localStorage.getItem('kavachpay_user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token || user?.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const claimsRes = await fetch('http://localhost:5000/api/admin/claims', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (statsRes.ok && claimsRes.ok) {
          setStats(await statsRes.json());
          setClaims(await claimsRes.json());
        }
      } catch (err) {
        console.error('Admin fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleUpdateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('kavachpay_token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/claims/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, reviewerNotes: 'Manual Admin override.' })
      });
      if (res.ok) {
        // Refresh local state
        setClaims(claims.map(c => c.id === id ? { ...c, status } : c));
      }
    } catch (err) {
      console.error('Update status failed', err);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-blue-400 font-bold animate-pulse">Initializing Administrative Secure Access...</div>;

  const filteredClaims = claims.filter(c => activeTab === 'all' || c.status === activeTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Admin Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-blue-500">KAVACH<span className="text-white">PAY</span> <span className="text-slate-500 text-sm ml-2 font-mono uppercase tracking-widest">v2.0 Admin</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
             <p className="text-xs font-bold text-slate-400">Security Level</p>
             <p className="text-[10px] font-black text-emerald-500 tracking-[3px] uppercase">Ultra Secure</p>
           </div>
           <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
             <ShieldCheck className="w-6 h-6 text-blue-400" />
           </div>
        </div>
      </nav>

      <main className="flex-grow p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top Intelligence Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-blue-500/30 transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">+12% growth</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Active Workers</p>
            <p className="text-3xl font-black mt-1">{stats?.totalUsers || 0}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-emerald-500/30 transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">In Force</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Policies</p>
            <p className="text-3xl font-black mt-1">{stats?.activePolicies || 0}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-amber-500/30 transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 group-hover:scale-110 transition">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">₹ INR</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Claims Paid</p>
            <p className="text-3xl font-black mt-1">₹{stats?.totalPayouts?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-rose-500/30 transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 group-hover:scale-110 transition">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Global Risk</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Platform Fraud Rate</p>
            <p className="text-3xl font-black mt-1">{stats?.fraudRate || 0}%</p>
          </div>
        </section>

        {/* Intelligence Breakdown Section */}
        <section className="grid lg:grid-cols-3 gap-8">
           {/* Chart Placeholder (Simulated) */}
           <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                <h3 className="font-bold flex items-center gap-2 text-slate-300">
                   <TrendingUp className="w-4 h-4 text-blue-500" />
                   Premium Revenue vs Payouts
                </h3>
                <select className="bg-slate-800 border-none rounded-lg text-xs px-3 py-1.5 font-bold outline-none cursor-pointer">
                  <option>Last 30 Days</option>
                  <option>Year to Date</option>
                </select>
              </div>

              {/* Minimalist Bar Chart CSS Simulation */}
              <div className="flex items-end justify-between gap-4 h-48 px-2 relative z-10">
                {[40, 65, 30, 85, 45, 90, 60, 55, 75, 40].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 w-full max-w-[40px]">
                    <div className="flex flex-row items-end gap-1 w-full h-full">
                       <div className="bg-blue-500/30 w-full rounded-t-lg transition hover:bg-blue-500" style={{ height: `${h}%` }}></div>
                       <div className="bg-emerald-500/20 w-1/2 rounded-t-lg transition hover:bg-emerald-500" style={{ height: `${h * 0.4}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>Jun 01</span>
                <span>Jun 10</span>
                <span>Jun 20</span>
                <span>Jun 30</span>
              </div>
           </div>

           {/* Fraud Alerts Feed */}
           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-full">
              <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-300">
                 <AlertTriangle className="w-4 h-4 text-rose-500" />
                 Active Fraud Alerts
              </h3>
              <div className="space-y-4 flex-grow overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                {claims.filter(c => c.fraudScore > 0.5).length === 0 ? (
                  <p className="text-slate-500 text-sm italic py-10 text-center">No active high-risk alerts.</p>
                ) : (
                  claims.filter(c => c.fraudScore > 0.5).map((c, i) => (
                    <div key={i} className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex items-center justify-between group hover:bg-rose-500/10 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <div>
                          <p className="text-xs font-black text-slate-100 uppercase tracking-wide">{c.user.fullName}</p>
                          <p className="text-[10px] text-slate-500 font-bold">{c.user.city} | Fraud Score: {c.fraudScore}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-rose-500 transition" />
                    </div>
                  ))
                )}
              </div>
              <button className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer">View Global Fraud Graph</button>
           </div>
        </section>

        {/* Claims Table UI */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center bg-slate-900/50 gap-4">
            <h3 className="text-lg font-black text-white">Global Claim Ledger</h3>
            <div className="flex gap-2 bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('all')}
                className={`text-[10px] font-black px-4 py-2 rounded-lg transition uppercase tracking-widest cursor-pointer ${activeTab === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveTab('REVIEW')}
                className={`text-[10px] font-black px-4 py-2 rounded-lg transition uppercase tracking-widest cursor-pointer ${activeTab === 'REVIEW' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setActiveTab('PAID')}
                className={`text-[10px] font-black px-4 py-2 rounded-lg transition uppercase tracking-widest cursor-pointer ${activeTab === 'PAID' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Processed
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Worker / ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ML Breakdown</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-xs">
                          {claim.user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{claim.user.fullName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">#{claim.id.split('-')[0].toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        {claim.user.city}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`text-[10px] font-black px-2.5 py-1 rounded-lg border w-fit uppercase ${
                        claim.policy.planTier === 'PREMIUM' ? 'border-amber-500/20 bg-amber-500/10 text-amber-500' :
                        claim.policy.planTier === 'STANDARD' ? 'border-blue-500/20 bg-blue-500/10 text-blue-500' :
                        'border-slate-500/20 bg-slate-500/10 text-slate-400'
                      }`}>
                        {claim.policy.planTier}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Fraud</span>
                            <span className={`text-xs font-black ${claim.fraudScore > 0.5 ? 'text-rose-500' : 'text-emerald-500'}`}>{claim.fraudScore}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Proof</span>
                            <span className={`text-xs font-black ${claim.workProofScore < 0.4 ? 'text-amber-500' : 'text-emerald-500'}`}>{claim.workProofScore}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                       <div className="inline-flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${
                           claim.status === 'PAID' ? 'bg-emerald-500' :
                           claim.status === 'REJECTED' ? 'bg-rose-500' :
                           'bg-amber-500 animate-pulse'
                         }`}></div>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${
                           claim.status === 'PAID' ? 'text-emerald-500' :
                           claim.status === 'REJECTED' ? 'text-rose-500' :
                           'text-amber-500'
                         }`}>
                           {claim.status === 'PAID' ? 'Processed' : claim.status === 'REJECTED' ? 'Blocked' : 'Review Required'}
                         </span>
                       </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                       {claim.status === 'REVIEW' ? (
                         <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(claim.id, 'REJECTED')}
                              className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500/50 hover:text-rose-500 transition cursor-pointer"
                              title="Reject Claim"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(claim.id, 'PAID')}
                              className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-500/50 hover:text-emerald-500 transition cursor-pointer"
                              title="Approve Payout"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                         </div>
                       ) : (
                         <button className="p-2 text-slate-700 cursor-not-allowed">
                            <ChevronRight className="w-5 h-5" />
                         </button>
                       )}
                    </td>
                  </tr>
                ))}
                {filteredClaims.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-slate-500 italic">
                       No claims found matching this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Admin Footer Status */}
      <footer className="p-4 border-t border-slate-900 bg-slate-950 flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-[4px]">
        <span>Operational Readiness: 100%</span>
        <span>Connected to IMD Infrastructure Nodes</span>
        <span>System Time: {new Date().toLocaleTimeString()}</span>
      </footer>
    </div>
  );
};

export default Admin;
