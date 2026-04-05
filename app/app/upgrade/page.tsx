import { PricingTable } from "@clerk/nextjs";
import Link from "next/link";

export default function UpgradePage() {
  const upgradeUrl = process.env.NEXT_PUBLIC_UPGRADE_URL || "#";

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-6 py-12">
      <section className="w-full rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Upgrade Required</h1>
        <p className="mt-3 text-sm text-gray-600">
          You’ve reached the limit for your current plan. Upgrade to continue creating interviews.
        </p>

        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-gray-700">
          <li>Create more interview sessions</li>
          <li>Get longer voice sessions</li>
          <li>Access upcoming premium features</li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={upgradeUrl}
            className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Upgrade Now
          </Link>

          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Back to App
          </Link>
        </div>
      </section>
      <PricingTable/>
    </main>
  );
}