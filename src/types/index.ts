// Базовые интерфейсы и абстракции
export interface IIdentifiable {
	id: string;
}

export interface IWithTotal {
	total: number;
}

export interface IValidatable {
	validate(): boolean;
}

// Абстрактный базовый класс для сущностей с идентификатором
export abstract class BaseEntity implements IIdentifiable {
	readonly id: string;

	constructor(id: string) {
		this.id = id;
	}
}

// Типы для категорий продуктов
export enum ProductCategory {
	SOFT_SKILL = 'софт-скил',
	OTHER = 'другое',
	ADDITIONAL = 'дополнительное',
	BUTTON = 'кнопка',
	HARD_SKILL = 'хард-скил',
}

// Типы оплаты
export enum PaymentMethod {
	ONLINE = 'online',
	CASH = 'cash',
}

// Интерфейс продукта
export interface IProduct extends IIdentifiable {
	description: string;
	image: string;
	title: string;
	category: ProductCategory;
	price: number | null;
}

// Класс продукта с валидацией
export class Product extends BaseEntity implements IProduct, IValidatable {
	description: string;
	image: string;
	title: string;
	category: ProductCategory;
	price: number | null;

	constructor(data: IProduct) {
		super(data.id);
		this.description = data.description;
		this.image = data.image;
		this.title = data.title;
		this.category = data.category;
		this.price = data.price;
	}

	// Проверка доступности для покупки
	get isAvailable(): boolean {
		return this.price !== null && this.price > 0;
	}

	// Валидация продукта
	validate(): boolean {
		return !!(this.id && this.title && this.description && this.category);
	}

	// Получение отформатированной цены
	getFormattedPrice(): string {
		return this.price === null ? 'Бесценно' : `${this.price} синапсов`;
	}
}

// Список продуктов
export interface IProductList extends IWithTotal {
	items: Product[];
	getAvailableProducts(): Product[];
	getProductsByCategory(category: ProductCategory): Product[];
}

export class ProductList implements IProductList {
	total: number;
	items: Product[];

	constructor(data: { total: number; items: IProduct[] }) {
		this.total = data.total;
		this.items = data.items.map((item) => new Product(item));
	}

	// Получение доступных продуктов
	getAvailableProducts(): Product[] {
		return this.items.filter((product) => product.isAvailable);
	}

	// Фильтрация по категории
	getProductsByCategory(category: ProductCategory): Product[] {
		return this.items.filter((product) => product.category === category);
	}
}

// Интерфейс для контактной информации
export interface IContactInfo {
	email: string;
	phone: string;
}

// Интерфейс для адреса доставки
export interface IDeliveryAddress {
	address: string;
}

// Интерфейс для способа оплаты
export interface IPaymentInfo {
	payment: PaymentMethod;
}

// Базовый интерфейс заказа
export interface IOrderBase
	extends IContactInfo,
		IDeliveryAddress,
		IPaymentInfo,
		IWithTotal {
	items: string[]; // массив ID продуктов
}

// Полный интерфейс заказа для создания
export type IOrder = IOrderBase;

// Интерфейс ответа на создание заказа
export interface IOrderResult extends IIdentifiable, IWithTotal {}

// Класс заказа с валидацией
export class Order implements IOrder, IValidatable {
	payment: PaymentMethod;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];

	constructor(data: IOrder) {
		Object.assign(this, data);
	}

	// Валидация заказа
	validate(): boolean {
		return (
			this.validateContactInfo() &&
			this.validateDelivery() &&
			this.validateItems() &&
			this.validateTotal()
		);
	}

	// Валидация контактной информации
	private validateContactInfo(): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const phoneRegex = /^\+?[1-9]\d{1,14}$/;

		return emailRegex.test(this.email) && phoneRegex.test(this.phone);
	}

	// Валидация доставки
	private validateDelivery(): boolean {
		return !!this.address && this.address.trim().length > 0;
	}

	// Валидация товаров
	private validateItems(): boolean {
		return Array.isArray(this.items) && this.items.length > 0;
	}

	// Валидация суммы
	private validateTotal(): boolean {
		return typeof this.total === 'number' && this.total > 0;
	}

	// Проверка способа оплаты
	isOnlinePayment(): boolean {
		return this.payment === PaymentMethod.ONLINE;
	}

	// Получение количества товаров
	getItemsCount(): number {
		return this.items.length;
	}
}

// Класс результата заказа
export class OrderResult extends BaseEntity implements IOrderResult {
	total: number;

	constructor(data: IOrderResult) {
		super(data.id);
		this.total = data.total;
	}
}

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

export interface IApiListResponse<T> extends IWithTotal {
	items: T[];
}

// Утилитарные типы
export type ProductId = string;
export type OrderId = string;

// Типы для форм
export type OrderFormData = Omit<IOrder, 'items' | 'total'>;
export type ContactFormData = Pick<IOrder, 'email' | 'phone'>;
export type DeliveryFormData = Pick<IOrder, 'address' | 'payment'>;

// Типы для корзины
export interface IBasketItem {
	product: IProduct;
	selected: boolean;
}

export class BasketItem implements IBasketItem {
	product: Product;
	selected = true;

	constructor(product: IProduct) {
		this.product = new Product(product);
	}

	// Получение цены товара в корзине
	getPrice(): number {
		return this.product.price || 0;
	}
}

// Интерфейс корзины
export interface IBasket {
	items: IBasketItem[];
	getTotal(): number;
	getSelectedItems(): IBasketItem[];
	addItem(product: IProduct): void;
	removeItem(productId: string): void;
	clear(): void;
}

export class Basket implements IBasket {
	items: BasketItem[] = [];

	// Добавление товара в корзину
	addItem(product: IProduct): void {
		const existingItem = this.items.find(
			(item) => item.product.id === product.id
		);

		if (!existingItem && product.price !== null) {
			this.items.push(new BasketItem(product));
		}
	}

	// Удаление товара из корзины
	removeItem(productId: string): void {
		this.items = this.items.filter((item) => item.product.id !== productId);
	}

	// Очистка корзины
	clear(): void {
		this.items = [];
	}

	// Получение общей суммы
	getTotal(): number {
		return this.getSelectedItems().reduce(
			(total, item) => total + item.getPrice(),
			0
		);
	}

	// Получение выбранных товаров
	getSelectedItems(): BasketItem[] {
		return this.items.filter((item) => item.selected);
	}

	// Получение ID выбранных товаров
	getSelectedItemIds(): string[] {
		return this.getSelectedItems().map((item) => item.product.id);
	}

	// Проверка наличия товаров
	get isEmpty(): boolean {
		return this.items.length === 0;
	}

	// Количество товаров
	get count(): number {
		return this.getSelectedItems().length;
	}
}

// Типы для событий
export type EventMap = {
	'products:loaded': IProductList;
	'product:selected': IProduct;
	'basket:changed': IBasket;
	'order:created': IOrderResult;
	'form:submit': IOrder;
	'modal:open': unknown;
	'modal:close': unknown;
};

// Интерфейс для работы с API
export interface IWebLarekAPI {
	getProductList(): Promise<IProductList>;
	getProduct(id: ProductId): Promise<IProduct>;
	createOrder(order: IOrder): Promise<IOrderResult>;
}

// Интерфейсы отображений

// Базовый интерфейс для всех компонентов
export interface IView<T = object> {
	render(data?: T): HTMLElement;
}

// Интерфейс для компонентов с возможностью установки контента
export interface IViewWithContent extends IView {
	setText(selector: string, value: string): void;
	setImage(selector: string, src: string, alt?: string): void;
	setHidden(selector: string, hidden: boolean): void;
	setDisabled(selector: string, disabled: boolean): void;
}

// Интерфейс для отображения продукта в каталоге
export interface IProductCardView extends IViewWithContent {
	render(data?: { product: IProduct }): HTMLElement;
}

// Интерфейс для отображения продукта в корзине
export interface IBasketItemView extends IViewWithContent {
	render(data?: { item: IBasketItem }): HTMLElement;
}

// Интерфейс для отображения модального окна
export interface IModalView extends IView {
	open(): void;
	close(): void;
	setContent(content: HTMLElement): void;
}

// Интерфейс для отображения корзины
export interface IBasketView extends IView {
	render(data?: { basket: IBasket }): HTMLElement;
	updateCounter(count: number): void;
	updateTotal(total: number): void;
}

// Интерфейс для отображения формы
export interface IFormView<T = object> extends IView<T> {
	getFormData(): T;
	setFormData(data: T): void;
	validate(): boolean;
	clearErrors(): void;
	showErrors(errors: Record<string, string>): void;
}

// Интерфейс для формы заказа
export interface IOrderFormView extends IFormView<OrderFormData> {
	setPaymentMethod(method: PaymentMethod): void;
}

// Интерфейс для формы контактов
export type IContactFormView = IFormView<ContactFormData>;

// Интерфейс для отображения успешного заказа
export interface IOrderSuccessView extends IView {
	render(data?: { result: IOrderResult }): HTMLElement;
}

// Интерфейс для отображения страницы
export interface IPageView extends IView {
	setProductList(products: IProduct[]): void;
	setBasketCounter(count: number): void;
	setLocked(locked: boolean): void;
}

// Интерфейсы базовых классов

// Базовый класс для всех компонентов
export interface IComponent<T = object> {
	container: HTMLElement;
	render(data?: T): HTMLElement;
	toggleClass(className: string, force?: boolean): void;
	setText(selector: string, value: string): void;
	setDisabled(selector: string, disabled: boolean): void;
	setHidden(selector: string, hidden: boolean): void;
	setImage(selector: string, src: string, alt?: string): void;
}

// Интерфейс для компонентов с событиями
export interface IEventEmitter {
	on<T extends keyof EventMap>(
		event: T,
		callback: (data: EventMap[T]) => void
	): void;
	emit<T extends keyof EventMap>(event: T, data?: EventMap[T]): void;
	off<T extends keyof EventMap>(
		event: T,
		callback: (data: EventMap[T]) => void
	): void;
}

// Интерфейс модели данных
export interface IAppState {
	products: IProduct[];
	basket: IBasket;
	order: Partial<IOrder>;
	loading: boolean;
	error: string | null;

	// Методы управления продуктами
	setProducts(products: IProduct[]): void;
	getProduct(id: ProductId): IProduct | undefined;

	// Методы управления корзиной
	addToBasket(product: IProduct): void;
	removeFromBasket(productId: ProductId): void;
	clearBasket(): void;

	// Методы управления заказом
	setOrderField<K extends keyof IOrder>(field: K, value: IOrder[K]): void;
	validateOrder(): boolean;
	clearOrder(): void;

	// Методы состояния
	setLoading(loading: boolean): void;
	setError(error: string | null): void;
}

// Дополнительные типы для отображений

// Тип данных для рендеринга карточки продукта
export type ProductCardData = {
	product: IProduct;
	inBasket?: boolean;
	onClick?: (product: IProduct) => void;
};

// Тип данных для рендеринга элемента корзины
export type BasketItemData = {
	item: IBasketItem;
	index: number;
	onRemove?: (productId: ProductId) => void;
};

// Тип данных для формы
export type FormData = {
	values: Record<string, string>;
	errors: Record<string, string>;
	valid: boolean;
};

// Селекторы для DOM элементов
export type DOMSelectors = {
	readonly [key: string]: string;
};

// Конфигурация для компонентов
export interface IComponentConfig {
	selector: string;
	template?: string;
	events?: Record<string, string>;
}

// Расширенные типы событий с данными для View
export type ViewEventMap = EventMap & {
	'card:select': { product: IProduct };
	'basket:add': { product: IProduct };
	'basket:remove': { productId: ProductId };
	'basket:open': void;
	'order:open': void;
	'order:submit': IOrder;
	'contacts:submit': ContactFormData;
	'payment:change': PaymentMethod;
	'form:change': { field: string; value: string };
	'form:error': { field: string; error: string };
};

// Тип для валидации полей формы
export type FormValidator<T = object> = {
	[K in keyof T]?: (value: T[K]) => string | null;
};

// Типы ошибок валидации
export type ValidationErrors<T = object> = {
	[K in keyof T]?: string;
};

// Состояния UI
export enum UIState {
	LOADING = 'loading',
	LOADED = 'loaded',
	ERROR = 'error',
	EMPTY = 'empty',
}

// Интерфейс для управления состоянием UI
export interface IUIStateManager {
	setState(state: UIState): void;
	getState(): UIState;
	isLoading(): boolean;
	hasError(): boolean;
}

// Интерфейсы для управления модальными окнами

// Интерфейс для отдельного модального окна
export interface IModal {
	element: HTMLElement;
	contentElement: HTMLElement;
	closeButton: HTMLElement;
	isOpen: boolean;

	open(): void;
	close(): void;
	setContent(content: HTMLElement | string): void;
	render(data?: unknown): HTMLElement;
}

// Интерфейс для менеджера модальных окон
export interface IModalManager {
	activeModal: IModal | null;
	modalContainer: HTMLElement;

	// Основные методы управления
	open(modal: IModal): void;
	close(modal?: IModal): void;
	closeAll(): void;

	// Проверки состояния
	isAnyOpen(): boolean;
	getActiveModal(): IModal | null;

	// Управление содержимым
	setModalContent(content: HTMLElement | string, modal?: IModal): void;

	// События
	onModalOpen?: (modal: IModal) => void;
	onModalClose?: (modal: IModal) => void;
	onModalContentChange?: (modal: IModal, content: HTMLElement | string) => void;
}

// Конфигурация для создания модального окна
export interface IModalConfig {
	selector?: string;
	closeOnOverlayClick?: boolean;
	closeOnEscapeKey?: boolean;
	autoFocus?: boolean;
	restoreFocus?: boolean;
	className?: string;
	contentSelector?: string;
	closeButtonSelector?: string;
}

// Типы модальных окон
export enum ModalType {
	PRODUCT_PREVIEW = 'product-preview',
	BASKET = 'basket',
	ORDER_FORM = 'order-form',
	CONTACTS_FORM = 'contacts-form',
	ORDER_SUCCESS = 'order-success',
}

// Данные для различных типов модалок
export type ModalData = {
	[ModalType.PRODUCT_PREVIEW]: { product: IProduct };
	[ModalType.BASKET]: { basket: IBasket };
	[ModalType.ORDER_FORM]: { order: Partial<IOrder> };
	[ModalType.CONTACTS_FORM]: { order: Partial<IOrder> };
	[ModalType.ORDER_SUCCESS]: { result: IOrderResult };
};

// Типизированный интерфейс для конкретных модалок
export interface ITypedModal<T extends ModalType> extends IModal {
	type: T;
	render(data: ModalData[T]): HTMLElement;
}

// Интерфейс для фабрики модальных окон
export interface IModalFactory {
	createModal<T extends ModalType>(
		type: T,
		config?: IModalConfig
	): ITypedModal<T>;
	getModalTemplate(type: ModalType): HTMLTemplateElement | null;
}

// События для модальных окон
export type ModalEventMap = {
	'modal:open': { modal: IModal; type?: ModalType };
	'modal:close': { modal: IModal; type?: ModalType };
	'modal:content-change': { modal: IModal; content: HTMLElement | string };
	'modal:overlay-click': { modal: IModal };
	'modal:escape-key': { modal: IModal };
	'modal:before-open': { modal: IModal };
	'modal:after-open': { modal: IModal };
	'modal:before-close': { modal: IModal };
	'modal:after-close': { modal: IModal };
};

// Состояния модального окна
export enum ModalState {
	CLOSED = 'closed',
	OPENING = 'opening',
	OPEN = 'open',
	CLOSING = 'closing',
}

// Интерфейс для анимации модальных окон
export interface IModalAnimator {
	animateOpen(modal: IModal): Promise<void>;
	animateClose(modal: IModal): Promise<void>;
	setDuration(duration: number): void;
	setEasing(easing: string): void;
}

// CSS классы для модальных окон
export const MODAL_CLASSES = {
	MODAL: 'modal',
	MODAL_ACTIVE: 'modal_active',
	MODAL_CONTAINER: 'modal__container',
	MODAL_CONTENT: 'modal__content',
	MODAL_CLOSE: 'modal__close',
	MODAL_OVERLAY: 'modal__overlay',
	MODAL_OPENING: 'modal_opening',
	MODAL_CLOSING: 'modal_closing',
} as const;

// Селекторы для поиска элементов модалки
export const MODAL_SELECTORS = {
	MODAL: '.modal',
	MODAL_CONTAINER: '.modal__container',
	MODAL_CONTENT: '.modal__content',
	MODAL_CLOSE: '.modal__close',
	MODAL_ACTIVE: '.modal_active',
} as const;

// Утилитарные типы для модалок
export type ModalSelector =
	(typeof MODAL_SELECTORS)[keyof typeof MODAL_SELECTORS];
export type ModalClassName = (typeof MODAL_CLASSES)[keyof typeof MODAL_CLASSES];

// Расширение EventMap с событиями модалок
export type ExtendedEventMap = EventMap & ViewEventMap & ModalEventMap;

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

// События
export type MVCEventMap = {
	// События модели
	'model:change': unknown;
	'model:products-loaded': Product[];
	'model:product-selected': Product;
	'model:basket-changed': Basket;
	'model:order-updated': Partial<IOrder>;
	'model:order-created': IOrderResult;

	// События представления
	'view:product-select': { productId: ProductId };
	'view:add-to-basket': { productId: ProductId };
	'view:remove-from-basket': { productId: ProductId };
	'view:open-basket': void;
	'view:start-order': void;
	'view:submit-order': IOrder;
	'view:order-complete': void;

	// События контроллера
	'controller:init': void;
	'controller:destroy': void;
	'controller:error': { error: string; context?: string };
};

// Полная карта событий приложения
export type AppEventMap = ExtendedEventMap & MVCEventMap;
