# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

## Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

---

# Архитектура проекта

## Паттерн проектирования

Проект использует **MVP (Model-View-Presenter)** паттерн с **событийной архитектурой**:

- **Model** — модели данных и бизнес-логика
- **View** — компоненты представления и пользовательский интерфейс
- **Presenter** — логика управления взаимодействием между Model и View
- **EventEmitter** — централизованная система событий для связи компонентов

## Структура классов по слоям

### **Базовый слой (Base Layer)**

#### `EventEmitter`

**Файл:** `src/components/base/events.ts`  
**Задача:** Централизованная система событий для связи между компонентами

**Поля:**

- `_events: Map<EventName, Set<Subscriber>>` — хранилище подписчиков на события

**Методы:**

- `on<T>(eventName: T, callback: Function)` — подписка на событие
- `off<T>(eventName: T, callback: Function)` — отписка от события
- `emit<T>(eventName: T, data?: EventMap[T])` — генерация события
- `onAll(callback: Function)` — подписка на все события
- `offAll()` — очистка всех подписок
- `trigger<T>(eventName: T, context?: Partial<EventMap[T]>)` — создание триггер-функции

#### `Api`

**Файл:** `src/components/base/api.ts`  
**Задача:** Базовый класс для HTTP-запросов к API

**Поля:**

- `baseUrl: string` — базовый URL API
- `options: RequestInit` — настройки запросов

**Методы:**

- `constructor(baseUrl: string, options?: RequestInit)` — инициализация API клиента
- `handleResponse(response: Response): Promise<object>` — обработка ответов сервера
- `get(uri: string)` — GET запрос
- `post(uri: string, data: object, method?: HttpMethod)` — POST/PUT/PATCH запросы

---

### **Слой моделей (Model Layer)**

#### `Product`

**Файл:** `src/types/product.ts`  
**Задача:** Модель товара с валидацией и форматированием

**Поля:**

- `id: string` — уникальный идентификатор
- `description: string` — описание товара
- `image: string` — URL изображения
- `title: string` — название товара
- `category: ProductCategory` — категория товара
- `price: number | null` — цена (null = бесценно)

**Методы:**

- `constructor(data: IProduct)` — создание экземпляра товара
- `get isAvailable(): boolean` — проверка доступности для покупки
- `validate(): boolean` — валидация данных товара
- `getFormattedPrice(): string` — получение отформатированной цены

#### `ProductList`

**Файл:** `src/types/product.ts`  
**Задача:** Коллекция товаров с методами фильтрации

**Поля:**

- `total: number` — общее количество товаров
- `items: Product[]` — массив товаров

**Методы:**

- `constructor(data: {total: number, items: IProduct[]})` — создание списка
- `getAvailableProducts(): Product[]` — получение доступных товаров
- `getProductsByCategory(category: ProductCategory): Product[]` — фильтрация по категории

#### `AppModel`

**Файл:** `src/components/AppModel.ts`  
**Задача:** Основная модель приложения, управляет состоянием

**Поля:**

- `_products: IProduct[]` — список всех товаров
- `_selectedProduct: IProduct | null` — выбранный товар
- `_api: WebLarekAPI` — экземпляр API клиента
- `_events: IEventEmitter` — система событий

**Методы:**

- `constructor(api: WebLarekAPI, events: IEventEmitter)` — инициализация модели
- `get products(): IProduct[]` — получение списка товаров
- `get selectedProduct(): IProduct | null` — получение выбранного товара
- `loadProducts(): Promise<void>` — загрузка товаров с сервера
- `selectProduct(product: IProduct): void` — выбор товара

#### `WebLarekAPI`

**Файл:** `src/components/WebLarekAPI.ts`  
**Задача:** API клиент для работы с сервером WebLarek

**Поля:**

- `cdn: string` — URL CDN для изображений
- `baseUrl: string` — базовый URL API (наследуется)
- `options: RequestInit` — настройки запросов (наследуется)

**Методы:**

- `constructor(baseUrl: string, cdn: string, options?: RequestInit)` — инициализация
- `getProductList(): Promise<IProductList>` — получение списка товаров
- `getProduct(id: ProductId): Promise<IProduct>` — получение товара по ID
- `createOrder(order: IOrder): Promise<IOrderResult>` — создание заказа
- `getImageUrl(imagePath: string): string` — получение полного URL изображения
- `getProductsByCategory(category: ProductCategory): Promise<Product[]>` — товары по категории
- `getAvailableProducts(): Promise<Product[]>` — доступные товары
- `searchProducts(query: string): Promise<Product[]>` — поиск товаров
- `submitOrder(order: IOrder): Promise<IOrderResult>` — отправка заказа с валидацией

---

### **Слой представления (View Layer)**

#### `ProductCard`

**Файл:** `src/components/ProductCard.ts`  
**Задача:** Компонент карточки товара в галерее

**Поля:**

- `_template: HTMLTemplateElement` — HTML шаблон карточки
- `_events: IEventEmitter` — система событий

**Методы:**

- `constructor(template: HTMLTemplateElement, events: IEventEmitter)` — инициализация
- `getCategoryClass(category: ProductCategory): string` — получение CSS класса категории
- `render(product: IProduct): HTMLElement` — рендеринг карточки товара

#### `Gallery`

**Файл:** `src/components/Gallery.ts`  
**Задача:** Компонент галереи товаров на главной странице

**Поля:**

- `_container: HTMLElement` — контейнер галереи
- `_productCard: ProductCard` — компонент карточки товара
- `_events: IEventEmitter` — система событий

**Методы:**

- `constructor(container: HTMLElement, productCard: ProductCard, events: IEventEmitter)` — инициализация
- `render(products: IProduct[]): void` — отображение списка товаров
- `showLoading(): void` — отображение состояния загрузки
- `showError(message: string): void` — отображение ошибки

---

### **Презентационный слой (Presenter Layer)**

#### `src/index.ts` (Main Application Controller)

**Задача:** Главный контроллер приложения, связывает модели и представления

**Компоненты:**

- `events: EventEmitter` — центральная система событий
- `api: WebLarekAPI` — API клиент
- `appModel: AppModel` — модель приложения
- `productCard: ProductCard` — компонент карточки
- `gallery: Gallery` — компонент галереи

**Функции:**

- `startApp(): Promise<void>` — запуск приложения
- Настройка обработчиков событий между компонентами
- Инициализация компонентов

---

## **Пользовательские события**

### События загрузки данных

```typescript
'products:loading' // Начало загрузки товаров
'products:loaded': IProductList // Товары успешно загружены
'error': { error: string } // Ошибка при загрузке
```

### События взаимодействия с товарами

```typescript
'card:select': { product: IProduct } // Клик по карточке товара
'product:selected': IProduct // Товар выбран в модели
```

### События корзины

```typescript
'basket:add': { product: IProduct } // Добавление товара в корзину
'basket:remove': { productId: ProductId } // Удаление товара из корзины
'basket:changed': IBasket // Изменение содержимого корзины
'basket:open': void // Открытие корзины
```

### События заказа

```typescript
'order:open': void // Открытие формы заказа
'order:submit': IOrder // Отправка заказа
'order:created': IOrderResult // Заказ создан
'contacts:submit': ContactFormData // Отправка контактных данных
```

### События модальных окон

```typescript
'modal:open': unknown // Открытие модального окна
'modal:close': unknown // Закрытие модального окна
```

### События форм

```typescript
'form:change': { field: string; value: string } // Изменение поля формы
'form:error': { field: string; error: string } // Ошибка валидации поля
'form:submit': IOrder // Отправка формы
'payment:change': PaymentMethod // Изменение способа оплаты
```

---

## **Поток выполнения**

### Загрузка приложения:

1. `startApp()` → `appModel.loadProducts()`
2. `AppModel` → `api.getProductList()` → `emit('products:loading')`
3. `Gallery` → `showLoading()`
4. Получение данных → `emit('products:loaded', productList)`
5. `Gallery` → `render(products)`

### Выбор товара:

1. Клик по карточке → `emit('card:select', { product })`
2. `AppModel` → `selectProduct(product)` → `emit('product:selected', product)`
3. Открытие модального окна с подробностями товара

### Добавление в корзину:

1. `emit('basket:add', { product })`
2. Обновление модели корзины → `emit('basket:changed', basket)`
3. Обновление счетчика в хедере

Эта архитектура обеспечивает слабую связанность компонентов, легкость тестирования и расширения функциональности.
