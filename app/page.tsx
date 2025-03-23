import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 p-8">
      <div className="flex flex-col items-center max-w-md w-full">
        {/* SafeLiza Image */}
        <div className="mb-8 w-90 h-70 relative">
          <Image
            src="/safeLiza.webp"
            alt="SafeLiza Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        {/* Login Button */}
        <Link href="/auth" className="btn btn-secondary btn-lg w-full max-w-xs">
          Welcome Agent
        </Link>
      </div>
      
    </div>
  );
}
