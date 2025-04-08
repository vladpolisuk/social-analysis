'use client';

import { useEffect, useState } from 'react';

interface ExpertLoginModalProps {
	onSuccess: () => void;
	onCancel: () => void;
	isOpen: boolean;
}

const EXPERT_PASSWORD = process.env.NEXT_PUBLIC_EXPERT_PASSWORD; // Здесь должен быть хеш пароля в реальном приложении
const EXPERT_SESSION_KEY = 'expertSession';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

export default function ExpertLoginModal({ onSuccess, onCancel, isOpen }: ExpertLoginModalProps) {
	const [password, setPassword] = useState('');
	const [error, setError] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		// При открытии модального окна сбрасываем ошибку и поле пароля
		if (isOpen) {
			setPassword('');
			setError(false);
			setShowPassword(false);
		}
	}, [isOpen]);

	// Проверка пароля и создание сессии
	const handleLogin = () => {
		if (password === EXPERT_PASSWORD) {
			// Успешный вход - сохраняем сессию
			const expiryTime = Date.now() + SESSION_DURATION;
			localStorage.setItem(EXPERT_SESSION_KEY, expiryTime.toString());

			// Вызываем коллбэк успешного логина
			setError(false);
			onSuccess();
		} else {
			// Неверный пароль
			setError(true);
		}
	};

	// Обработка нажатия Enter
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleLogin();
		}
	};

	// Переключение видимости пароля
	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50'>
			<div className='bg-white rounded-lg shadow-xl max-w-md p-6 mx-4 animate-fadeIn w-full'>
				<h3 className='text-xl font-semibold mb-4'>Вход в режим эксперта</h3>

				<div className='mb-4'>
					<label
						htmlFor='expertPassword'
						className='block text-sm font-medium text-gray-700 mb-1'>
						Пароль эксперта
					</label>
					<div className='relative'>
						<input
							autoFocus
							type={showPassword ? 'text' : 'password'}
							id='expertPassword'
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								setError(false);
							}}
							onKeyDown={handleKeyDown}
							className={`w-full p-2 pr-10 border ${
								error ? 'border-red-500' : 'border-gray-300'
							} rounded-md`}
							placeholder='Введите пароль эксперта'
						/>
						<button
							type='button'
							onClick={togglePasswordVisibility}
							className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5'>
							{showPassword ? (
								<svg
									className='h-5 w-5 text-gray-500'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
									/>
								</svg>
							) : (
								<svg
									className='h-5 w-5 text-gray-500'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
									/>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
									/>
								</svg>
							)}
						</button>
					</div>
					{error && <p className='text-red-500 text-sm mt-1'>Неверный пароль</p>}
				</div>

				<div className='flex justify-end gap-3'>
					<button
						onClick={onCancel}
						className='px-4 py-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors'>
						Отмена
					</button>
					<button
						onClick={handleLogin}
						className='px-4 py-2 bg-gradient-to-t from-purple-700 to-purple-500 hover:from-[#7100bd] hover:to-[#9618f0] shadow-[0_1px_2px_0px_inset_rgba(255,255,255,0.4)] text-white rounded-lg transition-colors'>
						Войти
					</button>
				</div>
			</div>
		</div>
	);
}

// Функция для проверки сессии эксперта
export function checkExpertSession(): boolean {
	const sessionExpiry = localStorage.getItem(EXPERT_SESSION_KEY);

	if (!sessionExpiry) return false;

	const expiryTime = parseInt(sessionExpiry, 10);
	const currentTime = Date.now();

	if (currentTime > expiryTime) {
		// Сессия истекла - удаляем из хранилища
		localStorage.removeItem(EXPERT_SESSION_KEY);
		return false;
	}

	return true;
}

// Функция для выхода из режима эксперта
export function logoutExpert(): void {
	localStorage.removeItem(EXPERT_SESSION_KEY);
}
