export interface Computer {
    id: number;
    label: string;
    slug: string;
    runtime: number;
    specs: string;
    workingSince: string;
    image: string;
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
    categoryPCResponse: CategoryPC;
}

export interface ComputerResponse {
    data: Computer[];
    page: number;
    size: number;
    totalElements: number;
    totalPages?: number; 

}

export interface CategoryPC {
    id: number;
    label: string;
    slug: string;
}
