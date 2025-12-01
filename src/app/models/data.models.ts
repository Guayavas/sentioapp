export interface LoginResponse {
    token: string;
    username: string;
    role: string;
}

export interface HierarchyNode {
    key: string;
    label: string;
    children?: HierarchyNode[];
    data?: any;
}

export interface Response {
    id: number;
    questionId: number;
    categoryId: number;
    importId: number;
    responseText: string;
    universidad: string;
    programa: string;
    sexoBiologico: string;
    orientacionSexual: string;
    grupoEtnico: string;
}
