import { Component } from './base/Component';
import { IBasketView } from '../types/views';
import { IBasket, IBasketItem } from '../types/basket';
import { IEventEmitter } from '../types/events';
import { ensureElement, cloneTemplate } from '../utils/utils';

/**
 * Компонент корзины
 */
export class Basket
	extends Component<{ basket: IBasket }>
	implements IBasketView
{
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLButtonElement;
	protected _events: IEventEmitter;
	protected _itemTemplate: HTMLTemplateElement;

	constructor(
		container: HTMLElement,
		events: IEventEmitter,
		itemTemplate?: HTMLTemplateElement
	) {
		super(container);
		this._events = events;

		this._list = ensureElement<HTMLElement>('.basket__list', container);
		this._total = ensureElement<HTMLElement>('.basket__price', container);
		this._button = ensureElement<HTMLButtonElement>(
			'.basket__button',
			container
		);

		if (itemTemplate) {
			this._itemTemplate = itemTemplate;
		}

		this._button.addEventListener('click', () => {
			this._events.emit('order:open', {});
		});
	}

	// Обновление счетчика товаров
	updateCounter(count: number): void {
		// Счетчик обновляется в компоненте Page
	}

	// Обновление общей суммы
	updateTotal(total: number): void {
		this.setText('.basket__price', `${total} синапсов`);
	}

	// Рендеринг корзины
	render(data?: { basket: IBasket }): HTMLElement {
		if (data && data.basket) {
			const basket = data.basket;

			// Очищаем список
			this._list.innerHTML = '';

			if (basket.isEmpty) {
				// Показываем сообщение о пустой корзине
				const emptyMessage = document.createElement('p');
				emptyMessage.textContent = 'Корзина пуста';
				emptyMessage.className = 'basket__empty';
				this._list.appendChild(emptyMessage);

				this.setDisabled('.basket__button', true);
			} else {
				// Отображаем товары в корзине
				basket.items.forEach((item, index) => {
					if (this._itemTemplate) {
						const basketItem = this.renderBasketItem(item, index + 1);
						this._list.appendChild(basketItem);
					}
				});

				this.setDisabled('.basket__button', false);
			}

			this.updateTotal(basket.getTotal());
		}

		return this.container;
	}

	// Рендеринг элемента корзины
	private renderBasketItem(item: IBasketItem, index: number): HTMLElement {
		const basketItem = cloneTemplate<HTMLElement>(this._itemTemplate);

		const indexElement = ensureElement('.basket__item-index', basketItem);
		const titleElement = ensureElement('.card__title', basketItem);
		const priceElement = ensureElement('.card__price', basketItem);
		const deleteButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			basketItem
		);

		indexElement.textContent = String(index);
		titleElement.textContent = item.product.title;
		priceElement.textContent = `${item.product.price} синапсов`;

		deleteButton.addEventListener('click', () => {
			this._events.emit('basket:remove', { productId: item.product.id });
		});

		return basketItem;
	}
}
