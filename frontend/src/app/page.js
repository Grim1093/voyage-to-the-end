import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
            
            {/* Ambient Background Glow Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-6xl w-full z-10 flex flex-col items-center">
                
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium tracking-wide">
                        MICE Registration Platform
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 drop-shadow-lg pb-2">
                        Global Tech & Finance Summit 2026
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100/70 max-w-2xl mx-auto font-light">
                        The premier convergence of enterprise ledgers and decentralized architecture.
                    </p>
                </div>

                {/* Navigation Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    
                    {/* Register Card */}
                    <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] hover:bg-white/15">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-blue-400/30">
                            <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-3">New Attendees</h2>
                        <p className="text-blue-100/60 mb-8 flex-grow">Secure your spot at the summit. Register your details and identity document.</p>
                        <Link href="/register" className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors shadow-lg shadow-blue-900/50">
                            Register Now
                        </Link>
                    </div>

                    {/* Guest Portal Card */}
                    <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)] hover:bg-white/15">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-purple-400/30">
                            <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Guest Portal</h2>
                        <p className="text-blue-100/60 mb-8 flex-grow">Already registered? Track your verification status and view event details.</p>
                        <Link href="/portal" className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors shadow-lg shadow-purple-900/50">
                            Access Portal
                        </Link>
                    </div>

                    {/* Admin Vault Card */}
                    <div className="bg-white/5 backdrop-blur-lg border border-white/5 rounded-2xl p-8 flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(148,163,184,0.2)] hover:bg-white/10">
                        <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mb-6 border border-slate-400/30">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-slate-200">System Override</h2>
                        <p className="text-slate-400 mb-8 flex-grow">Authorized personnel only. Access the secure ledger and verify guests.</p>
                        <Link href="/admin/login" className="w-full py-3 px-6 bg-transparent hover:bg-slate-800 border border-slate-600 rounded-lg font-semibold text-slate-300 transition-colors">
                            Enter Vault
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}