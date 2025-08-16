import { Component } from './base/Component';
import { IProduct, Product } from '../types/product';
import { ProductCategory } from '../types/enums';
import { IEventEmitter } from '../types/events';
import { IProductCardView } from '../types/views';
import { cloneTemplate, ensureElement, bem } from '../utils/utils';

export interface IProductCard {
	render(product: IProduct): HTMLElement;
}

export class ProductCard
	extends Component<{ product: IProduct }>
	implements IProductCard, IProductCardView
{
	protected _template: HTMLTemplateElement;
	protected _events: IEventEmitter;

	constructor(template: HTMLTemplateElement, events: IEventEmitter) {
		super(document.createElement('div')); // Временный контейнер
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

	render(data?: { product: IProduct } | IProduct): HTMLElement {
		// Поддерживаем оба варианта вызова для совместимости
		const product =
			data && 'product' in data ? data.product : (data as IProduct);

		if (!product) {
			throw new Error('Product data is required');
		}

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

		// Создаем экземпляр класса Product для использования методов
		const productInstance = new Product(product);
		priceElement.textContent = productInstance.getFormattedPrice();

		if (!productInstance.isAvailable) {
			cardElement.classList.add(bem('card', '', 'disabled').name);
		}

		// Добавляем обработчик клика для карточки каталога
		cardElement.addEventListener('click', () => {
			this._events.emit('card:select', { product: productInstance });
		});

		// Если это карточка превью (с кнопкой), добавляем обработчик для кнопки
		const button = cardElement.querySelector('.card__button');
		if (button) {
			// Проверяем, есть ли товар в корзине
			this._events.emit('product:check-in-basket', {
				product: productInstance,
				button: button as HTMLButtonElement,
			});

			button.addEventListener('click', (event) => {
				event.stopPropagation();
				if (productInstance.isAvailable) {
					this._events.emit('basket:add', { product: productInstance });
				}
			});

			// Используем метод класса Product для проверки доступности
			if (!productInstance.isAvailable) {
				button.textContent = 'Недоступно';
				(button as HTMLButtonElement).disabled = true;
			} else {
				button.textContent = 'В корзину';
			}
		}

		return cardElement;
	}
}
