import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/auth');
      }
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar */}
      <div className="bg-base-200 p-4 flex justify-end">
        <button className="btn btn-tertiary border border-white" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
} 