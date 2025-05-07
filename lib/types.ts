// Типы для основной модели данных

export interface BloggerData {
	id: string;
	name: string;
	platform: string;
	category: string;
	subscribers: number;
	subscriptions: number;
	followers_growth: number; // Прирост подписчиков за период
	posts: number; // Количество постов за период
	post_frequency: number; // Частота постов (постов в неделю)
	likes: number; // Общее количество лайков за период
	comments: number; // Общее количество комментариев за период
	shares: number; // Общее количество репостов за период
	avg_reach: number; // Средний охват одного поста
	mentions: number; // Количество упоминаний бренда/блогера

	// Стандартные отклонения для расчета устойчивости
	engagement_rate_std: number; // Стандартное отклонение показателя вовлеченности
	post_frequency_std: number; // Стандартное отклонение частоты постов
	reach_std: number; // Стандартное отклонение охвата
}

export interface BloggerInputData {
	name: string;
	platform: string;
	category: string;
	subscribers: number;
	subscriptions: number;
	followers_growth: number;
	posts: number;
	post_frequency: number;
	likes: number;
	comments: number;
	shares: number;
	avg_reach: number;
	mentions: number;
	engagement_rate_std: number;
	post_frequency_std: number;
	reach_std: number;
}

export interface BloggerMetrics {
	// Базовые метрики
	followers_ratio: number; // FR - соотношение подписчиков
	growth_rate: number; // GR - темп роста аудитории
	engagement_rate: number; // ER - показатель вовлеченности
	activity_stability: number; // SA - стабильность активности
	post_frequency: number; // PA - частота публикаций
	avg_reach: number; // RA - средний охват
	mentions: number; // M - упоминания

	// Стандартные отклонения
	engagement_rate_std: number;
	post_frequency_std: number;
	reach_std: number;

	// Производные индексы
	influence_index: number; // II - интегральный индекс влияния
	sustainability_index: number; // SI - индекс устойчивости влияния

	// Данные для сценариев
	scenarios?: ScenarioResults;
}

export interface ScenarioResults {
	activity_scenario: ScenarioData; // Сценарий "Увеличение активности"
	engagement_scenario: ScenarioData; // Сценарий "Повышение вовлеченности"
	collaboration_scenario: ScenarioData; // Сценарий "Коллаборации"
	education_scenario: ScenarioData; // Сценарий "Образовательный контент"

	// Ранжирование сценариев
	suitability_ranking: string[]; // Ранжирование по пригодности
	superiority_ranking: string[]; // Ранжирование по превосходству
	optimality_ranking: string[]; // Ранжирование по оптимальности

	recommended_scenario: string; // Рекомендуемый сценарий
}

export interface ScenarioData {
	name: string;
	delta_ii: number; // Изменение II
	delta_si: number; // Изменение SI
	cost: number; // Стоимость реализации сценария (Cs)
	description: string; // Описание сценария
	probability?: number; // Вероятность срабатывания сценария в процентах
}

export interface BusinessAnalysisResult {
	bloggers: BloggerWithMetrics[];
	averages: BloggerMetrics;
	ranking: string[]; // Ранжирование блогеров по II
	sustainability_ranking: string[]; // Ранжирование блогеров по SI
}

export interface BloggerWithMetrics {
	blogger: BloggerData;
	metrics: BloggerMetrics;
}

export interface BloggerAnalysisResult {
	metrics: BloggerMetrics;
}

// Типы для экспертных настроек

export interface IIWeights {
	followers_ratio: number; // w1 - Вес соотношения подписчиков (FR)
	engagement_rate: number; // w2 - Вес показателя вовлеченности (ER)
	post_frequency: number; // w3 - Вес частоты публикаций (PA)
	reach: number; // w4 - Вес среднего охвата (RA)
	mentions: number; // w5 - Вес упоминаний (M)
}

export interface SIWeights {
	engagement_consistency: number; // ϑ1 - Вес стабильности вовлеченности
	posting_consistency: number; // ϑ2 - Вес стабильности публикаций
	reach_consistency: number; // ϑ3 - Вес стабильности охвата
}

export interface OptimalityWeights {
	alpha: number; // α - Вес для ΔII
	beta: number; // β - Вес для ΔSI
	gamma: number; // γ - Вес для Cs (стоимости)
}

export interface ScenarioParameters {
	post_frequency_delta: number; // ΔPA - прирост частоты постов
	engagement_target: number; // ΔER - целевой прирост вовлеченности
	mentions_delta: number; // ΔM - прирост упоминаний
	cost_activity: number; // Cs для сценария "Увеличение активности"
	cost_engagement: number; // Cs для сценария "Повышение вовлеченности"
	cost_collaboration: number; // Cs для сценария "Коллаборации"
	cost_education: number; // Cs для сценария "Образовательный контент"
}

export interface BusinessSettings {
	ii_weights: IIWeights;
	si_weights: SIWeights;
	optimality_weights: OptimalityWeights;
}

export interface BloggerSettings {
	ii_weights: IIWeights;
	si_weights: SIWeights;
	scenario_parameters: ScenarioParameters;
}
