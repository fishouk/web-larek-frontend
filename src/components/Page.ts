import { Component } from './base/Component';
import { IPageView } from '../types/views';
import { IProduct } from '../types/product';
import { IEventEmitter } from '../types/events';
import { ensureElement } from '../utils/utils';

/**
 * Компонент главной страницы
 */
export class Page extends Component implements IPageView {
	protected _counter: HTMLElement;
	protected _gallery: HTMLElement;
	protected _wrapper: HTMLElement;
	protected _basket: HTMLButtonElement;
	protected _events: IEventEmitter;

	constructor(container: HTMLElement, events: IEventEmitter) {
		super(container);
		this._events = events;

		this._counter = ensureElement<HTMLElement>(
			'.header__basket-counter',
			container
		);
		this._gallery = ensureElement<HTMLElement>('.gallery', container);
		this._wrapper = ensureElement<HTMLElement>('.page__wrapper', container);
		this._basket = ensureElement<HTMLButtonElement>(
			'.header__basket',
			container
		);

		this._basket.addEventListener('click', () => {
			this._events.emit('basket:open', {});
		});
	}

	// Установка списка товаров
	setProductList(products: IProduct[]): void {
		// Gallery компонент будет управлять отображением товаров
		// Здесь мы только эмитируем событие для обновления галереи
		this._events.emit('products:changed', { products });
	}

	// Установка счетчика корзины
	setBasketCounter(count: number): void {
		this.setText('.header__basket-counter', String(count));
	}

	// Блокировка/разблокировка страницы (например, при открытии модального окна)
	setLocked(locked: boolean): void {
		this._wrapper.classList.toggle('page__wrapper_locked', locked);
	}

	render(): HTMLElement {
		return this.container;
	}
}
