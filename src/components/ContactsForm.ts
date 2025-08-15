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

		// Обновление состояния кнопки при изменении формы
		this._form.addEventListener('input', () => {
			this._submit.disabled = !this.validate();
		});
	}

	// Валидация формы контактов
	validate(): boolean {
		const formData = this.getFormData();

		try {
			const tempOrder = new Order({
				email: formData.email || '',
				phone: formData.phone || '',
				address: 'temp',
				payment: PaymentMethod.ONLINE,
				total: 1,
				items: ['temp'],
			});

			// Используем публичный метод валидации контактов из класса Order
			return tempOrder.validateContactInfo();
		} catch {
			return false;
		}
	}

	// Получение ошибок валидации - используем класс Order
	getValidationErrors(): Record<string, string> {
		const errors: Record<string, string> = {};
		const formData = this.getFormData();

		try {
			const tempOrder = new Order({
				email: formData.email || '',
				phone: formData.phone || '',
				address: 'temp',
				payment: PaymentMethod.ONLINE,
				total: 1,
				items: ['temp'],
			});

			// Проверяем каждое поле отдельно, используя логику из класса Order
			if (!formData.email) {
				errors.email = 'Укажите email';
			} else if (!tempOrder.validateContactInfo()) {
				// Если общая валидация не прошла, проверим email отдельно
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(formData.email)) {
					errors.email = 'Некорректный email';
				}
			}

			if (!formData.phone) {
				errors.phone = 'Укажите телефон';
			} else if (!tempOrder.validateContactInfo()) {
				// Если общая валидация не прошла, проверим телефон отдельно
				const phoneRegex = /^\+?[1-9]\d{1,14}$/;
				if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
					errors.phone = 'Некорректный номер телефона';
				}
			}
		} catch {
			errors.email = 'Некорректный email';
			errors.phone = 'Некорректный телефон';
		}

		return errors;
	}

	// Сброс формы
	reset(): void {
		this._form.reset();
		this.clearErrors();
	}
}
