import { IComponent } from '../../types/views';
import { ensureElement } from '../../utils/utils';

/**
 * Базовый класс для всех компонентов отображения
 */
export abstract class Component<T = object> implements IComponent<T> {
	protected _container: HTMLElement;

	constructor(container: HTMLElement) {
		this._container = container;
	}

	get container(): HTMLElement {
		return this._container;
	}

	// Переключение класса
	toggleClass(className: string, force?: boolean): void {
		this._container.classList.toggle(className, force);
	}

	// Установка текста элемента
	setText(selector: string, value: string): void {
		const element = ensureElement(selector, this._container);
		element.textContent = value;
	}

	// Включение/отключение элемента
	setDisabled(selector: string, disabled: boolean): void {
		const element = ensureElement(selector, this._container);
		if (
			element instanceof HTMLButtonElement ||
			element instanceof HTMLInputElement
		) {
			element.disabled = disabled;
		} else {
			element.classList.toggle('disabled', disabled);
		}
	}

	// Скрытие/показ элемента
	setHidden(selector: string, hidden: boolean): void {
		const element = ensureElement(selector, this._container);
		element.style.display = hidden ? 'none' : '';
	}

	// Установка изображения
	setImage(selector: string, src: string, alt?: string): void {
		const element = ensureElement<HTMLImageElement>(selector, this._container);
		element.src = src;
		if (alt) {
			element.alt = alt;
		}
	}

	// Установка значения input элемента
	protected setInputValue(selector: string, value: string): void {
		const element = ensureElement<HTMLInputElement>(selector, this._container);
		element.value = value;
	}

	// Получение значения input элемента
	protected getInputValue(selector: string): string {
		const element = ensureElement<HTMLInputElement>(selector, this._container);
		return element.value;
	}

	// Добавление обработчика события
	protected addEventListener(
		selector: string,
		event: string,
		handler: EventListener
	): void {
		const element = ensureElement(selector, this._container);
		element.addEventListener(event, handler);
	}

	// Удаление обработчика события
	protected removeEventListener(
		selector: string,
		event: string,
		handler: EventListener
	): void {
		const element = ensureElement(selector, this._container);
		element.removeEventListener(event, handler);
	}

	abstract render(data?: T): HTMLElement;
}
