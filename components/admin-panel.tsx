'use client';

import { STORAGE_KEYS } from '@/lib/data';
import { useEffect, useState } from 'react';
import { changeExpertPassword, logoutExpert } from './expert-login-modal';

interface Scenario {
	id: number;
	name: string;
	isActive: boolean;
	description?: string;
}

export default function AdminPanel() {
	const [activeTab, setActiveTab] = useState('scenarios');
	const [showConfirmClearCache, setShowConfirmClearCache] = useState(false);
	const [cacheCleared, setCacheCleared] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [password, setPassword] = useState('');
	const [showPasswordChanged, setShowPasswordChanged] = useState(false);
	const [passwordError, setPasswordError] = useState('');

	const [scenarios, setScenarios] = useState<Scenario[]>([]);

	const [newScenario, setNewScenario] = useState<{
		name: string;
		description: string;
	}>({ name: '', description: '' });

	useEffect(() => {
		const savedScenarios = localStorage.getItem(STORAGE_KEYS.CUSTOM_SCENARIOS);
		if (savedScenarios) {
			try {
				const parsed = JSON.parse(savedScenarios);
				// Обновляем сценарии, но убираем probability, если она присутствует
				setScenarios(
					parsed.map((scenario: any) => ({
						id: scenario.id,
						name: scenario.name,
						isActive: scenario.isActive !== false,
						description: scenario.description || '',
					})),
				);
			} catch (error) {
				console.error('Ошибка при загрузке сценариев:', error);

				// В случае ошибки загружаем стандартные сценарии
				setScenarios([
					{ id: 1, name: 'Увеличение активности', isActive: true },
					{ id: 2, name: 'Повышение вовлеченности', isActive: true },
					{ id: 3, name: 'Коллаборации', isActive: true },
					{ id: 4, name: 'Образовательный контент', isActive: true },
				]);
			}
		} else {
			// Если сценариев нет в localStorage, инициализируем стандартные
			setScenarios([
				{ id: 1, name: 'Увеличение активности', isActive: true },
				{ id: 2, name: 'Повышение вовлеченности', isActive: true },
				{ id: 3, name: 'Коллаборации', isActive: true },
				{ id: 4, name: 'Образовательный контент', isActive: true },
			]);
		}
	}, []);

	useEffect(() => {
		if (scenarios.length > 0) {
			localStorage.setItem(STORAGE_KEYS.CUSTOM_SCENARIOS, JSON.stringify(scenarios));
		}
	}, [scenarios]);

	const handleClearCache = () => {
		const keysToPreserve = [
			STORAGE_KEYS.EXPERT_SESSION,
			STORAGE_KEYS.EXPERT_PASSWORD,
			STORAGE_KEYS.CUSTOM_SCENARIOS,
		];

		// Очистка всех ключей кроме сессии эксперта и пароля
		Object.keys(localStorage).forEach((key) => {
			if (!keysToPreserve.includes(key)) {
				localStorage.removeItem(key);
			}
		});

		setCacheCleared(true);
		setShowConfirmClearCache(false);

		setTimeout(() => {
			setCacheCleared(false);
		}, 3000);
	};

	const handleLogout = () => {
		logoutExpert();
	};

	const handleChangePassword = () => {
		if (!password || password.length < 6) {
			setPasswordError('Пароль должен содержать не менее 6 символов');
			return;
		}

		const success = changeExpertPassword(password);

		if (success) {
			setShowPasswordChanged(true);
			setPasswordError('');
			setPassword('');

			setTimeout(() => {
				setShowPasswordChanged(false);
			}, 3000);
		} else {
			setPasswordError('Не удалось изменить пароль');
		}
	};

	const handleToggleScenario = (id: number) => {
		setScenarios(
			scenarios.map((scenario) =>
				scenario.id === id ? { ...scenario, isActive: !scenario.isActive } : scenario,
			),
		);
	};

	const handleAddScenario = () => {
		if (!newScenario.name) return;

		const maxId = Math.max(0, ...scenarios.map((s) => s.id));
		setScenarios([
			...scenarios,
			{
				id: maxId + 1,
				name: newScenario.name,
				isActive: true,
				description: newScenario.description,
			},
		]);
		setNewScenario({ name: '', description: '' });
	};

	const handleDeleteScenario = (id: number) => {
		// Нельзя удалять предустановленные сценарии (id 1-4)
		if (id <= 4) return;
		setScenarios(scenarios.filter((s) => s.id !== id));
	};

	return (
		<div className='bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto my-6'>
			<h1 className='text-2xl font-bold mb-6'>Панель администратора</h1>

			<div className='flex border-b mb-4'>
				<button
					className={`px-4 py-2 ${
						activeTab === 'scenarios'
							? 'border-b-2 border-blue-500 text-blue-500'
							: 'text-gray-500'
					}`}
					onClick={() => setActiveTab('scenarios')}>
					Сценарии
				</button>
				<button
					className={`px-4 py-2 ${
						activeTab === 'system'
							? 'border-b-2 border-blue-500 text-blue-500'
							: 'text-gray-500'
					}`}
					onClick={() => setActiveTab('system')}>
					Система
				</button>
			</div>

			{activeTab === 'scenarios' && (
				<div>
					<h2 className='text-xl font-semibold mb-4'>Управление сценариями</h2>
					<p className='text-gray-600 mb-4'>
						Здесь вы можете управлять доступными сценариями для анализа. Вероятность
						успеха сценариев рассчитывается автоматически на основе метрик блогера.
					</p>

					<div className='overflow-x-auto'>
						<table className='w-full border-collapse mb-6'>
							<thead>
								<tr className='bg-gray-100'>
									<th className='border p-2 text-left'>Название</th>
									<th className='border p-2 text-left'>Описание</th>
									<th className='border p-2 text-center'>Активен</th>
									<th className='border p-2 text-center'>Действия</th>
								</tr>
							</thead>
							<tbody>
								{scenarios.map((scenario) => (
									<tr key={scenario.id}>
										<td className='border p-2'>{scenario.name}</td>
										<td className='border p-2'>
											{scenario.description || '—'}
										</td>
										<td className='border p-2 text-center'>
											<label className='inline-flex items-center cursor-pointer'>
												<input
													type='checkbox'
													checked={scenario.isActive}
													onChange={() =>
														handleToggleScenario(scenario.id)
													}
													className='form-checkbox h-5 w-5 text-blue-600'
												/>
											</label>
										</td>
										<td className='border p-2 text-center'>
											{scenario.id > 4 && (
												<button
													onClick={() =>
														handleDeleteScenario(scenario.id)
													}
													className='text-red-500 hover:text-red-700'>
													Удалить
												</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className='bg-gray-50 p-4 rounded-lg mb-4'>
						<h3 className='text-lg font-medium mb-2'>Добавить новый сценарий</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Название
								</label>
								<input
									type='text'
									value={newScenario.name}
									onChange={(e) =>
										setNewScenario({ ...newScenario, name: e.target.value })
									}
									className='w-full p-2 border rounded'
									placeholder='Название сценария'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Описание (опционально)
								</label>
								<input
									type='text'
									value={newScenario.description}
									onChange={(e) =>
										setNewScenario({
											...newScenario,
											description: e.target.value,
										})
									}
									className='w-full p-2 border rounded'
									placeholder='Краткое описание сценария'
								/>
							</div>
						</div>
						<button
							onClick={handleAddScenario}
							disabled={!newScenario.name}
							className={`px-4 py-2 rounded ${
								newScenario.name
									? 'bg-blue-500 text-white hover:bg-blue-600'
									: 'bg-gray-300 text-gray-500 cursor-not-allowed'
							}`}>
							Добавить сценарий
						</button>
					</div>

					<div className='mt-6'>
						<div className='bg-blue-50 border-l-4 border-blue-500 p-4'>
							<p className='text-sm text-blue-700'>
								<span className='font-bold'>Примечание:</span> Вероятность успеха
								каждого сценария рассчитывается автоматически на основе текущих
								метрик блогера и математической модели. Например, для сценария
								повышения вовлеченности вероятность выше для блогеров с низким
								текущим показателем ER.
							</p>
						</div>
					</div>
				</div>
			)}

			{activeTab === 'system' && (
				<div>
					<h2 className='text-xl font-semibold mb-4'>Настройки системы</h2>

					<div className='mb-6 p-4 border rounded-lg'>
						<h3 className='text-lg font-medium mb-2'>Очистка кэша</h3>
						<p className='text-gray-600 mb-4'>
							Очистка кэша приложения удалит все сохраненные данные расчетов и ввода,
							кроме сценариев и настроек эксперта.
						</p>
						{!showConfirmClearCache ? (
							<button
								onClick={() => setShowConfirmClearCache(true)}
								className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'>
								Очистить кэш
							</button>
						) : (
							<div>
								<p className='text-amber-600 mb-2'>
									Вы уверены, что хотите очистить кэш? Это действие нельзя
									отменить.
								</p>
								<div className='flex space-x-2'>
									<button
										onClick={handleClearCache}
										className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'>
										Да, очистить
									</button>
									<button
										onClick={() => setShowConfirmClearCache(false)}
										className='px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400'>
										Отмена
									</button>
								</div>
							</div>
						)}
						{cacheCleared && <p className='mt-2 text-green-600'>Кэш успешно очищен!</p>}
					</div>

					<div className='mb-6 p-4 border rounded-lg'>
						<h3 className='text-lg font-medium mb-2'>Изменение пароля эксперта</h3>
						<p className='text-gray-600 mb-2'>
							Изменение пароля для доступа к экспертному режиму.
						</p>
						<div className='flex flex-col md:flex-row md:items-end gap-2'>
							<div className='flex-grow'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Новый пароль
								</label>
								<input
									type='password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className='w-full p-2 border rounded'
									placeholder='Минимум 6 символов'
								/>
								{passwordError && (
									<p className='text-red-500 mt-1'>{passwordError}</p>
								)}
							</div>
							<button
								onClick={handleChangePassword}
								className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
								Изменить пароль
							</button>
						</div>
						{showPasswordChanged && (
							<p className='mt-2 text-green-600'>Пароль успешно изменен!</p>
						)}
					</div>

					<div className='mt-6'>
						<button
							onClick={handleLogout}
							className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'>
							Выйти из режима эксперта
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
