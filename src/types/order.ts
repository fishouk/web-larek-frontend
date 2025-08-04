import { IIdentifiable, IValidatable, BaseEntity } from './base';
import { PaymentMethod } from './enums';

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
		IPaymentInfo {
	total: number;
	items: string[]; // массив ID продуктов
}

// Полный интерфейс заказа для создания
export type IOrder = IOrderBase;

// Интерфейс ответа на создание заказа
export interface IOrderResult extends IIdentifiable {
	total: number;
}

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

	// Получение отформатированной суммы
	getFormattedTotal(): string {
		return `${this.total} синапсов`;
	}
}

// Типы для форм
export type OrderFormData = Omit<IOrder, 'items' | 'total'>;
export type ContactFormData = Pick<IOrder, 'email' | 'phone'>;
export type DeliveryFormData = Pick<IOrder, 'address' | 'payment'>;
