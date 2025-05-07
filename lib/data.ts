'use client';

import { BloggerData, BloggerSettings, BloggerWithMetrics, BusinessSettings } from './types';

// Ключи для localStorage
const BUSINESS_SETTINGS_KEY = 'businessExpertSettings';
const BLOGGER_SETTINGS_KEY = 'bloggerExpertSettings';
const BUSINESS_RESULTS_KEY = 'businessResults';
const BLOGGER_RESULTS_KEY = 'bloggerResults';
const BUSINESS_DATA_KEY = 'businessData';
const BLOGGER_DATA_KEY = 'bloggerData';

// Константы для ключей хранилища
export const STORAGE_KEYS = {
	BUSINESS_MODE_SETTINGS: 'businessModeSettings',
	BLOGGER_MODE_SETTINGS: 'bloggerModeSettings',
	BUSINESS_MODE_RESULTS: 'businessModeResults',
	BLOGGER_MODE_RESULTS: 'bloggerModeResults',
	CUSTOM_SCENARIOS: 'custom_scenarios',
	EXPERT_PASSWORD: 'expertPassword',
	EXPERT_SESSION: 'expertSession',
};

/**
 * Сохраняет настройки для бизнес-режима в localStorage
 */
export function saveBusinessSettings(settings: BusinessSettings): void {
	try {
		localStorage.setItem(BUSINESS_SETTINGS_KEY, JSON.stringify(settings));
	} catch (error) {
		console.error('Ошибка при сохранении настроек для бизнеса:', error);
	}
}

/**
 * Сохраняет настройки для режима блогера в localStorage
 */
export function saveBloggerSettings(settings: BloggerSettings): void {
	try {
		localStorage.setItem(BLOGGER_SETTINGS_KEY, JSON.stringify(settings));
	} catch (error) {
		console.error('Ошибка при сохранении настроек блогера:', error);
	}
}

/**
 * Загружает настройки для бизнес-режима из localStorage
 */
export function loadBusinessSettings(): BusinessSettings | null {
	try {
		const settings = localStorage.getItem(BUSINESS_SETTINGS_KEY);
		return settings ? JSON.parse(settings) : null;
	} catch (error) {
		console.error('Ошибка при загрузке настроек для бизнеса:', error);
		return null;
	}
}

/**
 * Загружает настройки для режима блогера из localStorage
 */
export function loadBloggerSettings(): BloggerSettings | null {
	try {
		const settings = localStorage.getItem(BLOGGER_SETTINGS_KEY);
		return settings ? JSON.parse(settings) : null;
	} catch (error) {
		console.error('Ошибка при загрузке настроек блогера:', error);
		return null;
	}
}

/**
 * Сохраняет данные о блогере в localStorage
 */
export function saveBloggerData(data: BloggerData): void {
	try {
		localStorage.setItem(BLOGGER_DATA_KEY, JSON.stringify(data));
	} catch (error) {
		console.error('Ошибка при сохранении данных блогера:', error);
	}
}

/**
 * Сохраняет данные о блогерах для бизнес-режима в localStorage
 */
export function saveBusinessData(data: BloggerData[]): void {
	try {
		localStorage.setItem(BUSINESS_DATA_KEY, JSON.stringify(data));
	} catch (error) {
		console.error('Ошибка при сохранении данных для бизнеса:', error);
	}
}

/**
 * Загружает данные о блогере из localStorage
 */
export function loadBloggerData(): BloggerData | null {
	try {
		const data = localStorage.getItem(BLOGGER_DATA_KEY);
		return data ? JSON.parse(data) : null;
	} catch (error) {
		console.error('Ошибка при загрузке данных блогера:', error);
		return null;
	}
}

/**
 * Загружает данные о блогерах для бизнес-режима из localStorage
 */
export function loadBusinessData(): BloggerData[] {
	try {
		const data = localStorage.getItem(BUSINESS_DATA_KEY);
		return data ? JSON.parse(data) : [];
	} catch (error) {
		console.error('Ошибка при загрузке данных для бизнеса:', error);
		return [];
	}
}

/**
 * Сохраняет результаты анализа для блогера
 */
export function saveBloggerResults(results: BloggerWithMetrics): void {
	try {
		localStorage.setItem(BLOGGER_RESULTS_KEY, JSON.stringify(results));
	} catch (error) {
		console.error('Ошибка при сохранении результатов анализа блогера:', error);
	}
}

/**
 * Сохраняет результаты анализа для бизнеса
 */
export function saveBusinessResults(results: BloggerWithMetrics[]): void {
	try {
		localStorage.setItem(BUSINESS_RESULTS_KEY, JSON.stringify(results));
	} catch (error) {
		console.error('Ошибка при сохранении результатов анализа для бизнеса:', error);
	}
}

/**
 * Загружает результаты анализа для блогера
 */
export function loadBloggerResults(): BloggerWithMetrics | null {
	try {
		const results = localStorage.getItem(BLOGGER_RESULTS_KEY);
		return results ? JSON.parse(results) : null;
	} catch (error) {
		console.error('Ошибка при загрузке результатов анализа блогера:', error);
		return null;
	}
}

/**
 * Загружает результаты анализа для бизнеса
 */
export function loadBusinessResults(): BloggerWithMetrics[] {
	try {
		const results = localStorage.getItem(BUSINESS_RESULTS_KEY);
		return results ? JSON.parse(results) : [];
	} catch (error) {
		console.error('Ошибка при загрузке результатов анализа для бизнеса:', error);
		return [];
	}
}

/**
 * Очищает все данные из localStorage
 */
export function clearAllData(): void {
	try {
		localStorage.removeItem(BUSINESS_SETTINGS_KEY);
		localStorage.removeItem(BLOGGER_SETTINGS_KEY);
		localStorage.removeItem(BUSINESS_RESULTS_KEY);
		localStorage.removeItem(BLOGGER_RESULTS_KEY);
		localStorage.removeItem(BUSINESS_DATA_KEY);
		localStorage.removeItem(BLOGGER_DATA_KEY);
	} catch (error) {
		console.error('Ошибка при очистке данных:', error);
	}
}

// Получение настроенных сценариев с активностью
export function getCustomScenarios() {
	try {
		const savedScenarios = localStorage.getItem(STORAGE_KEYS.CUSTOM_SCENARIOS);
		if (!savedScenarios) {
			// Возвращаем сценарии по умолчанию, если нет сохраненных
			const defaultScenarios = [
				{ id: 1, name: 'Увеличение активности', isActive: true },
				{ id: 2, name: 'Повышение вовлеченности', isActive: true },
				{ id: 3, name: 'Коллаборации', isActive: true },
				{ id: 4, name: 'Образовательный контент', isActive: true },
			];

			// Сразу сохраняем их в localStorage
			localStorage.setItem(STORAGE_KEYS.CUSTOM_SCENARIOS, JSON.stringify(defaultScenarios));

			return defaultScenarios;
		}

		// Преобразуем сохраненные данные, но игнорируем поле probability
		const parsedScenarios = JSON.parse(savedScenarios);

		// Проверяем, содержит ли массив все стандартные сценарии
		const standardScenarioNames = [
			'Увеличение активности',
			'Повышение вовлеченности',
			'Коллаборации',
			'Образовательный контент',
		];

		// Проверяем, есть ли в сохраненных данных все стандартные сценарии
		const hasAllStandardScenarios = standardScenarioNames.every((name) =>
			parsedScenarios.some((s: any) => s.name === name),
		);

		// Если каких-то стандартных сценариев нет, добавляем их
		if (!hasAllStandardScenarios) {
			let maxId = Math.max(0, ...parsedScenarios.map((s: any) => s.id || 0));

			standardScenarioNames.forEach((name, index) => {
				if (!parsedScenarios.some((s: any) => s.name === name)) {
					parsedScenarios.push({
						id: index + 1 <= maxId ? maxId + 1 + index : index + 1,
						name: name,
						isActive: true,
					});
				}
			});

			// Сохраняем обновленные данные
			localStorage.setItem(STORAGE_KEYS.CUSTOM_SCENARIOS, JSON.stringify(parsedScenarios));
		}

		return parsedScenarios.map((scenario: any) => ({
			id: scenario.id,
			name: scenario.name,
			isActive: scenario.isActive,
			description: scenario.description,
		}));
	} catch (e) {
		console.error('Ошибка при получении сценариев:', e);
		// Возвращаем сценарии по умолчанию в случае ошибки
		return [
			{ id: 1, name: 'Увеличение активности', isActive: true },
			{ id: 2, name: 'Повышение вовлеченности', isActive: true },
			{ id: 3, name: 'Коллаборации', isActive: true },
			{ id: 4, name: 'Образовательный контент', isActive: true },
		];
	}
}

/**
 * Рассчитывает вероятность для конкретного сценария на основе метрик блогера
 * @param scenarioKey Ключ сценария
 * @param metrics Опциональные метрики блогера для более точного расчета
 */
export function getScenarioProbability(scenarioKey: string, metrics?: any): number {
	// Проверяем, активен ли этот сценарий
	const scenarios = getCustomScenarios();
	let scenarioName = '';

	switch (scenarioKey) {
		case 'activity_scenario':
			scenarioName = 'Увеличение активности';
			break;
		case 'engagement_scenario':
			scenarioName = 'Повышение вовлеченности';
			break;
		case 'collaboration_scenario':
			scenarioName = 'Коллаборации';
			break;
		case 'education_scenario':
			scenarioName = 'Образовательный контент';
			break;
	}

	const isActive = scenarios.find((s: any) => s.name === scenarioName)?.isActive !== false;

	if (!isActive) {
		return 0; // Если сценарий неактивен, вероятность 0
	}

	// Если переданы метрики, рассчитываем вероятность на их основе
	if (metrics) {
		switch (scenarioKey) {
			case 'activity_scenario': {
				// Вероятность на основе частоты публикаций и стабильности активности
				// Чем ниже частота и стабильность, тем выше вероятность успеха при их увеличении
				const postFrequencyFactor = Math.max(0, 1 - metrics.post_frequency / 10); // Обратная зависимость от частоты
				const stabilityFactor = Math.max(0, 1 - metrics.activity_stability); // Обратная зависимость от стабильности
				return Math.min(
					100,
					Math.round((postFrequencyFactor * 0.7 + stabilityFactor * 0.3) * 100),
				);
			}

			case 'engagement_scenario': {
				// Вероятность на основе показателя вовлеченности
				// Чем ниже вовлеченность, тем выше вероятность ее увеличения
				const erFactor = Math.max(0, 1 - metrics.engagement_rate / 15); // Обратная зависимость от ER
				return Math.min(100, Math.round((0.6 + erFactor * 0.4) * 100)); // Базовая вероятность 60% + поправка
			}

			case 'collaboration_scenario': {
				// Вероятность на основе упоминаний и охвата
				// Чем больше уже есть упоминаний, тем выше вероятность успеха коллабораций
				const mentionsFactor = Math.min(1, metrics.mentions / 20); // Прямая зависимость от упоминаний
				const reachFactor = Math.min(1, metrics.avg_reach / 10000); // Фактор охвата
				return Math.min(100, Math.round((mentionsFactor * 0.6 + reachFactor * 0.4) * 100));
			}

			case 'education_scenario': {
				// Образовательный контент работает лучше, если:
				// 1. У блогера мало комментариев относительно лайков (люди мало вовлечены в дискуссию)
				// 2. Высокий темп роста аудитории (новая аудитория нуждается в информации)

				// Соотношение комментариев к лайкам (инвертированное)
				const commentRatio = Math.max(
					0,
					1 - metrics.comments / Math.max(1, metrics.likes) / 0.2,
				);
				// Фактор роста аудитории
				const audienceGrowthFactor = Math.min(1, metrics.growth_rate / 10);

				// Базовая вероятность 50% + факторы
				return Math.min(
					100,
					Math.round((0.5 + commentRatio * 0.3 + audienceGrowthFactor * 0.2) * 100),
				);
			}
		}
	}

	// Если метрики не переданы, используем значения по умолчанию
	switch (scenarioKey) {
		case 'activity_scenario':
			return 70;
		case 'engagement_scenario':
			return 85;
		case 'collaboration_scenario':
			return 50;
		case 'education_scenario':
			return 65; // Значение по умолчанию для образовательного сценария
		default:
			return 60;
	}
}
