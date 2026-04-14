import { ShieldCheck, ShieldAlert } from "lucide-react";

interface VerificationBadgeProps {
  isVerified: boolean;
  variant?: "light" | "dark";
}

const VerificationBadge = ({ isVerified, variant = "light" }: VerificationBadgeProps) => {
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-trust/20 text-[10px] font-bold text-trust">
        <ShieldCheck className="w-3 h-3" />
        Verified
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
      variant === "light"
        ? "bg-amber-500/20 text-amber-200"
        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
    }`}>
      <ShieldAlert className="w-3 h-3" />
      Unverified
    </span>
  );
};

export default VerificationBadge;
