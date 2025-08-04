// Типы для категорий продуктов
export enum ProductCategory {
	SOFT_SKILL = 'софт-скил',
	OTHER = 'другое',
	ADDITIONAL = 'дополнительное',
	BUTTON = 'кнопка',
	HARD_SKILL = 'хард-скил',
}

// Типы оплаты
export enum PaymentMethod {
	ONLINE = 'online',
	CASH = 'cash',
}

// Состояния модального окна
export enum ModalState {
	CLOSED = 'closed',
	OPENING = 'opening',
	OPEN = 'open',
	CLOSING = 'closing',
}

// Типы модальных окон
export enum ModalType {
	PRODUCT_PREVIEW = 'product-preview',
	BASKET = 'basket',
	ORDER_FORM = 'order-form',
	CONTACTS_FORM = 'contacts-form',
	ORDER_SUCCESS = 'order-success',
}
