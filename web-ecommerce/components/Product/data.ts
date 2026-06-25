import { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Havit HV-G69 USB Gamepad",
    price: 29,
    originalPrice: 59,
    image: "/images/gamepad.png",
    category: "Games & Videos",
    description:
      "Ergonomic USB gamepad with dual vibration motors, compatible with PC and most gaming platforms. Features 12 action buttons and a D-pad for precise control.",
    feedbacks: [
      {
        id: "f1",
        author: "Davis Dorwart",
        rating: 5,
        comment:
          "Absolutely love this gamepad. Fits perfectly in my hands and the buttons are very responsive. Great value for the price.",
        date: "2024-12-01",
      },
      {
        id: "f2",
        author: "Wilson Dias",
        rating: 4,
        comment:
          "Good build quality and works out of the box. The only downside is the cable is a bit short. Otherwise a solid buy.",
        date: "2024-11-20",
      },
      {
        id: "f3",
        author: "Miracle Exterm",
        rating: 5,
        comment:
          "Perfect for casual gaming. Setup was plug-and-play, no drivers needed. Highly recommend for anyone on a budget.",
        date: "2024-11-10",
      },
      {
        id: "f4",
        author: "James Reyes",
        rating: 3,
        comment:
          "Decent gamepad but the triggers feel a bit stiff. Works fine after breaking in. Decent for the price.",
        date: "2024-10-30",
      },
      {
        id: "f5",
        author: "Sara Kim",
        rating: 4,
        comment:
          "Really nice controller. Lightweight and comfortable for long sessions. Would buy again.",
        date: "2024-10-15",
      },
    ],
  },
  {
    id: "2",
    name: "iPhone 14 Plus, 6/128GB",
    price: 99,
    originalPrice: 899,
    image: "/images/iphone14.png",
    category: "Mobile & Tablets",
    description:
      "Apple iPhone 14 Plus with A15 Bionic chip, 6.7-inch Super Retina XDR display, 12MP dual camera system, and all-day battery life.",
    feedbacks: [
      {
        id: "f6",
        author: "Anna Cruz",
        rating: 5,
        comment: "Best phone I have ever owned. Camera is stunning and battery lasts all day.",
        date: "2024-12-05",
      },
      {
        id: "f7",
        author: "Miguel Torres",
        rating: 4,
        comment: "Great phone overall. A bit pricey but the quality justifies it.",
        date: "2024-11-28",
      },
    ],
  },
  {
    id: "3",
    name: "Apple iMac M1 24-inch 2021",
    price: 29,
    originalPrice: 59,
    image: "/images/imac.png",
    category: "Laptop & PC",
    description:
      "Apple iMac with M1 chip, 24-inch 4.5K Retina display, 8-core CPU, 8-core GPU, 8GB unified memory.",
    feedbacks: [
      {
        id: "f8",
        author: "Lena Park",
        rating: 5,
        comment: "Incredible machine. Fast, beautiful display and so compact. Worth every penny.",
        date: "2024-12-10",
      },
    ],
  },
];

export const getProductById = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id);