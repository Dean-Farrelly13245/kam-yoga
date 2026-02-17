const isTestMode =
  typeof import.meta !== "undefined" &&
  ((import.meta.env && import.meta.env.DEV) ||
    import.meta.env?.VITE_STRIPE_TEST_MODE === "true");

const TestModeBanner = () => {
  if (!isTestMode) return null;

  return (
    <div className="w-full bg-amber-100 text-amber-900 text-center text-sm py-2 px-4 border-b border-amber-200">
      Stripe Test Mode enabled — use test cards only (e.g. 4242 4242 4242 4242)
    </div>
  );
};

export default TestModeBanner;
