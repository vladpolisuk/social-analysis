'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function Instruction() {
	const [activeSection, setActiveSection] = useState('overview');

	const observerRef = useRef<IntersectionObserver | null>(null);

	const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({
		overview: null,
		'business-mode': null,
		'blogger-mode': null,
		'expert-mode': null,
		metrics: null,
		scenarios: null,
	});

	useEffect(() => {
		const hash = window.location.hash.slice(1);

		if (hash) {
			setActiveSection(hash);
			const element = document.getElementById(hash);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		}

		const options = {
			rootMargin: '-10% 0px -80% 0px',
			threshold: 0,
		};

		observerRef.current = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				const id = entry.target.id;
				if (entry.isIntersecting) {
					setActiveSection(id);
					window.history.replaceState(null, '', `#${id}`);
				}
			});
		}, options);

		// Наблюдаем за всеми разделами
		Object.keys(sectionsRef.current).forEach((id) => {
			const element = document.getElementById(id);
			if (element) {
				sectionsRef.current[id] = element;
				observerRef.current?.observe(element);
			}
		});

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, []);

	const handleSectionClick = (section: string) => {
		setActiveSection(section);
	};

	return (
		<div className='w-full max-w-4xl mx-auto py-10'>
			<div className='flex flex-col md:flex-row gap-8'>
				{/* Навигация по разделам */}
				<aside className='md:w-1/4 md:sticky md:top-4 md:self-start'>
					<div className='bg-white rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.05)] p-4 mb-4'>
						<h2 className='text-lg font-semibold mb-3'>Содержание</h2>
						<nav className='flex flex-col gap-2'>
							<a
								href='#overview'
								onClick={() => handleSectionClick('overview')}
								className={`px-3 py-2 rounded-md text-sm ${
									activeSection === 'overview'
										? 'bg-blue-50 text-blue-600'
										: 'hover:bg-neutral-50'
								}`}>
								Обзор приложения
							</a>
							<a
								href='#business-mode'
								onClick={() => handleSectionClick('business-mode')}
								className={`px-3 py-2 rounded-md text-sm ${
									activeSection === 'business-mode'
										? 'bg-blue-50 text-blue-600'
										: 'hover:bg-neutral-50'
								}`}>
								Режим «Бизнес»
							</a>
							<a
								href='#blogger-mode'
								onClick={() => handleSectionClick('blogger-mode')}
								className={`px-3 py-2 rounded-md text-sm ${
									activeSection === 'blogger-mode'
										? 'bg-blue-50 text-blue-600'
										: 'hover:bg-neutral-50'
								}`}>
								Режим «Блогер»
							</a>
							<a
								href='#expert-mode'
								onClick={() => handleSectionClick('expert-mode')}
								className={`px-3 py-2 rounded-md text-sm ${
									activeSection === 'expert-mode'
										? 'bg-blue-50 text-blue-600'
										: 'hover:bg-neutral-50'
								}`}>
								Режим «Эксперт»
							</a>
							<a
								href='#metrics'
								onClick={() => handleSectionClick('metrics')}
								className={`px-3 py-2 rounded-md text-sm ${
									activeSection === 'metrics'
										? 'bg-blue-50 text-blue-600'
										: 'hover:bg-neutral-50'
								}`}>
								Метрики и показатели
							</a>
							<a
								href='#scenarios'
								onClick={() => handleSectionClick('scenarios')}
								className={`px-3 py-2 rounded-md text-sm ${
									activeSection === 'scenarios'
										? 'bg-blue-50 text-blue-600'
										: 'hover:bg-neutral-50'
								}`}>
								Сценарии улучшения
							</a>
						</nav>
					</div>
					<Link
						href='/'
						className='block w-full text-sm py-2 px-4 text-center rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors'>
						Вернуться на главную
					</Link>
				</aside>

				{/* Содержимое */}
				<main className='md:w-3/4'>
					<h1 className='text-4xl font-semibold mb-8 text-balance'>
						Инструкция по использованию и настройке приложения
					</h1>

					{/* Обзор приложения */}
					<section
						id='overview'
						className='mb-12'>
						<h2 className='text-2xl font-semibold mb-4'>Обзор приложения</h2>
						<div className='bg-white rounded-lg p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'>
							<p className='mb-4'>
								Приложение "Анализ влияния в социальных медиа" предназначено для
								оценки эффективности блогеров и их влияния в социальных сетях. Оно
								помогает:
							</p>
							<ul className='list-disc pl-6 mb-4 space-y-2'>
								<li>
									Бизнесу — выбрать наиболее подходящих блогеров для
									сотрудничества и рекламных кампаний
								</li>
								<li>
									Блогерам — оценить свое текущее влияние и получить рекомендации
									по его улучшению
								</li>
							</ul>
							<p className='mb-4'>Приложение рассчитывает два ключевых показателя:</p>
							<div className='grid md:grid-cols-2 gap-4 mb-4'>
								<div className='bg-blue-50 p-4 rounded-lg'>
									<h3 className='font-semibold text-blue-700 mb-2'>
										Интегральный индекс влияния (II)
									</h3>
									<p className='text-sm'>
										Комплексный показатель, учитывающий соотношение подписчиков,
										вовлеченность, частоту публикаций, охват и упоминания.
									</p>
								</div>
								<div className='bg-purple-50 p-4 rounded-lg'>
									<h3 className='font-semibold text-purple-700 mb-2'>
										Индекс устойчивости влияния (SI)
									</h3>
									<p className='text-sm'>
										Показатель стабильности влияния блогера, основанный на
										постоянстве вовлеченности, частоты публикаций и охвата.
									</p>
								</div>
							</div>
							<p>
								Приложение имеет два основных режима работы — "Бизнес" и "Блогер", а
								также дополнительный режим "Эксперт" для настройки параметров
								расчета.
							</p>
						</div>
					</section>

					{/* Режим "Бизнес" */}
					<section
						id='business-mode'
						className='mb-12'>
						<h2 className='text-2xl font-semibold mb-4'>Режим "Бизнес"</h2>
						<div className='bg-white rounded-lg p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'>
							<p className='mb-4'>
								Режим "Бизнес" предназначен для компаний, которые ищут блогеров для
								сотрудничества. В этом режиме вы можете:
							</p>
							<ul className='list-disc pl-6 mb-6 space-y-2'>
								<li>
									Добавить и проанализировать данные нескольких блогеров
									одновременно
								</li>
								<li>
									Сравнить их показатели и выбрать наиболее подходящих для вашей
									кампании
								</li>
								<li>
									Получить ранжированный список блогеров по интегральному индексу
									влияния и индексу устойчивости
								</li>
							</ul>
							<h3 className='font-semibold text-lg mb-3'>Как использовать:</h3>
							<ol className='list-decimal pl-6 mb-4 space-y-2'>
								<li>Выберите режим "Бизнес" в верхней части страницы</li>
								<li>
									Заполните данные для каждого блогера, которого хотите
									проанализировать
								</li>
								<li>
									Для добавления нового блогера нажмите кнопку "Добавить блогера"
									<div className='bg-neutral-100 inline-block ml-2 text-sm px-2 py-1 rounded'>
										максимум 10 блогеров
									</div>
								</li>
								<li>После заполнения всех данных нажмите "Анализировать"</li>
								<li>
									Результаты будут представлены в виде таблицы с возможностью
									сортировки по разным показателям
								</li>
							</ol>
						</div>
					</section>

					{/* Режим "Блогер" */}
					<section
						id='blogger-mode'
						className='mb-12'>
						<h2 className='text-2xl font-semibold mb-4'>Режим "Блогер"</h2>
						<div className='bg-white rounded-lg p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'>
							<p className='mb-4'>
								Режим "Блогер" предназначен для индивидуальных создателей контента,
								которые хотят оценить собственное влияние и получить рекомендации по
								его улучшению. В этом режиме вы можете:
							</p>
							<ul className='list-disc pl-6 mb-6 space-y-2'>
								<li>Проанализировать собственные метрики влияния</li>
								<li>Получить подробную оценку своих показателей</li>
								<li>
									Ознакомиться с рекомендуемыми сценариями для улучшения своего
									влияния
								</li>
								<li>
									Увидеть прогноз роста основных показателей при внедрении каждого
									сценария
								</li>
							</ul>
							<h3 className='font-semibold text-lg mb-3'>Как использовать:</h3>
							<ol className='list-decimal pl-6 mb-4 space-y-2'>
								<li>Выберите режим "Блогер" в верхней части страницы</li>
								<li>Заполните данные о своем аккаунте в социальной сети</li>
								<li>
									Не забудьте указать дополнительные метрики для более точного
									анализа (стандартные отклонения показателей)
								</li>
								<li>После заполнения всех данных нажмите "Анализировать"</li>
								<li>
									Результаты будут включать ваши текущие показатели и три сценария
									улучшения с прогнозными значениями
								</li>
							</ol>
						</div>
					</section>

					{/* Режим "Эксперт" */}
					<section
						id='expert-mode'
						className='mb-12'>
						<h2 className='text-2xl font-semibold mb-4'>Режим "Эксперт"</h2>
						<div className='bg-white rounded-lg p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'>
							<p className='mb-4'>
								Режим "Эксперт" предоставляет доступ к настройке параметров расчета
								показателей. Этот режим доступен только авторизованным пользователям
								и позволяет:
							</p>
							<ul className='list-disc pl-6 mb-6 space-y-2'>
								<li>
									Настроить веса для различных метрик при расчете интегрального
									индекса влияния
								</li>
								<li>
									Настроить веса для показателей стабильности при расчете индекса
									устойчивости
								</li>
								<li>
									В режиме "Бизнес": настроить веса для критериев оптимальности
									при оценке блогеров
								</li>
								<li>
									В режиме "Блогер": настроить параметры сценариев улучшения и их
									стоимость
								</li>
							</ul>
							<h3 className='font-semibold text-lg mb-3'>Как использовать:</h3>
							<ol className='list-decimal pl-6 mb-6 space-y-2'>
								<li>Нажмите кнопку "Эксперт" в верхней части страницы</li>
								<li>Введите пароль для доступа к экспертным настройкам</li>
								<li>
									Настройте веса и параметры в соответствии с вашими приоритетами
								</li>
								<li>Нажмите "Сохранить настройки"</li>
								<li>Все последующие расчеты будут использовать ваши настройки</li>
							</ol>
							<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
								<p className='text-sm'>
									<span className='font-semibold text-yellow-700'>Важно:</span>{' '}
									Сумма весов в каждой группе параметров должна равняться 1.0.
									Если сумма отличается, система предложит автоматически
									нормализовать значения.
								</p>
							</div>
						</div>
					</section>

					{/* Метрики и показатели */}
					<section
						id='metrics'
						className='mb-12'>
						<h2 className='text-2xl font-semibold mb-4'>Метрики и показатели</h2>
						<div className='bg-white rounded-lg p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'>
							<p className='mb-4'>
								Для анализа влияния блогеров используются следующие метрики и
								рассчитываемые показатели:
							</p>

							<h3 className='font-semibold text-lg mb-3'>
								Основные метрики (вводятся пользователем):
							</h3>
							<div className='grid md:grid-cols-2 gap-4 mb-6'>
								<div className='bg-neutral-50 p-3 rounded-lg'>
									<h4 className='font-medium mb-1'>Количество подписчиков</h4>
									<p className='text-sm text-neutral-600'>
										Общее число подписчиков аккаунта
									</p>
								</div>
								<div className='bg-neutral-50 p-3 rounded-lg'>
									<h4 className='font-medium mb-1'>Прирост подписчиков</h4>
									<p className='text-sm text-neutral-600'>
										Количество новых подписчиков за последний период
									</p>
								</div>
								<div className='bg-neutral-50 p-3 rounded-lg'>
									<h4 className='font-medium mb-1'>Количество постов</h4>
									<p className='text-sm text-neutral-600'>
										Общее число опубликованных материалов
									</p>
								</div>
								<div className='bg-neutral-50 p-3 rounded-lg'>
									<h4 className='font-medium mb-1'>Частота постов</h4>
									<p className='text-sm text-neutral-600'>
										Среднее количество публикаций в неделю
									</p>
								</div>
								<div className='bg-neutral-50 p-3 rounded-lg'>
									<h4 className='font-medium mb-1'>
										Лайки, комментарии, репосты
									</h4>
									<p className='text-sm text-neutral-600'>
										Показатели взаимодействия с контентом
									</p>
								</div>
								<div className='bg-neutral-50 p-3 rounded-lg'>
									<h4 className='font-medium mb-1'>Средний охват</h4>
									<p className='text-sm text-neutral-600'>
										Среднее число просмотров одного поста
									</p>
								</div>
								<div className='bg-neutral-50 p-3 rounded-lg'>
									<h4 className='font-medium mb-1'>Упоминания</h4>
									<p className='text-sm text-neutral-600'>
										Количество упоминаний блогера в социальных сетях
									</p>
								</div>
								<div className='bg-neutral-50 p-3 rounded-lg'>
									<h4 className='font-medium mb-1'>Стандартные отклонения</h4>
									<p className='text-sm text-neutral-600'>
										Показатели стабильности метрик
									</p>
								</div>
							</div>

							<h3 className='font-semibold text-lg mb-3'>
								Рассчитываемые показатели:
							</h3>
							<div className='grid md:grid-cols-2 gap-4 mb-6'>
								<div className='bg-blue-50 p-4 rounded-lg'>
									<h4 className='font-medium text-blue-700 mb-1'>
										Интегральный индекс влияния (II)
									</h4>
									<p className='text-sm'>
										Комбинированный показатель, учитывающий все аспекты влияния
										блогера. Формула:
									</p>
									<div className='bg-white p-2 mt-2 rounded border border-blue-100 text-sm font-mono'>
										II = w₁×FR + w₂×ER + w₃×PA + w₄×RA + w₅×M
									</div>
								</div>
								<div className='bg-purple-50 p-4 rounded-lg'>
									<h4 className='font-medium text-purple-700 mb-1'>
										Индекс устойчивости влияния (SI)
									</h4>
									<p className='text-sm'>
										Оценка стабильности и предсказуемости показателей блогера.
										Формула:
									</p>
									<div className='bg-white p-2 mt-2 rounded border border-purple-100 text-sm font-mono'>
										SI = ϑ₁×EC + ϑ₂×PC + ϑ₃×RC
									</div>
								</div>
								<div className='bg-green-50 p-4 rounded-lg'>
									<h4 className='font-medium text-green-700 mb-1'>
										Соотношение подписчиков (FR)
									</h4>
									<p className='text-sm'>Показатель роста аудитории:</p>
									<div className='bg-white p-2 mt-2 rounded border border-green-100 text-sm font-mono'>
										FR = 1 + прирост / подписчики
									</div>
								</div>
								<div className='bg-orange-50 p-4 rounded-lg'>
									<h4 className='font-medium text-orange-700 mb-1'>
										Показатель вовлеченности (ER)
									</h4>
									<p className='text-sm'>
										Уровень взаимодействия аудитории с контентом:
									</p>
									<div className='bg-white p-2 mt-2 rounded border border-orange-100 text-sm font-mono'>
										ER = (лайки + комм. + репосты) / подписчики
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* Сценарии улучшения */}
					<section
						id='scenarios'
						className='mb-8'>
						<h2 className='text-2xl font-semibold mb-4'>Сценарии улучшения</h2>
						<div className='bg-white rounded-lg p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'>
							<p className='mb-4'>
								В режиме "Блогер" система предлагает три основных сценария для
								улучшения показателей:
							</p>

							<div className='space-y-4 mb-6'>
								<div className='border border-neutral-200 rounded-lg p-4'>
									<h3 className='font-semibold text-blue-600 mb-2'>
										Сценарий 1: Увеличение активности
									</h3>
									<p className='mb-2 text-sm'>
										Увеличение частоты публикаций, что приводит к повышению
										видимости и охвата.
									</p>
									<div className='bg-neutral-50 p-3 rounded-md text-sm'>
										<p className='mb-1 font-medium'>Основные изменения:</p>
										<ul className='list-disc pl-6 space-y-1'>
											<li>Увеличение частоты постов (ΔPA)</li>
											<li>Небольшой рост показателя вовлеченности</li>
											<li>Повышение общего влияния и устойчивости</li>
										</ul>
									</div>
								</div>

								<div className='border border-neutral-200 rounded-lg p-4'>
									<h3 className='font-semibold text-green-600 mb-2'>
										Сценарий 2: Повышение вовлеченности
									</h3>
									<p className='mb-2 text-sm'>
										Сосредоточение на качестве контента для повышения
										вовлеченности аудитории.
									</p>
									<div className='bg-neutral-50 p-3 rounded-md text-sm'>
										<p className='mb-1 font-medium'>Основные изменения:</p>
										<ul className='list-disc pl-6 space-y-1'>
											<li>Значительный рост вовлеченности (ΔER)</li>
											<li>Улучшение стабильности вовлеченности</li>
											<li>
												Постепенный рост аудитории через органический охват
											</li>
										</ul>
									</div>
								</div>

								<div className='border border-neutral-200 rounded-lg p-4'>
									<h3 className='font-semibold text-purple-600 mb-2'>
										Сценарий 3: Коллаборации и упоминания
									</h3>
									<p className='mb-2 text-sm'>
										Сотрудничество с другими блогерами для расширения аудитории.
									</p>
									<div className='bg-neutral-50 p-3 rounded-md text-sm'>
										<p className='mb-1 font-medium'>Основные изменения:</p>
										<ul className='list-disc pl-6 space-y-1'>
											<li>Значительное увеличение упоминаний (ΔM)</li>
											<li>Рост новой аудитории</li>
											<li>Повышение всех показателей влияния</li>
										</ul>
									</div>
								</div>
							</div>

							<h3 className='font-semibold text-lg mb-3'>Таблица рекомендаций:</h3>
							<p className='mb-4 text-sm'>
								Для каждого сценария система выводит конкретные рекомендации в
								таблице результатов. Рекомендации учитывают ваши текущие показатели
								и предлагают конкретные действия для улучшения.
							</p>

							<div className='overflow-x-auto mb-6'>
								<table className='w-full border-collapse'>
									<thead>
										<tr className='bg-neutral-100'>
											<th className='border border-neutral-200 px-3 py-2 text-left text-sm'>
												Сценарий
											</th>
											<th className='border border-neutral-200 px-3 py-2 text-left text-sm'>
												II<sub>s</sub>
											</th>
											<th className='border border-neutral-200 px-3 py-2 text-left text-sm'>
												ΔII<sub>s</sub>
											</th>
											<th className='border border-neutral-200 px-3 py-2 text-left text-sm'>
												SI<sub>s</sub>
											</th>
											<th className='border border-neutral-200 px-3 py-2 text-left text-sm'>
												ΔSI<sub>s</sub>
											</th>
											<th className='border border-neutral-200 px-3 py-2 text-left text-sm'>
												Критерий
											</th>
											<th className='border border-neutral-200 px-3 py-2 text-left text-sm'>
												Рекомендация
											</th>
										</tr>
									</thead>
									<tbody>
										<tr className='hover:bg-blue-50'>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												Увеличение активности
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												0.57
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												0.04
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												0.85
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												0.03
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												Пригодность
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												Публикуйте 5 постов в неделю
											</td>
										</tr>
										<tr className='hover:bg-green-50'>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												Повышение вовлечённости
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												0.68
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												0.15
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												0.78
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												-0.04
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												Оптимальность
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												Используйте 3 трендовых хэштега
											</td>
										</tr>
										<tr className='hover:bg-purple-50'>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												Коллаборации
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												0.73
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												0.20
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												0.80
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												-0.02
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												Превосходство
											</td>
											<td className='border border-neutral-200 px-3 py-2 text-sm'>
												Сотрудничайте с 2 блогерами
											</td>
										</tr>
									</tbody>
								</table>
							</div>

							<p className='text-sm mb-4'>
								Таблица рекомендаций включает следующую информацию:
							</p>
							<ul className='list-disc pl-6 mb-4 space-y-2 text-sm'>
								<li>
									<strong>
										II<sub>s</sub>
									</strong>{' '}
									и{' '}
									<strong>
										SI<sub>s</sub>
									</strong>{' '}
									— прогнозируемые значения интегрального индекса влияния и
									индекса устойчивости после внедрения сценария
								</li>
								<li>
									<strong>
										ΔII<sub>s</sub>
									</strong>{' '}
									и{' '}
									<strong>
										ΔSI<sub>s</sub>
									</strong>{' '}
									— изменения индексов относительно текущих значений
								</li>
								<li>
									<strong>Критерий</strong> — оценка сценария по одному из трех
									критериев: пригодность, оптимальность или превосходство
								</li>
								<li>
									<strong>Рекомендация</strong> — конкретное действие, которое вам
									следует предпринять для реализации сценария
								</li>
							</ul>

							<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm'>
								<p>
									<span className='font-semibold text-yellow-700'>
										Примечание:
									</span>{' '}
									Система выбирает оптимальный сценарий на основе анализа текущих
									показателей. Для более точного прогнозирования рекомендуется
									использовать режим "Эксперт" и настроить параметры сценариев под
									свои цели и возможности.
								</p>
							</div>
						</div>
					</section>

					<div className='mt-10 pt-6 border-t border-neutral-200'>
						<Link
							href='/'
							className='flex items-center text-blue-600 hover:text-blue-800'>
							<svg
								className='w-4 h-4 mr-2 mb-[1px]'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M10 19l-7-7m0 0l7-7m-7 7h18'></path>
							</svg>
							Вернуться на главную страницу
						</Link>
					</div>
				</main>
			</div>
		</div>
	);
}
