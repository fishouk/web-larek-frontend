import { Component } from './base/Component';
import { IBasketView } from '../types/views';
import { IEventEmitter } from '../types/events';
import { ensureElement } from '../utils/utils';

/**
 * Компонент корзины
 */
export class Basket extends Component implements IBasketView {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLButtonElement;
	protected _events: IEventEmitter;

	constructor(container: HTMLElement, events: IEventEmitter) {
		super(container);
		this._events = events;

		this._list = ensureElement<HTMLElement>('.basket__list', container);
		this._total = ensureElement<HTMLElement>('.basket__price', container);
		this._button = ensureElement<HTMLButtonElement>(
			'.basket__button',
			container
		);

		this._button.addEventListener('click', () => {
			this._events.emit('order:open', {});
		});
	}

	// Установка элементов списка
	setItems(items: HTMLElement[]): void {
		this._list.innerHTML = '';
		if (items.length === 0) {
			this._list.innerHTML = '<p class="basket__empty">Корзина пуста</p>';
			this.setDisabled('.basket__button', true);
		} else {
			items.forEach((item) => this._list.appendChild(item));
			this.setDisabled('.basket__button', false);
		}
	}

	// Установка общей суммы
	setTotal(total: number): void {
		this.setText('.basket__price', `${total} синапсов`);
	}

	// Рендеринг корзины
	render(): HTMLElement {
		return this.container;
	}
}
