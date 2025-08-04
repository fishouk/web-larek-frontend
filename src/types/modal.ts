import { IProduct } from './product';
import { IBasket } from './basket';
import { IOrder, IOrderResult } from './order';
import { ModalType } from './enums';

// Интерфейс для отдельного модального окна
export interface IModal {
	element: HTMLElement;
	contentElement: HTMLElement;
	closeButton: HTMLElement;
	isOpen: boolean;

	open(): void;
	close(): void;
	setContent(content: HTMLElement | string): void;
	render(data?: unknown): HTMLElement;
}

// Интерфейс для менеджера модальных окон
export interface IModalManager {
	activeModal: IModal | null;
	modalContainer: HTMLElement;

	// Основные методы управления
	open(modal: IModal): void;
	close(modal?: IModal): void;
	closeAll(): void;

	// Проверки состояния
	isAnyOpen(): boolean;
	getActiveModal(): IModal | null;

	// Управление содержимым
	setModalContent(content: HTMLElement | string, modal?: IModal): void;

	// События
	onModalOpen?: (modal: IModal) => void;
	onModalClose?: (modal: IModal) => void;
	onModalContentChange?: (modal: IModal, content: HTMLElement | string) => void;
}

// Конфигурация для создания модального окна
export interface IModalConfig {
	selector?: string;
	closeOnOverlayClick?: boolean;
	closeOnEscapeKey?: boolean;
	autoFocus?: boolean;
	restoreFocus?: boolean;
	className?: string;
	contentSelector?: string;
	closeButtonSelector?: string;
}

// Данные для различных типов модалок
export type ModalData = {
	[ModalType.PRODUCT_PREVIEW]: { product: IProduct };
	[ModalType.BASKET]: { basket: IBasket };
	[ModalType.ORDER_FORM]: { order: Partial<IOrder> };
	[ModalType.CONTACTS_FORM]: { order: Partial<IOrder> };
	[ModalType.ORDER_SUCCESS]: { result: IOrderResult };
};

// Типизированный интерфейс для конкретных модалок
export interface ITypedModal<T extends ModalType> extends IModal {
	type: T;
	render(data: ModalData[T]): HTMLElement;
}

// Интерфейс для фабрики модальных окон
export interface IModalFactory {
	createModal<T extends ModalType>(
		type: T,
		config?: IModalConfig
	): ITypedModal<T>;
	getModalTemplate(type: ModalType): HTMLTemplateElement | null;
}

// Интерфейс для анимации модальных окон
export interface IModalAnimator {
	animateOpen(modal: IModal): Promise<void>;
	animateClose(modal: IModal): Promise<void>;
	setDuration(duration: number): void;
	setEasing(easing: string): void;
}

// CSS классы для модальных окон
export const MODAL_CLASSES = {
	MODAL: 'modal',
	MODAL_ACTIVE: 'modal_active',
	MODAL_CONTAINER: 'modal__container',
	MODAL_CONTENT: 'modal__content',
	MODAL_CLOSE: 'modal__close',
	MODAL_OVERLAY: 'modal__overlay',
	MODAL_OPENING: 'modal_opening',
	MODAL_CLOSING: 'modal_closing',
} as const;

// Селекторы для поиска элементов модалки
export const MODAL_SELECTORS = {
	MODAL: '.modal',
	MODAL_CONTAINER: '.modal__container',
	MODAL_CONTENT: '.modal__content',
	MODAL_CLOSE: '.modal__close',
	MODAL_ACTIVE: '.modal_active',
} as const;

// Утилитарные типы для модалок
export type ModalSelector =
	(typeof MODAL_SELECTORS)[keyof typeof MODAL_SELECTORS];
export type ModalClassName = (typeof MODAL_CLASSES)[keyof typeof MODAL_CLASSES];
