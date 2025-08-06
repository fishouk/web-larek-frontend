import { IProduct } from '../types/product';
import { ProductCategory } from '../types/enums';
import { IEventEmitter } from '../types/events';
import { cloneTemplate, ensureElement, bem } from '../utils/utils';

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
			'софт-скил': bem('card', 'category', 'soft').name,
			'хард-скил': bem('card', 'category', 'hard').name,
			другое: bem('card', 'category', 'other').name,
			дополнительное: bem('card', 'category', 'additional').name,
			кнопка: bem('card', 'category', 'button').name,
		};
		return categoryMap[category] || bem('card', 'category', 'other').name;
	}

	render(product: IProduct): HTMLElement {
		const cardElement = cloneTemplate<HTMLElement>(this._template);

		const categoryElement = ensureElement('.card__category', cardElement);
		const titleElement = ensureElement('.card__title', cardElement);
		const imageElement = ensureElement<HTMLImageElement>(
			'.card__image',
			cardElement
		);
		const priceElement = ensureElement('.card__price', cardElement);

		categoryElement.textContent = product.category;
		categoryElement.className = `card__category ${this.getCategoryClass(
			product.category
		)}`;

		titleElement.textContent = product.title;

		imageElement.src = product.image;
		imageElement.alt = product.title;

		if (product.price === null) {
			priceElement.textContent = 'Бесценно';
			cardElement.classList.add(bem('card', '', 'disabled').name);
		} else {
			priceElement.textContent = `${product.price} синапсов`;
		}

		// Добавляем обработчик клика
		cardElement.addEventListener('click', () => {
			this._events.emit('card:select', { product });
		});

		return cardElement;
	}
}
