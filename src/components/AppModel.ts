import { IProduct, ProductList } from '../types/product';
import { IEventEmitter } from '../types/events';
import { WebLarekAPI } from './WebLarekAPI';

export interface IAppModel {
	products: IProduct[];
	selectedProduct: IProduct | null;
	loadProducts(): Promise<void>;
	selectProduct(product: IProduct): void;
}

export class AppModel implements IAppModel {
	protected _products: IProduct[] = [];
	protected _selectedProduct: IProduct | null = null;
	protected _api: WebLarekAPI;
	protected _events: IEventEmitter;

	constructor(api: WebLarekAPI, events: IEventEmitter) {
		this._api = api;
		this._events = events;
	}

	get products(): IProduct[] {
		return this._products;
	}

	get selectedProduct(): IProduct | null {
		return this._selectedProduct;
	}

	async loadProducts(): Promise<void> {
		try {
			this._events.emit('products:loading', {});
			const productList = await this._api.getProductList();
			this._products = productList.items;
			this._events.emit('products:loaded', productList);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Неизвестная ошибка';
			this._events.emit('error', { error: errorMessage });
		}
	}

	selectProduct(product: IProduct): void {
		this._selectedProduct = product;
		this._events.emit('product:selected', product);
	}
}
