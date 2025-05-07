/**
 * Библиотека математических функций для расчета показателей влияния
 */

import { getCustomScenarios, getScenarioProbability } from './data';
import {
	BloggerAnalysisResult,
	BloggerData,
	BloggerMetrics,
	BloggerSettings,
	BusinessAnalysisResult,
	BusinessSettings,
	IIWeights,
	OptimalityWeights,
	ScenarioData,
	ScenarioParameters,
	ScenarioResults,
	SIWeights,
} from './types';

// Функции для расчета базовых метрик

/**
 * Рассчитывает соотношение подписчиков (FR)
 */
function calculateFollowersRatio(subscribers: number, subscriptions: number): number {
	// Классическое представление FR: отношение подписчиков к подпискам
	if (subscriptions === 0) return 0; // Предотвращение деления на ноль
	return subscribers / subscriptions;
}

/**
 * Рассчитывает темп роста аудитории (GR)
 */
function calculateGrowthRate(subscribers: number, growth: number): number {
	return (growth / subscribers) * 100;
}

/**
 * Рассчитывает показатель вовлеченности (ER)
 */
function calculateEngagementRate(
	likes: number,
	comments: number,
	shares: number,
	posts: number,
	subscribers: number,
): number {
	if (posts === 0 || subscribers === 0) return 0;
	return ((likes + comments * 2 + shares * 3) / (posts * subscribers)) * 100;
}

/**
 * Рассчитывает стабильность активности (SA)
 */
function calculateActivityStability(post_frequency_std: number, post_frequency: number): number {
	if (post_frequency === 0) return 0;
	// Обратное отношение: чем меньше отклонение, тем выше стабильность
	return 1 - Math.min(post_frequency_std / post_frequency, 1);
}

/**
 * Нормализует значение в диапазоне от 0 до 1
 */
function normalize(value: number, min: number, max: number): number {
	if (max === min) return 0.5;
	return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Нормализует значение в указанном диапазоне [min, max] в значение от 0 до 1
 */
function normalizeValue(value: number, min: number, max: number): number {
	if (value < min) return 0;
	if (value > max) return 1;
	return (value - min) / (max - min);
}

/**
 * Рассчитывает Интегральный индекс влияния (II)
 */
function calculateInfluenceIndex(metrics: Partial<BloggerMetrics>, weights: IIWeights): number {
	return (
		weights.followers_ratio * (metrics.followers_ratio || 0) +
		(weights.engagement_rate * (metrics.engagement_rate || 0)) / 100 +
		(weights.post_frequency * (metrics.post_frequency || 0)) / 10 +
		(weights.reach * (metrics.avg_reach || 0)) / 10000 +
		(weights.mentions * (metrics.mentions || 0)) / 50
	);
}

/**
 * Рассчитывает Индекс устойчивости влияния (SI)
 */
function calculateSustainabilityIndex(
	metrics: Partial<BloggerMetrics>,
	weights: SIWeights,
): number {
	// Расчет стабильности вовлеченности (1 - нормализованное отклонение)
	const engagement_stability = metrics.engagement_rate_std
		? 1 - Math.min((metrics.engagement_rate_std || 0) / (metrics.engagement_rate || 1), 1)
		: 0.5;

	// Стабильность охвата
	const reach_stability = metrics.reach_std
		? 1 - Math.min((metrics.reach_std || 0) / (metrics.avg_reach || 1), 1)
		: 0.5;

	return (
		weights.engagement_consistency * engagement_stability +
		weights.posting_consistency * (metrics.activity_stability || 0) +
		weights.reach_consistency * reach_stability
	);
}

/**
 * Моделирует сценарии улучшения показателей влияния
 */
function simulateScenarios(
	metrics: BloggerMetrics,
	settings: ScenarioParameters,
	iiWeights: IIWeights,
	siWeights: SIWeights,
): ScenarioResults {
	// Сценарий 1: Увеличение активности
	const activityScenario = {
		name: 'Увеличение активности',
		delta_ii: 0,
		delta_si: 0,
		cost: settings.cost_activity,
		description: 'Увеличение частоты публикаций и стабильности постинга',
	};

	// Создаем копию метрик для сценария 1
	const activityMetrics = { ...metrics };
	activityMetrics.post_frequency += settings.post_frequency_delta;
	activityMetrics.activity_stability = Math.min(1, activityMetrics.activity_stability * 1.2);

	// Рассчитываем новые индексы и разницу
	const newII1 = calculateInfluenceIndex(activityMetrics, iiWeights);
	const newSI1 = calculateSustainabilityIndex(activityMetrics, siWeights);
	activityScenario.delta_ii = newII1 - metrics.influence_index;
	activityScenario.delta_si = newSI1 - metrics.sustainability_index;

	// Сценарий 2: Повышение вовлеченности
	const engagementScenario = {
		name: 'Повышение вовлеченности',
		delta_ii: 0,
		delta_si: 0,
		cost: settings.cost_engagement,
		description: 'Улучшение качества контента для повышения вовлеченности',
	};

	// Создаем копию метрик для сценария 2
	const engagementMetrics = { ...metrics };
	engagementMetrics.engagement_rate *= settings.engagement_target;
	engagementMetrics.avg_reach *= 1.15; // Увеличение охвата на 15%

	// Рассчитываем новые индексы и разницу
	const newII2 = calculateInfluenceIndex(engagementMetrics, iiWeights);
	const newSI2 = calculateSustainabilityIndex(engagementMetrics, siWeights);
	engagementScenario.delta_ii = newII2 - metrics.influence_index;
	engagementScenario.delta_si = newSI2 - metrics.sustainability_index;

	// Сценарий 3: Коллаборации
	const collaborationScenario = {
		name: 'Коллаборации',
		delta_ii: 0,
		delta_si: 0,
		cost: settings.cost_collaboration,
		description: 'Коллаборации с другими блогерами для расширения аудитории',
	};

	// Создаем копию метрик для сценария 3
	const collaborationMetrics = { ...metrics };
	collaborationMetrics.mentions += settings.mentions_delta;
	collaborationMetrics.avg_reach *= 1.3; // Увеличение охвата на 30%
	collaborationMetrics.engagement_rate *= 1.1; // Увеличение вовлеченности на 10%

	// Рассчитываем новые индексы и разницу
	const newII3 = calculateInfluenceIndex(collaborationMetrics, iiWeights);
	const newSI3 = calculateSustainabilityIndex(collaborationMetrics, siWeights);
	collaborationScenario.delta_ii = newII3 - metrics.influence_index;
	collaborationScenario.delta_si = newSI3 - metrics.sustainability_index;

	// Сценарий 4: Образовательный контент
	const educationScenario = {
		name: 'Образовательный контент',
		delta_ii: 0,
		delta_si: 0,
		cost: settings.cost_education,
		description: 'Добавление образовательных элементов для повышения ценности контента',
	};

	// Создаем копию метрик для сценария 4
	const educationMetrics = { ...metrics };
	educationMetrics.engagement_rate *= 1.3; // Увеличение вовлеченности на 30%
	educationMetrics.avg_reach *= 1.25; // Увеличение охвата на 25%

	// Рассчитываем новые индексы и разницу
	const newII4 = calculateInfluenceIndex(educationMetrics, iiWeights);
	const newSI4 = calculateSustainabilityIndex(educationMetrics, siWeights);
	educationScenario.delta_ii = newII4 - metrics.influence_index;
	educationScenario.delta_si = newSI4 - metrics.sustainability_index;

	// Ранжирование сценариев по пригодности (наименьшие затраты)
	const scenarios = [
		{ key: 'activity_scenario', cost: activityScenario.cost },
		{ key: 'engagement_scenario', cost: engagementScenario.cost },
		{ key: 'collaboration_scenario', cost: collaborationScenario.cost },
		{ key: 'education_scenario', cost: educationScenario.cost },
	];

	const suitabilityRanking = [...scenarios].sort((a, b) => a.cost - b.cost).map((s) => s.key);

	// Ранжирование по превосходству (наибольший прирост II)
	const superiorityRanking = [
		{ key: 'activity_scenario', delta: activityScenario.delta_ii },
		{ key: 'engagement_scenario', delta: engagementScenario.delta_ii },
		{ key: 'collaboration_scenario', delta: collaborationScenario.delta_ii },
		{ key: 'education_scenario', delta: educationScenario.delta_ii },
	]
		.sort((a, b) => b.delta - a.delta)
		.map((s) => s.key);

	// Расчет оптимальности (комбинированный критерий)
	function calculateOptimality(
		deltaII: number,
		deltaSI: number,
		cost: number,
		weights: OptimalityWeights,
	): number {
		// Нормализация значений
		const maxDeltaII = Math.max(
			activityScenario.delta_ii,
			engagementScenario.delta_ii,
			collaborationScenario.delta_ii,
			educationScenario.delta_ii,
		);
		const maxDeltaSI = Math.max(
			activityScenario.delta_si,
			engagementScenario.delta_si,
			collaborationScenario.delta_si,
			educationScenario.delta_si,
		);
		const maxCost = Math.max(
			activityScenario.cost,
			engagementScenario.cost,
			collaborationScenario.cost,
			educationScenario.cost,
		);

		const normDeltaII = maxDeltaII > 0 ? deltaII / maxDeltaII : 0;
		const normDeltaSI = maxDeltaSI > 0 ? deltaSI / maxDeltaSI : 0;
		const normCost = maxCost > 0 ? 1 - cost / maxCost : 0;

		return weights.alpha * normDeltaII + weights.beta * normDeltaSI + weights.gamma * normCost;
	}

	// Используем веса по умолчанию, если не переданы
	const defaultWeights: OptimalityWeights = {
		alpha: 0.5,
		beta: 0.3,
		gamma: 0.2,
	};

	// Расчет оптимальности для каждого сценария
	const activityOptimality = calculateOptimality(
		activityScenario.delta_ii,
		activityScenario.delta_si,
		activityScenario.cost,
		defaultWeights,
	);

	const engagementOptimality = calculateOptimality(
		engagementScenario.delta_ii,
		engagementScenario.delta_si,
		engagementScenario.cost,
		defaultWeights,
	);

	const collaborationOptimality = calculateOptimality(
		collaborationScenario.delta_ii,
		collaborationScenario.delta_si,
		collaborationScenario.cost,
		defaultWeights,
	);

	const educationOptimality = calculateOptimality(
		educationScenario.delta_ii,
		educationScenario.delta_si,
		educationScenario.cost,
		defaultWeights,
	);

	// Ранжирование по оптимальности
	const optimalityRanking = [
		{ key: 'activity_scenario', optimality: activityOptimality },
		{ key: 'engagement_scenario', optimality: engagementOptimality },
		{ key: 'collaboration_scenario', optimality: collaborationOptimality },
		{ key: 'education_scenario', optimality: educationOptimality },
	]
		.sort((a, b) => b.optimality - a.optimality)
		.map((s) => s.key);

	// Выбор рекомендуемого сценария (первый по оптимальности)
	const recommendedScenario = optimalityRanking[0];

	return {
		activity_scenario: activityScenario,
		engagement_scenario: engagementScenario,
		collaboration_scenario: collaborationScenario,
		education_scenario: educationScenario,
		suitability_ranking: suitabilityRanking,
		superiority_ranking: superiorityRanking,
		optimality_ranking: optimalityRanking,
		recommended_scenario: recommendedScenario,
	};
}

/**
 * Анализирует данные блогеров для бизнеса
 */
export async function analyzeForBusiness(
	data: BloggerData[],
	settings?: BusinessSettings | null,
): Promise<BusinessAnalysisResult> {
	// Используем настройки по умолчанию, если не переданы
	const defaultSettings: BusinessSettings = {
		ii_weights: {
			followers_ratio: 0.2,
			engagement_rate: 0.3,
			post_frequency: 0.2,
			reach: 0.2,
			mentions: 0.1,
		},
		si_weights: {
			engagement_consistency: 0.4,
			posting_consistency: 0.3,
			reach_consistency: 0.3,
		},
		optimality_weights: {
			alpha: 0.5,
			beta: 0.3,
			gamma: 0.2,
		},
	};

	const iiWeights = settings?.ii_weights || defaultSettings.ii_weights;
	const siWeights = settings?.si_weights || defaultSettings.si_weights;

	// Расчет метрик для каждого блогера
	const bloggers = data.map((blogger) => {
		const metrics = calculateMetrics(blogger, iiWeights, siWeights);
		return { blogger, metrics };
	});

	// Расчет средних значений метрик
	const averages: Partial<BloggerMetrics> = {
		followers_ratio: average(bloggers.map((b) => b.metrics.followers_ratio)),
		growth_rate: average(bloggers.map((b) => b.metrics.growth_rate)),
		engagement_rate: average(bloggers.map((b) => b.metrics.engagement_rate)),
		activity_stability: average(bloggers.map((b) => b.metrics.activity_stability)),
		post_frequency: average(bloggers.map((b) => b.metrics.post_frequency)),
		avg_reach: average(bloggers.map((b) => b.metrics.avg_reach)),
		mentions: average(bloggers.map((b) => b.metrics.mentions)),
		influence_index: average(bloggers.map((b) => b.metrics.influence_index)),
		sustainability_index: average(bloggers.map((b) => b.metrics.sustainability_index)),
	};

	// Нормализация метрик относительно средних значений
	bloggers.forEach((blogger) => {
		blogger.metrics.followers_ratio = normalize(
			blogger.metrics.followers_ratio,
			0,
			averages.followers_ratio! * 2,
		);
		blogger.metrics.engagement_rate = normalize(
			blogger.metrics.engagement_rate,
			0,
			averages.engagement_rate! * 2,
		);
		blogger.metrics.post_frequency = normalize(
			blogger.metrics.post_frequency,
			0,
			averages.post_frequency! * 2,
		);
		blogger.metrics.avg_reach = normalize(
			blogger.metrics.avg_reach,
			0,
			averages.avg_reach! * 2,
		);
		blogger.metrics.mentions = normalize(blogger.metrics.mentions, 0, averages.mentions! * 2);
	});

	// Пересчет индексов после нормализации
	bloggers.forEach((blogger) => {
		blogger.metrics.influence_index = calculateInfluenceIndex(blogger.metrics, iiWeights);
		blogger.metrics.sustainability_index = calculateSustainabilityIndex(
			blogger.metrics,
			siWeights,
		);
	});

	// Ранжирование блогеров по II и SI
	const rankingByII = [...bloggers]
		.sort((a, b) => b.metrics.influence_index - a.metrics.influence_index)
		.map((b) => b.blogger.id);

	const rankingBySI = [...bloggers]
		.sort((a, b) => b.metrics.sustainability_index - a.metrics.sustainability_index)
		.map((b) => b.blogger.id);

	return {
		bloggers,
		averages: averages as BloggerMetrics,
		ranking: rankingByII,
		sustainability_ranking: rankingBySI,
	};
}

/**
 * Анализирует данные одного блогера
 */
export async function analyzeForBlogger(
	data: BloggerData,
	settings?: BloggerSettings | null,
): Promise<BloggerAnalysisResult> {
	// Используем настройки по умолчанию, если не переданы
	const defaultSettings: BloggerSettings = {
		ii_weights: {
			followers_ratio: 0.2,
			engagement_rate: 0.3,
			post_frequency: 0.2,
			reach: 0.2,
			mentions: 0.1,
		},
		si_weights: {
			engagement_consistency: 0.4,
			posting_consistency: 0.3,
			reach_consistency: 0.3,
		},
		scenario_parameters: {
			post_frequency_delta: 2.0,
			engagement_target: 1.5,
			mentions_delta: 3.0,
			cost_activity: 0.2,
			cost_engagement: 0.4,
			cost_collaboration: 0.8,
			cost_education: 0.5,
		},
	};

	const iiWeights = settings?.ii_weights || defaultSettings.ii_weights;
	const siWeights = settings?.si_weights || defaultSettings.si_weights;
	const scenarioParams = settings?.scenario_parameters || defaultSettings.scenario_parameters;

	// Расчет метрик блогера
	const metrics = calculateMetrics(data, iiWeights, siWeights);

	// Моделирование сценариев улучшения
	const scenarios = simulateScenarios(metrics, scenarioParams, iiWeights, siWeights);
	metrics.scenarios = scenarios;

	return { metrics };
}

/**
 * Рассчитывает все метрики для блогера
 */
function calculateMetrics(
	data: BloggerData,
	iiWeights: IIWeights,
	siWeights: SIWeights,
): BloggerMetrics {
	// Расчет базовых метрик
	const followers_ratio = calculateFollowersRatio(data.subscribers, data.subscriptions);
	const growth_rate = calculateGrowthRate(data.subscribers, data.followers_growth);
	const engagement_rate = calculateEngagementRate(
		data.likes,
		data.comments,
		data.shares,
		data.posts,
		data.subscribers,
	);
	const activity_stability = calculateActivityStability(
		data.post_frequency_std,
		data.post_frequency,
	);

	// Формирование объекта с метриками
	const metrics: BloggerMetrics = {
		followers_ratio,
		growth_rate,
		engagement_rate,
		activity_stability,
		post_frequency: data.post_frequency,
		avg_reach: data.avg_reach,
		mentions: data.mentions,
		engagement_rate_std: data.engagement_rate_std,
		post_frequency_std: data.post_frequency_std,
		reach_std: data.reach_std,
		influence_index: 0,
		sustainability_index: 0,
	};

	// Расчет индексов влияния
	metrics.influence_index = calculateInfluenceIndex(metrics, iiWeights);
	metrics.sustainability_index = calculateSustainabilityIndex(metrics, siWeights);

	return metrics;
}

/**
 * Вычисляет среднее значение массива чисел
 */
function average(values: number[]): number {
	if (values.length === 0) return 0;
	const sum = values.reduce((acc, val) => acc + val, 0);
	return sum / values.length;
}

/**
 * Функция для обработки динамических сценариев
 */
function processCustomScenario(
	scenarioKey: string,
	scenarioName: string,
	metrics: BloggerMetrics,
	settings: ScenarioParameters,
	iiWeights: IIWeights,
	siWeights: SIWeights,
	costKey: string = 'cost_education', // Используем стоимость образовательного сценария по умолчанию
): ScenarioData {
	// По умолчанию используем логику образовательного сценария
	const newMetrics = { ...metrics };

	// Повышаем вовлеченность на 30%
	newMetrics.engagement_rate = metrics.engagement_rate * 1.3;

	// Нормализуем метрики через функцию нормализации
	const normalizedMetrics = {
		...newMetrics,
		// Нормализованные значения в диапазоне [0,1]
		followers_ratio: normalizeValue(newMetrics.followers_ratio, 0, 10),
		growth_rate: normalizeValue(newMetrics.growth_rate, 0, 0.5),
		engagement_rate: normalizeValue(newMetrics.engagement_rate, 0, 0.3),
		activity_stability: normalizeValue(newMetrics.activity_stability, 0, 1),
		post_frequency: normalizeValue(newMetrics.post_frequency, 0, 14),
		avg_reach: normalizeValue(newMetrics.avg_reach, 0, 1),
		mentions: normalizeValue(newMetrics.mentions, 0, 100),
	};

	// Рассчитываем новые индексы влияния
	const newII = calculateInfluenceIndex(normalizedMetrics, iiWeights);
	const newSI = calculateSustainabilityIndex(normalizedMetrics, siWeights);

	// Создаем объект сценария
	return {
		name: scenarioName,
		delta_ii: newII - metrics.influence_index,
		delta_si: newSI - metrics.sustainability_index,
		cost: settings[costKey as keyof ScenarioParameters] || settings.cost_education,
		description: `Реализация сценария "${scenarioName}" с улучшением общих показателей блогера.`,
		probability: getScenarioProbability(scenarioKey, metrics),
	};
}

/**
 * Рассчитывает прогностические сценарии
 */
export function calculateScenarios(
	input: BloggerData,
	metrics: BloggerMetrics,
	settings: BloggerSettings,
): ScenarioResults {
	const { ii_weights, si_weights, scenario_parameters } = settings;

	// Расчет метрик при сценарии "Увеличение активности"
	const activityScenarioPostFrequency =
		metrics.post_frequency + scenario_parameters.post_frequency_delta;
	const activityScenarioII = calculateInfluenceIndex(
		{
			...metrics,
			post_frequency: activityScenarioPostFrequency,
		},
		ii_weights,
	);
	const activityScenarioSI = calculateSustainabilityIndex(
		{
			...metrics,
			post_frequency_std: metrics.post_frequency_std * 0.9, // Улучшение стабильности публикаций
		},
		si_weights,
	);

	// Расчет метрик при сценарии "Повышение вовлеченности"
	const engagementScenarioER = metrics.engagement_rate + scenario_parameters.engagement_target;
	const engagementScenarioII = calculateInfluenceIndex(
		{
			...metrics,
			engagement_rate: engagementScenarioER,
		},
		ii_weights,
	);
	const engagementScenarioSI = calculateSustainabilityIndex(
		{
			...metrics,
			engagement_rate_std: metrics.engagement_rate_std * 0.9, // Улучшение стабильности вовлеченности
		},
		si_weights,
	);

	// Расчет метрик при сценарии "Коллаборации"
	const collaborationScenarioMentions = metrics.mentions + scenario_parameters.mentions_delta;
	const collaborationScenarioReach = metrics.avg_reach * 1.2; // Увеличение охвата на 20%
	const collaborationScenarioII = calculateInfluenceIndex(
		{
			...metrics,
			mentions: collaborationScenarioMentions,
			avg_reach: collaborationScenarioReach,
		},
		ii_weights,
	);
	const collaborationScenarioSI = calculateSustainabilityIndex(
		{
			...metrics,
			reach_std: metrics.reach_std * 0.95, // Небольшое улучшение стабильности охвата
		},
		si_weights,
	);

	// Расчет метрик при сценарии "Образовательный контент"
	const educationScenarioER = metrics.engagement_rate * 1.3; // Предполагаем, что вовлеченность вырастет на 30%
	const educationScenarioII = calculateInfluenceIndex(
		{
			...metrics,
			engagement_rate: educationScenarioER,
		},
		ii_weights,
	);
	const educationScenarioSI = calculateSustainabilityIndex(
		{
			...metrics,
			engagement_rate_std: metrics.engagement_rate_std * 0.85, // Улучшение стабильности вовлеченности
		},
		si_weights,
	);

	// Дельты для каждого сценария
	const activityScenarioDeltaII = activityScenarioII - metrics.influence_index;
	const activityScenarioDeltaSI = activityScenarioSI - metrics.sustainability_index;

	const engagementScenarioDeltaII = engagementScenarioII - metrics.influence_index;
	const engagementScenarioDeltaSI = engagementScenarioSI - metrics.sustainability_index;

	const collaborationScenarioDeltaII = collaborationScenarioII - metrics.influence_index;
	const collaborationScenarioDeltaSI = collaborationScenarioSI - metrics.sustainability_index;

	const educationScenarioDeltaII = educationScenarioII - metrics.influence_index;
	const educationScenarioDeltaSI = educationScenarioSI - metrics.sustainability_index;

	// Используем веса по умолчанию для расчета оптимальности
	const defaultWeights: OptimalityWeights = {
		alpha: 0.5,
		beta: 0.3,
		gamma: 0.2,
	};

	// Создаем объекты сценариев с вероятностями, рассчитанными на основе текущих метрик
	const activity_scenario = {
		name: 'Увеличение активности',
		delta_ii: activityScenarioDeltaII,
		delta_si: activityScenarioDeltaSI,
		cost: scenario_parameters.cost_activity,
		description: `Увеличить частоту публикаций с ${metrics.post_frequency.toFixed(
			1,
		)} до ${activityScenarioPostFrequency.toFixed(1)} постов в неделю.`,
		probability: getScenarioProbability('activity_scenario', metrics),
	};

	const engagement_scenario = {
		name: 'Повышение вовлеченности',
		delta_ii: engagementScenarioDeltaII,
		delta_si: engagementScenarioDeltaSI,
		cost: scenario_parameters.cost_engagement,
		description: `Увеличить показатель вовлеченности с ${(
			metrics.engagement_rate * 100
		).toFixed(1)}% до ${(engagementScenarioER * 100).toFixed(1)}%.`,
		probability: getScenarioProbability('engagement_scenario', metrics),
	};

	const collaboration_scenario = {
		name: 'Коллаборации',
		delta_ii: collaborationScenarioDeltaII,
		delta_si: collaborationScenarioDeltaSI,
		cost: scenario_parameters.cost_collaboration,
		description: `Увеличить количество упоминаний с ${metrics.mentions} до ${collaborationScenarioMentions} и расширить охват аудитории на 20%.`,
		probability: getScenarioProbability('collaboration_scenario', metrics),
	};

	const education_scenario = {
		name: 'Образовательный контент',
		delta_ii: educationScenarioDeltaII,
		delta_si: educationScenarioDeltaSI,
		cost: scenario_parameters.cost_education,
		description: `Внедрить образовательные элементы в контент, увеличив вовлеченность на 30% и улучшив качество обратной связи от аудитории.`,
		probability: getScenarioProbability('education_scenario', metrics),
	};

	// Получаем все настроенные сценарии из хранилища
	const customScenarios = getCustomScenarios();
	const scenarioResults: { [key: string]: ScenarioData } = {};
	const allScenarioKeys: string[] = [];

	// Стандартные сценарии
	const standardScenarios = [
		{ key: 'activity_scenario', name: 'Увеличение активности' },
		{ key: 'engagement_scenario', name: 'Повышение вовлеченности' },
		{ key: 'collaboration_scenario', name: 'Коллаборации' },
		{ key: 'education_scenario', name: 'Образовательный контент' },
	];

	// Добавляем стандартные сценарии
	standardScenarios.forEach(({ key, name }) => {
		const scenarioInfo = customScenarios.find(
			(s: { name: string; isActive?: boolean }) => s.name === name,
		);
		if (scenarioInfo && scenarioInfo.isActive !== false) {
			allScenarioKeys.push(key);

			// Используем уже вычисленные сценарии, если они есть
			if (key === 'activity_scenario') {
				scenarioResults[key] = activity_scenario;
			} else if (key === 'engagement_scenario') {
				scenarioResults[key] = engagement_scenario;
			} else if (key === 'collaboration_scenario') {
				scenarioResults[key] = collaboration_scenario;
			} else if (key === 'education_scenario') {
				scenarioResults[key] = education_scenario;
			}
		}
	});

	// Добавляем пользовательские сценарии
	customScenarios.forEach(
		(scenario: { id: number; name: string; isActive?: boolean; description?: string }) => {
			const isStandard = standardScenarios.some((s) => s.name === scenario.name);
			if (!isStandard && scenario.isActive !== false) {
				const scenarioKey = `custom_scenario_${scenario.id}`;
				allScenarioKeys.push(scenarioKey);
				scenarioResults[scenarioKey] = processCustomScenario(
					scenarioKey,
					scenario.name,
					metrics,
					scenario_parameters,
					ii_weights,
					si_weights,
				);
			}
		},
	);

	// Расчет критериев для всех сценариев
	const suitability: { [key: string]: number } = {};
	const superiority: { [key: string]: number } = {};
	const optimality: { [key: string]: number } = {};

	// Заполняем данные для всех активных сценариев
	allScenarioKeys.forEach((key) => {
		const scenarioData = scenarioResults[key];
		suitability[key] = scenarioData.delta_ii;
		superiority[key] = scenarioData.delta_si;
		optimality[key] =
			defaultWeights.alpha * scenarioData.delta_ii +
			defaultWeights.beta * scenarioData.delta_si -
			defaultWeights.gamma * scenarioData.cost;
	});

	// Ранжирование сценариев по каждому критерию
	const suitabilityRanking = Object.entries(suitability)
		.sort((a, b) => b[1] - a[1])
		.map((entry) => entry[0]);

	const superiorityRanking = Object.entries(superiority)
		.sort((a, b) => b[1] - a[1])
		.map((entry) => entry[0]);

	const optimalityRanking = Object.entries(optimality)
		.sort((a, b) => b[1] - a[1])
		.map((entry) => entry[0]);

	// Рекомендуемый сценарий (первый по оптимальности)
	const recommendedScenario = optimalityRanking[0] || '';

	// Формируем результат
	const result = {
		...scenarioResults,
		suitability_ranking: suitabilityRanking,
		superiority_ranking: superiorityRanking,
		optimality_ranking: optimalityRanking,
		recommended_scenario: recommendedScenario,
	} as ScenarioResults;

	return result;
}
