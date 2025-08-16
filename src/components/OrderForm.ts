import { Form } from './Form';
import { IOrderFormView } from '../types/views';
import { OrderFormData } from '../types/order';
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
				this._events.emit('order:change', { field: 'payment', value: payment });
			});
		});

		// Обновление данных при изменении полей
		this._form.addEventListener('input', (event) => {
			const target = event.target as HTMLInputElement;
			this._events.emit('order:change', {
				field: target.name,
				value: target.value,
			});
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
