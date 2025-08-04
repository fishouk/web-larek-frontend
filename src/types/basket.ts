import { IProduct, Product } from './product';
import { ProductId } from './base';

// Типы для корзины
export interface IBasketItem {
	product: IProduct;
	selected: boolean;
}

export class BasketItem implements IBasketItem {
	product: Product;
	selected = true;

	constructor(product: IProduct) {
		this.product = new Product(product);
	}

	// Получение цены товара в корзине
	getPrice(): number {
		return this.product.price || 0;
	}

	// Переключение выбора товара
	toggleSelection(): void {
		this.selected = !this.selected;
	}

	// Установка выбора товара
	setSelected(selected: boolean): void {
		this.selected = selected;
	}
}

// Интерфейс корзины
export interface IBasket {
	items: IBasketItem[];
	getTotal(): number;
	getSelectedItems(): IBasketItem[];
	addItem(product: IProduct): void;
	removeItem(productId: string): void;
	clear(): void;
}

export class Basket implements IBasket {
	items: BasketItem[] = [];

	// Добавление товара в корзину
	addItem(product: IProduct): void {
		const existingItem = this.items.find(
			(item) => item.product.id === product.id
		);

		if (!existingItem && product.price !== null) {
			this.items.push(new BasketItem(product));
		}
	}

	// Удаление товара из корзины
	removeItem(productId: string): void {
		this.items = this.items.filter((item) => item.product.id !== productId);
	}

	// Очистка корзины
	clear(): void {
		this.items = [];
	}

	// Получение общей суммы
	getTotal(): number {
		return this.getSelectedItems().reduce(
			(total, item) => total + item.getPrice(),
			0
		);
	}

	// Получение выбранных товаров
	getSelectedItems(): BasketItem[] {
		return this.items.filter((item) => item.selected);
	}

	// Получение ID выбранных товаров
	getSelectedItemIds(): string[] {
		return this.getSelectedItems().map((item) => item.product.id);
	}

	// Проверка наличия товаров
	get isEmpty(): boolean {
		return this.items.length === 0;
	}

	// Количество товаров
	get count(): number {
		return this.getSelectedItems().length;
	}

	// Переключение выбора всех товаров
	toggleAllItems(selected: boolean): void {
		this.items.forEach((item) => item.setSelected(selected));
	}

	// Получение количества выбранных товаров
	getSelectedCount(): number {
		return this.getSelectedItems().length;
	}
}

// Тип данных для рендеринга элемента корзины
export type BasketItemData = {
	item: IBasketItem;
	index: number;
	onRemove?: (productId: ProductId) => void;
	onToggle?: (productId: ProductId, selected: boolean) => void;
};
