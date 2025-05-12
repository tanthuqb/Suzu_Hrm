import { LoaderIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <LoaderIcon className="h-10 w-10 animate-spin" />
    </div>
  );
}
