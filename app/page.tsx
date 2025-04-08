'use client';

import ExpertSettings from '@/components/expert-settings';
import InputForm from '@/components/input-form';
import ModeSelector from '@/components/mode-selector';
import ResultsTable from '@/components/results-table';
import { saveBloggerData, saveBusinessData } from '@/lib/data';
import { analyzeForBlogger, analyzeForBusiness } from '@/lib/math';
import {
	BloggerData,
	BloggerInputData,
	BloggerSettings,
	BloggerWithMetrics,
	BusinessSettings,
} from '@/lib/types';
import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
	const [isBusinessMode, setIsBusinessMode] = useState(true);
	const [isExpertMode, setIsExpertMode] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [results, setResults] = useState<BloggerWithMetrics[] | null>(null);
	const [hasUserInput, setHasUserInput] = useState(false);

	// Ссылка на форму для сброса полей
	const inputFormRef = useRef<{ resetForm: () => void; checkIfEmpty: () => boolean } | null>(
		null,
	);

	const handleModeChange = (mode: string, isExpert: boolean) => {
		setIsBusinessMode(mode === 'business');
		setIsExpertMode(isExpert);
		setShowResults(false);
		setResults(null);

		// Сброс формы при смене режима
		if (inputFormRef.current) {
			inputFormRef.current.resetForm();
			setHasUserInput(false);
		}
	};

	const handleFormSubmit = async (inputData: BloggerInputData[]) => {
		try {
			if (isBusinessMode) {
				// Преобразование данных и добавление ID для каждого блогера
				const bloggersData: BloggerData[] = inputData.map((blogger) => ({
					...blogger,
					id: uuidv4(), // генерация уникального ID
				}));

				// Сохранение данных в localStorage
				saveBusinessData(bloggersData);

				// Анализ данных
				const businessSettings = localStorage.getItem('businessExpertSettings');
				const settings: BusinessSettings | null = businessSettings
					? JSON.parse(businessSettings)
					: null;

				const results = await analyzeForBusiness(bloggersData, settings);
				setResults(results.bloggers);
			} else {
				// Для режима блогера - один элемент
				const bloggerData: BloggerData = {
					...inputData[0],
					id: uuidv4(),
				};

				// Сохранение данных в localStorage
				saveBloggerData(bloggerData);

				// Анализ данных
				const bloggerSettings = localStorage.getItem('bloggerExpertSettings');
				const settings: BloggerSettings | null = bloggerSettings
					? JSON.parse(bloggerSettings)
					: null;

				const result = await analyzeForBlogger(bloggerData, settings);
				setResults([{ blogger: bloggerData, metrics: result.metrics }]);
			}

			setShowResults(true);
		} catch (error) {
			console.error('Ошибка при анализе данных:', error);
			alert(
				'Произошла ошибка при анализе данных. Пожалуйста, проверьте введенную информацию.',
			);
		}
	};

	const handleExpertSettingsSubmit = (settings: BusinessSettings | BloggerSettings) => {
		// Сохранение настроек (уже происходит в компоненте ExpertSettings)
		// После сохранения настроек возвращаемся к форме ввода
		setIsExpertMode(false);
	};

	// Обработчик для отслеживания ввода данных
	const handleInputChange = (isEmpty: boolean) => {
		setHasUserInput(!isEmpty);
	};

	return (
		<div className='w-full max-w-4xl mx-auto slide-up'>
			{/* Заголовок */}
			<div className='mb-10 text-center'>
				<h1 className='text-3xl md:text-4xl font-semibold bg-gradient-to-t from-blue-700 to-blue-500 inline-block text-transparent bg-clip-text mb-3'>
					Анализ влияния в социальных медиа
				</h1>
				<p className='text-neutral-700 text-lg max-w-2xl mx-auto'>
					Анализируйте влияние в социальных медиа. Найдите идеальных блогеров для вашего
					бизнеса с помощью SocialRank
				</p>
			</div>

			{/* Селектор режима */}
			<div className='mb-4'>
				<ModeSelector
					isBusinessMode={isBusinessMode}
					isExpertMode={isExpertMode}
					onModeChange={handleModeChange}
					hasUserInput={hasUserInput}
				/>
			</div>

			{/* Содержимое в зависимости от режима - с анимацией */}
			<div className='transition-all duration-300 ease-in-out'>
				{isExpertMode ? (
					<div className='fade-in'>
						<ExpertSettings
							isBusinessMode={isBusinessMode}
							onSaveSettings={handleExpertSettingsSubmit}
						/>
					</div>
				) : !showResults ? (
					<div className='fade-in'>
						<InputForm
							ref={inputFormRef}
							isBusinessMode={isBusinessMode}
							onSubmit={handleFormSubmit}
							onInputChange={handleInputChange}
						/>
					</div>
				) : (
					<div className='fade-in'>
						<ResultsTable
							isBusinessMode={isBusinessMode}
							data={results}
						/>
					</div>
				)}
			</div>

			{/* Кнопка возврата к форме ввода */}
			{showResults && (
				<div className='flex justify-center mt-8'>
					<button
						onClick={() => setShowResults(false)}
						className='bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 transition-all px-4 py-2 rounded-lg'>
						Вернуться к форме ввода
					</button>
				</div>
			)}
		</div>
	);
}
