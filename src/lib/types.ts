export interface ColorVariant {
  color: string;
  colorName: string;
  images: string[];
  sizes: {
    size: string;
    stock: number;
  }[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  discountPrice?: number;
  variants: ColorVariant[];
  createdAt: string;
  isNew?: boolean;
  isTrending?: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  videoUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  isStatic?: boolean;
}

export interface CartItem {
  productId: string;
  productName: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}
