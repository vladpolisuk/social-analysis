'use client';

import { BloggerWithMetrics } from '@/lib/types';
import { useState } from 'react';

interface ResultsTableProps {
	isBusinessMode: boolean;
	data: BloggerWithMetrics[] | null;
}

export default function ResultsTable({ isBusinessMode, data }: ResultsTableProps) {
	const [isSaving, setIsSaving] = useState(false);

	if (!data || data.length === 0) {
		return null;
	}

	// Функция для сохранения отчета
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

	const renderScenarios = (blogger: BloggerWithMetrics) => {
		if (!blogger.metrics.scenarios) return null;

		const scenarios = blogger.metrics.scenarios;
		const getBadgeColor = (scenario: string) => {
			return scenarios.recommended_scenario === scenario
				? 'bg-green-100 text-green-800 border-green-300'
				: 'bg-blue-100 text-blue-800 border-blue-300';
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
					{[
						{
							scenario: scenarios.activity_scenario,
							name: 'Увеличение активности',
							key: 'activity_scenario',
						},
						{
							scenario: scenarios.engagement_scenario,
							name: 'Повышение вовлеченности',
							key: 'engagement_scenario',
						},
						{
							scenario: scenarios.collaboration_scenario,
							name: 'Коллаборации',
							key: 'collaboration_scenario',
						},
					].map((item) => (
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
					))}
				</div>

				{/* Таблица рекомендаций */}
				<div className='mb-6'>
					<h5 className='font-medium mb-3'>Таблица рекомендаций</h5>
					<div className='overflow-x-auto'>
						<table className='w-full border-collapse'>
							<thead>
								<tr className='bg-neutral-100'>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium'>
										Сценарий
									</th>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium'>
										II<sub>s</sub>
									</th>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium'>
										ΔII<sub>s</sub>
									</th>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium'>
										SI<sub>s</sub>
									</th>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium'>
										ΔSI<sub>s</sub>
									</th>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium'>
										Критерий
									</th>
									<th className='border border-neutral-200 px-3 py-2 text-left text-xs font-medium'>
										Рекомендация
									</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										scenario: scenarios.activity_scenario,
										name: 'Увеличение активности',
										key: 'activity_scenario',
									},
									{
										scenario: scenarios.engagement_scenario,
										name: 'Повышение вовлеченности',
										key: 'engagement_scenario',
									},
									{
										scenario: scenarios.collaboration_scenario,
										name: 'Коллаборации',
										key: 'collaboration_scenario',
									},
								].map((item) => {
									const iiAfter =
										blogger.metrics.influence_index + item.scenario.delta_ii;
									const siAfter =
										blogger.metrics.sustainability_index +
										item.scenario.delta_si;
									const criterion = getCriterionForScenario(item.key);

									return (
										<tr
											key={item.key}
											className={`hover:bg-${
												item.key === 'activity_scenario'
													? 'blue'
													: item.key === 'engagement_scenario'
													? 'green'
													: 'purple'
											}-50 ${
												scenarios.recommended_scenario === item.key
													? 'bg-green-50'
													: ''
											}`}>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												{item.name}
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												{iiAfter.toFixed(2)}
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												{item.scenario.delta_ii > 0 ? '+' : ''}
												{item.scenario.delta_ii.toFixed(2)}
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												{siAfter.toFixed(2)}
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												{item.scenario.delta_si > 0 ? '+' : ''}
												{item.scenario.delta_si.toFixed(2)}
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												{criterion}
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm font-medium'>
												{getRecommendation(item.key, blogger)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>

				<div className='grid grid-cols-3 gap-4 text-sm'>
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
										{scenarioKey === 'activity_scenario'
											? 'Активность'
											: scenarioKey === 'engagement_scenario'
											? 'Вовлеченность'
											: 'Коллаборации'}
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
										{scenarioKey === 'activity_scenario'
											? 'Активность'
											: scenarioKey === 'engagement_scenario'
											? 'Вовлеченность'
											: 'Коллаборации'}
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
										{scenarioKey === 'activity_scenario'
											? 'Активность'
											: scenarioKey === 'engagement_scenario'
											? 'Вовлеченность'
											: 'Коллаборации'}
									</span>
								</li>
							))}
						</ol>
					</div>
				</div>
			</div>
		);
	};

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
			<h2 className='text-2xl font-semibold mb-6'>
				Результаты сравнительного анализа блогеров
			</h2>

			<div className='mb-6'>
				<h3 className='text-lg font-semibold mb-3'>Ранжирование по влиянию</h3>
				<div className='overflow-x-auto'>
					<table className='min-w-full divide-y divide-neutral-200'>
						<thead className='bg-neutral-50'>
							<tr>
								<th className='px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
									Ранг
								</th>
								<th className='px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
									Блогер
								</th>
								<th className='px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider'>
									Индекс влияния (II)
								</th>
								<th className='px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider'>
									Индекс устойчивости (SI)
								</th>
								<th className='px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider'>
									Соотношение подписчиков
								</th>
								<th className='px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider'>
									Вовлеченность
								</th>
								<th className='px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider'>
									Охват
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
										<td className='px-3 py-3 whitespace-nowrap'>
											<span className='px-2 py-1 text-xs inline-flex leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'>
												{rankByII}
											</span>
										</td>
										<td className='px-3 py-3 whitespace-nowrap'>
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
										<td className='px-3 py-3 whitespace-nowrap text-right'>
											<div className='text-sm font-medium text-blue-600'>
												{blogger.metrics.influence_index.toFixed(2)}
											</div>
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-right'>
											<div className='text-sm font-medium text-purple-600'>
												{blogger.metrics.sustainability_index.toFixed(2)}
											</div>
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-right text-sm'>
											{blogger.metrics.followers_ratio.toFixed(2)}
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-right text-sm'>
											{blogger.metrics.engagement_rate.toFixed(2)}%
										</td>
										<td className='px-3 py-3 whitespace-nowrap text-right text-sm'>
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
				<div className='overflow-hidden border rounded-lg'>
					<div className='p-4 bg-neutral-50 border-b'>
						<div className='grid grid-cols-7 gap-4 text-xs font-medium text-neutral-500 uppercase'>
							<div>Блогер</div>
							<div className='text-right'>FR</div>
							<div className='text-right'>GR</div>
							<div className='text-right'>ER</div>
							<div className='text-right'>PA</div>
							<div className='text-right'>RA</div>
							<div className='text-right'>M</div>
						</div>
					</div>
					<div className='divide-y'>
						{data.map((blogger) => (
							<div
								key={blogger.blogger.id}
								className='p-4'>
								<div className='grid grid-cols-7 gap-4 text-sm'>
									<div className='font-medium'>{blogger.blogger.name}</div>
									<div className='text-right'>
										{blogger.metrics.followers_ratio.toFixed(2)}
									</div>
									<div className='text-right'>
										{blogger.metrics.growth_rate.toFixed(2)}%
									</div>
									<div className='text-right'>
										{blogger.metrics.engagement_rate.toFixed(2)}%
									</div>
									<div className='text-right'>
										{blogger.metrics.post_frequency.toFixed(1)}
									</div>
									<div className='text-right'>
										{blogger.metrics.avg_reach.toLocaleString()}
									</div>
									<div className='text-right'>{blogger.metrics.mentions}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
