import { IProduct, IProductList } from './product';
import { IOrder, IOrderResult } from './order';
import { ProductId } from './base';

// Интерфейс ошибки API
export interface IApiError {
	error: string;
}

// Класс ошибки API
export class ApiError extends Error implements IApiError {
	error: string;

	constructor(error: string) {
		super(error);
		this.error = error;
		this.name = 'ApiError';
	}

	// Проверка типа ошибки
	static isApiError(error: unknown): error is ApiError {
		return (
			error instanceof ApiError ||
			(typeof error === 'object' && error !== null && 'error' in error)
		);
	}
}

// Расширенные типы ответов API
export interface IApiResponse<T = unknown> {
	data?: T;
	error?: string;
}

export interface IApiListResponse<T> {
	total: number;
	items: T[];
}

// Интерфейс для работы с API
export interface IWebLarekAPI {
	getProductList(): Promise<IProductList>;
	getProduct(id: ProductId): Promise<IProduct>;
	createOrder(order: IOrder): Promise<IOrderResult>;
}

// Конфигурация API
export interface IApiConfig {
	baseUrl: string;
	timeout?: number;
	headers?: Record<string, string>;
}

// Типы для HTTP методов
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Интерфейс для HTTP запроса
export interface IHttpRequest {
	method: HttpMethod;
	url: string;
	headers?: Record<string, string>;
	body?: unknown;
}

// Интерфейс для HTTP ответа
export interface IHttpResponse<T = unknown> {
	status: number;
	statusText: string;
	headers: Record<string, string>;
	data: T;
}

// Интерфейс для HTTP клиента
export interface IHttpClient {
	request<T>(config: IHttpRequest): Promise<IHttpResponse<T>>;
	get<T>(
		url: string,
		headers?: Record<string, string>
	): Promise<IHttpResponse<T>>;
	post<T>(
		url: string,
		data?: unknown,
		headers?: Record<string, string>
	): Promise<IHttpResponse<T>>;
}
