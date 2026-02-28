import GuestIntakeForm from '../components/GuestIntakeForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MICE Registration
          </h1>
          <p className="text-sm text-gray-500">
            Secure Guest Intake Portal
          </p>
        </div>

        {/* Our Fully Functional Client Component */}
        <GuestIntakeForm />

      </div>
    </main>
  );
}