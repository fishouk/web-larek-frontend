import { Form } from './Form';
import { IContactFormView } from '../types/views';
import { ContactFormData } from '../types/order';
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

		// Обновление состояния кнопки при изменении полей
		this._form.addEventListener('input', (event) => {
			const target = event.target as HTMLInputElement;
			this._events.emit('contacts:change', {
				field: target.name,
				value: target.value,
			});
		});
	}

	// Сброс формы
	reset(): void {
		this._form.reset();
		this.clearErrors();
	}
}
