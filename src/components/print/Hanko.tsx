import { cn } from "@/lib/cn";
export function Hanko({ children, small, className, romaji }: { children: React.ReactNode; small?: boolean; className?: string; romaji?: string }) {
  return (
    <span className={cn("stamp", className)} style={{ fontSize: small ? 14 : 22, borderWidth: small ? 2 : 3 }}>
      {children}
      {romaji ? <small>{romaji}</small> : null}
    </span>
  );
}
