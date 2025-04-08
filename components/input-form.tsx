'use client';

import { BloggerInputData } from '@/lib/types';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

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

const InputForm = forwardRef<
	{ resetForm: () => void; checkIfEmpty: () => boolean },
	InputFormProps
>(({ isBusinessMode, onSubmit, onInputChange }, ref) => {
	const [bloggers, setBloggers] = useState<BloggerInputData[]>([createEmptyBlogger()]);
	const [formError, setFormError] = useState<string | null>(null);
	const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
	const [attemptedSubmit, setAttemptedSubmit] = useState(false);

	// Проверяет, пуста ли форма
	const checkIfEmpty = (): boolean => {
		// Проверяем все блогеры и их поля
		for (const blogger of bloggers) {
			// Если хотя бы одно поле заполнено, форма не пуста
			if (
				blogger.name ||
				blogger.platform ||
				blogger.category ||
				blogger.subscribers ||
				blogger.followers_growth ||
				blogger.posts ||
				blogger.post_frequency ||
				blogger.likes ||
				blogger.comments ||
				blogger.shares ||
				blogger.avg_reach ||
				blogger.mentions ||
				blogger.engagement_rate_std ||
				blogger.post_frequency_std ||
				blogger.reach_std
			) {
				return false;
			}
		}
		return true; // Если дошли до сюда, значит все поля пусты
	};

	// Предоставляем методы для использования через ref
	useImperativeHandle(ref, () => ({
		resetForm: () => {
			setBloggers([createEmptyBlogger()]);
			setFormError(null);
			setTouchedFields({});
			setAttemptedSubmit(false);
		},
		checkIfEmpty, // Предоставляем функцию проверки пустоты формы
	}));

	// Отслеживаем изменения в полях формы и сообщаем родительскому компоненту
	useEffect(() => {
		if (onInputChange) {
			const isEmpty = checkIfEmpty();
			onInputChange(isEmpty);
		}
	}, [bloggers, onInputChange]);

	const handleChange = (index: number, field: keyof BloggerInputData, value: string | number) => {
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
			if (!blogger.name || !blogger.platform || !blogger.category) {
				setFormError('Пожалуйста, заполните все текстовые поля.');
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
			(attemptedSubmit || touchedFields[`${index}-${field}`]) && isFieldEmpty(index, field)
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setAttemptedSubmit(true);

		// Преобразование строковых значений в числа перед валидацией
		const processedBloggers = bloggers.map((blogger) => ({
			...blogger,
			subscribers: Number(blogger.subscribers) || 0,
			followers_growth: Number(blogger.followers_growth) || 0,
			posts: Number(blogger.posts) || 0,
			post_frequency: Number(blogger.post_frequency) || 0,
			likes: Number(blogger.likes) || 0,
			comments: Number(blogger.comments) || 0,
			shares: Number(blogger.shares) || 0,
			avg_reach: Number(blogger.avg_reach) || 0,
			mentions: Number(blogger.mentions) || 0,
			engagement_rate_std: Number(blogger.engagement_rate_std) || 0,
			post_frequency_std: Number(blogger.post_frequency_std) || 0,
			reach_std: Number(blogger.reach_std) || 0,
		}));

		setBloggers(processedBloggers);

		if (validateForm()) {
			onSubmit(processedBloggers);
		}
	};

	// Стили для поля с ошибкой
	const errorFieldStyle = 'border-red-500 bg-red-50';

	return (
		<form
			onSubmit={handleSubmit}
			className='w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'>
			<h2 className='text-2xl font-semibold mb-6'>
				{isBusinessMode ? 'Оценка влияния блогеров для бизнеса' : 'Оценка личного влияния'}
			</h2>

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
							<label className='text-sm font-medium mb-1'>
								Платформа <span className='text-red-500'>*</span>
							</label>
							<select
								value={blogger.platform}
								onChange={(e) => handleChange(index, 'platform', e.target.value)}
								className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
									shouldShowError(index, 'platform') ? errorFieldStyle : ''
								}`}>
								<option value=''>Выберите платформу</option>
								<option value='Instagram'>Instagram</option>
								<option value='YouTube'>YouTube</option>
								<option value='TikTok'>TikTok</option>
								<option value='Telegram'>Telegram</option>
								<option value='ВКонтакте'>ВКонтакте</option>
								<option value='X'>X (Twitter)</option>
								<option value='Facebook'>Facebook</option>
							</select>
							{shouldShowError(index, 'platform') && (
								<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
							)}
						</div>

						<div className='flex flex-col mb-2'>
							<label className='text-sm font-medium mb-1'>
								Категория контента <span className='text-red-500'>*</span>
							</label>
							<select
								value={blogger.category}
								onChange={(e) => handleChange(index, 'category', e.target.value)}
								className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
									shouldShowError(index, 'category') ? errorFieldStyle : ''
								}`}>
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
							{shouldShowError(index, 'category') && (
								<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
							)}
						</div>

						<div className='flex flex-col mb-2'>
							<label className='text-sm font-medium mb-1'>
								Количество подписчиков <span className='text-red-500'>*</span>
							</label>
							<input
								value={blogger.subscribers}
								onChange={(e) => handleChange(index, 'subscribers', e.target.value)}
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
								Количество постов за период <span className='text-red-500'>*</span>
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
									shouldShowError(index, 'post_frequency') ? errorFieldStyle : ''
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
								onChange={(e) => handleChange(index, 'comments', e.target.value)}
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
								Общее количество репостов <span className='text-red-500'>*</span>
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
								Средний охват одного поста <span className='text-red-500'>*</span>
							</label>
							<input
								value={blogger.avg_reach}
								onChange={(e) => handleChange(index, 'avg_reach', e.target.value)}
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
								onChange={(e) => handleChange(index, 'mentions', e.target.value)}
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
										handleChange(index, 'engagement_rate_std', e.target.value)
									}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
										shouldShowError(index, 'engagement_rate_std')
											? errorFieldStyle
											: ''
									}`}
									placeholder='Например, 0.5'
								/>
								{shouldShowError(index, 'engagement_rate_std') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
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
										handleChange(index, 'post_frequency_std', e.target.value)
									}
									className={`p-2 border border-neutral-300 rounded-md bg-white transition-colors ${
										shouldShowError(index, 'post_frequency_std')
											? errorFieldStyle
											: ''
									}`}
									placeholder='Например, 0.8'
								/>
								{shouldShowError(index, 'post_frequency_std') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
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
										shouldShowError(index, 'reach_std') ? errorFieldStyle : ''
									}`}
									placeholder='Например, 200'
								/>
								{shouldShowError(index, 'reach_std') && (
									<p className='text-red-500 text-xs mt-1'>Обязательное поле</p>
								)}
							</div>
						</div>
						<p className='text-xs text-neutral-500 mt-1'>
							Укажите стандартные отклонения метрик за последние 3 месяца для расчета
							стабильности влияния. Если точные значения неизвестны, укажите примерные
							оценки.
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
});

InputForm.displayName = 'InputForm';

export default InputForm;
