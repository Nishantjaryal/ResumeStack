import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  takeTo: string;
  Text: string;
}

const BackLink = ({ takeTo, Text }: BackLinkProps) => {
  return (
    <Button
    size={"sm"}
      variant={"ghost"}
      className="mt-1 mb-3 p-2 px-3 bg-black/10 text-black rounded-none border-l-2 border-primary/40"
      asChild
    >
      <div>
        <ArrowLeft className="ml-1" />
        <Link href={takeTo}>{`Back to ${Text}`}</Link>
      </div>
    </Button>
  );
};

export default BackLink;
