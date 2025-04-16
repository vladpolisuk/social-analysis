'use client';

import { BloggerInputData } from '@/lib/types';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface InputFormProps {
	isBusinessMode: boolean;
	onSubmit: (data: BloggerInputData[]) => void;
	onInputChange?: (isEmpty: boolean) => void; // Обработчик для отслеживания ввода
}

// Создаем пустой шаблон для данных блогера
const createEmptyBlogger = (): BloggerInputData => ({
	name: '',
	platform: '',
	category: '',
	subscribers: '' as unknown as number,
	subscriptions: '' as unknown as number,
	followers_growth: '' as unknown as number,
	posts: '' as unknown as number,
	post_frequency: '' as unknown as number,
	likes: '' as unknown as number,
	comments: '' as unknown as number,
	shares: '' as unknown as number,
	avg_reach: '' as unknown as number,
	mentions: '' as unknown as number,
	engagement_rate_std: '' as unknown as number,
	post_frequency_std: '' as unknown as number,
	reach_std: '' as unknown as number,
});

const requiredFields: (keyof BloggerInputData)[] = [
	'name',
	'subscribers',
	'subscriptions',
	'followers_growth',
	'posts',
	'post_frequency',
	'likes',
	'comments',
	'shares',
	'avg_reach',
	'mentions',
	'engagement_rate_std',
	'post_frequency_std',
	'reach_std',
];

// Стиль поля с ошибкой
const errorFieldStyle = 'border-red-500 bg-red-50';

// Типы для useImperativeHandle и ref
export interface InputFormHandles {
	checkIfEmpty: () => boolean;
	resetForm: () => void;
}

const InputForm = forwardRef<InputFormHandles, InputFormProps>(
	({ isBusinessMode, onSubmit, onInputChange }, ref) => {
		const [bloggers, setBloggers] = useState<BloggerInputData[]>([createEmptyBlogger()]);
		const [formError, setFormError] = useState<string | null>(null);
		const [attemptedSubmit, setAttemptedSubmit] = useState(false);
		const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
		const [isUploading, setIsUploading] = useState(false);
		const fileInputRef = useRef<HTMLInputElement>(null);

		// Предоставляем доступ к функциям через ref
		useImperativeHandle(ref, () => ({
			checkIfEmpty: () => {
				// Проверяем, пустые ли все поля во всех блогерах
				for (const blogger of bloggers) {
					for (const key in blogger) {
						const value = blogger[key as keyof typeof blogger];
						// Если какое-то поле не пустое, форма не пустая
						if (
							(typeof value === 'string' && value !== '') ||
							(typeof value === 'number' && value !== 0)
						) {
							return false;
						}
					}
				}
				return true;
			},
			resetForm: () => {
				setBloggers([createEmptyBlogger()]);
				setFormError(null);
				setAttemptedSubmit(false);
				setTouchedFields({});
			},
		}));

		// Обновляем состояние "пустой формы" при каждом изменении данных
		useEffect(() => {
			if (onInputChange) {
				// @ts-ignore
				const isEmpty = ref?.current?.checkIfEmpty() ?? true;
				onInputChange(isEmpty);
			}
		}, [bloggers, onInputChange, ref]);

		// Функция для преобразования строковых значений в числа перед отправкой
		const prepareDataForSubmit = (): BloggerInputData[] => {
			return bloggers.map((blogger) => {
				const processedBlogger: Partial<BloggerInputData> = {};

				for (const [key, value] of Object.entries(blogger)) {
					if (key === 'name' || key === 'platform' || key === 'category') {
						// @ts-ignore
						processedBlogger[key as keyof BloggerInputData] = value as string;
					} else {
						// Преобразуем значение в число, заменяя запятые на точки
						let numValue: number;
						if (typeof value === 'string') {
							numValue = parseFloat(value.replace(',', '.'));
						} else {
							numValue = value as number;
						}
						// @ts-ignore
						processedBlogger[key as keyof BloggerInputData] = numValue;
					}
				}

				return processedBlogger as BloggerInputData;
			});
		};

		const handleSubmit = (e: React.FormEvent) => {
			e.preventDefault();
			setAttemptedSubmit(true);

			if (!validateForm()) return;

			try {
				const processedData = prepareDataForSubmit();
				onSubmit(processedData);
			} catch (error) {
				console.error('Ошибка при подготовке данных:', error);
				setFormError(
					'Произошла ошибка при подготовке данных. Проверьте введенные значения.',
				);
			}
		};

		const handleChange = (
			index: number,
			field: keyof BloggerInputData,
			value: string | number,
		) => {
			const newBloggers = [...bloggers];

			// Отмечаем поле как "тронутое"
			setTouchedFields({
				...touchedFields,
				[`${index}-${field}`]: true,
			});

			if (
				typeof value === 'string' &&
				field !== 'name' &&
				field !== 'platform' &&
				field !== 'category'
			) {
				// Проверяем, что для числовых полей вводятся только цифры, точки и запятые
				if (/^[0-9.,]*$/.test(value) || value === '') {
					// Сохраняем строковое значение для числовых полей, чтобы разрешить ввод 0, точек и запятых
					// Преобразование в число будет происходить при отправке формы
					newBloggers[index] = {
						...newBloggers[index],
						[field]: value,
					};
				}
			} else {
				newBloggers[index] = {
					...newBloggers[index],
					[field]: value,
				};
			}

			setBloggers(newBloggers);
		};

		const addBlogger = () => {
			if (!isBusinessMode) return;

			setBloggers([...bloggers, createEmptyBlogger()]);
		};

		const removeBlogger = (index: number) => {
			if (!isBusinessMode || bloggers.length <= 1) return;

			const newBloggers = [...bloggers];
			newBloggers.splice(index, 1);
			setBloggers(newBloggers);

			// Удаляем все записи о тронутых полях для удаленного блогера
			const updatedTouchedFields = { ...touchedFields };
			Object.keys(updatedTouchedFields).forEach((key) => {
				if (key.startsWith(`${index}-`)) {
					delete updatedTouchedFields[key];
				}
			});
			setTouchedFields(updatedTouchedFields);
		};

		const validateForm = (): boolean => {
			// Проверка заполнения обязательных полей
			for (const blogger of bloggers) {
				if (!blogger.name) {
					setFormError('Пожалуйста, заполните имя/ник блогера.');
					return false;
				}

				// Проверка, что числовые значения больше 0
				if (
					blogger.subscribers <= 0 ||
					blogger.posts <= 0 ||
					blogger.post_frequency <= 0 ||
					blogger.likes <= 0 ||
					blogger.comments <= 0 ||
					blogger.shares <= 0 ||
					blogger.avg_reach <= 0
				) {
					setFormError('Все числовые значения должны быть больше 0.');
					return false;
				}
			}

			setFormError(null);
			return true;
		};

		// Функция для определения, является ли поле пустым
		const isFieldEmpty = (index: number, field: keyof BloggerInputData): boolean => {
			const value = bloggers[index][field];
			return value === '' || value === 0;
		};

		// Функция для определения, нужно ли показывать ошибку для поля
		const shouldShowError = (index: number, field: keyof BloggerInputData): boolean => {
			// Показываем ошибку если:
			// 1. Форма была отправлена хотя бы раз или
			// 2. Поле было "тронуто" и сейчас пустое
			return (
				(attemptedSubmit || touchedFields[`${index}-${field}`]) &&
				isFieldEmpty(index, field)
			);
		};

		// Функция для загрузки данных из JSON файла
		const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			setIsUploading(true);
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const jsonData = JSON.parse(e.target?.result as string);

					// Валидация загруженных данных
					if (isBusinessMode) {
						// В режиме бизнеса ожидаем массив блогеров
						if (!Array.isArray(jsonData)) {
							throw new Error('Ожидался массив данных блогеров');
						}
						validateBloggersData(jsonData);
						setBloggers(jsonData);
					} else {
						// В режиме блогера ожидаем один объект или массив с одним объектом
						if (Array.isArray(jsonData)) {
							if (jsonData.length === 0) {
								throw new Error('Файл не содержит данных блогера');
							}
							validateBloggersData(jsonData);
							// Берем только первый элемент массива
							setBloggers([jsonData[0]]);
						} else if (typeof jsonData === 'object' && jsonData !== null) {
							validateBloggersData([jsonData]);
							setBloggers([jsonData]);
						} else {
							throw new Error('Неверный формат данных');
						}
					}

					setFormError(null);
					// Сбросить значение input, чтобы можно было загрузить тот же файл повторно
					if (fileInputRef.current) fileInputRef.current.value = '';
				} catch (error) {
					console.error('Ошибка при обработке файла:', error);
					setFormError(`Ошибка при обработке файла: ${(error as Error).message}`);
					// Сбросить значение input
					if (fileInputRef.current) fileInputRef.current.value = '';
				} finally {
					setIsUploading(false);
				}
			};

			reader.onerror = () => {
				setFormError('Произошла ошибка при чтении файла');
				setIsUploading(false);
				// Сбросить значение input
				if (fileInputRef.current) fileInputRef.current.value = '';
			};

			reader.readAsText(file);
		};

		// Функция для валидации данных блогеров
		const validateBloggersData = (data: any[]) => {
			// Проверяем каждого блогера в массиве
			for (const blogger of data) {
				// Проверяем наличие всех необходимых полей

				for (const field of requiredFields) {
					if (blogger[field] === undefined) {
						throw new Error(`Отсутствует обязательное поле: ${field}`);
					}
				}

				// Проверка типов данных
				if (
					typeof blogger.name !== 'string' ||
					typeof blogger.platform !== 'string' ||
					typeof blogger.category !== 'string'
				) {
					throw new Error('Поля name, platform и category должны быть строками');
				}

				// Проверка числовых полей
				const numericFields: (keyof BloggerInputData)[] = [
					'subscribers',
					'posts',
					'post_frequency',
					'likes',
					'comments',
					'shares',
					'avg_reach',
					'mentions',
					'engagement_rate_std',
					'post_frequency_std',
					'reach_std',
				];

				for (const field of numericFields) {
					const value = blogger[field];
					// Преобразуем в число, если это строка
					const numValue =
						typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;

					// Проверяем, что это число и оно больше или равно 0
					if (isNaN(numValue) || numValue < 0) {
						throw new Error(`Поле ${field} должно быть положительным числом`);
					}

					// Преобразуем значение к числу
					blogger[field] = numValue;
				}
			}
		};

		// Функция для открытия диалога выбора файла
		const triggerFileInput = () => {
			fileInputRef.current?.click();
		};

		// Функция для скачивания примера JSON файла
		const downloadSampleJSON = () => {
			const sampleData = isBusinessMode
				? [createEmptyBlogger(), createEmptyBlogger()]
				: [createEmptyBlogger()];

			// Заполняем пример данными
			sampleData.forEach((blogger, index) => {
				blogger.name = `Пример Блогер ${index + 1}`;
				blogger.platform = 'Instagram';
				blogger.category = 'Lifestyle';
				blogger.subscribers = 10000 + index * 5000;
				blogger.followers_growth = 500 + index * 100;
				blogger.posts = 20 + index * 5;
				blogger.post_frequency = 3 + index * 0.5;
				blogger.likes = 5000 + index * 1000;
				blogger.comments = 500 + index * 100;
				blogger.shares = 200 + index * 50;
				blogger.avg_reach = 15000 + index * 3000;
				blogger.mentions = 15 + index * 5;
				blogger.engagement_rate_std = 0.5 + index * 0.1;
				blogger.post_frequency_std = 0.8 + index * 0.1;
				blogger.reach_std = 0.3 + index * 0.1;
			});

			const jsonStr = JSON.stringify(isBusinessMode ? sampleData : sampleData[0], null, 2);
			const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonStr)}`;
			const link = document.createElement('a');
			link.href = dataUri;
			link.download = isBusinessMode
				? 'sample_business_data.json'
				: 'sample_blogger_data.json';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		};

		return (
			<form
				onSubmit={handleSubmit}
				className='w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'>
				<h2 className='text-2xl font-semibold mb-6'>
					{isBusinessMode
						? 'Оценка влияния блогеров для бизнеса'
						: 'Оценка личного влияния'}
				</h2>

				{/* Секция импорта данных */}
				<div className='mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg'>
					<h3 className='text-lg font-semibold mb-3'>Импорт данных</h3>
					<p className='text-sm mb-3'>
						Вы можете загрузить данные из JSON-файла или заполнить форму вручную.
					</p>

					<div className='flex flex-wrap gap-3'>
						<input
							type='file'
							accept='.json'
							className='hidden'
							ref={fileInputRef}
							onChange={handleFileUpload}
						/>

						<button
							type='button'
							onClick={triggerFileInput}
							disabled={isUploading}
							className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center shadow-sm transition-colors'>
							{isUploading ? (
								<>
									<svg
										className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
									Загрузка...
								</>
							) : (
								<>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width='24'
										height='24'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
										className='lucide w-5 h-5 mr-2 lucide-cloud-upload-icon lucide-cloud-upload'>
										<path d='M12 13v8' />
										<path d='M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' />
										<path d='m8 17 4-4 4 4' />
									</svg>
									Загрузить из JSON
								</>
							)}
						</button>

						<button
							type='button'
							onClick={downloadSampleJSON}
							className='px-4 py-2 bg-white hover:bg-neutral-50 text-blue-600 border border-blue-300 rounded-lg flex items-center shadow-sm transition-colors'>
							<svg
								className='w-4.5 h-4.5 mr-2'
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
							Скачать пример JSON
						</button>
					</div>
				</div>

				{bloggers.map((blogger, index) => (
					<div
						key={index}
						className='mb-8 p-4 border border-neutral-200 bg-neutral-50 rounded-lg'>
						<h3 className='text-lg font-semibold mb-4'>
							{isBusinessMode ? `Блогер ${index + 1}` : 'Ваши данные'}
						</h3>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
							{/* Базовые данные */}
							<div className='flex flex-col mb-2'>
								<label className='text-sm font-medium mb-1'>
									Имя/ник блогера <span className='text-red-500'>*</span>
								</label>
								<input
									type='text'
									value={blogger.name}
									onChange={(e) => handleChange(index, 'name', e.target.value)}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
										shouldShowError(index, 'name') ? errorFieldStyle : ''
									}`}
									placeholder='Введите имя или ник'
								/>
								{shouldShowError(index, 'name') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
								)}
							</div>

							<div className='flex flex-col mb-2'>
								<label className='text-sm font-medium mb-1'>Платформа</label>
								<select
									value={blogger.platform}
									onChange={(e) =>
										handleChange(index, 'platform', e.target.value)
									}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors`}>
									<option value=''>Выберите платформу</option>
									<option value='Instagram'>Instagram</option>
									<option value='YouTube'>YouTube</option>
									<option value='TikTok'>TikTok</option>
									<option value='Telegram'>Telegram</option>
									<option value='ВКонтакте'>ВКонтакте</option>
									<option value='X'>X (Twitter)</option>
									<option value='Facebook'>Facebook</option>
								</select>
							</div>

							<div className='flex flex-col mb-2'>
								<label className='text-sm font-medium mb-1'>
									Категория контента
								</label>
								<select
									value={blogger.category}
									onChange={(e) =>
										handleChange(index, 'category', e.target.value)
									}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors`}>
									<option value=''>Выберите категорию</option>
									<option value='Fashion'>Мода</option>
									<option value='Beauty'>Красота</option>
									<option value='Lifestyle'>Лайфстайл</option>
									<option value='Food'>Еда</option>
									<option value='Tech'>Технологии</option>
									<option value='Travel'>Путешествия</option>
									<option value='Fitness'>Фитнес</option>
									<option value='Business'>Бизнес</option>
									<option value='Education'>Образование</option>
									<option value='Gaming'>Игры</option>
									<option value='Other'>Другое</option>
								</select>
							</div>

							<div className='flex flex-col mb-2'>
								<label className='text-sm font-medium mb-1'>
									Количество подписчиков <span className='text-red-500'>*</span>
								</label>
								<input
									value={blogger.subscribers}
									onChange={(e) =>
										handleChange(index, 'subscribers', e.target.value)
									}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
										shouldShowError(index, 'subscribers') ? errorFieldStyle : ''
									}`}
									placeholder='Например, 10000'
								/>
								{shouldShowError(index, 'subscribers') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
								)}
							</div>

							<div className='flex flex-col mb-2'>
								<label className='text-sm font-medium mb-1'>
									Количество подписок <span className='text-red-500'>*</span>
								</label>
								<input
									value={blogger.subscriptions}
									onChange={(e) =>
										handleChange(index, 'subscriptions', e.target.value)
									}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
										shouldShowError(index, 'subscriptions')
											? errorFieldStyle
											: ''
									}`}
									placeholder='Например, 500'
								/>
								{shouldShowError(index, 'subscriptions') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
								)}
							</div>

							<div className='flex flex-col mb-2'>
								<label className='text-sm font-medium mb-1'>
									Прирост подписчиков за период{' '}
									<span className='text-red-500'>*</span>
								</label>
								<input
									value={blogger.followers_growth}
									onChange={(e) =>
										handleChange(index, 'followers_growth', e.target.value)
									}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
										shouldShowError(index, 'followers_growth')
											? errorFieldStyle
											: ''
									}`}
									placeholder='Например, 500'
								/>
								{shouldShowError(index, 'followers_growth') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
								)}
							</div>

							<div className='flex flex-col mb-2'>
								<label className='text-sm font-medium mb-1'>
									Количество постов за период{' '}
									<span className='text-red-500'>*</span>
								</label>
								<input
									value={blogger.posts}
									onChange={(e) => handleChange(index, 'posts', e.target.value)}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
										shouldShowError(index, 'posts') ? errorFieldStyle : ''
									}`}
									placeholder='Например, 30'
								/>
								{shouldShowError(index, 'posts') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
								)}
							</div>

							<div className='flex flex-col mb-2'>
								<label className='text-sm font-medium mb-1'>
									Частота постов в неделю <span className='text-red-500'>*</span>
								</label>
								<input
									step='0.1'
									value={blogger.post_frequency}
									onChange={(e) =>
										handleChange(index, 'post_frequency', e.target.value)
									}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
										shouldShowError(index, 'post_frequency')
											? errorFieldStyle
											: ''
									}`}
									placeholder='Например, 3.5'
								/>
								{shouldShowError(index, 'post_frequency') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
								)}
							</div>

							<div className='flex flex-col mb-2'>
								<label className='text-sm font-medium mb-1'>
									Общее количество лайков <span className='text-red-500'>*</span>
								</label>
								<input
									value={blogger.likes}
									onChange={(e) => handleChange(index, 'likes', e.target.value)}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
										shouldShowError(index, 'likes') ? errorFieldStyle : ''
									}`}
									placeholder='Например, 5000'
								/>
								{shouldShowError(index, 'likes') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
								)}
							</div>

							<div className='flex flex-col mb-2'>
								<label className='text-sm font-medium mb-1'>
									Общее количество комментариев{' '}
									<span className='text-red-500'>*</span>
								</label>
								<input
									value={blogger.comments}
									onChange={(e) =>
										handleChange(index, 'comments', e.target.value)
									}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
										shouldShowError(index, 'comments') ? errorFieldStyle : ''
									}`}
									placeholder='Например, 500'
								/>
								{shouldShowError(index, 'comments') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
								)}
							</div>

							<div className='flex flex-col mb-2'>
								<label className='text-sm font-medium mb-1'>
									Общее количество репостов{' '}
									<span className='text-red-500'>*</span>
								</label>
								<input
									value={blogger.shares}
									onChange={(e) => handleChange(index, 'shares', e.target.value)}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
										shouldShowError(index, 'shares') ? errorFieldStyle : ''
									}`}
									placeholder='Например, 100'
								/>
								{shouldShowError(index, 'shares') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
								)}
							</div>

							<div className='flex flex-col mb-2'>
								<label className='text-sm font-medium mb-1'>
									Средний охват одного поста{' '}
									<span className='text-red-500'>*</span>
								</label>
								<input
									value={blogger.avg_reach}
									onChange={(e) =>
										handleChange(index, 'avg_reach', e.target.value)
									}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
										shouldShowError(index, 'avg_reach') ? errorFieldStyle : ''
									}`}
									placeholder='Например, 2000'
								/>
								{shouldShowError(index, 'avg_reach') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
								)}
							</div>

							<div className='flex flex-col mb-2'>
								<label className='text-sm font-medium mb-1'>
									Количество упоминаний <span className='text-red-500'>*</span>
								</label>
								<input
									value={blogger.mentions}
									onChange={(e) =>
										handleChange(index, 'mentions', e.target.value)
									}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
										shouldShowError(index, 'mentions') ? errorFieldStyle : ''
									}`}
									placeholder='Например, 20'
								/>
								{shouldShowError(index, 'mentions') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
								)}
							</div>
						</div>

						{/* Блок для стандартных отклонений */}
						<div className='mb-4 mt-6'>
							<h4 className='text-md font-medium mb-2 border-b border-neutral-200 pb-2'>
								Стандартные отклонения (для расчета устойчивости)
							</h4>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div className='flex flex-col justify-between mb-2'>
									<label className='text-sm font-medium mb-1'>
										Отклонение показателя вовлеченности{' '}
										<span className='text-red-500'>*</span>
									</label>
									<input
										value={blogger.engagement_rate_std}
										onChange={(e) =>
											handleChange(
												index,
												'engagement_rate_std',
												e.target.value,
											)
										}
										className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
											shouldShowError(index, 'engagement_rate_std')
												? errorFieldStyle
												: ''
										}`}
										placeholder='Например, 0.5'
									/>
									{shouldShowError(index, 'engagement_rate_std') && (
										<p className='text-red-500 text-xs mt-1'>
											Обязательное поле
										</p>
									)}
								</div>

								<div className='flex flex-col justify-between mb-2'>
									<label className='text-sm font-medium mb-1'>
										Отклонение частоты постов{' '}
										<span className='text-red-500'>*</span>
									</label>
									<input
										value={blogger.post_frequency_std}
										onChange={(e) =>
											handleChange(
												index,
												'post_frequency_std',
												e.target.value,
											)
										}
										className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
											shouldShowError(index, 'post_frequency_std')
												? errorFieldStyle
												: ''
										}`}
										placeholder='Например, 0.8'
									/>
									{shouldShowError(index, 'post_frequency_std') && (
										<p className='text-red-500 text-xs mt-1'>
											Обязательное поле
										</p>
									)}
								</div>

								<div className='flex flex-col justify-between mb-2'>
									<label className='text-sm font-medium mb-1'>
										Отклонение охвата <span className='text-red-500'>*</span>
									</label>
									<input
										value={blogger.reach_std}
										onChange={(e) =>
											handleChange(index, 'reach_std', e.target.value)
										}
										className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
											shouldShowError(index, 'reach_std')
												? errorFieldStyle
												: ''
										}`}
										placeholder='Например, 200'
									/>
									{shouldShowError(index, 'reach_std') && (
										<p className='text-red-500 text-xs mt-1'>
											Обязательное поле
										</p>
									)}
								</div>
							</div>
							<p className='text-xs text-neutral-500 mt-1'>
								Укажите стандартные отклонения метрик за последние 3 месяца для
								расчета стабильности влияния. Если точные значения неизвестны,
								укажите примерные оценки.
							</p>
						</div>

						{isBusinessMode && bloggers.length > 1 && (
							<button
								type='button'
								onClick={() => removeBlogger(index)}
								className='mt-2 bg-gradient-to-t from-red-700 to-red-500 shadow-[0_1px_2px_0px_inset_rgba(255,255,255,0.4)] text-white py-2 px-4 rounded-md text-sm'>
								Удалить блогера
							</button>
						)}
					</div>
				))}

				{isBusinessMode && (
					<button
						type='button'
						onClick={addBlogger}
						className='mb-6 bg-gradient-to-t from-blue-600 to-blue-500 hover:from-[#1056ec] hover:to-[#2472e7] shadow-[0_1px_2px_0px_inset_rgba(255,255,255,0.4)] text-white font-medium py-2 px-4 rounded-lg'>
						+ Добавить еще блогера
					</button>
				)}

				{formError && (
					<div className='text-red-500 mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
						<p className='font-medium'>Ошибка при отправке формы:</p>
						<p>{formError}</p>
					</div>
				)}

				<div className='flex justify-center'>
					<button
						type='submit'
						className='px-6 py-3 bg-gradient-to-t from-blue-600 to-blue-500 hover:from-[#1056ec] hover:to-[#2472e7] shadow-[0_1px_2px_0px_inset_rgba(255,255,255,0.4)] text-white rounded-lg text-lg font-medium'>
						Рассчитать показатели влияния
					</button>
				</div>
			</form>
		);
	},
);

InputForm.displayName = 'InputForm';

export default InputForm;
