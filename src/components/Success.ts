import { Component } from './base/Component';
import { IOrderSuccessView } from '../types/views';
import { IOrderResult, OrderResult } from '../types/order';
import { IEventEmitter } from '../types/events';
import { ensureElement } from '../utils/utils';

/**
 * Компонент страницы успешного заказа
 */
export class Success
	extends Component<{ result: IOrderResult }>
	implements IOrderSuccessView
{
	protected _close: HTMLButtonElement;
	protected _description: HTMLElement;
	protected _events: IEventEmitter;

	constructor(container: HTMLElement, events: IEventEmitter) {
		super(container);
		this._events = events;

		this._close = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			container
		);
		this._description = ensureElement<HTMLElement>(
			'.order-success__description',
			container
		);

		this._close.addEventListener('click', () => {
			this._events.emit('success:close', {});
		});
	}

	render(data?: { result: IOrderResult }): HTMLElement {
		if (data && data.result) {
			const { result } = data;
			// Создаем экземпляр класса OrderResult для использования методов
			const orderResult = new OrderResult(result);
			this.setText(
				'.order-success__description',
				`Списано ${orderResult.getFormattedTotal()}`
			);
		}

		return this.container;
	}
}
