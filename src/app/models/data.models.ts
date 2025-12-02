export interface LoginResponse {
    token: string;
    username: string;
    role: string;
}

export interface Question {
    id: number;
    text: string;
}

export interface PreviewResponse {
    questionText: string;
    categoryName: string;
    responseText: string;
    universidad: string;
    programa: string;
    sexoBiologico: string;
    orientacionSexual: string;
    grupoEtnico: string;
}

export interface Response extends PreviewResponse {
    id: number;
    questionId: number;
    categoryId: number;
    importId: number;
}
