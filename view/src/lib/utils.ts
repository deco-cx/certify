import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gera a URL do LinkedIn para adicionar certificado ao perfil
 */
export function generateLinkedInCertificateUrl({
  organizationName,
  name,
  issueYear,
  issueMonth,
  certId,
  certUrl,
}: {
  organizationName: string;
  name: string;
  issueYear: number;
  issueMonth: number;
  certId: string;
  certUrl: string;
}): string {
  const baseUrl = "https://www.linkedin.com/profile/add";
  
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    organizationName,
    name,
    issueYear: issueYear.toString(),
    issueMonth: issueMonth.toString(),
    certId,
    certUrl,
  });

  return `${baseUrl}?${params.toString()}`;
}
