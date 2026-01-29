export interface CartItem {
  id?: number;
  productId: number;
  product?: {
    id: number;
    label: string;
    price: number;
    image: string;
  };
  quantity: number;
  price: number;
}

export interface Cart {
  id?: number;
  userId?: number;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface OrderItem {
  id?: number;
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id?: number;
  userId?: number;
  items: OrderItem[];
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  createdAt?: string;
}
