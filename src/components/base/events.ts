type EventName = string | RegExp;
type Subscriber = (...args: any[]) => void;
type EmitterEvent = {
	eventName: string;
	data: unknown;
};

// Импортируем правильный интерфейс из типов проекта
import { IEventEmitter, EventMap } from '../../types/events';

/**
 * Брокер событий
 */
export class EventEmitter implements IEventEmitter {
	_events: Map<EventName, Set<Subscriber>>;

	constructor() {
		this._events = new Map<EventName, Set<Subscriber>>();
	}

	/**
	 * Установить обработчик на событие
	 */
	on<T extends keyof EventMap>(
		eventName: T,
		callback: (data: EventMap[T]) => void
	) {
		if (!this._events.has(eventName as string)) {
			this._events.set(eventName as string, new Set<Subscriber>());
		}
		this._events.get(eventName as string)?.add(callback);
	}

	/**
	 * Снять обработчик с события
	 */
	off<T extends keyof EventMap>(
		eventName: T,
		callback: (data: EventMap[T]) => void
	) {
		if (this._events.has(eventName as string)) {
			this._events.get(eventName as string)!.delete(callback);
			if (this._events.get(eventName as string)?.size === 0) {
				this._events.delete(eventName as string);
			}
		}
	}

	/**
	 * Инициировать событие с данными
	 */
	emit<T extends keyof EventMap>(eventName: T, data?: EventMap[T]) {
		this._events.forEach((subscribers, name) => {
			if (name === '*')
				subscribers.forEach((callback) =>
					callback({
						eventName,
						data,
					})
				);
			if (
				(name instanceof RegExp && name.test(eventName as string)) ||
				name === eventName
			) {
				subscribers.forEach((callback) => callback(data));
			}
		});
	}

	/**
	 * Слушать все события
	 */
	onAll(callback: (event: EmitterEvent) => void) {
		this.on('*' as any, callback as any);
	}

	/**
	 * Сбросить все обработчики
	 */
	offAll() {
		this._events = new Map<string, Set<Subscriber>>();
	}

	/**
	 * Сделать коллбек триггер, генерирующий событие при вызове
	 */
	trigger<T extends keyof EventMap>(
		eventName: T,
		context?: Partial<EventMap[T]>
	) {
		return (event: object = {}) => {
			this.emit(eventName, {
				...(event || {}),
				...(context || {}),
			} as EventMap[T]);
		};
	}
}
