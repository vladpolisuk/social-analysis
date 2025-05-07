'use client';

import { checkExpertSession } from '@/components/expert-login-modal';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
	const router = useRouter();

	useEffect(() => {
		// Check if user has expert session
		if (!checkExpertSession()) {
			// If not, redirect to homepage
			router.push('/');
			return;
		}

		// If has session, redirect to homepage with admin mode
		router.push('/?admin=true');
	}, [router]);

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100'>
			<div className='p-8 bg-white rounded-lg shadow-md'>
				<h1 className='text-xl font-semibold mb-2'>Перенаправление...</h1>
				<p className='text-gray-600'>
					Пожалуйста, подождите. Вы будете перенаправлены на панель администратора.
				</p>
			</div>
		</div>
	);
}
