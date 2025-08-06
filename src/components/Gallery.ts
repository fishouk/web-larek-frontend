import { IProduct } from '../types/product';
import { IEventEmitter } from '../types/events';
import { ProductCard } from './ProductCard';
import { createTextElement } from '../utils/utils';

export interface IGallery {
	render(products: IProduct[]): void;
}

export class Gallery implements IGallery {
	protected _container: HTMLElement;
	protected _productCard: ProductCard;
	protected _events: IEventEmitter;

	constructor(
		container: HTMLElement,
		productCard: ProductCard,
		events: IEventEmitter
	) {
		this._container = container;
		this._productCard = productCard;
		this._events = events;
	}

	render(products: IProduct[]): void {
		this._container.innerHTML = '';

		if (products.length === 0) {
			const emptyMessage = createTextElement<HTMLParagraphElement>(
				'p',
				'Товары не найдены'
			);
			this._container.appendChild(emptyMessage);
			return;
		}

		products.forEach((product) => {
			const productElement = this._productCard.render(product);
			this._container.appendChild(productElement);
		});
	}

	showLoading(): void {
		this._container.innerHTML = '';
		const loadingMessage = createTextElement<HTMLParagraphElement>(
			'p',
			'Загрузка товаров...'
		);
		this._container.appendChild(loadingMessage);
	}

	showError(message: string): void {
		this._container.innerHTML = '';
		const errorMessage = createTextElement<HTMLParagraphElement>(
			'p',
			`Ошибка: ${message}`
		);
		this._container.appendChild(errorMessage);
	}
}
