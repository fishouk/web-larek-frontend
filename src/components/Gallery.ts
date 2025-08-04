import { IProduct } from '../types/product';
import { IEventEmitter } from '../types/events';
import { ProductCard } from './ProductCard';

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
			this._container.innerHTML = '<p>Товары не найдены</p>';
			return;
		}

		products.forEach((product) => {
			const productElement = this._productCard.render(product);
			this._container.appendChild(productElement);
		});
	}

	showLoading(): void {
		this._container.innerHTML = '<p>Загрузка товаров...</p>';
	}

	showError(message: string): void {
		this._container.innerHTML = `<p>Ошибка: ${message}</p>`;
	}
}
