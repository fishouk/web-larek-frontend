import { IProduct, IProductList } from './product';
import { IOrder, IOrderResult } from './order';
import { IBasket } from './basket';
import { ProductId } from './base';
import { PaymentMethod } from './enums';
import { ContactFormData } from './order';

// Базовые типы событий
export type EventMap = {
	'products:loading': unknown;
	'products:loaded': IProductList;
	'products:changed': { products: IProduct[] };
	'product:selected': IProduct;
	'basket:changed': IBasket;
	'basket:add': { product: IProduct };
	'basket:remove': { productId: ProductId };
	'basket:clear': unknown;
	'order:change': { field?: string; value?: any } | Record<string, never>;
	'order:error': { errors: string[] };
	'order:created': IOrderResult;
	'form:submit': IOrder;
	'modal:open': unknown;
	'modal:close': unknown;
	'card:select': { product: IProduct };
	error: { error: string };
};

// Интерфейс для компонентов с событиями
export interface IEventEmitter {
	on<T extends keyof EventMap>(
		event: T,
		callback: (data: EventMap[T]) => void
	): void;
	emit<T extends keyof EventMap>(event: T, data?: EventMap[T]): void;
	off<T extends keyof EventMap>(
		event: T,
		callback: (data: EventMap[T]) => void
	): void;
}

// Расширенные типы событий с данными для View
export type ViewEventMap = EventMap & {
	'card:select': { product: IProduct };
	'basket:add': { product: IProduct };
	'basket:remove': { productId: ProductId };
	'basket:open': void;
	'order:open': void;
	'order:submit': IOrder;
	'contacts:submit': ContactFormData;
	'payment:change': PaymentMethod;
	'form:change': { field: string; value: string };
	'form:error': { field: string; error: string };
};

// События для модальных окон
export type ModalEventMap = {
	'modal:open': { modal: unknown; type?: unknown };
	'modal:close': { modal: unknown; type?: unknown };
	'modal:content-change': { modal: unknown; content: HTMLElement | string };
	'modal:overlay-click': { modal: unknown };
	'modal:escape-key': { modal: unknown };
	'modal:before-open': { modal: unknown };
	'modal:after-open': { modal: unknown };
	'modal:before-close': { modal: unknown };
	'modal:after-close': { modal: unknown };
};

// События
export type MVCEventMap = {
	// События модели
	'model:change': unknown;
	'model:products-loaded': IProduct[];
	'model:product-selected': IProduct;
	'model:basket-changed': IBasket;
	'model:order-updated': Partial<IOrder>;
	'model:order-created': IOrderResult;

	// События представления
	'view:product-select': { productId: ProductId };
	'view:add-to-basket': { productId: ProductId };
	'view:remove-from-basket': { productId: ProductId };
	'view:open-basket': void;
	'view:start-order': void;
	'view:submit-order': IOrder;
	'view:order-complete': void;

	// События контроллера
	'controller:init': void;
	'controller:destroy': void;
	'controller:error': { error: string; context?: string };
};

// Полная карта событий приложения
export type AppEventMap = EventMap & ViewEventMap & ModalEventMap & MVCEventMap;
