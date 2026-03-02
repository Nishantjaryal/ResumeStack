import { PricingTable } from "@clerk/nextjs";

const AppPricingTable = () => {
  return (
    <div className="w-full max-w-4xl">
      <PricingTable newSubscriptionRedirectUrl="/app" />
    </div>
  );
};

export default AppPricingTable;
