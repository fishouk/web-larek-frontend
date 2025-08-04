// Базовые интерфейсы и абстракции
export interface IIdentifiable {
	id: string;
}

export interface IWithTotal {
	total: number;
}

export interface IValidatable {
	validate(): boolean;
}

// Абстрактный базовый класс для сущностей с идентификатором
export abstract class BaseEntity implements IIdentifiable {
	readonly id: string;

	constructor(id: string) {
		this.id = id;
	}
}

export type ProductId = string;
export type OrderId = string;

// Селекторы для DOM элементов
export type DOMSelectors = {
	readonly [key: string]: string;
};

// Конфигурация для компонентов
export interface IComponentConfig {
	selector: string;
	template?: string;
	events?: Record<string, string>;
}

// Состояния UI
export enum UIState {
	LOADING = 'loading',
	LOADED = 'loaded',
	ERROR = 'error',
	EMPTY = 'empty',
}

// Интерфейс для управления состоянием UI
export interface IUIStateManager {
	setState(state: UIState): void;
	getState(): UIState;
	isLoading(): boolean;
	hasError(): boolean;
}
