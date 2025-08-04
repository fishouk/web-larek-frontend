import { Api, ApiListResponse } from './base/api';
import {
	IWebLarekAPI,
	IProductList,
	IProduct,
	IOrder,
	IOrderResult,
	ProductId,
	ProductList,
	Product,
	OrderResult,
	ApiError,
	ProductCategory,
} from '../types';

/**
 * Специализированный API класс для работы с WebLarek API
 * Наследует базовый Api класс и реализует интерфейс IWebLarekAPI
 */
export class WebLarekAPI extends Api implements IWebLarekAPI {
	readonly cdn: string;

	constructor(baseUrl: string, cdn: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	/**
	 * Получение списка всех продуктов
	 */
	async getProductList(): Promise<IProductList> {
		try {
			const response = (await this.get(
				'/product/'
			)) as ApiListResponse<IProduct>;

			// Обрабатываем изображения - добавляем CDN URL
			const processedItems = response.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
				category: item.category as ProductCategory,
			}));

			return new ProductList({
				total: response.total,
				items: processedItems,
			});
		} catch (error) {
			throw new ApiError(this.handleApiError(error));
		}
	}

	/**
	 * Получение конкретного продукта по ID
	 */
	async getProduct(id: ProductId): Promise<IProduct> {
		try {
			const response = (await this.get(`/product/${id}`)) as IProduct;

			return new Product({
				...response,
				image: this.cdn + response.image,
				category: response.category as ProductCategory,
			});
		} catch (error) {
			throw new ApiError(this.handleApiError(error));
		}
	}

	/**
	 * Создание заказа
	 */
	async createOrder(order: IOrder): Promise<IOrderResult> {
		try {
			const response = (await this.post('/order', order)) as IOrderResult;

			return new OrderResult(response);
		} catch (error) {
			throw new ApiError(this.handleApiError(error));
		}
	}

	/**
	 * Обработка ошибок API
	 */
	private handleApiError(error: unknown): string {
		if (typeof error === 'string') {
			return error;
		}

		if (error && typeof error === 'object' && 'error' in error) {
			return (error as { error: string }).error;
		}

		if (error instanceof Error) {
			return error.message;
		}

		return 'Произошла неизвестная ошибка';
	}

	/**
	 * Получение полного URL для изображения
	 */
	getImageUrl(imagePath: string): string {
		return this.cdn + imagePath;
	}

	/**
	 * Получение продуктов по категории
	 */
	async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
		const productList = await this.getProductList();
		return productList.getProductsByCategory(category);
	}

	/**
	 * Получение доступных продуктов (с ценой)
	 */
	async getAvailableProducts(): Promise<Product[]> {
		const productList = await this.getProductList();
		return productList.getAvailableProducts();
	}

	/**
	 * Поиск продуктов по названию
	 */
	async searchProducts(query: string): Promise<Product[]> {
		const productList = await this.getProductList();
		const searchQuery = query.toLowerCase();

		return productList.items.filter(
			(product) =>
				product.title.toLowerCase().includes(searchQuery) ||
				product.description.toLowerCase().includes(searchQuery)
		);
	}

	/**
	 * Валидация заказа перед отправкой
	 */
	private validateOrderBeforeSubmit(order: IOrder): void {
		if (!order.email || !order.phone || !order.address) {
			throw new ApiError('Не заполнены обязательные поля');
		}

		if (order.items.length === 0) {
			throw new ApiError('Корзина пуста');
		}

		if (order.total <= 0) {
			throw new ApiError('Неверная сумма заказа');
		}
	}

	/**
	 * Создание заказа с предварительной валидацией
	 */
	async submitOrder(order: IOrder): Promise<IOrderResult> {
		this.validateOrderBeforeSubmit(order);
		return this.createOrder(order);
	}
}
