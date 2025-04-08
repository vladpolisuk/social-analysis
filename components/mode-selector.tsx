'use client';

import Image from 'next/image';
import { useState } from 'react';
import ExpertLoginModal, { checkExpertSession } from './expert-login-modal';

interface ModeSelectorProps {
	isBusinessMode: boolean;
	isExpertMode: boolean;
	onModeChange: (mode: string, isExpert: boolean) => void;
	hasUserInput?: boolean; // Флаг, указывающий, есть ли введенные пользователем данные
}

export default function ModeSelector({
	isBusinessMode,
	isExpertMode,
	onModeChange,
	hasUserInput = false, // По умолчанию считаем, что пользователь ничего не ввел
}: ModeSelectorProps) {
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [pendingModeChange, setPendingModeChange] = useState<{
		mode: string;
		isExpert: boolean;
	} | null>(null);

	// Обработчик нажатия на кнопку переключения режима
	const handleModeButtonClick = (mode: string, isExpert: boolean) => {
		// Если выбран тот же режим, что и сейчас - ничего не делаем
		if ((mode === 'business') === isBusinessMode && isExpert === isExpertMode) {
			return;
		}

		// Если пользователь хочет включить режим эксперта
		if (isExpert && !isExpertMode) {
			// Если уже есть активная сессия
			if (checkExpertSession()) {
				// Сразу меняем режим
				directModeChange(mode, isExpert);
			} else {
				// Иначе показываем модальное окно входа
				setPendingModeChange({ mode, isExpert });
				setShowLoginModal(true);
			}
			return;
		}

		// Если пользователь хочет выключить режим эксперта
		if (!isExpert && isExpertMode) {
			// Спрашиваем подтверждение только если есть введенные данные
			if (hasUserInput) {
				setPendingModeChange({ mode, isExpert });
				setShowConfirmModal(true);
			} else {
				directModeChange(mode, isExpert);
			}
			return;
		}

		// Если меняется только режим (бизнес/блогер)
		if (hasUserInput) {
			// Если есть данные, спрашиваем подтверждение
			setPendingModeChange({ mode, isExpert });
			setShowConfirmModal(true);
		} else {
			// Иначе сразу меняем режим
			directModeChange(mode, isExpert);
		}
	};

	// Прямое изменение режима без подтверждения
	const directModeChange = (mode: string, isExpert: boolean) => {
		onModeChange(mode, isExpert);
	};

	// Подтверждение смены режима
	const confirmModeChange = () => {
		if (pendingModeChange) {
			directModeChange(pendingModeChange.mode, pendingModeChange.isExpert);
		}
		// Закрываем модальное окно и сбрасываем ожидающее изменение
		setShowConfirmModal(false);
		setPendingModeChange(null);
	};

	// Отмена смены режима
	const cancelModeChange = () => {
		setShowConfirmModal(false);
		setPendingModeChange(null);
	};

	// Успешный вход в режим эксперта
	const handleLoginSuccess = () => {
		if (pendingModeChange) {
			directModeChange(pendingModeChange.mode, pendingModeChange.isExpert);
		}
		setShowLoginModal(false);
		setPendingModeChange(null);
	};

	// Отмена входа в режим эксперта
	const handleLoginCancel = () => {
		setShowLoginModal(false);
		setPendingModeChange(null);
	};

	return (
		<>
			<div className='w-full max-w-4xl mx-auto mb-3 bg-white p-4 rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'>
				<div className='flex flex-col md:flex-row justify-between items-center gap-6'>
					<div className='flex gap-2'>
						<button
							className={`px-6 py-2 rounded-lg transition-colors ${
								isBusinessMode
									? 'bg-gradient-to-t from-blue-600 to-blue-500 hover:from-[#1056ec] hover:to-[#2472e7] shadow-[0_1px_2px_0px_inset_rgba(255,255,255,0.4)] text-white'
									: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'
							}`}
							onClick={() => handleModeButtonClick('business', isExpertMode)}>
							Я - бизнес
						</button>

						<button
							className={`px-6 py-2 rounded-lg transition-colors ${
								!isBusinessMode
									? 'bg-gradient-to-t from-blue-600 to-blue-500 hover:from-[#1056ec] hover:to-[#2472e7] shadow-[0_1px_2px_0px_inset_rgba(255,255,255,0.4)] text-white'
									: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'
							}`}
							onClick={() => handleModeButtonClick('blogger', isExpertMode)}>
							Я - блогер
						</button>
					</div>

					<button
						className={`px-4 w-[150px] flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
							isExpertMode
								? 'bg-gradient-to-t from-purple-700 to-purple-500 hover:from-[#7100bd] hover:to-[#9618f0] shadow-[0_1px_2px_0px_inset_rgba(255,255,255,0.4)] text-white'
								: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'
						}`}
						onClick={() =>
							handleModeButtonClick(
								isBusinessMode ? 'business' : 'blogger',
								!isExpertMode,
							)
						}>
						{isExpertMode ? 'Выйти' : 'Эксперт'}
						<Image
							src='/settings.svg'
							alt='settings'
							width={20}
							height={20}
							draggable={false}
							className={`w-5 h-5 select-none opacity-60 mb-[1px] ${
								isExpertMode ? 'invert opacity-100' : ''
							}`}
						/>
					</button>
				</div>
			</div>

			{/* Модальное окно подтверждения */}
			{showConfirmModal && (
				<div className='fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50'>
					<div className='bg-white rounded-lg shadow-xl max-w-md p-6 mx-4 animate-fadeIn'>
						<h3 className='text-xl font-semibold mb-4'>Изменение режима</h3>
						<p className='text-neutral-700 mb-6'>
							При смене режима все введенные данные будут потеряны. Вы уверены, что
							хотите продолжить?
						</p>
						<div className='flex justify-end gap-3'>
							<button
								onClick={cancelModeChange}
								className='px-4 py-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors'>
								Отмена
							</button>
							<button
								onClick={confirmModeChange}
								className='px-4 py-2 bg-gradient-to-t from-blue-600 to-blue-500 hover:from-[#1056ec] hover:to-[#2472e7] shadow-[0_1px_2px_0px_inset_rgba(255,255,255,0.4)] text-white rounded-lg transition-colors'>
								Продолжить
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Модальное окно входа эксперта */}
			<ExpertLoginModal
				isOpen={showLoginModal}
				onSuccess={handleLoginSuccess}
				onCancel={handleLoginCancel}
			/>
		</>
	);
}
