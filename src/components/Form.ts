import { Component } from './base/Component';
import { IFormView } from '../types/views';
import { IEventEmitter } from '../types/events';
import { ensureElement } from '../utils/utils';

/**
 * Базовый класс для форм
 */
export class Form<T extends Record<string, any>>
	extends Component<T>
	implements IFormView<T>
{
	protected _submit: HTMLButtonElement;
	protected _errors: HTMLElement;
	protected _events: IEventEmitter;
	protected _form: HTMLFormElement;

	constructor(container: HTMLElement, events: IEventEmitter) {
		super(container);
		this._events = events;

		this._form = ensureElement<HTMLFormElement>('form', container);
		this._submit = ensureElement<HTMLButtonElement>('[type=submit]', container);
		this._errors = ensureElement<HTMLElement>('.form__errors', container);

		this._form.addEventListener('input', (event) => {
			const target = event.target as HTMLInputElement;
			const field = target.name;
			const value = target.value;
			this.onInputChange(field, value);
		});

		this._form.addEventListener('submit', (event) => {
			event.preventDefault();
			// Эмитируем событие с корректным типом в зависимости от имени формы
			if (this._form.name === 'order') {
				this._events.emit('order:submit', this.getFormData() as any);
			} else if (this._form.name === 'contacts') {
				this._events.emit('contacts:submit', this.getFormData() as any);
			} else {
				this._events.emit('form:submit', this.getFormData() as any);
			}
		});
	}

	// Обработчик изменения поля формы
	protected onInputChange(field: string, value: string): void {
		this._events.emit('form:change', { field, value });
	}

	// Получение данных формы
	getFormData(): T {
		const formData = new FormData(this._form);
		const result: Record<string, any> = {};

		for (const [key, value] of formData.entries()) {
			result[key] = value;
		}

		return result as T;
	}

	// Установка данных формы
	setFormData(data: T): void {
		for (const [key, value] of Object.entries(data)) {
			const input = this._form.elements.namedItem(key) as HTMLInputElement;
			if (input) {
				input.value = String(value);
			}
		}
	}

	// Валидация формы
	validate(): boolean {
		// Базовая валидация - проверяем, что все обязательные поля заполнены
		const inputs = this._form.querySelectorAll('input[required]');
		return Array.from(inputs).every(
			(input: HTMLInputElement) => input.value.trim() !== ''
		);
	}

	// Очистка ошибок
	clearErrors(): void {
		this._errors.textContent = '';
		this.setDisabled('[type=submit]', false);
	}

	// Показ ошибок
	showErrors(errors: Record<string, string>): void {
		const errorMessages = Object.values(errors);
		this._errors.textContent = errorMessages.join('; ');
		this.setDisabled('[type=submit]', errorMessages.length > 0);
	}

	// Установка валидности формы
	setValid(valid: boolean): void {
		this.setDisabled('[type=submit]', !valid);
	}

	// Установка ошибок
	setErrors(errors: string[]): void {
		this._errors.textContent = errors.join(', ');
		this.setDisabled('[type=submit]', errors.length > 0);
	}

	render(data?: T): HTMLElement {
		if (data) {
			this.setFormData(data);
		}
		return this.container;
	}
}
