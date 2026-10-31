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

  const matchedCategory = categories.find((c: any) => c.id === design.categoryId);
  const categoryName = matchedCategory?.name || "Dresses";
  const effectiveWardrobe = matchedCategory?.wardrobeType || design.defaultCollection || "Queen's Wardrobe";

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

    const rawSizes = (v.sizes || []).map((s: any) => ({
      size: s.size,
      stock: s.quantity || 0,
    }));

    let finalSizes = rawSizes;
    if (design.availableSizes && Array.isArray(design.availableSizes) && design.availableSizes.length > 0) {
      const allowedLower = design.availableSizes.map((as: string) => as.trim().toLowerCase());
      const matched = rawSizes.filter((s: any) => allowedLower.includes(s.size.trim().toLowerCase()));
      const existingSizeNames = new Set(matched.map((s: any) => s.size.trim().toLowerCase()));
      const missing = design.availableSizes
        .filter((as: string) => !existingSizeNames.has(as.trim().toLowerCase()))
        .map((as: string) => ({ size: as, stock: 0 }));
      finalSizes = [...matched, ...missing];
    }

    return {
      color: colorToHex(v.color),
      colorName: v.color,
      swatchUrl: v.swatchUrl || undefined,
      mediaVideoUrl: v.mediaVideoUrl || undefined,
      images: colorImages,
      sizes: finalSizes,
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
    sizeChartText: design.sizeChartText || undefined,
    sizeChartImageUrl: design.sizeChartImageUrl || undefined,
    availableSizes: design.availableSizes || undefined,
    defaultCollection: effectiveWardrobe,
    customCollection: design.customCollection || undefined,
    offer: offer,
    createdAt: design.createdAt || new Date().toISOString(),
    isNew: true,
  };
};
