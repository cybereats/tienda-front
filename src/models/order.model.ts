import { Product } from "./product.model";
import { User } from "./user.model";

export interface OrderItem {
    id: number;
    product: Product;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    user: User;
    status: string;
    createdAt: string;
    orderItems: OrderItem[];
    totalPrice?: number;
}

export interface OrderResponse {
    data: Order[];
    page: number;
    size: number;
    totalElements: number;
    totalPages?: number;
}
