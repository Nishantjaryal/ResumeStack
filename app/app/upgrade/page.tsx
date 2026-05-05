import { PricingTable } from "@clerk/nextjs";

export default function UpgradePage() {

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-6 py-12">
      
      <PricingTable/>
    </main>
  );
}