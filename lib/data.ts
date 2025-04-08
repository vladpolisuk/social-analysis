'use client';

import { BloggerData, BloggerSettings, BloggerWithMetrics, BusinessSettings } from './types';

// Ключи для localStorage
const BUSINESS_SETTINGS_KEY = 'businessExpertSettings';
const BLOGGER_SETTINGS_KEY = 'bloggerExpertSettings';
const BUSINESS_RESULTS_KEY = 'businessResults';
const BLOGGER_RESULTS_KEY = 'bloggerResults';
const BUSINESS_DATA_KEY = 'businessData';
const BLOGGER_DATA_KEY = 'bloggerData';

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
