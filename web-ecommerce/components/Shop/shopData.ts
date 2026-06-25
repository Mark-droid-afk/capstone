import { Product } from "@/types/product";

const halaYaImg = "/images/products/UBEHALAYA.jpg";
const jamImg = "/images/products/UBEJAM.jpg";

const shopData: Product[] = [
  {
    title: "Ube Halaya Smooth",
    reviews: 15,
    price: 199.0,
    discountedPrice: 199.0,
    id: 1,
    category: "UBE HALAYA",
    variations: [
      { weight: "250g", price: 199.0, discountedPrice: 199.0 },
      { weight: "500g", price: 379.0, discountedPrice: 379.0 }
    ],
    imgs: {
      thumbnails: [halaYaImg, halaYaImg],
      previews: [halaYaImg, halaYaImg],
    },
  },
  {
    title: "Ube Halaya Tidbits",
    reviews: 12,
    price: 199.0,
    discountedPrice: 199.0,
    id: 2,
    category: "UBE HALAYA",
    variations: [
      { weight: "250g", price: 199.0, discountedPrice: 199.0 },
      { weight: "500g", price: 379.0, discountedPrice: 379.0 }
    ],
    imgs: {
      thumbnails: [halaYaImg, halaYaImg],
      previews: [halaYaImg, halaYaImg],
    },
  },
  {
    title: "Ube Jam Smooth",
    reviews: 20,
    price: 199.0,
    discountedPrice: 199.0,
    id: 3,
    category: "UBE JAM",
    variations: [
      { weight: "200g", price: 199.0, discountedPrice: 199.0 },
      { weight: "300g", price: 299.0, discountedPrice: 299.0 },
      { weight: "500g", price: 449.0, discountedPrice: 449.0 }
    ],
    imgs: {
      thumbnails: [jamImg, jamImg],
      previews: [jamImg, jamImg],
    },
  },
  {
    title: "Ube Jam Tidbits",
    reviews: 8,
    price: 199.0,
    discountedPrice: 199.0,
    id: 4,
    category: "UBE JAM",
    variations: [
      { weight: "200g", price: 199.0, discountedPrice: 199.0 },
      { weight: "300g", price: 299.0, discountedPrice: 299.0 },
      { weight: "500g", price: 449.0, discountedPrice: 449.0 }
    ],
    imgs: {
      thumbnails: [jamImg, jamImg],
      previews: [jamImg, jamImg],
    },
  }
];

export default shopData;
