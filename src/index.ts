import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { WebLarekAPI } from './components/WebLarekAPI';
import { AppModel } from './components/AppModel';
import { ProductCard } from './components/ProductCard';
import { Gallery } from './components/Gallery';
import { Modal } from './components/Modal';
import { Page } from './components/Page';
import { Basket } from './components/Basket';
import { OrderForm } from './components/OrderForm';
import { ContactsForm } from './components/ContactsForm';
import { Success } from './components/Success';
import { BasketItem } from './components/BasketItem';
import { API_URL, CDN_URL } from './utils/constants';
import { ensureElement } from './utils/utils';

// Инициализация EventEmitter
const events = new EventEmitter();

// Инициализация API
const api = new WebLarekAPI(API_URL, CDN_URL);

// Получение DOM элементов
const pageContainer = ensureElement<HTMLElement>('.page');
const galleryContainer = ensureElement<HTMLElement>('.gallery');
const modalContainer = ensureElement<HTMLElement>('#modal-container');

// Получение шаблонов
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Инициализация компонентов
const appModel = new AppModel(events);
const page = new Page(pageContainer, events);
const modal = new Modal(modalContainer, events);

// Компоненты
const gallery = new Gallery(galleryContainer);

// Инициализация остальных компонентов
const basketElement = basketTemplate.content.cloneNode(
	true
) as DocumentFragment;
const basket = new Basket(
	basketElement.firstElementChild as HTMLElement,
	events
);

// Инициализируем корзину пустым состоянием
basket.setItems([]);
basket.setTotal(0);

const orderFormElement = orderTemplate.content.firstElementChild?.cloneNode(
	true
) as HTMLFormElement;
const orderForm = new OrderForm(orderFormElement, events);

const contactsFormElement =
	contactsTemplate.content.firstElementChild?.cloneNode(
		true
	) as HTMLFormElement;
const contactsForm = new ContactsForm(contactsFormElement, events);

const successElement = successTemplate.content.cloneNode(
	true
) as DocumentFragment;
const success = new Success(
	successElement.firstElementChild as HTMLElement,
	events
);

// === ПРЕЗЕНТЕР: ОБРАБОТЧИКИ СОБЫТИЙ МОДЕЛИ ===

// Обработка загрузки товаров
events.on('products:changed', (data) => {
	const productElements = data.products.map((product) => {
		const productCard = new ProductCard(cardCatalogTemplate, events);
		return productCard.render(product);
	});
	gallery.render(productElements);
});

// Обработка ошибок
events.on('error', (data) => {
	gallery.showError(data.error);
	console.error('Ошибка приложения:', data.error);
});

// Обработка выбора товара
events.on('card:select', (data) => {
	appModel.selectProduct(data.product);
});

events.on('product:selected', (product) => {
	const previewCard = new ProductCard(cardPreviewTemplate, events);
	const cardElement = previewCard.render(product);
	modal.setContent(cardElement);
	modal.open();
});

events.on('product:check-in-basket', (data) => {
	const isInBasket = appModel.isProductInBasket(data.product.id);
	if (isInBasket) {
		data.button.textContent = 'Уже в корзине';
		data.button.disabled = true;
	}
});

// Обработка корзины
events.on('basket:changed', (basketData) => {
	page.setBasketCounter(basketData.count);

	const basketItems = basketData.items.map((item, index) => {
		const basketItem = new BasketItem(cardBasketTemplate, events);
		return basketItem.render({ product: item.product, index });
	});

	basket.setItems(basketItems);
	basket.setTotal(basketData.getTotal());
});

events.on('basket:open', () => {
	modal.setContent(basket.render());
	modal.open();
});

events.on('basket:add', (data) => {
	appModel.addToBasket(data.product);
	modal.close();
});

events.on('basket:remove', (data) => {
	appModel.removeFromBasket(data.productId);
});

// Обработка форм заказа
events.on('order:open', () => {
	modal.setContent(orderForm.render());
	modal.open();
});

events.on('order:submit', () => {
	modal.setContent(contactsForm.render());
});

events.on('contacts:submit', async () => {
	try {
		const orderData = appModel.getOrderData();
		const result = await api.createOrder(orderData);
		appModel.onOrderSuccess(result);
	} catch (error) {
		events.emit('error', { error: error.message });
	}
});

// Обработка изменений в формах
events.on('order:change', (data) => {
	if (data.field === 'payment' || data.field === 'address') {
		appModel.setOrderField(data.field, data.value);
	}
	const errors = appModel.getOrderFormErrors();
	orderForm.setErrors(errors);
	orderForm.setValid(errors.length === 0);
});

events.on('contacts:change', (data) => {
	if (data.field === 'email' || data.field === 'phone') {
		appModel.setOrderField(data.field, data.value);
	}
	const errors = appModel.getContactsFormErrors();
	contactsForm.setErrors(errors);
	contactsForm.setValid(errors.length === 0);
});

events.on('order:created', (result) => {
	modal.setContent(success.render({ result }));
});

events.on('success:close', () => {
	modal.close();
	page.setLocked(false);
});

// Обработка модального окна
events.on('modal:open', () => {
	page.setLocked(true);
});

events.on('modal:close', () => {
	page.setLocked(false);
});

// Обработка заказа
events.on('order:change', (data) => {
	console.log('Изменены данные заказа:', data);
});

events.on('order:error', (data) => {
	console.log('Ошибки валидации заказа:', data.errors);
});

// === ВЗАИМОДЕЙСТВИЕ С API ===

// Загрузка товаров
async function loadProducts() {
	try {
		gallery.showLoading();
		const productList = await api.getProductList();
		appModel.setProducts(productList.items);
		console.log('Товары загружены успешно');
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Неизвестная ошибка';
		events.emit('error', { error: errorMessage });
	}
}

// Создание заказа
async function createOrder() {
	try {
		const orderData = appModel.getOrderData();
		const result = await api.createOrder(orderData);
		appModel.onOrderSuccess(result);
		console.log('Заказ успешно создан');
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Ошибка создания заказа';
		events.emit('error', { error: errorMessage });
	}
}

// === ЗАПУСК ПРИЛОЖЕНИЯ ===

async function startApp() {
	try {
		await loadProducts();
		console.log('Приложение запущено успешно');
	} catch (error) {
		console.error('Ошибка запуска приложения:', error);
	}
}

// Запускаем приложение
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', startApp);
} else {
	startApp();
}

export { createOrder, loadProducts };
