import { Product } from './product';
import { Basket } from './basket';
import { IOrder, IOrderResult } from './order';
import { ProductId } from './base';
import { IEventEmitter } from './events';
import { IModalManager } from './modal';
import { IPageView, IProductCardView, IBasketView, IOrderFormView, IContactFormView, IOrderSuccessView } from './views';

// Интерфейс для модели
export interface IMVCModel<T = unknown> {
	data: T;

	// Основные методы модели
	getData(): T;
	setData(data: T): void;
	updateData(data: Partial<T>): void;
	resetData(): void;

	// Валидация
	validate(): boolean;
	getValidationErrors(): Record<string, string>;
}

// Интерфейс для представления
export interface IMVCView<TData = unknown> {
	container: HTMLElement;

	// Основные методы представления
	render(data?: TData): HTMLElement;
	update(data: Partial<TData>): void;
	destroy(): void;

	// Управление элементами
	show(): void;
	hide(): void;
	toggle(visible?: boolean): void;

	// Работа с событиями
	bindEvents(): void;
	unbindEvents(): void;
}

// Интерфейс для контроллера
export interface IMVCController<TModel = unknown, TView = unknown> {
	model: TModel;
	view: TView;

	// Основные методы контроллера
	init(): void;
	destroy(): void;

	// Обработка событий
	handleViewEvent(event: string, data?: unknown): void;
	handleModelEvent(event: string, data?: unknown): void;
}

// Абстрактные базовые классы

// Базовая модель
export abstract class BaseMVCModel<T = unknown> implements IMVCModel<T> {
	protected _data: T;
	protected _events: IEventEmitter;

	constructor(data: T, events: IEventEmitter) {
		this._data = data;
		this._events = events;
	}

	get data(): T {
		return this._data;
	}

	abstract getData(): T;
	abstract setData(data: T): void;
	abstract updateData(data: Partial<T>): void;
	abstract resetData(): void;
	abstract validate(): boolean;
	abstract getValidationErrors(): Record<string, string>;

	protected emitChange(): void {
		(this._events as any).emit('model:change', this._data);
	}
}

// Базовое представление
export abstract class BaseMVCView<TData = unknown> implements IMVCView<TData> {
	protected _container: HTMLElement;
	protected _events: IEventEmitter;

	constructor(container: HTMLElement, events: IEventEmitter) {
		this._container = container;
		this._events = events;
		this.bindEvents();
	}

	get container(): HTMLElement {
		return this._container;
	}

	abstract render(data?: TData): HTMLElement;
	abstract update(data: Partial<TData>): void;

	show(): void {
		this._container.style.display = '';
	}

	hide(): void {
		this._container.style.display = 'none';
	}

	toggle(visible?: boolean): void {
		if (visible === undefined) {
			visible = this._container.style.display === 'none';
		}
		visible ? this.show() : this.hide();
	}

	destroy(): void {
		this.unbindEvents();
		this._container.remove();
	}

	abstract bindEvents(): void;
	abstract unbindEvents(): void;
}

// Базовый контроллер
export abstract class BaseMVCController<TModel = unknown, TView = unknown>
	implements IMVCController<TModel, TView>
{
	protected _model: TModel;
	protected _view: TView;
	protected _events: IEventEmitter;

	constructor(model: TModel, view: TView, events: IEventEmitter) {
		this._model = model;
		this._view = view;
		this._events = events;
	}

	get model(): TModel {
		return this._model;
	}

	get view(): TView {
		return this._view;
	}

	abstract init(): void;
	abstract destroy(): void;
	abstract handleViewEvent(event: string, data?: unknown): void;
	abstract handleModelEvent(event: string, data?: unknown): void;
}

// Модель приложения
export interface IAppModel
	extends IMVCModel<{
		products: Product[];
		basket: Basket;
		order: Partial<IOrder>;
		selectedProduct: Product | null;
	}> {
	// Продукты
	loadProducts(): Promise<void>;
	getProduct(id: ProductId): Product | undefined;
	selectProduct(product: Product): void;

	// Корзина
	addToBasket(product: Product): void;
	removeFromBasket(productId: ProductId): void;
	clearBasket(): void;
	getBasketTotal(): number;

	// Заказ
	setOrderField<K extends keyof IOrder>(field: K, value: IOrder[K]): void;
	createOrder(): Promise<IOrderResult>;
	clearOrder(): void;
}

// Представления приложения
export interface IAppViews {
	page: IPageView;
	modal: IModalManager;
	productCard: IProductCardView;
	basket: IBasketView;
	orderForm: IOrderFormView; 
	contactsForm: IContactFormView;
	orderSuccess: IOrderSuccessView; 
}

// Главный контроллер приложения
export interface IAppController extends IMVCController<IAppModel, IAppViews> {
	// Инициализация приложения
	start(): Promise<void>;

	// Обработчики действий пользователя
	onProductSelect(product: Product): void;
	onAddToBasket(product: Product): void;
	onRemoveFromBasket(productId: ProductId): void;
	onOpenBasket(): void;
	onStartOrder(): void;
	onSubmitOrder(orderData: IOrder): void;
	onOrderComplete(result: IOrderResult): void;
}
