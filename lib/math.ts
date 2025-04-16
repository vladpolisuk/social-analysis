/**
 * Библиотека математических функций для расчета показателей влияния
 */

import {
	BloggerAnalysisResult,
	BloggerData,
	BloggerMetrics,
	BloggerSettings,
	BusinessAnalysisResult,
	BusinessSettings,
	IIWeights,
	OptimalityWeights,
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

	// Ранжирование сценариев по пригодности (наименьшие затраты)
	const scenarios = [
		{ key: 'activity_scenario', cost: activityScenario.cost },
		{ key: 'engagement_scenario', cost: engagementScenario.cost },
		{ key: 'collaboration_scenario', cost: collaborationScenario.cost },
	];

	const suitabilityRanking = [...scenarios].sort((a, b) => a.cost - b.cost).map((s) => s.key);

	// Ранжирование по превосходству (наибольший прирост II)
	const superiorityRanking = [
		{ key: 'activity_scenario', delta: activityScenario.delta_ii },
		{ key: 'engagement_scenario', delta: engagementScenario.delta_ii },
		{ key: 'collaboration_scenario', delta: collaborationScenario.delta_ii },
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
		);
		const maxDeltaSI = Math.max(
			activityScenario.delta_si,
			engagementScenario.delta_si,
			collaborationScenario.delta_si,
		);
		const maxCost = Math.max(
			activityScenario.cost,
			engagementScenario.cost,
			collaborationScenario.cost,
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

	// Ранжирование по оптимальности
	const optimalityRanking = [
		{ key: 'activity_scenario', optimality: activityOptimality },
		{ key: 'engagement_scenario', optimality: engagementOptimality },
		{ key: 'collaboration_scenario', optimality: collaborationOptimality },
	]
		.sort((a, b) => b.optimality - a.optimality)
		.map((s) => s.key);

	// Выбор рекомендуемого сценария (первый по оптимальности)
	const recommendedScenario = optimalityRanking[0];

	return {
		activity_scenario: activityScenario,
		engagement_scenario: engagementScenario,
		collaboration_scenario: collaborationScenario,
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
