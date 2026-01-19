export interface User {
  id: number
  name: string
  surname?: string | null
  bornDate?: string | null
  username: string
  password?: string | null
  email: string
  role: 'ADMIN' | 'CLIENT'
}

export interface UsersResponse {
  data: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages?: number;
}
