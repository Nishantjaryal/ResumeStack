import { SignIn } from "@clerk/nextjs";
import { env } from "@/data/env/client";

const SignInPage = () => {
  return (
    <div className="flex items-center w-screen justify-center h-screen">
      {/* implemented force redirects , in case an exception arises */}

      <SignIn
        forceRedirectUrl={env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL}
        fallbackRedirectUrl={env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL}
        signUpForceRedirectUrl={env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL}
        signUpFallbackRedirectUrl={env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL}
      />
    </div>
  );
};

export default SignInPage;
