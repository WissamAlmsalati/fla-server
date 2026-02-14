// Helper function to get status label based on status and country
export function getStatusLabel(status: string, country?: string | null): string {
    const countryName = getCountryName(country);

    const statusMap: Record<string, string> = {
        purchased: "تم الشراء",
        arrived_to_china: `وصل إلى ${countryName}`,
        shipping_to_libya: "قيد الشحن لليبيا",
        arrived_libya: "وصل إلى ليبيا",
        ready_for_pickup: "جاهز للاستلام",
        delivered: "تم التسليم",
        canceled: "ملغي",
        cancelled: "ملغي",
    };

    return statusMap[status] || status;
}

// Helper function to get country name in Arabic
export function getCountryName(country?: string | null): string {
    if (!country) return "الصين"; // Default to China

    const countryMap: Record<string, string> = {
        CHINA: "الصين",
        china: "الصين",
        USA: "أمريكا",
        usa: "أمريكا",
        TURKEY: "تركيا",
        turkey: "تركيا",
        DUBAI: "دبي",
        dubai: "دبي",
    };

    return countryMap[country] || country;
}

// Status color mapping
export const statusColorMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className?: string }> = {
    purchased: { variant: "secondary", className: "bg-purple-100 text-purple-800" },
    arrived_to_china: { variant: "default", className: "bg-pink-100 text-pink-800" },
    shipping_to_libya: { variant: "default", className: "bg-amber-100 text-amber-800" },
    arrived_libya: { variant: "default", className: "bg-blue-100 text-blue-800" },
    ready_for_pickup: { variant: "default", className: "bg-green-100 text-green-800" },
    delivered: { variant: "secondary", className: "bg-emerald-100 text-emerald-800" },
    canceled: { variant: "destructive" },
    cancelled: { variant: "destructive" },
};
