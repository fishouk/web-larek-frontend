import { IProduct } from '../types/product';
import { ProductCategory } from '../types/enums';
import { IEventEmitter } from '../types/events';
import { cloneTemplate } from '../utils/utils';

export interface IProductCard {
	render(product: IProduct): HTMLElement;
}

export class ProductCard implements IProductCard {
	protected _template: HTMLTemplateElement;
	protected _events: IEventEmitter;

	constructor(template: HTMLTemplateElement, events: IEventEmitter) {
		this._template = template;
		this._events = events;
	}

	protected getCategoryClass(category: ProductCategory): string {
		const categoryMap: Record<ProductCategory, string> = {
			'софт-скил': 'card__category_soft',
			'хард-скил': 'card__category_hard',
			другое: 'card__category_other',
			дополнительное: 'card__category_additional',
			кнопка: 'card__category_button',
		};
		return categoryMap[category] || 'card__category_other';
	}

	render(product: IProduct): HTMLElement {
		const cardElement = cloneTemplate<HTMLElement>(this._template);

		const categoryElement = cardElement.querySelector('.card__category');
		const titleElement = cardElement.querySelector('.card__title');
		const imageElement = cardElement.querySelector(
			'.card__image'
		) as HTMLImageElement;
		const priceElement = cardElement.querySelector('.card__price');

		if (categoryElement) {
			categoryElement.textContent = product.category;
			categoryElement.className = `card__category ${this.getCategoryClass(
				product.category
			)}`;
		}

		if (titleElement) {
			titleElement.textContent = product.title;
		}

		if (imageElement) {
			imageElement.src = product.image;
			imageElement.alt = product.title;
		}

		if (priceElement) {
			if (product.price === null) {
				priceElement.textContent = 'Бесценно';
				cardElement.classList.add('card_disabled');
			} else {
				priceElement.textContent = `${product.price} синапсов`;
			}
		}

		// Добавляем обработчик клика
		cardElement.addEventListener('click', () => {
			this._events.emit('card:select', { product });
		});

		return cardElement;
	}
}
