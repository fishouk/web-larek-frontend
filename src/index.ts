import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { WebLarekAPI } from './components/WebLarekAPI';
import { AppModel } from './components/AppModel';
import { ProductCard } from './components/ProductCard';
import { Gallery } from './components/Gallery';
import { API_URL, CDN_URL } from './utils/constants';
import { ensureElement } from './utils/utils';

// Инициализация EventEmitter
const events = new EventEmitter();

// Инициализация API
const api = new WebLarekAPI(API_URL, CDN_URL);

// Получение DOM элементов
const galleryContainer = ensureElement<HTMLElement>('.gallery');
const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');

// Инициализация компонентов
const appModel = new AppModel(events);
const productCard = new ProductCard(cardTemplate, events);
const gallery = new Gallery(galleryContainer, productCard, events);

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
	console.log('Выбран товар:', data.product.title);
});

events.on('product:selected', (product) => {
	console.log('Товар выбран в модели:', product.title);
	// Здесь нужно открыть модальное окно с товаром
});

// Обработка корзины
events.on('basket:changed', (basket) => {
	console.log(
		'Корзина изменена, товаров:',
		basket.count,
		'на сумму:',
		basket.getTotal()
	);
	// Здесь нужно обновить счетчик в хедере
});

// Обработка заказа
events.on('order:change', (data) => {
	console.log('Изменены данные заказа:', data);
});

events.on('order:error', (data) => {
	console.log('Ошибки валидации заказа:', data.errors);
});

events.on('order:created', (result) => {
	console.log('Заказ создан:', result);
	// Здесь нужно показать страницу успеха
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
