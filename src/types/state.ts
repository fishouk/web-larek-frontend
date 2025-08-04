import { IProduct } from './product';
import { ProductId } from './base';
import { IBasket } from './basket';
import { IOrder } from './order';

// Интерфейс модели данных
export interface IAppState {
	products: IProduct[];
	basket: IBasket;
	order: Partial<IOrder>;
	loading: boolean;
	error: string | null;

	// Методы управления продуктами
	setProducts(products: IProduct[]): void;
	getProduct(id: ProductId): IProduct | undefined;

	// Методы управления корзиной
	addToBasket(product: IProduct): void;
	removeFromBasket(productId: ProductId): void;
	clearBasket(): void;

	// Методы управления заказом
	setOrderField<K extends keyof IOrder>(field: K, value: IOrder[K]): void;
	validateOrder(): boolean;
	clearOrder(): void;

	// Методы состояния
	setLoading(loading: boolean): void;
	setError(error: string | null): void;
}

// Состояние загрузки
export interface ILoadingState {
	isLoading: boolean;
	loadingText?: string;
}

// Состояние ошибки
export interface IErrorState {
	hasError: boolean;
	errorMessage?: string;
	errorCode?: string;
}

// Состояние UI
export interface IUIState extends ILoadingState, IErrorState {
	isLocked: boolean;
	isModalOpen: boolean;
	activeModal?: string;
}

// Состояние формы
export interface IFormState<T = Record<string, any>> {
	values: T;
	errors: Record<keyof T, string>;
	isValid: boolean;
	isDirty: boolean;
	isSubmitting: boolean;
}

// Состояние валидации
export interface IValidationState {
	isValid: boolean;
	errors: Record<string, string>;
	touched: Record<string, boolean>;
}

// Состояние фильтрации
export interface IFilterState {
	searchQuery: string;
	selectedCategories: string[];
	sortBy: string;
	sortOrder: 'asc' | 'desc';
}

// Состояние пагинации
export interface IPaginationState {
	currentPage: number;
	itemsPerPage: number;
	totalItems: number;
	totalPages: number;
}

// Полное состояние приложения
export interface IApplicationState {
	ui: IUIState;
	products: {
		items: IProduct[];
		filter: IFilterState;
		pagination: IPaginationState;
	};
	basket: IBasket;
	order: Partial<IOrder>;
	form: IFormState;
	validation: IValidationState;
}
