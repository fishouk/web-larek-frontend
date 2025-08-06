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

## Структура классов по слоям

### **Базовый слой**

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

### **Слой моделей **

#### `Product`

**Файл:** `src/types/product.ts`  
**Задача:** Модель товара с валидацией и форматированием

**Поля:**

- `id: string` — уникальный идентификатор
- `description: string` — описание товара
- `image: string` — URL изображения
- `title: string` — название товара
- `category: ProductCategory` — категория товара
- `price: number | null` — цена 

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
**Задача:** Модель данных приложения - хранение, валидация и управление состоянием

**Поля:**

- `_products: IProduct[]` — список всех товаров
- `_selectedProduct: IProduct | null` — выбранный товар для просмотра
- `_basket: Basket` — корзина с товарами пользователя
- `_order: Partial<IOrder>` — данные текущего заказа
- `_events: IEventEmitter` — система событий

**Методы для товаров:**

- `constructor(events: IEventEmitter)` — инициализация модели
- `get products(): IProduct[]` — получение списка товаров
- `get selectedProduct(): IProduct | null` — получение выбранного товара
- `setProducts(products: IProduct[]): void` — установка списка товаров
- `selectProduct(product: IProduct): void` — выбор товара для просмотра
- `getProduct(id: ProductId): IProduct | undefined` — получение товара по ID

**Методы для корзины:**

- `get basket(): IBasket` — получение корзины
- `addToBasket(product: IProduct): void` — добавление товара в корзину с валидацией
- `removeFromBasket(productId: ProductId): void` — удаление товара из корзины
- `clearBasket(): void` — очистка корзины
- `getBasketTotal(): number` — получение общей суммы корзины
- `getBasketCount(): number` — получение количества товаров в корзине

**Методы для заказа и валидации:**

- `get order(): Partial<IOrder>` — получение данных заказа
- `setOrderField<K>(field: K, value: IOrder[K]): void` — установка поля заказа с валидацией
- `validateOrder(): boolean` — полная валидация заказа
- `getOrderErrors(): string[]` — получение списка ошибок валидации
- `getOrderData(): IOrder` — получение валидных данных заказа для отправки на сервер
- `clearOrder(): void` — очистка данных заказа
- `onOrderSuccess(result: IOrderResult): void` — обработка успешного создания заказа

#### `WebLarekAPI`

**Файл:** `src/components/WebLarekAPI.ts`  
**Задача:** API клиент для работы с сервером

**Поля:**

- `cdn: string` — URL CDN для изображений
- `baseUrl: string` — базовый URL API
- `options: RequestInit` — настройки запросов

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

#### `Basket`

**Файл:** `src/types/basket.ts`  
**Задача:** Модель корзины для управления выбранными товарами

**Поля:**

- `items: BasketItem[]` — массив товаров в корзине

**Методы:**

- `addItem(product: IProduct): void` — добавление товара
- `removeItem(productId: string): void` — удаление товара по ID
- `clear(): void` — очистка корзины
- `getTotal(): number` — получение общей суммы выбранных товаров
- `getSelectedItems(): BasketItem[]` — получение выбранных товаров
- `getSelectedItemIds(): string[]` — получение ID выбранных товаров
- `get isEmpty(): boolean` — проверка пустоты корзины
- `get count(): number` — количество выбранных товаров
- `toggleAllItems(selected: boolean): void` — переключение выбора всех товаров
- `getSelectedCount(): number` — количество выбранных товаров

#### `BasketItem`

**Файл:** `src/types/basket.ts`  
**Задача:** Модель элемента корзины с возможностью выбора

**Поля:**

- `product: Product` — товар в корзине
- `selected: boolean` — выбран ли товар

**Методы:**

- `constructor(product: IProduct)` — создание элемента корзины
- `getPrice(): number` — получение цены товара
- `toggleSelection(): void` — переключение выбора товара
- `setSelected(selected: boolean): void` — установка состояния выбора

#### `Order`

**Файл:** `src/types/order.ts`  
**Задача:** Модель заказа с валидацией данных пользователя

**Поля:**

- `payment: PaymentMethod` — способ оплаты (онлайн/при получении)
- `email: string` — email пользователя
- `phone: string` — телефон пользователя
- `address: string` — адрес доставки
- `total: number` — общая сумма заказа
- `items: string[]` — массив ID товаров в заказе

**Методы:**

- `constructor(data: IOrder)` — создание заказа
- `validate(): boolean` — полная валидация всех полей заказа
- `validateContactInfo(): boolean` — валидация email и телефона
- `validateDelivery(): boolean` — валидация адреса доставки
- `validateItems(): boolean` — валидация наличия товаров
- `validateTotal(): boolean` — валидация суммы заказа
- `isOnlinePayment(): boolean` — проверка онлайн оплаты
- `getItemsCount(): number` — количество товаров в заказе

#### `OrderResult`

**Файл:** `src/types/order.ts`  
**Задача:** Модель результата успешно созданного заказа

**Поля:**

- `id: string` — уникальный идентификатор заказа
- `total: number` — итоговая сумма заказа

**Методы:**

- `constructor(data: IOrderResult)` — создание результата заказа
- `getFormattedTotal(): string` — получение отформатированной суммы

---

### **Слой представления**

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

#### `IPageView`

**Файл:** `src/types/views.ts`  
**Задача:** Интерфейс главной страницы приложения

**Методы:**

- `render(data?: object): HTMLElement` — рендеринг страницы
- `setProductList(products: IProduct[]): void` — установка списка товаров
- `setBasketCounter(count: number): void` — обновление счетчика корзины
- `setLocked(locked: boolean): void` — блокировка/разблокировка страницы

#### `IBasketView`

**Файл:** `src/types/views.ts`  
**Задача:** Интерфейс представления корзины

**Методы:**

- `render(data?: { basket: IBasket }): HTMLElement` — рендеринг корзины
- `updateCounter(count: number): void` — обновление счетчика товаров
- `updateTotal(total: number): void` — обновление общей суммы

#### `IBasketItemView`

**Файл:** `src/types/views.ts`  
**Задача:** Интерфейс элемента товара в корзине

**Методы:**

- `render(data?: { item: IBasket }): HTMLElement` — рендеринг элемента корзины
- `setText(selector: string, value: string): void` — установка текста
- `setImage(selector: string, src: string, alt?: string): void` — установка изображения
- `setHidden(selector: string, hidden: boolean): void` — скрытие/показ элемента
- `setDisabled(selector: string, disabled: boolean): void` — блокировка/разблокировка

#### `IOrderFormView`

**Файл:** `src/types/views.ts`  
**Задача:** Интерфейс формы заказа (адрес и способ оплаты)

**Методы:**

- `render(data?: OrderFormData): HTMLElement` — рендеринг формы заказа
- `getFormData(): OrderFormData` — получение данных формы
- `setFormData(data: OrderFormData): void` — установка данных формы
- `validate(): boolean` — валидация формы
- `clearErrors(): void` — очистка ошибок
- `showErrors(errors: Record<string, string>): void` — отображение ошибок
- `setPaymentMethod(method: PaymentMethod): void` — установка способа оплаты

#### `IContactFormView`

**Файл:** `src/types/views.ts`  
**Задача:** Интерфейс формы контактных данных (email и телефон)

**Методы:**

- `render(data?: ContactFormData): HTMLElement` — рендеринг формы контактов
- `getFormData(): ContactFormData` — получение контактных данных
- `setFormData(data: ContactFormData): void` — установка контактных данных
- `validate(): boolean` — валидация контактов
- `clearErrors(): void` — очистка ошибок валидации
- `showErrors(errors: Record<string, string>): void` — отображение ошибок

#### `IOrderSuccessView`

**Файл:** `src/types/views.ts`  
**Задача:** Интерфейс экрана успешного оформления заказа

**Методы:**

- `render(data?: { result: IOrderResult }): HTMLElement` — рендеринг экрана успеха

#### `IModal`

**Файл:** `src/types/modal.ts`  
**Задача:** Интерфейс отдельного модального окна

**Поля:**

- `element: HTMLElement` — корневой элемент модалки
- `contentElement: HTMLElement` — контейнер содержимого
- `closeButton: HTMLElement` — кнопка закрытия
- `isOpen: boolean` — состояние открытости

**Методы:**

- `open(): void` — открытие модального окна
- `close(): void` — закрытие модального окна
- `setContent(content: HTMLElement | string): void` — установка содержимого
- `render(data?: unknown): HTMLElement` — рендеринг модалки

#### `IModalManager`

**Файл:** `src/types/modal.ts`  
**Задача:** Менеджер для управления модальными окнами

**Поля:**

- `activeModal: IModal | null` — текущее активное модальное окно
- `modalContainer: HTMLElement` — контейнер для модалок

**Методы управления:**

- `open(modal: IModal): void` — открытие модального окна
- `close(modal?: IModal): void` — закрытие конкретного или активного окна
- `closeAll(): void` — закрытие всех модальных окон

**Методы проверки состояния:**

- `isAnyOpen(): boolean` — проверка открытости любого окна
- `getActiveModal(): IModal | null` — получение активного окна

**Методы содержимого:**

- `setModalContent(content: HTMLElement | string, modal?: IModal): void` — установка содержимого

**События:**

- `onModalOpen?: (modal: IModal) => void` — обработчик открытия
- `onModalClose?: (modal: IModal) => void` — обработчик закрытия
- `onModalContentChange?: (modal: IModal, content: HTMLElement | string) => void` — изменение содержимого

#### `IModalFactory`

**Файл:** `src/types/modal.ts`  
**Задача:** Фабрика для создания типизированных модальных окон

**Методы:**

- `createModal<T>(type: T, config?: IModalConfig): ITypedModal<T>` — создание модалки конкретного типа
- `getModalTemplate(type: ModalType): HTMLTemplateElement | null` — получение шаблона модалки

#### `IComponent<T>`

**Файл:** `src/types/views.ts`  
**Задача:** Базовый интерфейс для всех компонентов представления

**Поля:**

- `container: HTMLElement` — корневой элемент компонента

**Методы:**

- `render(data?: T): HTMLElement` — рендеринг компонента с данными
- `toggleClass(className: string, force?: boolean): void` — переключение CSS класса
- `setText(selector: string, value: string): void` — установка текста элемента
- `setDisabled(selector: string, disabled: boolean): void` — блокировка элементов
- `setHidden(selector: string, hidden: boolean): void` — скрытие элементов
- `setImage(selector: string, src: string, alt?: string): void` — установка изображения

---

### **Презентационный слой**

#### `src/index.ts` (Main Application Controller/Presenter)

**Задача:** Презентер в MVP архитектуре

**Компоненты:**

- `events: EventEmitter` — центральная система событий
- `api: WebLarekAPI` — API клиент для взаимодействия с сервером
- `appModel: AppModel` — модель данных приложения
- `productCard: ProductCard` — компонент карточки
- `gallery: Gallery` — компонент галереи

**Функции взаимодействия с API:**

- `loadProducts(): Promise<void>` — загрузка товаров с сервера и передача в модель
- `createOrder(): Promise<void>` — получение данных заказа из модели и отправка на сервер
- `startApp(): Promise<void>` — запуск приложения

**Обработчики событий модели:**

- `products:changed` — обновление галереи при изменении списка товаров
- `basket:changed` — обновление счетчика корзины
- `order:change` — реакция на изменения в заказе
- `order:error` — обработка ошибок валидации
- `order:created` — обработка успешного создания заказа
- `error` — централизованная обработка ошибок

---

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
'basket:clear': unknown // Очистка корзины
'basket:open': void // Открытие корзины
```

### События заказа

```typescript
'order:change': { field?: string; value?: any } | Record<string, never> // Изменение данных заказа
'order:error': { errors: string[] } // Ошибки валидации заказа
'order:created': IOrderResult // Заказ успешно создан
'order:start': void // Начало оформления заказа
'order:next': void // Переход к следующему шагу оформления
'order:submit': IOrder // Отправка заказа
'contacts:submit': ContactFormData // Отправка контактных данных
```

### События модальных окон

```typescript
'modal:open': { modal: IModal; type?: ModalType } // Открытие модального окна
'modal:close': { modal: IModal; type?: ModalType } // Закрытие модального окна
'modal:content-change': { modal: IModal; content: HTMLElement | string } // Изменение содержимого
'modal:overlay-click': { modal: IModal } // Клик по оверлею
'modal:escape-key': { modal: IModal } // Нажатие Escape
'modal:before-open': { modal: IModal } // Перед открытием (для анимации)
'modal:after-open': { modal: IModal } // После открытия
'modal:before-close': { modal: IModal } // Перед закрытием
'modal:after-close': { modal: IModal } // После закрытия
```

### События форм

```typescript
'form:change': { field: string; value: string } // Изменение поля формы
'form:error': { field: string; error: string } // Ошибка валидации поля
'form:submit': IOrder // Отправка формы
'form:valid': boolean // Изменение состояния валидности формы
'payment:change': PaymentMethod // Изменение способа оплаты
```

### События страницы

```typescript
'page:lock': boolean // Блокировка/разблокировка страницы
'page:product-list-change': { products: IProduct[] } // Изменение списка товаров на странице
'page:basket-counter-change': { count: number } // Изменение счетчика корзины
```

### События компонентов

```typescript
'component:render': { component: string; data: unknown } // Рендеринг компонента
'component:destroy': { component: string } // Уничтожение компонента
'component:state-change': { component: string; state: unknown } // Изменение состояния
```

---

## **Взаимодействие компонентов**

### **Жизненный цикл модальных окон:**

#### 1. **Просмотр товара:**

1. `ProductCard` → клик → `emit('card:select', { product })`
2. `Presenter` → `IModalManager.open(productModal)`
3. `IModal` → `setContent(IProductCardView.render(product))`
4. Отображение полной информации о товаре

#### 2. **Корзина товаров:**

1. `IPageView` → клик на корзину → `emit('basket:open')`
2. `Presenter` → `IModalManager.open(basketModal)`
3. `IBasketView` → `render({ basket })` → список `IBasketItemView`
4. `IBasketView` → `updateTotal(basket.getTotal())`

#### 3. **Оформление заказа:**

1. `IBasketView` → клик "Оформить" → `emit('order:start')`
2. `Presenter` → `IModalManager.open(orderFormModal)`
3. `IOrderFormView` → `render(orderData)` → выбор оплаты и адреса
4. `IOrderFormView` → `validate()` → `emit('order:next')`
5. `Presenter` → `IModalManager.open(contactsFormModal)`
6. `IContactFormView` → ввод email/телефона → `validate()`
7. `IContactFormView` → `emit('order:submit', orderData)`

#### 4. **Успешный заказ:**

1. `Presenter` → получение `IOrderResult` от API
2. `IModalManager.open(successModal)`
3. `IOrderSuccessView` → `render({ result })` → показ суммы списания
4. Автоматическая очистка корзины в модели

### **Система валидации форм:**

#### `IFormView<T>` базовая логика:

1. **Ввод данных:** пользователь заполняет поля
2. **Реактивная валидация:** `validate()` при изменении полей
3. **Отображение ошибок:** `showErrors(errors)` под каждым полем
4. **Состояние формы:** `getFormData()` возвращает типизированные данные
5. **Очистка:** `clearErrors()` при исправлении ошибок

#### Специфичная валидация:

- **`IOrderFormView`:** проверка адреса доставки и способа оплаты
- **`IContactFormView`:** валидация email (regex) и телефона (формат)

### **Управление состоянием компонентов:**

#### **IPageView** (главная страница):

- `setProductList(products)` ← данные от `AppModel`
- `setBasketCounter(count)` ← события `basket:changed`
- `setLocked(true)` ← при открытии модальных окон

#### **IComponent<T>** базовая функциональность:

- `render(data)` — перерисовка при изменении данных
- `toggleClass()` — управление состояниями (active, disabled, hidden)
- `setText()` / `setImage()` — обновление содержимого без перерисовки
- `setDisabled()` / `setHidden()` — реактивное управление UI

### **Паттерн Observer в компонентах:**

```typescript
// Компонент подписывается на изменения модели
events.on('basket:changed', (basket: IBasket) => {
	basketView.updateCounter(basket.count);
	basketView.updateTotal(basket.getTotal());
	pageView.setBasketCounter(basket.count);
});

// Компонент эмитирует события действий пользователя
basketItemView.onClick(() => {
	events.emit('basket:remove', { productId: item.product.id });
});
```

### **Типизированная система модальных окон:**

```typescript
// Создание типизированной модалки
const productModal = modalFactory.createModal(ModalType.PRODUCT_PREVIEW, {
	closeOnOverlayClick: true,
	closeOnEscapeKey: true,
});

// Типизированные данные передаются автоматически
productModal.render({ product });
```

---

## **Поток выполнения (MVP архитектура)**

### Загрузка приложения:

1. **Презентер:** `startApp()` → `loadProducts()`
2. **Презентер:** `api.getProductList()` — загрузка данных с сервера
3. **Презентер:** `gallery.showLoading()` — показ индикатора загрузки
4. **Презентер:** `appModel.setProducts(products)` — передача данных в модель
5. **Модель:** `emit('products:changed', { products })` — уведомление об изменении
6. **Презентер:** обработка события → `gallery.render(products)` — отображение товаров

### Выбор товара:

1. **Представление:** клик по карточке → `emit('card:select', { product })`
2. **Презентер:** обработка события → `appModel.selectProduct(product)`
3. **Модель:** `emit('product:selected', product)` — уведомление о выборе
4. **Презентер:** обработка события → открытие модального окна

### Добавление в корзину:

1. **Представление:** `emit('basket:add', { product })`
2. **Презентер:** `appModel.addToBasket(product)`
3. **Модель:** валидация товара → `basket.addItem(product)`
4. **Модель:** `emit('basket:changed', basket)` — уведомление об изменении
5. **Презентер:** обработка события → обновление счетчика в UI

### Оформление заказа:

1. **Модель:** `setOrderField(field, value)` → валидация поля в реальном времени
2. **Модель:** при ошибках → `emit('order:error', { errors })`
3. **Презентер:** `createOrder()` → `appModel.getOrderData()` — получение данных
4. **Презентер:** `api.createOrder(orderData)` — отправка на сервер
5. **Презентер:** `appModel.onOrderSuccess(result)` — передача результата в модель
6. **Модель:** очистка корзины и заказа → `emit('order:created', result)`

## **Полный список сущностей проекта**

### **Описанные модели данных:**

- **`Product`** — товар с валидацией и форматированием
- **`ProductList`** — коллекция товаров с фильтрацией
- **`Basket`** — корзина с управлением товарами
- **`BasketItem`** — элемент корзины с выбором
- **`Order`** — заказ с комплексной валидацией
- **`OrderResult`** — результат созданного заказа
- **`AppModel`** — центральная модель приложения

### **Описанные представления (Views):**

- **`ProductCard`** — карточка товара в каталоге
- **`Gallery`** — галерея товаров на главной
- **`IPageView`** — главная страница приложения
- **`IBasketView`** — представление корзины
- **`IBasketItemView`** — элемент товара в корзине
- **`IOrderFormView`** — форма заказа (адрес, оплата)
- **`IContactFormView`** — форма контактов (email, телефон)
- **`IOrderSuccessView`** — экран успешного заказа
- **`IComponent<T>`** — базовый компонент для всех представлений

### **Описанная система модальных окон:**

- **`IModal`** — интерфейс отдельного модального окна
- **`IModalManager`** — менеджер управления модалками
- **`IModalFactory`** — фабрика создания типизированных модалок
- **`ModalType`** — типы модальных окон
- **`ModalState`** — состояния для анимаций
- **`ModalData`** — типизированные данные для каждого типа

### **Описанные вспомогательные сущности:**

- **`EventEmitter`** — система событий
- **`WebLarekAPI`** — API клиент
- **`ProductCategory`** — категории товаров
- **`PaymentMethod`** — способы оплаты
- **`FormData`** — структура данных форм
- **`FormValidator<T>`** — система валидации
- **Константы и селекторы** — CSS классы и селекторы

### **DOM утилиты:**

- `ensureElement<T>(selector, context?)` — безопасный поиск элемента с автоматической проверкой существования
- `cloneTemplate<T>(template)` — клонирование HTML шаблонов
- `createElement<T>(tagName, props?, children?)` — фабрика для создания DOM элементов
- `createTextElement<T>(tagName, text, className?)` — упрощенное создание текстовых элементов

### **БЭМ методология:**

- `bem(block, element?, modifier?)` — генерация БЭМ классов

### **Работа с данными:**

- `setElementData(element, data)` — установка dataset атрибутов
- `getElementData(element, scheme)` — получение типизированных данных из dataset
- `isEmpty(value)` — проверка на null/undefined
- `isPlainObject(obj)` — проверка на простой объект

### **Енумы и константы (Enums & Constants)**

#### `ProductCategory`

**Файл:** `src/types/enums.ts`  
**Задача:** Типизация категорий товаров

**Значения:**

#### `PaymentMethod`

**Файл:** `src/types/enums.ts`  
**Задача:** Способы оплаты заказа

**Значения:**

- `ONLINE = 'online'` — онлайн оплата
- `CASH = 'cash'` — оплата при получении

#### `ModalType`

**Файл:** `src/types/enums.ts`  
**Задача:** Типы модальных окон для типизированного управления

**Значения:**

- `PRODUCT_PREVIEW = 'product-preview'` — просмотр товара
- `BASKET = 'basket'` — корзина товаров
- `ORDER_FORM = 'order-form'` — форма заказа
- `CONTACTS_FORM = 'contacts-form'` — форма контактов
- `ORDER_SUCCESS = 'order-success'` — успешное оформление

#### `ModalState`

**Файл:** `src/types/enums.ts`  
**Задача:** Состояния модального окна для анимаций

**Значения:**

- `CLOSED = 'closed'` — закрыто
- `OPENING = 'opening'` — процесс открытия
- `OPEN = 'open'` — открыто
