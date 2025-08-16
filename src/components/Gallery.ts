import { createTextElement } from '../utils/utils';

export interface IGallery {
	render(elements: HTMLElement[]): void;
}

export class Gallery implements IGallery {
	protected _container: HTMLElement;

	constructor(container: HTMLElement) {
		this._container = container;
	}

	render(elements: HTMLElement[]): void {
		this._container.innerHTML = '';

		if (elements.length === 0) {
			const emptyMessage = createTextElement<HTMLParagraphElement>(
				'p',
				'Товары не найдены'
			);
			this._container.appendChild(emptyMessage);
			return;
		}

		elements.forEach((element) => {
			this._container.appendChild(element);
		});
	}

	showLoading(): void {
		this._container.innerHTML = '';
		const loadingMessage = createTextElement<HTMLParagraphElement>(
			'p',
			'Загрузка товаров...'
		);
		this._container.appendChild(loadingMessage);
	}

	showError(message: string): void {
		this._container.innerHTML = '';
		const errorMessage = createTextElement<HTMLParagraphElement>(
			'p',
			`Ошибка: ${message}`
		);
		this._container.appendChild(errorMessage);
	}
}
