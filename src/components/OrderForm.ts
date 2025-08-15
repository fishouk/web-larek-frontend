import { Form } from './Form';
import { IOrderFormView } from '../types/views';
import { OrderFormData, Order } from '../types/order';
import { PaymentMethod } from '../types/enums';
import { IEventEmitter } from '../types/events';

/**
 * Компонент формы заказа (способ оплаты и адрес)
 */
export class OrderForm extends Form<OrderFormData> implements IOrderFormView {
	protected _paymentButtons: HTMLButtonElement[];
	protected _selectedPayment: PaymentMethod | null = null;

	constructor(container: HTMLElement, events: IEventEmitter) {
		super(container, events);

		this._paymentButtons = Array.from(
			container.querySelectorAll('.order__buttons .button')
		) as HTMLButtonElement[];

		this._paymentButtons.forEach((button) => {
			button.addEventListener('click', () => {
				const payment = button.name as PaymentMethod;
				this.setPaymentMethod(payment);
				this.onInputChange('payment', payment);
			});
		});

		// Обновление состояния кнопки 'Далее'
		this._form.addEventListener('input', () => {
			this._submit.disabled = !this.validate();
		});
	}

	// Установка способа оплаты
	setPaymentMethod(method: PaymentMethod): void {
		this._selectedPayment = method;

		this._paymentButtons.forEach((button) => {
			button.classList.toggle('button_alt-active', button.name === method);
		});
	}

	// Получение данных формы с учетом способа оплаты
	getFormData(): OrderFormData {
		const formData = super.getFormData();
		return {
			...formData,
			payment: this._selectedPayment,
		} as OrderFormData;
	}

	// Установка данных формы
	setFormData(data: OrderFormData): void {
		super.setFormData(data);
		if (data.payment) {
			this.setPaymentMethod(data.payment);
		}
	}

	// Валидация формы заказа - используем класс Order
	validate(): boolean {
		const formData = this.getFormData();

		try {
			const tempOrder = new Order({
				email: 'temp@temp.com', // Временные данные
				phone: '+1234567890',
				address: formData.address || '',
				payment: this._selectedPayment || PaymentMethod.ONLINE,
				total: 1,
				items: ['temp'],
			});

			// Используем публичный метод валидации доставки из класса Order
			return tempOrder.validateDelivery() && this._selectedPayment !== null;
		} catch {
			return false;
		}
	}

	// Сброс формы
	reset(): void {
		this._form.reset();
		this._selectedPayment = null;
		this._paymentButtons.forEach((button) => {
			button.classList.remove('button_alt-active');
		});
		this.clearErrors();
	}
}
