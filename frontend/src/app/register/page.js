import GuestIntakeForm from '../../components/GuestIntakeForm';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            
            {/* Ambient Background Depth */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-200/40 rounded-full filter blur-[100px] -z-10 pointer-events-none"></div>
            
            <div className="max-w-3xl mx-auto">
                
                {/* Navigation Breadcrumb */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors bg-white/60 px-4 py-2 rounded-full border border-blue-100 backdrop-blur-md shadow-sm hover:shadow active:scale-95 transform duration-150">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Return to Hub
                    </Link>
                </div>

                {/* Page Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                        Secure Intake Portal
                    </h1>
                    <p className="text-lg text-gray-600 max-w-xl mx-auto">
                        Submit your credentials for the Global Tech & Finance Summit. All entries are verified before being committed to the ledger.
                    </p>
                </div>

                {/* Form Wrapper with Glassmorphism Depth */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white p-2">
                    <GuestIntakeForm />
                </div>
                
            </div>
        </main>
    );
}