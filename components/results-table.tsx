'use client';

import { getCustomScenarios, getScenarioProbability } from '@/lib/data';
import { BloggerWithMetrics, ScenarioData } from '@/lib/types';
import { useMemo, useState } from 'react';

interface ResultsTableProps {
	isBusinessMode: boolean;
	data: BloggerWithMetrics[] | null;
}

// Тип для пользовательского сценария
interface CustomScenario {
	id: number;
	name: string;
	isActive?: boolean;
	description?: string;
}

// Тип для элемента сценария для отображения
interface ScenarioItem {
	scenario: ScenarioData;
	name: string;
	key: string;
}

export default function ResultsTable({ isBusinessMode, data }: ResultsTableProps) {
	const [isSaving, setIsSaving] = useState(false);
	const [showMetricsHelp, setShowMetricsHelp] = useState(false);

	if (!data || data.length === 0) {
		return null;
	}

	// Функция для сохранения отчета для одного блогера
	const saveReport = (blogger: BloggerWithMetrics) => {
		setIsSaving(true);

		try {
			// Создаем объект с данными отчета
			const reportData = {
				name: blogger.blogger.name,
				platform: blogger.blogger.platform,
				category: blogger.blogger.category,
				date: new Date().toLocaleDateString(),
				influence_index: blogger.metrics.influence_index.toFixed(2),
				sustainability_index: blogger.metrics.sustainability_index.toFixed(2),
				metrics: {
					followers_ratio: blogger.metrics.followers_ratio.toFixed(2),
					growth_rate: blogger.metrics.growth_rate.toFixed(2),
					engagement_rate: blogger.metrics.engagement_rate.toFixed(2),
					post_frequency: blogger.metrics.post_frequency.toFixed(1),
					activity_stability: blogger.metrics.activity_stability.toFixed(2),
					avg_reach: blogger.metrics.avg_reach.toLocaleString(),
					mentions: blogger.metrics.mentions,
				},
				scenarios: blogger.metrics.scenarios,
			};

			// Преобразуем данные в JSON-строку и в URL-данные
			const jsonData = JSON.stringify(reportData, null, 2);
			const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonData);

			// Создаем элемент ссылки для скачивания
			const downloadAnchorNode = document.createElement('a');
			downloadAnchorNode.setAttribute('href', dataStr);
			downloadAnchorNode.setAttribute(
				'download',
				`social_analysis_${blogger.blogger.name.replace(/\s+/g, '_')}_${new Date()
					.toISOString()
					.slice(0, 10)}.json`,
			);
			document.body.appendChild(downloadAnchorNode);
			downloadAnchorNode.click();
			downloadAnchorNode.remove();

			// Показываем уведомление об успехе
			alert('Отчет успешно сохранен!');
		} catch (error) {
			console.error('Ошибка при сохранении отчета:', error);
			alert('Произошла ошибка при сохранении отчета. Пожалуйста, попробуйте еще раз.');
		} finally {
			setIsSaving(false);
		}
	};

	// Функция для экспорта данных сравнительного анализа
	const exportComparisonData = () => {
		setIsSaving(true);

		try {
			// Создаем объект с данными сравнительного анализа
			const comparisonData = {
				date: new Date().toLocaleDateString(),
				analysis_type: 'Сравнительный анализ блогеров',
				bloggers: data.map((blogger) => ({
					name: blogger.blogger.name,
					platform: blogger.blogger.platform,
					category: blogger.blogger.category,
					influence_index: blogger.metrics.influence_index.toFixed(2),
					sustainability_index: blogger.metrics.sustainability_index.toFixed(2),
					metrics: {
						followers_ratio: blogger.metrics.followers_ratio.toFixed(2),
						growth_rate: blogger.metrics.growth_rate.toFixed(2),
						engagement_rate: blogger.metrics.engagement_rate.toFixed(2),
						post_frequency: blogger.metrics.post_frequency.toFixed(1),
						activity_stability: blogger.metrics.activity_stability.toFixed(2),
						avg_reach: blogger.metrics.avg_reach.toLocaleString(),
						mentions: blogger.metrics.mentions,
					},
				})),
			};

			// Преобразуем данные в JSON-строку и в URL-данные
			const jsonData = JSON.stringify(comparisonData, null, 2);
			const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonData);

			// Создаем элемент ссылки для скачивания
			const downloadAnchorNode = document.createElement('a');
			downloadAnchorNode.setAttribute('href', dataStr);
			downloadAnchorNode.setAttribute(
				'download',
				`social_analysis_comparison_${new Date().toISOString().slice(0, 10)}.json`,
			);
			document.body.appendChild(downloadAnchorNode);
			downloadAnchorNode.click();
			downloadAnchorNode.remove();

			// Показываем уведомление об успехе
			alert('Сравнительный анализ успешно сохранен!');
		} catch (error) {
			console.error('Ошибка при сохранении сравнительного анализа:', error);
			alert('Произошла ошибка при сохранении. Пожалуйста, попробуйте еще раз.');
		} finally {
			setIsSaving(false);
		}
	};

	const renderScenarios = (blogger: BloggerWithMetrics) => {
		if (!blogger.metrics.scenarios) return null;

		const scenarios = blogger.metrics.scenarios;
		const getBadgeColor = (scenario: string) => {
			return scenarios.recommended_scenario === scenario
				? 'bg-green-100 text-green-800 border-green-300'
				: 'bg-blue-100 text-blue-800 border-blue-300';
		};

		// Получение пользовательских сценариев
		const customScenarios = useMemo<CustomScenario[]>(() => getCustomScenarios(), []);

		// Формирование списка всех сценариев для отображения
		const allScenarios = useMemo<(ScenarioItem | null)[]>(() => {
			// Массив стандартных сценариев
			const standardScenarioKeys = [
				'activity_scenario',
				'engagement_scenario',
				'collaboration_scenario',
				'education_scenario',
			];

			// Формируем список стандартных сценариев с их данными
			const standardScenarioItems = standardScenarioKeys
				.map((key) => {
					// Находим соответствующее имя сценария
					let name = '';
					switch (key) {
						case 'activity_scenario':
							name = 'Увеличение активности';
							break;
						case 'engagement_scenario':
							name = 'Повышение вовлеченности';
							break;
						case 'collaboration_scenario':
							name = 'Коллаборации';
							break;
						case 'education_scenario':
							name = 'Образовательный контент';
							break;
					}

					// Проверяем, активен ли сценарий в пользовательских настройках
					const customScenario = customScenarios.find(
						(s: CustomScenario) => s.name === name,
					);
					if (!customScenario || customScenario.isActive === false) {
						return null;
					}

					// Формируем элемент для отображения
					return {
						scenario: scenarios[key as keyof typeof scenarios] as ScenarioData,
						name,
						key,
					};
				})
				.filter(Boolean); // Фильтруем null элементы

			// Добавляем пользовательские сценарии
			const customScenarioItems = customScenarios
				.filter((s: CustomScenario) => s.isActive !== false)
				.filter(
					(s: CustomScenario) =>
						![
							'Увеличение активности',
							'Повышение вовлеченности',
							'Коллаборации',
							'Образовательный контент',
						].includes(s.name),
				)
				.map((s: CustomScenario) => {
					const key = `custom_scenario_${s.id}`;
					return {
						scenario: scenarios[key as keyof typeof scenarios] as ScenarioData,
						name: s.name,
						key,
					};
				})
				.filter((item: ScenarioItem | null) => item && item.scenario); // Отображаем только если есть данные сценария

			return [...standardScenarioItems, ...customScenarioItems];
		}, [customScenarios, scenarios]);

		// Функция для получения имени сценария по ключу
		const getScenarioName = (scenarioKey: string) => {
			const scenarioItem = allScenarios.find(
				(item: ScenarioItem | null) => item?.key === scenarioKey,
			);
			if (scenarioItem) {
				return scenarioItem.name;
			}

			// Стандартные имена для резервного варианта
			if (scenarioKey === 'activity_scenario') return 'Активность';
			if (scenarioKey === 'engagement_scenario') return 'Вовлеченность';
			if (scenarioKey === 'collaboration_scenario') return 'Коллаборации';
			if (scenarioKey === 'education_scenario') return 'Образовательный контент';

			// Для пользовательских сценариев извлекаем ID
			if (scenarioKey.startsWith('custom_scenario_')) {
				const id = scenarioKey.replace('custom_scenario_', '');
				const customScenario = customScenarios.find(
					(s: CustomScenario) => s.id.toString() === id,
				);
				if (customScenario) {
					return customScenario.name;
				}
			}

			return scenarioKey;
		};

		// Функция для определения конкретных рекомендаций в зависимости от сценария
		const getRecommendation = (scenarioKey: string, blogger: BloggerWithMetrics) => {
			const metrics = blogger.metrics;

			switch (scenarioKey) {
				case 'activity_scenario':
					// Рекомендуемое количество постов в неделю (текущее + прирост, округлено)
					const recommendedPosts = Math.round(metrics.post_frequency + 2);
					return `Публикуйте ${recommendedPosts} постов в неделю`;

				case 'engagement_scenario':
					// Рекомендуемое количество хэштегов
					return `Используйте ${Math.min(
						5,
						Math.round(metrics.engagement_rate + 2),
					)} трендовых хэштега`;

				case 'collaboration_scenario':
					// Рекомендуемое количество коллабораций (зависит от текущих упоминаний)
					const recommendedCollabs =
						metrics.mentions < 10 ? 2 : metrics.mentions < 30 ? 3 : 4;
					return `Сотрудничайте с ${recommendedCollabs} блогерами`;

				case 'education_scenario':
					return 'Создавайте образовательный контент';

				default:
					return 'Следуйте плану развития';
			}
		};

		// Функция для определения критерия для каждого сценария
		const getCriterionForScenario = (scenarioKey: string) => {
			if (scenarios.optimality_ranking[0] === scenarioKey) {
				return 'Оптимальность';
			} else if (scenarios.superiority_ranking[0] === scenarioKey) {
				return 'Превосходство';
			} else if (scenarios.suitability_ranking[0] === scenarioKey) {
				return 'Пригодность';
			} else {
				return '-';
			}
		};

		return (
			<div className='mt-4 border border-neutral-200 bg-neutral-50 rounded-lg p-4'>
				<h4 className='text-lg font-semibold mb-4'>Сценарии улучшения влияния</h4>

				<div className='grid grid-cols-3 gap-4 mb-6'>
					{allScenarios.map(
						(item) =>
							item && (
								<div
									key={item.key}
									className={`border rounded-lg relative flex flex-col px-3 pb-3 pt-3.5 ${
										scenarios.recommended_scenario === item.key
											? 'border-green-400 bg-green-50'
											: 'border-neutral-200 bg-white'
									}`}>
									{scenarios.recommended_scenario === item.key && (
										<span className='absolute -top-3.5 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-300'>
											Рекомендуется
										</span>
									)}
									<div className='flex justify-between items-center mb-2'>
										<h5 className='font-medium'>{item.name}</h5>
										<span className='text-xs inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-800'>
											{item.scenario.probability ??
												getScenarioProbability(item.key)}
											% шанс
										</span>
									</div>
									<div className='space-y-2 text-sm'>
										<div className='flex justify-between'>
											<span>Прирост II:</span>
											<span className='font-medium text-blue-700'>
												{item.scenario.delta_ii > 0 ? '+' : ''}
												{item.scenario.delta_ii.toFixed(2)}
											</span>
										</div>
										<div className='flex justify-between'>
											<span>Прирост SI:</span>
											<span className='font-medium text-purple-700'>
												{item.scenario.delta_si > 0 ? '+' : ''}
												{item.scenario.delta_si.toFixed(2)}
											</span>
										</div>
										<div className='flex justify-between'>
											<span>Стоимость:</span>
											<span className='font-medium text-neutral-700'>
												{item.scenario.cost.toFixed(1)}
											</span>
										</div>
									</div>
								</div>
							),
					)}
				</div>

				{/* Таблица рекомендаций */}
				<div className='mb-6'>
					<h5 className='font-medium mb-3'>Таблица рекомендаций</h5>
					<div className='overflow-x-auto border border-neutral-200 rounded-lg'>
						<table className='w-full border-collapse'>
							<thead>
								<tr className='bg-neutral-100'>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium whitespace-nowrap'>
										Сценарий
									</th>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium whitespace-nowrap'>
										II<sub>s</sub>
									</th>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium whitespace-nowrap'>
										ΔII<sub>s</sub>
									</th>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium whitespace-nowrap'>
										SI<sub>s</sub>
									</th>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium whitespace-nowrap'>
										ΔSI<sub>s</sub>
									</th>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium whitespace-nowrap'>
										Критерий
									</th>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium whitespace-nowrap'>
										Рекомендация
									</th>
								</tr>
							</thead>
							<tbody>
								{allScenarios.map(
									(item) =>
										item &&
										(() => {
											const iiAfter =
												blogger.metrics.influence_index +
												item.scenario.delta_ii;
											const siAfter =
												blogger.metrics.sustainability_index +
												item.scenario.delta_si;
											const criterion = getCriterionForScenario(item.key);

											return (
												<tr
													key={item.key}
													className={`hover:bg-neutral-50 ${
														scenarios.recommended_scenario === item.key
															? 'bg-green-50'
															: ''
													}`}>
													<td className='border border-neutral-200 w-fit px-3 py-2 text-sm whitespace-break-spaces'>
														{item.name}
													</td>
													<td className='border border-neutral-200 px-3 py-2 text-sm whitespace-nowrap'>
														{iiAfter.toFixed(2)}
													</td>
													<td className='border border-neutral-200 px-3 py-2 text-sm whitespace-nowrap'>
														{item.scenario.delta_ii > 0 ? '+' : ''}
														{item.scenario.delta_ii.toFixed(2)}
													</td>
													<td className='border border-neutral-200 px-3 py-2 text-sm whitespace-nowrap'>
														{siAfter.toFixed(2)}
													</td>
													<td className='border border-neutral-200 px-3 py-2 text-sm whitespace-nowrap'>
														{item.scenario.delta_si > 0 ? '+' : ''}
														{item.scenario.delta_si.toFixed(2)}
													</td>
													<td className='border border-neutral-200 px-3 py-2 text-sm whitespace-nowrap'>
														{criterion}
													</td>
													<td className='border border-neutral-200 px-3 py-2 text-sm font-medium whitespace-nowrap'>
														{getRecommendation(item.key, blogger)}
													</td>
												</tr>
											);
										})(),
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Ранжирование сценариев */}
				<div className='grid grid-cols-3 gap-4 mt-6'>
					<div>
						<div className='font-medium mb-1'>По пригодности:</div>
						<ol className='list-decimal list-inside'>
							{scenarios.suitability_ranking.map((scenarioKey, idx) => (
								<li
									key={scenarioKey}
									className='mb-1'>
									<span
										className={`px-2 py-0.5 rounded-md ${getBadgeColor(
											scenarioKey,
										)}`}>
										{getScenarioName(scenarioKey)}
									</span>
								</li>
							))}
						</ol>
					</div>
					<div>
						<div className='font-medium mb-1'>По превосходству:</div>
						<ol className='list-decimal list-inside'>
							{scenarios.superiority_ranking.map((scenarioKey, idx) => (
								<li
									key={scenarioKey}
									className='mb-1'>
									<span
										className={`px-2 py-0.5 rounded-md ${getBadgeColor(
											scenarioKey,
										)}`}>
										{getScenarioName(scenarioKey)}
									</span>
								</li>
							))}
						</ol>
					</div>

					<div>
						<div className='font-medium mb-1'>По оптимальности:</div>
						<ol className='list-decimal list-inside'>
							{scenarios.optimality_ranking.map((scenarioKey, idx) => (
								<li
									key={scenarioKey}
									className='mb-1'>
									<span
										className={`px-2 py-0.5 rounded-md ${getBadgeColor(
											scenarioKey,
										)}`}>
										{getScenarioName(scenarioKey)}
									</span>
								</li>
							))}
						</ol>
					</div>
				</div>
			</div>
		);
	};

	// Компонент справки по метрикам
	const MetricsHelp = () => (
		<div className='mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50'>
			<div className='flex justify-between items-center mb-4'>
				<h3 className='text-lg font-semibold'>Справка по метрикам и индексам</h3>
				<button
					onClick={() => setShowMetricsHelp(false)}
					className='text-blue-600 hover:text-blue-800'>
					<svg
						className='w-5 h-5'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
						xmlns='http://www.w3.org/2000/svg'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M6 18L18 6M6 6l12 12'></path>
					</svg>
				</button>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
				<div>
					<h4 className='font-medium text-blue-700'>Основные индексы</h4>
					<ul className='mt-2 space-y-2'>
						<li>
							<span className='font-medium'>II - Интегральный индекс влияния</span>
							<p className='text-sm text-neutral-600'>
								Комплексная оценка влияния блогера, учитывающая аудиторию,
								вовлеченность и активность.
							</p>
						</li>
						<li>
							<span className='font-medium'>SI - Индекс устойчивости</span>
							<p className='text-sm text-neutral-600'>
								Оценка стабильности и предсказуемости показателей влияния блогера.
							</p>
						</li>
					</ul>
				</div>

				<div>
					<h4 className='font-medium text-blue-700'>Аудитория</h4>
					<ul className='mt-2 space-y-2'>
						<li>
							<span className='font-medium'>FR - Соотношение подписчиков</span>
							<p className='text-sm text-neutral-600'>
								Показатель эффективности аудитории относительно других блогеров в
								категории.
							</p>
						</li>
						<li>
							<span className='font-medium'>GR - Темп роста</span>
							<p className='text-sm text-neutral-600'>
								Процент прироста аудитории за определенный период.
							</p>
						</li>
					</ul>
				</div>

				<div>
					<h4 className='font-medium text-blue-700'>Вовлеченность</h4>
					<ul className='mt-2 space-y-2'>
						<li>
							<span className='font-medium'>ER - Коэффициент вовлеченности</span>
							<p className='text-sm text-neutral-600'>
								Процентное отношение суммы взаимодействий (лайки, комментарии,
								репосты) к количеству подписчиков.
							</p>
						</li>
						<li>
							<span className='font-medium'>RA - Средний охват</span>
							<p className='text-sm text-neutral-600'>
								Среднее количество уникальных просмотров публикаций.
							</p>
						</li>
					</ul>
				</div>

				<div>
					<h4 className='font-medium text-blue-700'>Активность</h4>
					<ul className='mt-2 space-y-2'>
						<li>
							<span className='font-medium'>PA - Частота публикаций</span>
							<p className='text-sm text-neutral-600'>
								Среднее количество публикаций в неделю.
							</p>
						</li>
						<li>
							<span className='font-medium'>SA - Стабильность активности</span>
							<p className='text-sm text-neutral-600'>
								Показатель регулярности публикаций и их качества.
							</p>
						</li>
						<li>
							<span className='font-medium'>M - Упоминания</span>
							<p className='text-sm text-neutral-600'>
								Количество упоминаний блогера другими пользователями и СМИ.
							</p>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);

	// Рендеринг для одного блогера
	if (!isBusinessMode) {
		const blogger = data[0];
		return (
			<div className='w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'>
				<div className='flex justify-between items-center mb-6'>
					<h2 className='text-2xl font-semibold'>Результаты анализа влияния</h2>
					<button
						onClick={() => saveReport(blogger)}
						disabled={isSaving}
						className='bg-gradient-to-t from-blue-600 to-blue-500 hover:from-[#1056ec] hover:to-[#2472e7] shadow-[0_1px_2px_0px_inset_rgba(255,255,255,0.4)] text-white py-2 px-4 rounded-lg text-sm flex items-center transition-colors'>
						{isSaving ? (
							<>
								<svg
									className='animate-spin -ml-1 mr-2 mb-[1px] h-4 w-4 text-white'
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'>
									<circle
										className='opacity-25'
										cx='12'
										cy='12'
										r='10'
										stroke='currentColor'
										strokeWidth='4'></circle>
									<path
										className='opacity-75'
										fill='currentColor'
										d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
								</svg>
								Сохранение...
							</>
						) : (
							<>
								<svg
									className='w-4 h-4 mr-2'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
									xmlns='http://www.w3.org/2000/svg'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'></path>
								</svg>
								Сохранить отчет (JSON)
							</>
						)}
					</button>
				</div>

				<div className='flex items-center justify-between mb-6'>
					<div>
						<h3 className='text-xl font-semibold'>{blogger.blogger.name}</h3>
						<div className='text-sm text-neutral-600 mt-1'>
							{blogger.blogger.platform} • {blogger.blogger.category}
						</div>
					</div>
					<div className='flex items-center space-x-4'>
						<div className='text-center'>
							<div className='text-3xl font-semibold text-blue-600'>
								{blogger.metrics.influence_index.toFixed(2)}
							</div>
							<div className='text-xs uppercase text-neutral-500'>
								Индекс влияния (II)
							</div>
						</div>
						<div className='text-center'>
							<div className='text-3xl font-semibold text-purple-600'>
								{blogger.metrics.sustainability_index.toFixed(2)}
							</div>
							<div className='text-xs uppercase text-neutral-500'>
								Индекс устойчивости (SI)
							</div>
						</div>
					</div>
				</div>

				<div className='mb-6'>
					<h4 className='text-lg font-semibold mb-3'>Базовые метрики</h4>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
						<div>
							<div className='text-sm text-neutral-600'>
								Соотношение подписчиков (FR)
							</div>
							<div className='text-lg font-medium'>
								{blogger.metrics.followers_ratio.toFixed(2)}
							</div>
						</div>
						<div>
							<div className='text-sm text-neutral-600'>Темп роста (GR)</div>
							<div className='text-lg font-medium'>
								{blogger.metrics.growth_rate.toFixed(2)} %
							</div>
						</div>
						<div>
							<div className='text-sm text-neutral-600'>Вовлеченность (ER)</div>
							<div className='text-lg font-medium'>
								{blogger.metrics.engagement_rate.toFixed(2)} %
							</div>
						</div>
						<div>
							<div className='text-sm text-neutral-600'>Частота постов (PA)</div>
							<div className='text-lg font-medium'>
								{blogger.metrics.post_frequency.toFixed(1)} /неделю
							</div>
						</div>
						<div>
							<div className='text-sm text-neutral-600'>
								Стабильность активности (SA)
							</div>
							<div className='text-lg font-medium'>
								{blogger.metrics.activity_stability.toFixed(2)}
							</div>
						</div>
						<div>
							<div className='text-sm text-neutral-600'>Средний охват (RA)</div>
							<div className='text-lg font-medium'>
								{blogger.metrics.avg_reach.toLocaleString()}
							</div>
						</div>
						<div>
							<div className='text-sm text-neutral-600'>Упоминания (M)</div>
							<div className='text-lg font-medium'>{blogger.metrics.mentions}</div>
						</div>
					</div>
				</div>

				{renderScenarios(blogger)}
			</div>
		);
	}

	// Рендеринг для бизнес-режима (несколько блогеров)
	return (
		<div className='w-full max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-2xl font-semibold'>
					Результаты сравнительного анализа блогеров
				</h2>
				<button
					onClick={exportComparisonData}
					disabled={isSaving}
					className='bg-gradient-to-t from-blue-600 to-blue-500 hover:from-[#1056ec] hover:to-[#2472e7] shadow-[0_1px_2px_0px_inset_rgba(255,255,255,0.4)] text-white py-2 px-4 rounded-lg text-sm flex items-center transition-colors'>
					{isSaving ? (
						<>
							<svg
								className='animate-spin -ml-1 mr-2 mb-[1px] h-4 w-4 text-white'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'>
								<circle
									className='opacity-25'
									cx='12'
									cy='12'
									r='10'
									stroke='currentColor'
									strokeWidth='4'></circle>
								<path
									className='opacity-75'
									fill='currentColor'
									d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
							</svg>
							Сохранение...
						</>
					) : (
						<>
							<svg
								className='w-4 h-4 mr-2'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'></path>
							</svg>
							Экспорт данных (JSON)
						</>
					)}
				</button>
			</div>

			<div className='mb-6'>
				<h3 className='text-lg font-semibold mb-3'>Ранжирование по влиянию</h3>
				<div className='overflow-x-auto border border-neutral-200 rounded-lg'>
					<table className='min-w-full divide-y divide-neutral-200 table-fixed w-full'>
						<thead className='bg-neutral-50'>
							<tr>
								<th className='px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces w-[60px]'>
									Ранг
								</th>
								<th className='px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces'>
									Блогер
								</th>
								<th className='px-3 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces w-[80px]'>
									II
								</th>
								<th className='px-3 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces w-[80px]'>
									SI
								</th>
								<th className='px-3 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces w-[80px]'>
									FR
								</th>
								<th className='px-3 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces w-[80px]'>
									ER
								</th>
								<th className='px-3 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces w-[80px]'>
									RA
								</th>
							</tr>
						</thead>
						<tbody className='bg-white divide-y divide-neutral-200'>
							{data.map((blogger, index) => {
								const rankByII =
									data.findIndex((b) => b.blogger.id === blogger.blogger.id) + 1;

								return (
									<tr
										key={blogger.blogger.id}
										className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
										<td className='px-3 py-3 whitespace-nowrap w-[60px]'>
											<span className='w-7 h-7 text-xs flex items-center justify-center leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'>
												{rankByII}
											</span>
										</td>
										<td className='px-3 py-3 whitespace-break-spaces'>
											<div className='flex items-center'>
												<div>
													<div className='text-sm font-medium text-neutral-900'>
														{blogger.blogger.name}
													</div>
													<div className='text-xs text-neutral-500'>
														{blogger.blogger.platform} •{' '}
														{blogger.blogger.category}
													</div>
												</div>
											</div>
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-center'>
											<div className='text-sm font-medium text-blue-600'>
												{blogger.metrics.influence_index.toFixed(2)}
											</div>
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-center'>
											<div className='text-sm font-medium text-purple-600'>
												{blogger.metrics.sustainability_index.toFixed(2)}
											</div>
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-center text-sm'>
											{blogger.metrics.followers_ratio.toFixed(2)}
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-center text-sm'>
											{blogger.metrics.engagement_rate.toFixed(2)}%
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-center text-sm'>
											{blogger.metrics.avg_reach.toLocaleString()}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			<div className='mb-6'>
				<h3 className='text-lg font-semibold mb-3'>Сравнение ключевых метрик</h3>

				<div className='overflow-x-auto border border-neutral-200 rounded-lg'>
					<table className='min-w-full divide-y divide-neutral-200 table-fixed w-full'>
						<thead className='bg-neutral-50'>
							<tr>
								<th className='px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces'>
									Блогер
								</th>
								<th className='px-3 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces w-[80px]'>
									FR
								</th>
								<th className='px-3 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces w-[80px]'>
									GR
								</th>
								<th className='px-3 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces w-[80px]'>
									ER
								</th>
								<th className='px-3 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces w-[80px]'>
									PA
								</th>
								<th className='px-3 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces w-[80px]'>
									RA
								</th>
								<th className='px-3 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-break-spaces w-[80px]'>
									M
								</th>
							</tr>
						</thead>
						<tbody className='bg-white divide-y divide-neutral-200'>
							{data.map((blogger, index) => {
								return (
									<tr
										key={blogger.blogger.id}
										className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
										<td className='px-3 py-3 whitespace-break-spaces'>
											<div className='flex items-center'>
												<div>
													<div className='text-sm font-medium text-neutral-900'>
														{blogger.blogger.name}
													</div>
													<div className='text-xs text-neutral-500'>
														{blogger.blogger.platform} •{' '}
														{blogger.blogger.category}
													</div>
												</div>
											</div>
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-center'>
											<div className='text-sm font-medium text-blue-600'>
												{blogger.metrics.followers_ratio.toFixed(2)}
											</div>
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-center'>
											<div className='text-sm font-medium text-purple-600'>
												{blogger.metrics.growth_rate.toFixed(2)}%
											</div>
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-center'>
											{blogger.metrics.engagement_rate.toFixed(2)}%
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-center'>
											{blogger.metrics.post_frequency.toFixed(1)}
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-center'>
											{blogger.metrics.avg_reach.toLocaleString()}
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-center'>
											{blogger.metrics.mentions.toFixed(3)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			<button
				onClick={() => setShowMetricsHelp(!showMetricsHelp)}
				className='text-blue-600 hover:text-blue-800 text-sm flex items-center'>
				<svg
					className='w-4 h-4 mr-1'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
					xmlns='http://www.w3.org/2000/svg'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='2'
						d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
				</svg>
				Справка по метрикам
			</button>

			{showMetricsHelp && <MetricsHelp />}
		</div>
	);
}
