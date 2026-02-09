import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SignInButton, UserButton } from "@clerk/nextjs";

const Home = () => {
  return (
    <main>
      <SignInButton />
      <UserButton />
      <ThemeToggle />
    </main>
  );
};

export default Home;
