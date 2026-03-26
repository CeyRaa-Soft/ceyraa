import { Product, Banner } from './types';

export const BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'THE ESSENTIALS',
    subtitle: 'Elevated staples for the modern wardrobe.',
    imageUrl: 'https://picsum.photos/seed/fashion1/1920/1080',
    ctaText: 'SHOP COLLECTION',
    ctaLink: '/shop',
  },
  {
    id: 'b2',
    title: 'SPRING / SUMMER 24',
    subtitle: 'Limited pieces now available.',
    imageUrl: 'https://picsum.photos/seed/fashion2/1920/1080',
    ctaText: 'EXPLORE',
    ctaLink: '/shop?category=New%20Arrivals',
  }
];

const COLORS = [
  { name: 'Onyx', hex: '#0A0A0A' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Slate', hex: '#708090' }
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const generateProducts = (): Product[] => {
  const products: Product[] = [];
  const categories = ['Outerwear', 'Dresses', 'Knitwear', 'Accessories', 'Footwear'];
  
  // Use deterministic generation based on index 'i' to avoid hydration mismatches
  for (let i = 1; i <= 30; i++) {
    const isDiscounted = i % 4 === 0;
    const basePrice = 150 + (i * 23) % 450;
    const category = categories[i % categories.length];
    
    products.push({
      id: `p${i}`,
      name: `${category === 'Outerwear' ? 'Tailored' : 'Luxury'} ${category.slice(0, -1)} ${i}`,
      description: 'Hand-crafted with the finest materials to ensure both comfort and durability. This piece represents our commitment to timeless luxury and exceptional craftsmanship.',
      category,
      basePrice,
      discountPrice: isDiscounted ? Math.floor(basePrice * 0.85) : undefined,
      isNew: i <= 5,
      isTrending: i > 5 && i <= 10,
      createdAt: '2024-01-01T00:00:00.000Z',
      variants: COLORS.slice(0, (i % 3) + 1).map((color, idx) => ({
        color: color.hex,
        colorName: color.name,
        images: [
          `https://picsum.photos/seed/prod${i}-${idx}1/800/1200`,
          `https://picsum.photos/seed/prod${i}-${idx}2/800/1200`,
        ],
        sizes: SIZES.map((size, sIdx) => ({
          size,
          stock: (i + sIdx) % 12,
        }))
      }))
    });
  }
  return products;
};

export const PRODUCTS = generateProducts();
