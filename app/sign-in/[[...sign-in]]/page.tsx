import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="flex items-center w-screen justify-center h-screen bg-gray-100">
      <SignIn />;
    </div>
  );
};

export default SignInPage;
