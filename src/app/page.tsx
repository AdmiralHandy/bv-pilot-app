import Image from "next/image";
import AuthButton from "@/components/AuthButton";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <Image
          src="/bvl-logo.png"
          alt="BlightVeil Logo"
          width={120}
          height={131}
          className="mx-auto mb-4"
          priority
        />
        <h1 className="text-4xl font-bold text-purple-light mb-2">
          BlightVeil
        </h1>
        <p className="text-gray-400 text-lg">Pilot Roster Management</p>
        <p className="text-gray-600 text-sm mt-1">Star Citizen Organization</p>
      </div>
      <AuthButton />
    </div>
  );
}
