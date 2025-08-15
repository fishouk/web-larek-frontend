import { Component } from './base/Component';
import { IModalView } from '../types/views';
import { IEventEmitter } from '../types/events';
import { ensureElement } from '../utils/utils';

/**
 * Компонент модального окна
 */
export class Modal extends Component<unknown> implements IModalView {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;
	protected _events: IEventEmitter;

	constructor(container: HTMLElement, events: IEventEmitter) {
		super(container);
		this._events = events;

		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);
		this._content = ensureElement<HTMLElement>('.modal__content', container);

		this._closeButton.addEventListener('click', this.close.bind(this));
		container.addEventListener('click', this.close.bind(this));
		this._content.addEventListener('click', (event) => event.stopPropagation());
	}

	// Установка содержимого модального окна
	setContent(content: HTMLElement): void {
		this._content.replaceChildren(content);
	}

	// Открытие модального окна
	open(): void {
		this.toggleClass('modal_active', true);
		this._events.emit('modal:open', {});
	}

	// Закрытие модального окна
	close(): void {
		this.toggleClass('modal_active', false);
		this.setContent(document.createElement('div'));
		this._events.emit('modal:close', {});
	}

	// Рендеринг модального окна
	render(data?: unknown): HTMLElement {
		return this.container;
	}
}
