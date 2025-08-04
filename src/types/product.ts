import { IIdentifiable, IValidatable, BaseEntity } from './base';
import { ProductCategory } from './enums';

// Интерфейс продукта
export interface IProduct extends IIdentifiable {
	description: string;
	image: string;
	title: string;
	category: ProductCategory;
	price: number | null;
}

// Класс продукта с валидацией
export class Product extends BaseEntity implements IProduct, IValidatable {
	description: string;
	image: string;
	title: string;
	category: ProductCategory;
	price: number | null;

	constructor(data: IProduct) {
		super(data.id);
		this.description = data.description;
		this.image = data.image;
		this.title = data.title;
		this.category = data.category;
		this.price = data.price;
	}

	// Проверка доступности для покупки
	get isAvailable(): boolean {
		return this.price !== null && this.price > 0;
	}

	// Валидация продукта
	validate(): boolean {
		return !!(this.id && this.title && this.description && this.category);
	}

	// Получение отформатированной цены
	getFormattedPrice(): string {
		return this.price === null ? 'Бесценно' : `${this.price} синапсов`;
	}
}

// Список продуктов
export interface IProductList {
	total: number;
	items: Product[];
	getAvailableProducts(): Product[];
	getProductsByCategory(category: ProductCategory): Product[];
}

export class ProductList implements IProductList {
	total: number;
	items: Product[];

	constructor(data: { total: number; items: IProduct[] }) {
		this.total = data.total;
		this.items = data.items.map((item) => new Product(item));
	}

	// Получение доступных продуктов
	getAvailableProducts(): Product[] {
		return this.items.filter((product) => product.isAvailable);
	}

	// Фильтрация по категории
	getProductsByCategory(category: ProductCategory): Product[] {
		return this.items.filter((product) => product.category === category);
	}
}

// Тип данных для рендеринга карточки продукта
export type ProductCardData = {
	product: IProduct;
	inBasket?: boolean;
	onClick?: (product: IProduct) => void;
};
