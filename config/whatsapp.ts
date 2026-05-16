import { brand } from "@/config/brand";

export function buildWhatsappUrl(message: string) {
  const phoneDigits = brand.whatsappNumber.replace(/\D/g, "");
  return `https://api.whatsapp.com/send?phone=${phoneDigits}&text=${encodeURIComponent(message)}`;
}
