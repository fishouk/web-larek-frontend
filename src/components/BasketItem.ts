import { Component } from './base/Component';
import { IProduct } from '../types/product';
import { IEventEmitter } from '../types/events';
import { cloneTemplate, ensureElement } from '../utils/utils';

export interface IBasketItem {
	render(data: { product: IProduct; index: number }): HTMLElement;
}

export class BasketItem
	extends Component<{ product: IProduct; index: number }>
	implements IBasketItem
{
	protected _template: HTMLTemplateElement;
	protected _events: IEventEmitter;

	constructor(template: HTMLTemplateElement, events: IEventEmitter) {
		const tempContainer = template.content.cloneNode(true) as DocumentFragment;
		super(tempContainer.firstElementChild as HTMLElement);
		this._template = template;
		this._events = events;
	}

	render(data: { product: IProduct; index: number }): HTMLElement {
		const { product, index } = data;
		const itemElement = cloneTemplate<HTMLElement>(this._template);

		const indexElement = ensureElement('.basket__item-index', itemElement);
		const titleElement = ensureElement('.card__title', itemElement);
		const priceElement = ensureElement('.card__price', itemElement);
		const deleteButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			itemElement
		);

		indexElement.textContent = String(index + 1);
		titleElement.textContent = product.title;
		priceElement.textContent = `${product.price} синапсов`;

		deleteButton.addEventListener('click', () => {
			this._events.emit('basket:remove', { productId: product.id });
		});

		return itemElement;
	}
}
