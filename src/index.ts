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

// Компоненты карточек
const productCard = new ProductCard(cardCatalogTemplate, events);
const gallery = new Gallery(galleryContainer, productCard, events);

// Инициализация остальных компонентов
let basket: Basket;
let orderForm: OrderForm;
let contactsForm: ContactsForm;
let success: Success;

// === ПРЕЗЕНТЕР: ОБРАБОТЧИКИ СОБЫТИЙ МОДЕЛИ ===

// Обработка загрузки товаров
events.on('products:changed', (data) => {
	gallery.render(data.products);
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
	// Открываем модальное окно с детальной информацией о товаре
	const previewCard = new ProductCard(cardPreviewTemplate, events);
	const cardElement = previewCard.render(product);
	modal.setContent(cardElement);
	modal.open();
	page.setLocked(true);
});

// Обработка корзины
events.on('basket:changed', (basketData) => {
	page.setBasketCounter(basketData.count);

	// Если корзина открыта в модальном окне, обновляем её содержимое
	if (basket && modal.container.classList.contains('modal_active')) {
		modal.setContent(basket.render({ basket: basketData }));
	}
});

events.on('basket:open', () => {
	// Создаем компонент корзины при первом открытии
	if (!basket) {
		const basketElement = basketTemplate.content.cloneNode(
			true
		) as DocumentFragment;
		basket = new Basket(
			basketElement.firstElementChild as HTMLElement,
			events,
			cardBasketTemplate
		);
	}

	modal.setContent(basket.render({ basket: appModel.basket }));
	modal.open();
	page.setLocked(true);
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
	// Создаем форму заказа при первом открытии
	if (!orderForm) {
		const orderElement = orderTemplate.content.firstElementChild?.cloneNode(
			true
		) as HTMLElement;
		const container = document.createElement('div');
		container.appendChild(orderElement);
		orderForm = new OrderForm(container, events);
	}

	modal.setContent(orderForm.render());
	modal.open();
});

events.on('order:submit', (data) => {
	// Сохраняем данные заказа и переходим к форме контактов
	appModel.setOrderField('payment', data.payment);
	appModel.setOrderField('address', data.address);

	// Создаем форму контактов при первом открытии
	if (!contactsForm) {
		// Клонируем шаблон и получаем первый элемент (form)
		const contactsElement =
			contactsTemplate.content.firstElementChild?.cloneNode(
				true
			) as HTMLElement;
		// Создаем контейнер-обертку для формы
		const container = document.createElement('div');
		container.appendChild(contactsElement);
		contactsForm = new ContactsForm(container, events);
	}

	modal.setContent(contactsForm.render());
});

events.on('contacts:submit', async (data) => {
	// Сохраняем контактные данные и отправляем заказ
	appModel.setOrderField('email', data.email);
	appModel.setOrderField('phone', data.phone);

	try {
		const orderData = appModel.getOrderData();
		const result = await api.createOrder(orderData);
		appModel.onOrderSuccess(result);
	} catch (error) {
		events.emit('error', { error: error.message });
	}
});

events.on('order:created', (result) => {
	// Показываем страницу успеха
	if (!success) {
		const successElement = successTemplate.content.cloneNode(
			true
		) as DocumentFragment;
		success = new Success(
			successElement.firstElementChild as HTMLElement,
			events
		);
	}

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

// Обработка изменений формы
events.on('form:change', (data) => {
	// Можно добавить валидацию в реальном времени
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
