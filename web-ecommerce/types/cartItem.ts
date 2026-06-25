export interface CartItem {
  id: number;
  quantity: number;
  name?: string;
  price: number;
  title: string;
  imgs?: {
    thumbnails: string[];
  };
  discountedPrice: number;
}
