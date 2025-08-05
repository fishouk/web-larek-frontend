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
const appModel = new AppModel(api, events);
const productCard = new ProductCard(cardTemplate, events);
const gallery = new Gallery(galleryContainer, productCard, events);

// Обработчики событий
events.on('products:loading', () => {
	gallery.showLoading();
});

events.on('products:loaded', (data) => {
	gallery.render(data.items);
});

events.on('error', (data) => {
	gallery.showError(data.error);
	console.error('Ошибка приложения:', data.error);
});

events.on('card:select', (data) => {
	appModel.selectProduct(data.product);
	console.log('Выбран товар:', data.product.title);
});

events.on('product:selected', (product) => {
	console.log('Товар выбран в модели:', product.title);
	// Здесь можно открыть модальное окно с товаром
});

// Запуск приложения
async function startApp() {
	try {
		await appModel.loadProducts();
		console.log('Приложение запущено успешно');
	} catch (error) {
		console.error('Ошибка запуска приложения:', error);
	}
}

// Запускаем приложение после загрузки DOM
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', startApp);
} else {
	startApp();
}
