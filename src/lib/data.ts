import { Product, Banner } from './types';

export const BANNERS: Banner[] = [
  {
    id: 'b1',
    title: "QUEEN'S WARDROBE",
    subtitle: 'Thoughtful silhouettes and refined everyday grace.',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'DISCOVER WARDROBE',
    ctaLink: '/shop?category=Queen%27s%20Wardrobe',
  },
  {
    id: 'b2',
    title: "KING'S WARDROBE",
    subtitle: 'Classic tailoring and understated modern cuts.',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'EXPLORE TAILORING',
    ctaLink: '/shop?category=King%27s%20Wardrobe',
  }
];

const COLORS = [
  { name: 'Onyx Black', hex: '#0D0814' },
  { name: 'Deep Indigo', hex: '#1E1236' },
  { name: 'Pearl Ivory', hex: '#F5F3EC' },
  { name: 'Warm Taupe', hex: '#8F7E75' }
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

interface DressTemplate {
  name: string;
  category: string;
  basePrice: number;
  image1: string;
  image2: string;
  description: string;
}

const CURATED_PIECES: DressTemplate[] = [
  {
    name: 'Pleated Evening Midi Dress',
    category: "Queen's Wardrobe",
    basePrice: 16500,
    image1: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    image2: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    description: 'A fluid midi dress with gentle micro-pleating, tailored to drape softly with every step.'
  },
  {
    name: 'Tailored Single-Breasted Blazer',
    category: "King's Wardrobe",
    basePrice: 24500,
    image1: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    image2: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=800&q=80',
    description: 'Structured wool-blend blazer designed with clean lines and balanced proportions.'
  },
  {
    name: 'Linen Belted Wrap Dress',
    category: "Queen's Wardrobe",
    basePrice: 14200,
    image1: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    image2: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=800&q=80',
    description: 'Breathable washed linen wrap dress with an adjustable waist tie and relaxed sleeves.'
  },
  {
    name: 'Classic Poplin Oversized Shirt',
    category: "King's Wardrobe",
    basePrice: 9800,
    image1: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80',
    image2: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    description: 'Crisp organic cotton poplin cut in a modern relaxed silhouette with mother-of-pearl buttons.'
  },
  {
    name: 'Minimalist Satin Column Gown',
    category: "Queen's Wardrobe",
    basePrice: 22000,
    image1: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80',
    image2: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    description: 'Sleek floor-length gown with clean architectural seams and subtle back slit.'
  },
  {
    name: 'Wool Overcoat in Midnight',
    category: "Outerwear",
    basePrice: 32000,
    image1: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    image2: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=800&q=80',
    description: 'Substantial cold-weather outerwear featuring clean notch lapels and deep welt pockets.'
  },
  {
    name: 'Ruched Bodice Cocktail Dress',
    category: "Queen's Wardrobe",
    basePrice: 17800,
    image1: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    image2: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    description: 'Elegantly shaped dress with flattering lateral gathers and a gentle square neckline.'
  },
  {
    name: 'Relaxed Tailored Trousers',
    category: "King's Wardrobe",
    basePrice: 12500,
    image1: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=800&q=80',
    image2: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    description: 'High-waisted pleated trousers crafted with subtle drape for all-day composure.'
  }
];

const generateProducts = (): Product[] => {
  return CURATED_PIECES.map((item, idx) => {
    const isDiscounted = idx % 3 === 0;
    return {
      id: `p${idx + 1}`,
      name: item.name,
      description: item.description,
      category: item.category,
      basePrice: item.basePrice,
      discountPrice: isDiscounted ? Math.floor(item.basePrice * 0.85) : undefined,
      isNew: idx < 4,
      isTrending: idx >= 4,
      createdAt: '2025-01-01T00:00:00.000Z',
      variants: COLORS.slice(0, 3).map((color) => ({
        color: color.hex,
        colorName: color.name,
        images: [item.image1, item.image2],
        sizes: SIZES.map((size, sIdx) => ({
          size,
          stock: (idx + sIdx + 2) % 6,
        }))
      }))
    };
  });
};

export const PRODUCTS = generateProducts();
