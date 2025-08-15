import { IProduct, Product } from '../types/product';
import { IEventEmitter } from '../types/events';
import { IBasket, Basket } from '../types/basket';
import { IOrder, Order, IOrderResult, OrderResult } from '../types/order';
import { ProductId } from '../types/base';

export interface IAppModel {
	products: IProduct[];
	selectedProduct: IProduct | null;
	basket: IBasket;
	order: Partial<IOrder>;

	// Методы для товаров
	setProducts(products: IProduct[]): void;
	selectProduct(product: IProduct): void;
	getProduct(id: ProductId): IProduct | undefined;

	// Методы для корзины
	addToBasket(product: IProduct): void;
	removeFromBasket(productId: ProductId): void;
	clearBasket(): void;
	getBasketTotal(): number;
	getBasketCount(): number;

	// Методы для заказа
	setOrderField<K extends keyof IOrder>(field: K, value: IOrder[K]): void;
	validateOrder(): boolean;
	getOrderErrors(): string[];
	getOrderData(): IOrder;
	clearOrder(): void;
}

export class AppModel implements IAppModel {
	protected _products: Product[] = [];
	protected _selectedProduct: Product | null = null;
	protected _basket: Basket;
	protected _order: Partial<Order> = {};
	protected _events: IEventEmitter;

	constructor(events: IEventEmitter) {
		this._events = events;
		this._basket = new Basket();
	}

	get products(): IProduct[] {
		return this._products;
	}

	get selectedProduct(): IProduct | null {
		return this._selectedProduct;
	}

	get basket(): IBasket {
		return this._basket;
	}

	get order(): Partial<IOrder> {
		return this._order;
	}

	// === МЕТОДЫ ДЛЯ ТОВАРОВ ===

	setProducts(products: IProduct[]): void {
		// Преобразуем в классы Product для использования методов
		this._products = products.map((p) => new Product(p));
		this._events.emit('products:changed', { products: this._products });
	}

	selectProduct(product: IProduct): void {
		// Создаем экземпляр класса Product
		const productInstance = new Product(product);
		this._selectedProduct = productInstance;
		this._events.emit('product:selected', productInstance);
	}

	getProduct(id: ProductId): IProduct | undefined {
		return this._products.find((product) => product.id === id);
	}

	// === МЕТОДЫ ДЛЯ КОРЗИНЫ ===

	addToBasket(product: IProduct): void {
		// Создаем экземпляр класса Product для использования методов
		const productInstance = new Product(product);
		if (!productInstance.isAvailable) {
			this._events.emit('error', { error: 'Товар недоступен для покупки' });
			return;
		}

		this._basket.addItem(product);
		this._events.emit('basket:changed', this._basket);
	}

	removeFromBasket(productId: ProductId): void {
		this._basket.removeItem(productId);
		this._events.emit('basket:changed', this._basket);
	}

	clearBasket(): void {
		this._basket.clear();
		this._events.emit('basket:changed', this._basket);
	}

	getBasketTotal(): number {
		return this._basket.getTotal();
	}

	getBasketCount(): number {
		return this._basket.count;
	}

	// === МЕТОДЫ ДЛЯ ЗАКАЗА ===

	setOrderField<K extends keyof IOrder>(field: K, value: IOrder[K]): void {
		this._order[field] = value;
		this._events.emit('order:change', { field, value });

		// Валидация при изменении поля
		const errors = this.getOrderErrors();
		if (errors.length > 0) {
			this._events.emit('order:error', { errors });
		}
	}

	validateOrder(): boolean {
		if (
			!this._order.email ||
			!this._order.phone ||
			!this._order.address ||
			!this._order.payment
		) {
			return false;
		}

		const order = new Order({
			...(this._order as IOrder),
			items: this._basket.getSelectedItemIds(),
			total: this.getBasketTotal(),
		});

		return order.validate();
	}

	getOrderErrors(): string[] {
		const errors: string[] = [];

		if (!this._order.email) {
			errors.push('Укажите email');
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this._order.email)) {
			errors.push('Некорректный email');
		}

		if (!this._order.phone) {
			errors.push('Укажите телефон');
		} else if (!/^\+?[1-9]\d{1,14}$/.test(this._order.phone)) {
			errors.push('Некорректный номер телефона');
		}

		if (!this._order.address?.trim()) {
			errors.push('Укажите адрес доставки');
		}

		if (!this._order.payment) {
			errors.push('Выберите способ оплаты');
		}

		if (this._basket.isEmpty) {
			errors.push('Корзина пуста');
		}

		return errors;
	}

	getOrderData(): IOrder {
		if (!this.validateOrder()) {
			const errors = this.getOrderErrors();
			throw new Error(`Ошибка валидации: ${errors.join(', ')}`);
		}

		return {
			...(this._order as IOrder),
			items: this._basket.getSelectedItemIds(),
			total: this.getBasketTotal(),
		};
	}

	clearOrder(): void {
		this._order = {};
		this._events.emit('order:change', {});
	}

	// Методы для обработки результатов от презентера
	onOrderSuccess(result: IOrderResult): void {
		this.clearBasket();
		this.clearOrder();
		// Создаем экземпляр класса OrderResult для использования методов
		const orderResult = new OrderResult(result);
		this._events.emit('order:created', orderResult);
	}
}
