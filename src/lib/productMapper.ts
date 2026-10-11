import { Product } from "./types";

export const colorToHex = (colorName: string): string => {
  if (colorName.startsWith("#")) return colorName;

  const map: Record<string, string> = {
    onyx: "#0A0A0A",
    ivory: "#FFFFF0",
    camel: "#C19A6B",
    slate: "#708090",
    red: "#FF0000",
    blue: "#0000FF",
    green: "#008000",
    black: "#000000",
    white: "#FFFFFF",
    pink: "#FFC0CB",
    yellow: "#FFFF00",
    purple: "#800080",
    orange: "#FFA500",
    gray: "#808080",
    brown: "#A52A2A",
    gold: "#FFD700",
    silver: "#C0C0C0",
  };

  return map[colorName.trim().toLowerCase()] || "#708090"; // default Slate
};

export const mapDesignToProduct = (design: any, categories: any[]): Product => {
  let basePrice = 0;
  for (const v of design.variants || []) {
    if (v.sizes && v.sizes.length > 0) {
      basePrice = v.sizes[0].unitPrice || 0;
      break;
    }
  }

  const categoryName =
    categories.find((c: any) => c.id === design.categoryId)?.name || "Dresses";

  const mappedVariants = (design.variants || []).map((v: any) => {
    let colorImages = (design.images || [])
      .filter(
        (img: any) =>
          (img?.color || "").trim().toLowerCase() === (v?.color || "").trim().toLowerCase(),
      )
      .map((img: any) => img.url);

    if (colorImages.length === 0 && design.images && design.images.length > 0) {
      colorImages = [design.images[0].url];
    }

    if (colorImages.length === 0) {
      colorImages = ["https://placehold.co/800x1200?text=No+Image"];
    }

    return {
      color: colorToHex(v.color),
      colorName: v.color,
      swatchUrl: v.swatchUrl || undefined,
      images: colorImages,
      sizes: (v.sizes || []).map((s: any) => ({
        size: s.size,
        stock: s.quantity || 0,
      })),
    };
  });

  const offer = design.offer && design.offer.active ? design.offer : undefined;
  const effectiveDiscountPrice = offer ? offer.offerPrice : undefined;

  return {
    id: design.id,
    name: design.name,
    description:
      design.description ||
      "Hand-crafted with the finest materials to ensure both comfort and durability.",
    category: categoryName,
    basePrice: basePrice,
    discountPrice: effectiveDiscountPrice,
    variants: mappedVariants,
    mediaVideoUrl: design.mediaVideoUrl || undefined,
    defaultCollection: design.defaultCollection || undefined,
    customCollection: design.customCollection || undefined,
    offer: offer,
    createdAt: design.createdAt || new Date().toISOString(),
    isNew: true,
  };
};
