'use client';

import Image from 'next/image';
import { useState } from 'react';
import ExpertLoginModal, { checkExpertSession } from './expert-login-modal';

interface ModeSelectorProps {
	isBusinessMode: boolean;
	isExpertMode: boolean;
	isAdminMode?: boolean;
	onModeChange: (mode: string, isExpert: boolean, isAdmin?: boolean) => void;
	hasUserInput?: boolean; // Флаг, указывающий, есть ли введенные пользователем данные
}

export default function ModeSelector({
	isBusinessMode,
	isExpertMode,
	isAdminMode = false,
	onModeChange,
	hasUserInput = false, // По умолчанию считаем, что пользователь ничего не ввел
}: ModeSelectorProps) {
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [pendingModeChange, setPendingModeChange] = useState<{
		mode: string;
		isExpert: boolean;
		isAdmin?: boolean;
	} | null>(null);

	// Обработчик нажатия на кнопку переключения режима
	const handleModeButtonClick = (
		mode: string,
		isExpert: boolean,
		isAdmin: boolean = isAdminMode,
	) => {
		// Если выбран тот же режим, что и сейчас - ничего не делаем
		if (
			(mode === 'business') === isBusinessMode &&
			isExpert === isExpertMode &&
			isAdmin === isAdminMode
		) {
			return;
		}

		// Если пользователь хочет включить режим эксперта или админа
		if ((isExpert && !isExpertMode) || (isAdmin && !isAdminMode)) {
			// Если уже есть активная сессия
			if (checkExpertSession()) {
				// Сразу меняем режим
				directModeChange(mode, isExpert, isAdmin);
			} else {
				// Иначе показываем модальное окно входа
				setPendingModeChange({ mode, isExpert, isAdmin });
				setShowLoginModal(true);
			}
			return;
		}

		// Если пользователь хочет выключить режим эксперта или админа
		if ((!isExpert && isExpertMode) || (!isAdmin && isAdminMode)) {
			// Спрашиваем подтверждение только если есть введенные данные
			if (hasUserInput) {
				setPendingModeChange({ mode, isExpert, isAdmin });
				setShowConfirmModal(true);
			} else {
				directModeChange(mode, isExpert, isAdmin);
			}
			return;
		}

		// Если меняется только режим (бизнес/блогер)
		if (hasUserInput) {
			// Если есть данные, спрашиваем подтверждение
			setPendingModeChange({ mode, isExpert, isAdmin });
			setShowConfirmModal(true);
		} else {
			// Иначе сразу меняем режим
			directModeChange(mode, isExpert, isAdmin);
		}
	};

	// Прямое изменение режима без подтверждения
	const directModeChange = (mode: string, isExpert: boolean, isAdmin: boolean = isAdminMode) => {
		onModeChange(mode, isExpert, isAdmin);
	};

	// Подтверждение смены режима
	const confirmModeChange = () => {
		if (pendingModeChange) {
			directModeChange(
				pendingModeChange.mode,
				pendingModeChange.isExpert,
				pendingModeChange.isAdmin,
			);
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
			directModeChange(
				pendingModeChange.mode,
				pendingModeChange.isExpert,
				pendingModeChange.isAdmin,
			);
		}
		setShowLoginModal(false);
		setPendingModeChange(null);
	};

	// Отмена входа в режим эксперта
	const handleLoginCancel = () => {
		setShowLoginModal(false);
		setPendingModeChange(null);
	};

	// Переключатель режима админа
	const toggleAdminMode = () => {
		handleModeButtonClick(isBusinessMode ? 'business' : 'blogger', isExpertMode, !isAdminMode);
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

					<div className='flex gap-2'>
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
									isAdminMode,
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

						{isExpertMode && (
							<button
								className={`px-4 w-[150px] flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
									isAdminMode
										? 'bg-gradient-to-t from-red-700 to-red-500 hover:from-[#b71c1c] hover:to-[#ef5350] shadow-[0_1px_2px_0px_inset_rgba(255,255,255,0.4)] text-white'
										: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'
								}`}
								onClick={toggleAdminMode}>
								{isAdminMode ? 'Выйти' : 'Админ'}
								<Image
									src='/admin.svg'
									alt='admin'
									width={20}
									height={20}
									draggable={false}
									className={`w-5 h-5 select-none opacity-60 mb-[1px] ${
										isAdminMode ? 'invert opacity-100' : ''
									}`}
								/>
							</button>
						)}
					</div>
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
