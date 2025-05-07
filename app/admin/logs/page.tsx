'use client';

import { checkExpertSession } from '@/components/expert-login-modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Mock log data for demonstration
const mockLogs = [
	{
		id: 1,
		level: 'info',
		message: 'User login successful',
		timestamp: '2023-06-15T10:30:45.123Z',
		source: 'auth-service',
	},
	{
		id: 2,
		level: 'warning',
		message: 'API rate limit approaching threshold',
		timestamp: '2023-06-15T11:15:22.456Z',
		source: 'api-gateway',
	},
	{
		id: 3,
		level: 'error',
		message: 'Database connection failed',
		timestamp: '2023-06-15T12:05:17.789Z',
		source: 'data-service',
	},
	{
		id: 4,
		level: 'info',
		message: 'Background job completed successfully',
		timestamp: '2023-06-15T13:22:33.012Z',
		source: 'job-scheduler',
	},
	{
		id: 5,
		level: 'error',
		message: 'Failed to process user request',
		timestamp: '2023-06-15T14:45:10.345Z',
		source: 'web-server',
	},
	{
		id: 6,
		level: 'info',
		message: 'System backup completed',
		timestamp: '2023-06-15T15:30:00.678Z',
		source: 'backup-service',
	},
	{
		id: 7,
		level: 'warning',
		message: 'Memory usage high on server node-03',
		timestamp: '2023-06-15T16:17:42.901Z',
		source: 'monitoring',
	},
	{
		id: 8,
		level: 'info',
		message: 'New user registered',
		timestamp: '2023-06-15T17:05:55.234Z',
		source: 'auth-service',
	},
];

export default function SystemLogs() {
	const router = useRouter();
	const [logs, setLogs] = useState(mockLogs);
	const [filter, setFilter] = useState('all');

	useEffect(() => {
		// Check if user has expert session
		if (!checkExpertSession()) {
			// If not, redirect to homepage
			router.push('/');
			return;
		}
	}, [router]);

	const filteredLogs = filter === 'all' ? logs : logs.filter((log) => log.level === filter);

	const handleFilterChange = (newFilter: string) => {
		setFilter(newFilter);
	};

	return (
		<div className='w-full max-w-6xl mx-auto p-6'>
			<div className='flex items-center justify-between mb-6'>
				<h1 className='text-2xl font-semibold'>Системные журналы</h1>
				<Link
					href='/'
					className='px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors'>
					Вернуться на главную
				</Link>
			</div>

			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6'>
				<h2 className='text-lg font-medium mb-3'>Фильтры</h2>
				<div className='flex gap-2'>
					<button
						onClick={() => handleFilterChange('all')}
						className={`px-3 py-1 rounded ${
							filter === 'all'
								? 'bg-blue-100 text-blue-800'
								: 'bg-gray-100 text-gray-700'
						}`}>
						Все
					</button>
					<button
						onClick={() => handleFilterChange('info')}
						className={`px-3 py-1 rounded ${
							filter === 'info'
								? 'bg-green-100 text-green-800'
								: 'bg-gray-100 text-gray-700'
						}`}>
						Информация
					</button>
					<button
						onClick={() => handleFilterChange('warning')}
						className={`px-3 py-1 rounded ${
							filter === 'warning'
								? 'bg-yellow-100 text-yellow-800'
								: 'bg-gray-100 text-gray-700'
						}`}>
						Предупреждения
					</button>
					<button
						onClick={() => handleFilterChange('error')}
						className={`px-3 py-1 rounded ${
							filter === 'error'
								? 'bg-red-100 text-red-800'
								: 'bg-gray-100 text-gray-700'
						}`}>
						Ошибки
					</button>
				</div>
			</div>

			<div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
				<table className='min-w-full divide-y divide-gray-200'>
					<thead className='bg-gray-50'>
						<tr>
							<th
								scope='col'
								className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Уровень
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Сообщение
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Источник
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Временная метка
							</th>
						</tr>
					</thead>
					<tbody className='bg-white divide-y divide-gray-200'>
						{filteredLogs.map((log) => (
							<tr key={log.id}>
								<td className='px-6 py-4 whitespace-nowrap'>
									<span
										className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${
											log.level === 'info'
												? 'bg-green-100 text-green-800'
												: log.level === 'warning'
												? 'bg-yellow-100 text-yellow-800'
												: 'bg-red-100 text-red-800'
										}`}>
										{log.level}
									</span>
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
									{log.message}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
									{log.source}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
									{new Date(log.timestamp).toLocaleString()}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
