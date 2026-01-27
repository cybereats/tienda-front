export interface CategoryProduct {
  id: number;
  label: string;
  slug: string;
}

export interface Product {
  id: number;
  label: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: CategoryProduct;
}

export interface ProductsResponse {
  data: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages?: number;
}
