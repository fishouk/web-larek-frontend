import { Form } from './Form';
import { IContactFormView } from '../types/views';
import { ContactFormData, Order } from '../types/order';
import { PaymentMethod } from '../types/enums';
import { IEventEmitter } from '../types/events';

/**
 * Компонент формы контактов (email и телефон)
 */
export class ContactsForm
	extends Form<ContactFormData>
	implements IContactFormView
{
	constructor(container: HTMLElement, events: IEventEmitter) {
		super(container, events);
	}

	// Валидация формы контактов
	validate(): boolean {
		const formData = this.getFormData();

		try {
			new Order({
				email: formData.email || '',
				phone: formData.phone || '',
				address: 'temp', 
				payment: PaymentMethod.ONLINE,
				total: 1,
				items: ['temp'],
			});

			// Используем ту же логику валидации контактов, что и в классе Order
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			const phoneRegex = /^\+?[1-9]\d{1,14}$/;

			return (
				emailRegex.test(formData.email || '') &&
				phoneRegex.test(formData.phone || '')
			);
		} catch {
			return false;
		}
	}

	// Получение ошибок валидации
	getValidationErrors(): Record<string, string> {
		const errors: Record<string, string> = {};
		const formData = this.getFormData();

		// Используем те же регулярные выражения, что и в Order
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const phoneRegex = /^\+?[1-9]\d{1,14}$/;

		if (!formData.email) {
			errors.email = 'Укажите email';
		} else if (!emailRegex.test(formData.email)) {
			errors.email = 'Некорректный email';
		}

		if (!formData.phone) {
			errors.phone = 'Укажите телефон';
		} else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
			errors.phone = 'Некорректный номер телефона';
		}

		return errors;
	}

	// Сброс формы
	reset(): void {
		this._form.reset();
		this.clearErrors();
	}
}
