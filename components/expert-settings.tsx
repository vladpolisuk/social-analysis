'use client';

import { useEffect, useState } from 'react';

interface IIWeights {
	followers_ratio: number; // w1 - Вес соотношения подписчиков (FR)
	engagement_rate: number; // w2 - Вес показателя вовлеченности (ER)
	post_frequency: number; // w3 - Вес частоты публикаций (PA)
	reach: number; // w4 - Вес среднего охвата (RA)
	mentions: number; // w5 - Вес упоминаний (M)
	[key: string]: number; // Индексная сигнатура для доступа по строковому ключу
}

interface SIWeights {
	engagement_consistency: number; // ϑ1 - Вес стабильности вовлеченности
	posting_consistency: number; // ϑ2 - Вес стабильности публикаций
	reach_consistency: number; // ϑ3 - Вес стабильности охвата
	[key: string]: number; // Индексная сигнатура для доступа по строковому ключу
}

interface OptimalityWeights {
	alpha: number; // α - Вес для ΔII
	beta: number; // β - Вес для ΔSI
	gamma: number; // γ - Вес для Cs (стоимости)
	[key: string]: number; // Индексная сигнатура для доступа по строковому ключу
}

interface ScenarioParameters {
	post_frequency_delta: number; // ΔPA - прирост частоты постов
	engagement_target: number; // ΔER - целевой прирост вовлеченности
	mentions_delta: number; // ΔM - прирост упоминаний
	cost_activity: number; // Cs для сценария "Увеличение активности"
	cost_engagement: number; // Cs для сценария "Повышение вовлеченности"
	cost_collaboration: number; // Cs для сценария "Коллаборации"
	[key: string]: number; // Индексная сигнатура для доступа по строковому ключу
}

interface BusinessSettings {
	ii_weights: IIWeights;
	si_weights: SIWeights;
	optimality_weights: OptimalityWeights;
}

interface BloggerSettings {
	ii_weights: IIWeights;
	si_weights: SIWeights;
	scenario_parameters: ScenarioParameters;
}

type Settings = BusinessSettings | BloggerSettings;

interface ExpertSettingsProps {
	isBusinessMode: boolean;
	onSaveSettings: (settings: Settings) => void;
}

// Значения по умолчанию
const defaultBusinessSettings: BusinessSettings = {
	// Веса для Интегрального индекса влияния (II)
	ii_weights: {
		followers_ratio: 0.2, // w1
		engagement_rate: 0.3, // w2
		post_frequency: 0.2, // w3
		reach: 0.2, // w4
		mentions: 0.1, // w5
	},
	// Веса для Индекса устойчивости влияния (SI)
	si_weights: {
		engagement_consistency: 0.4, // ϑ1
		posting_consistency: 0.3, // ϑ2
		reach_consistency: 0.3, // ϑ3
	},
	// Веса для критериев оптимальности
	optimality_weights: {
		alpha: 0.5, // α - Вес для ΔII
		beta: 0.3, // β - Вес для ΔSI
		gamma: 0.2, // γ - Вес для Cs
	},
};

const defaultBloggerSettings: BloggerSettings = {
	// Веса для Интегрального индекса влияния (II)
	ii_weights: {
		followers_ratio: 0.2, // w1
		engagement_rate: 0.3, // w2
		post_frequency: 0.2, // w3
		reach: 0.2, // w4
		mentions: 0.1, // w5
	},
	// Веса для Индекса устойчивости влияния (SI)
	si_weights: {
		engagement_consistency: 0.4, // ϑ1
		posting_consistency: 0.3, // ϑ2
		reach_consistency: 0.3, // ϑ3
	},
	// Параметры для сценариев улучшения
	scenario_parameters: {
		post_frequency_delta: 2.0, // ΔPA - прирост частоты постов
		engagement_target: 1.5, // ΔER - целевой прирост вовлеченности
		mentions_delta: 3.0, // ΔM - прирост упоминаний
		cost_activity: 0.2, // Cs для "Увеличение активности"
		cost_engagement: 0.2, // Cs для "Повышение вовлеченности"
		cost_collaboration: 0.6, // Cs для "Коллаборации"
	},
};

export default function ExpertSettings({ isBusinessMode, onSaveSettings }: ExpertSettingsProps) {
	const [settings, setSettings] = useState<Settings>(
		isBusinessMode ? defaultBusinessSettings : defaultBloggerSettings,
	);
	// Объект для хранения строковых значений полей до преобразования в числа
	const [stringValues, setStringValues] = useState<{ [key: string]: { [key: string]: string } }>({
		ii_weights: {},
		si_weights: {},
		optimality_weights: {},
		scenario_parameters: {},
	});
	// Состояние для отображения ошибки валидации
	const [validationError, setValidationError] = useState<string | null>(null);

	// Загрузка сохраненных настроек из localStorage при монтировании
	useEffect(() => {
		const savedSettings = localStorage.getItem(
			isBusinessMode ? 'businessExpertSettings' : 'bloggerExpertSettings',
		);
		if (savedSettings) {
			const parsed = JSON.parse(savedSettings);
			setSettings(parsed);

			// Инициализация строковых значений из загруженных настроек
			const initialStringValues: { [key: string]: { [key: string]: string } } = {
				ii_weights: {},
				si_weights: {},
				optimality_weights: {},
				scenario_parameters: {},
			};

			// Заполнение строковых значений из числовых
			Object.keys(parsed.ii_weights).forEach((key) => {
				initialStringValues.ii_weights[key] = parsed.ii_weights[key].toString();
			});

			Object.keys(parsed.si_weights).forEach((key) => {
				initialStringValues.si_weights[key] = parsed.si_weights[key].toString();
			});

			if ('optimality_weights' in parsed) {
				Object.keys(parsed.optimality_weights).forEach((key) => {
					initialStringValues.optimality_weights[key] =
						parsed.optimality_weights[key].toString();
				});
			}

			if ('scenario_parameters' in parsed) {
				Object.keys(parsed.scenario_parameters).forEach((key) => {
					initialStringValues.scenario_parameters[key] =
						parsed.scenario_parameters[key].toString();
				});
			}

			setStringValues(initialStringValues);
		} else {
			const defaultSettings = isBusinessMode
				? defaultBusinessSettings
				: defaultBloggerSettings;
			setSettings(defaultSettings);

			// Инициализация строковых значений из дефолтных настроек
			const initialStringValues: { [key: string]: { [key: string]: string } } = {
				ii_weights: {},
				si_weights: {},
				optimality_weights: {},
				scenario_parameters: {},
			};

			// Заполнение строковых значений из числовых
			Object.keys(defaultSettings.ii_weights).forEach((key) => {
				initialStringValues.ii_weights[key] = defaultSettings.ii_weights[key].toString();
			});

			Object.keys(defaultSettings.si_weights).forEach((key) => {
				initialStringValues.si_weights[key] = defaultSettings.si_weights[key].toString();
			});

			if ('optimality_weights' in defaultSettings) {
				Object.keys(defaultSettings.optimality_weights).forEach((key) => {
					initialStringValues.optimality_weights[key] =
						defaultSettings.optimality_weights[key].toString();
				});
			}

			if ('scenario_parameters' in defaultSettings) {
				Object.keys(defaultSettings.scenario_parameters).forEach((key) => {
					initialStringValues.scenario_parameters[key] =
						defaultSettings.scenario_parameters[key].toString();
				});
			}

			setStringValues(initialStringValues);
		}
	}, [isBusinessMode]);

	const handleChange = (category: string, field: string, value: string) => {
		// Проверяем, что вводятся только допустимые символы для числовых полей
		if (!/^[0-9.,]*$/.test(value) && value !== '') {
			return;
		}

		// Обновляем строковое значение
		setStringValues((prev) => ({
			...prev,
			[category]: {
				...prev[category],
				[field]: value,
			},
		}));

		// Устанавливаем числовое значение независимо от того, пустая строка или нет
		// Пустые строки превращаются в 0
		const numValue = value === '' ? 0 : parseFloat(value.replace(',', '.'));

		// Если это не число, не обновляем настройки
		if (isNaN(numValue)) return;

		setSettings((prevSettings) => {
			const newSettings = { ...prevSettings };
			if (category === 'ii_weights') {
				(newSettings as any).ii_weights = {
					...(newSettings as any).ii_weights,
					[field]: numValue,
				};
			} else if (category === 'si_weights') {
				(newSettings as any).si_weights = {
					...(newSettings as any).si_weights,
					[field]: numValue,
				};
			} else if (category === 'optimality_weights' && 'optimality_weights' in newSettings) {
				newSettings.optimality_weights = {
					...newSettings.optimality_weights,
					[field]: numValue,
				};
			} else if (category === 'scenario_parameters' && 'scenario_parameters' in newSettings) {
				newSettings.scenario_parameters = {
					...newSettings.scenario_parameters,
					[field]: numValue,
				};
			}
			return newSettings;
		});
	};

	// Функция для проверки суммы весов
	const validateWeightsSum = (settings: Settings): boolean => {
		let isValid = true;
		let errorMessage = '';

		// Проверка суммы весов для II
		const iiSum = Object.values(settings.ii_weights).reduce((sum, value) => sum + value, 0);
		if (Math.abs(iiSum - 1.0) > 0.001) {
			isValid = false;
			errorMessage += `Сумма весов для II должна быть равна 1.0, текущая сумма: ${iiSum.toFixed(
				2,
			)}. `;
		}

		// Проверка суммы весов для SI
		const siSum = Object.values(settings.si_weights).reduce((sum, value) => sum + value, 0);
		if (Math.abs(siSum - 1.0) > 0.001) {
			isValid = false;
			errorMessage += `Сумма весов для SI должна быть равна 1.0, текущая сумма: ${siSum.toFixed(
				2,
			)}. `;
		}

		// Проверка суммы весов в зависимости от режима
		if ('optimality_weights' in settings) {
			const optimalitySum = Object.values(settings.optimality_weights).reduce(
				(sum, value) => sum + value,
				0,
			);
			if (Math.abs(optimalitySum - 1.0) > 0.001) {
				isValid = false;
				errorMessage += `Сумма весов критериев оптимальности (α+β+γ) должна быть равна 1.0, текущая сумма: ${optimalitySum.toFixed(
					2,
				)}. `;
			}
		} else if ('scenario_parameters' in settings) {
			const costSum =
				settings.scenario_parameters.cost_activity +
				settings.scenario_parameters.cost_engagement +
				settings.scenario_parameters.cost_collaboration;
			if (Math.abs(costSum - 1.0) > 0.001) {
				isValid = false;
				errorMessage += `Сумма весов стоимости сценариев (C₁+C₂+C₃) должна быть равна 1.0, текущая сумма: ${costSum.toFixed(
					2,
				)}. `;
			}
		}

		setValidationError(isValid ? null : errorMessage);
		return isValid;
	};

	// Функция для нормализации весов (приведения суммы к 1.0)
	const normalizeWeights = (settings: Settings): Settings => {
		const newSettings = { ...settings };

		// Нормализуем веса для II
		const iiSum = Object.values(newSettings.ii_weights).reduce((sum, value) => sum + value, 0);
		if (iiSum > 0) {
			Object.keys(newSettings.ii_weights).forEach((key) => {
				newSettings.ii_weights[key] = newSettings.ii_weights[key] / iiSum;
			});
		}

		// Нормализуем веса для SI
		const siSum = Object.values(newSettings.si_weights).reduce((sum, value) => sum + value, 0);
		if (siSum > 0) {
			Object.keys(newSettings.si_weights).forEach((key) => {
				newSettings.si_weights[key] = newSettings.si_weights[key] / siSum;
			});
		}

		// Нормализуем веса в зависимости от режима
		if ('optimality_weights' in newSettings) {
			const optimalitySum = Object.values(newSettings.optimality_weights).reduce(
				(sum, value) => sum + value,
				0,
			);
			if (optimalitySum > 0) {
				Object.keys(newSettings.optimality_weights).forEach((key) => {
					newSettings.optimality_weights[key as keyof OptimalityWeights] =
						newSettings.optimality_weights[key as keyof OptimalityWeights] /
						optimalitySum;
				});
			}
		} else if ('scenario_parameters' in newSettings) {
			const costSum =
				newSettings.scenario_parameters.cost_activity +
				newSettings.scenario_parameters.cost_engagement +
				newSettings.scenario_parameters.cost_collaboration;
			if (costSum > 0) {
				newSettings.scenario_parameters.cost_activity /= costSum;
				newSettings.scenario_parameters.cost_engagement /= costSum;
				newSettings.scenario_parameters.cost_collaboration /= costSum;
			}
		}

		return newSettings;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Убедимся, что все строковые значения преобразованы в числа
		const finalSettings = { ...settings };

		// Преобразуем все строковые значения в числовые для окончательных настроек
		Object.keys(stringValues.ii_weights).forEach((key) => {
			const value = stringValues.ii_weights[key];
			const numValue = parseFloat(value.replace(',', '.')) || 0;
			(finalSettings as any).ii_weights[key] = numValue;
		});

		Object.keys(stringValues.si_weights).forEach((key) => {
			const value = stringValues.si_weights[key];
			const numValue = parseFloat(value.replace(',', '.')) || 0;
			(finalSettings as any).si_weights[key] = numValue;
		});

		if ('optimality_weights' in finalSettings) {
			Object.keys(stringValues.optimality_weights).forEach((key) => {
				const value = stringValues.optimality_weights[key];
				const numValue = parseFloat(value.replace(',', '.')) || 0;
				(finalSettings as BusinessSettings).optimality_weights[
					key as keyof OptimalityWeights
				] = numValue;
			});
		}

		if ('scenario_parameters' in finalSettings) {
			Object.keys(stringValues.scenario_parameters).forEach((key) => {
				const value = stringValues.scenario_parameters[key];
				const numValue = parseFloat(value.replace(',', '.')) || 0;
				(finalSettings as BloggerSettings).scenario_parameters[
					key as keyof ScenarioParameters
				] = numValue;
			});
		}

		// Проверяем суммы весов
		if (!validateWeightsSum(finalSettings)) {
			// Если суммы некорректны, спрашиваем пользователя, хочет ли он нормализовать веса
			if (confirm('Суммы весов не равны 1.0. Хотите автоматически нормализовать значения?')) {
				// Нормализуем веса
				const normalizedSettings = normalizeWeights(finalSettings);

				// Обновляем строковые значения после нормализации
				const newStringValues = { ...stringValues };

				Object.keys(normalizedSettings.ii_weights).forEach((key) => {
					newStringValues.ii_weights[key] = normalizedSettings.ii_weights[key].toFixed(2);
				});

				Object.keys(normalizedSettings.si_weights).forEach((key) => {
					newStringValues.si_weights[key] = normalizedSettings.si_weights[key].toFixed(2);
				});

				if ('optimality_weights' in normalizedSettings) {
					Object.keys(normalizedSettings.optimality_weights).forEach((key) => {
						newStringValues.optimality_weights[key] =
							normalizedSettings.optimality_weights[
								key as keyof OptimalityWeights
							].toFixed(2);
					});
				}

				if ('scenario_parameters' in normalizedSettings) {
					// Обновляем только весовые параметры стоимости
					newStringValues.scenario_parameters.cost_activity =
						normalizedSettings.scenario_parameters.cost_activity.toFixed(2);
					newStringValues.scenario_parameters.cost_engagement =
						normalizedSettings.scenario_parameters.cost_engagement.toFixed(2);
					newStringValues.scenario_parameters.cost_collaboration =
						normalizedSettings.scenario_parameters.cost_collaboration.toFixed(2);
				}

				setStringValues(newStringValues);
				setSettings(normalizedSettings);

				// Сохранение в localStorage
				localStorage.setItem(
					isBusinessMode ? 'businessExpertSettings' : 'bloggerExpertSettings',
					JSON.stringify(normalizedSettings),
				);

				onSaveSettings(normalizedSettings);
				setValidationError(null);
			}
			return;
		}

		// Сохранение в localStorage
		localStorage.setItem(
			isBusinessMode ? 'businessExpertSettings' : 'bloggerExpertSettings',
			JSON.stringify(finalSettings),
		);

		onSaveSettings(finalSettings);
		setValidationError(null);
	};

	// Проверка типа настроек
	const isBusinessSettings = (settings: Settings): settings is BusinessSettings => {
		return 'optimality_weights' in settings;
	};

	// Функции сброса настроек до значений по умолчанию
	const resetToDefault = (category: string) => {
		const defaults = isBusinessMode ? defaultBusinessSettings : defaultBloggerSettings;
		const newSettings = { ...settings };
		const newStringValues = { ...stringValues };

		if (category === 'ii_weights') {
			// Сброс весов II
			newSettings.ii_weights = { ...defaults.ii_weights };

			// Обновление строковых значений
			Object.keys(defaults.ii_weights).forEach((key) => {
				newStringValues.ii_weights[key] = defaults.ii_weights[key].toString();
			});
		} else if (category === 'si_weights') {
			// Сброс весов SI
			newSettings.si_weights = { ...defaults.si_weights };

			// Обновление строковых значений
			Object.keys(defaults.si_weights).forEach((key) => {
				newStringValues.si_weights[key] = defaults.si_weights[key].toString();
			});
		} else if (
			category === 'optimality_weights' &&
			'optimality_weights' in newSettings &&
			'optimality_weights' in defaults
		) {
			// Сброс весов оптимальности (для бизнес режима)
			newSettings.optimality_weights = { ...defaults.optimality_weights };

			// Обновление строковых значений
			Object.keys(defaults.optimality_weights).forEach((key) => {
				newStringValues.optimality_weights[key] =
					defaults.optimality_weights[key].toString();
			});
		} else if (
			category === 'scenario_parameters' &&
			'scenario_parameters' in newSettings &&
			'scenario_parameters' in defaults
		) {
			// Сброс параметров сценариев (для режима блогера)
			newSettings.scenario_parameters = { ...defaults.scenario_parameters };

			// Обновление строковых значений
			Object.keys(defaults.scenario_parameters).forEach((key) => {
				newStringValues.scenario_parameters[key] =
					defaults.scenario_parameters[key].toString();
			});
		} else if (category === 'all') {
			// Сброс всех настроек
			if (isBusinessMode) {
				setSettings({ ...defaultBusinessSettings });

				// Обновление всех строковых значений
				Object.keys(defaultBusinessSettings.ii_weights).forEach((key) => {
					newStringValues.ii_weights[key] =
						defaultBusinessSettings.ii_weights[key].toString();
				});

				Object.keys(defaultBusinessSettings.si_weights).forEach((key) => {
					newStringValues.si_weights[key] =
						defaultBusinessSettings.si_weights[key].toString();
				});

				Object.keys(defaultBusinessSettings.optimality_weights).forEach((key) => {
					newStringValues.optimality_weights[key] =
						defaultBusinessSettings.optimality_weights[key].toString();
				});
			} else {
				setSettings({ ...defaultBloggerSettings });

				// Обновление всех строковых значений
				Object.keys(defaultBloggerSettings.ii_weights).forEach((key) => {
					newStringValues.ii_weights[key] =
						defaultBloggerSettings.ii_weights[key].toString();
				});

				Object.keys(defaultBloggerSettings.si_weights).forEach((key) => {
					newStringValues.si_weights[key] =
						defaultBloggerSettings.si_weights[key].toString();
				});

				Object.keys(defaultBloggerSettings.scenario_parameters).forEach((key) => {
					newStringValues.scenario_parameters[key] =
						defaultBloggerSettings.scenario_parameters[key].toString();
				});
			}

			setValidationError(null);
			setStringValues(newStringValues);
			return;
		}

		setSettings(newSettings);
		setStringValues(newStringValues);
		setValidationError(null);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='w-full max-w-4xl mx-auto bg-[#fdfbff] p-6 rounded-lg shadow-[0_0_0_1px_#ecdaff]'>
			<h2 className='text-2xl font-semibold mb-6'>Настройки эксперта</h2>

			{/* Отображение ошибки валидации, если она есть */}
			{validationError && (
				<div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md'>
					{validationError}
				</div>
			)}

			{/* Веса для II */}
			<div className='mb-8'>
				<div className='flex justify-between items-center mb-4'>
					<h3 className='text-lg font-semibold'>
						Веса для Интегрального индекса влияния (II)
					</h3>
					<button
						type='button'
						onClick={() => resetToDefault('ii_weights')}
						className='text-sm px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md border border-neutral-300'>
						Сбросить по умолчанию
					</button>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
					{Object.entries(settings.ii_weights).map(([key, value]) => (
						<div
							key={key}
							className='flex items-center'>
							<label className='w-1/2 text-sm opacity-70 font-medium'>
								{key === 'followers_ratio'
									? 'Соотношение подписчиков (w₁)'
									: key === 'engagement_rate'
									? 'Вовлеченность (w₂)'
									: key === 'post_frequency'
									? 'Частота постов (w₃)'
									: key === 'reach'
									? 'Охват (w₄)'
									: key === 'mentions'
									? 'Упоминания (w₅)'
									: key}
							</label>
							<input
								value={stringValues.ii_weights[key] || value.toString()}
								onChange={(e) => handleChange('ii_weights', key, e.target.value)}
								className='w-1/2 p-2 border border-neutral-300 rounded-md bg-white'
								max='1'
								step='0.05'
							/>
						</div>
					))}
				</div>
				<div className='mt-4 text-xs text-neutral-500'>
					Сумма весов должна равняться 1.0
				</div>
			</div>

			{/* Веса для SI */}
			<div className='mb-8'>
				<div className='flex justify-between items-center mb-4'>
					<h3 className='text-lg font-semibold'>
						Веса для Индекса устойчивости влияния (SI)
					</h3>
					<button
						type='button'
						onClick={() => resetToDefault('si_weights')}
						className='text-sm px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md border border-neutral-300'>
						Сбросить по умолчанию
					</button>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
					{Object.entries(settings.si_weights).map(([key, value]) => (
						<div
							key={key}
							className='flex items-center'>
							<label className='w-1/2 text-sm font-medium opacity-70'>
								{key === 'engagement_consistency'
									? 'Стаб. вовлеченности (ϑ₁)'
									: key === 'posting_consistency'
									? 'Стаб. публикаций (ϑ₂)'
									: key === 'reach_consistency'
									? 'Стаб. охвата (ϑ₃)'
									: key}
							</label>
							<input
								value={stringValues.si_weights[key] || value.toString()}
								onChange={(e) => handleChange('si_weights', key, e.target.value)}
								className='w-1/2 p-2 border border-neutral-300 rounded-md bg-white'
								max='1'
								step='0.05'
							/>
						</div>
					))}
				</div>
				<div className='mt-4 text-xs text-neutral-500'>
					Сумма весов должна равняться 1.0
				</div>
			</div>

			{/* Параметры в зависимости от режима */}
			{isBusinessSettings(settings) ? (
				<div className='mb-8'>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='text-lg font-semibold'>Веса для критериев оптимальности</h3>
						<button
							type='button'
							onClick={() => resetToDefault('optimality_weights')}
							className='text-sm px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md border border-neutral-300'>
							Сбросить по умолчанию
						</button>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
						{Object.entries(settings.optimality_weights).map(([key, value]) => (
							<div
								key={key}
								className='flex items-center'>
								<label className='w-1/2 text-sm font-medium opacity-70'>
									{key === 'alpha'
										? 'ΔII - Прирост влияния (α)'
										: key === 'beta'
										? 'ΔSI - Прирост устойчивости (β)'
										: key === 'gamma'
										? 'Cost - Затраты ресурсов (γ)'
										: key}
								</label>
								<input
									value={stringValues.optimality_weights[key] || value.toString()}
									onChange={(e) =>
										handleChange('optimality_weights', key, e.target.value)
									}
									className='w-1/2 p-2 border border-neutral-300 rounded-md bg-white'
									max='1'
									step='0.05'
								/>
							</div>
						))}
					</div>
					<div className='mt-4 text-xs text-neutral-500'>
						Сумма весов α + β + γ должна равняться 1.0
					</div>
				</div>
			) : (
				<div className='mb-8'>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='text-lg font-semibold'>Параметры для сценариев улучшения</h3>
						<button
							type='button'
							onClick={() => resetToDefault('scenario_parameters')}
							className='text-sm px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md border border-neutral-300'>
							Сбросить по умолчанию
						</button>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
						{Object.entries(settings.scenario_parameters).map(([key, value]) => (
							<div
								key={key}
								className='flex items-center'>
								<label className='w-1/2 text-sm font-medium opacity-70'>
									{key === 'post_frequency_delta'
										? 'Δ частоты постов (ΔPA)'
										: key === 'engagement_target'
										? 'Δ вовлеченности (ΔER)'
										: key === 'mentions_delta'
										? 'Δ упоминаний (ΔM)'
										: key === 'cost_activity'
										? 'Стоимость "Активность" (C₁)'
										: key === 'cost_engagement'
										? 'Стоимость "Вовлеченность" (C₂)'
										: key === 'cost_collaboration'
										? 'Стоимость "Коллаборации" (C₃)'
										: key}
								</label>
								<input
									value={
										stringValues.scenario_parameters[key] || value.toString()
									}
									onChange={(e) =>
										handleChange('scenario_parameters', key, e.target.value)
									}
									className='w-1/2 p-2 border border-neutral-300 rounded-md bg-white'
									step={key.startsWith('cost_') ? '0.1' : '0.5'}
								/>
							</div>
						))}
					</div>
					<div className='mt-4 text-xs text-neutral-500'>
						Сумма весов C₁ + C₂ + C₃ должна равняться 1.0
					</div>
				</div>
			)}

			<div className='flex justify-between mb-6'>
				<button
					type='button'
					onClick={() => resetToDefault('all')}
					className='px-6 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg font-medium'>
					Сбросить все
				</button>
				<button
					type='submit'
					className='px-6 py-3 bg-gradient-to-t from-blue-600 to-blue-500 hover:from-[#1056ec] hover:to-[#2472e7] shadow-[0_1px_5px_0px_inset_rgba(255,255,255,0.4)] text-white rounded-lg text-lg font-medium'>
					Сохранить настройки
				</button>
			</div>
		</form>
	);
}
