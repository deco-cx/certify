import { Button } from "./ui/button";
import { generateLinkedInCertificateUrl } from "@/lib/utils";

interface LinkedInButtonProps {
  organizationName: string;
  certificateName: string;
  issueYear: number;
  issueMonth: number;
  certId: string;
  certUrl: string;
  className?: string;
  variant?: "mobile" | "desktop";
}

export function LinkedInButton({
  organizationName,
  certificateName,
  issueYear,
  issueMonth,
  certId,
  certUrl,
  className,
  variant = "mobile",
}: LinkedInButtonProps) {
  const handleAddToLinkedIn = () => {
    const linkedInUrl = generateLinkedInCertificateUrl({
      organizationName,
      name: certificateName,
      issueYear,
      issueMonth,
      certId,
      certUrl,
    });

    // Abrir em nova aba
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      onClick={handleAddToLinkedIn}
      className={`
        bg-[#0077B5] hover:bg-[#005885] 
        border-[#0077B5] hover:border-[#005885]
        text-white hover:text-white
        transition-all duration-200
        ${className || "flex flex-col items-center gap-1 py-3 px-2 h-auto"}
      `}
    >
      {/* LinkedIn logo SVG */}
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
      <span className="text-xs font-medium">
        {variant === "desktop" ? "Adicionar no LinkedIn" : "LinkedIn"}
      </span>
    </Button>
  );
}
