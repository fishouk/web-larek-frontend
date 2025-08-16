import { IProduct } from './product';
import { IBasket } from './basket';
import { IOrderResult, OrderFormData, ContactFormData } from './order';
import { PaymentMethod } from './enums';

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
	render(data?: { item: IBasket }): HTMLElement;
}

// Интерфейс для отображения модального окна
export interface IModalView extends IView {
	open(): void;
	close(): void;
	setContent(content: HTMLElement): void;
}

// Интерфейс для отображения корзины
export interface IBasketView extends IView {
	render(): HTMLElement;
	setItems(items: HTMLElement[]): void;
	setTotal(total: number): void;
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

// Тип данных для формы
export type FormData = {
	values: Record<string, string>;
	errors: Record<string, string>;
	valid: boolean;
};

// Тип для валидации полей формы
export type FormValidator<T = object> = {
	[K in keyof T]?: (value: T[K]) => string | null;
};

// Типы ошибок валидации
export type ValidationErrors<T = object> = {
	[K in keyof T]?: string;
};
