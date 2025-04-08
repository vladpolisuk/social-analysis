import Footer from '@/components/footer';
import Header from '@/components/header';
import ProgressProvider from '@/components/progress-provider';
import type { Metadata } from 'next';
import { Fira_Mono, Lora, Onest } from 'next/font/google';
import './globals.css';

const loraSans = Lora({
	variable: '--font-lora-sans',
	subsets: ['cyrillic', 'latin'],
	weight: ['400', '500', '600', '700'],
});

const onestSans = Onest({
	variable: '--font-onest-sans',
	subsets: ['cyrillic', 'latin'],
	weight: ['300', '400', '500', '600', '700'],
});

const firaMono = Fira_Mono({
	variable: '--font-fira-mono',
	subsets: ['cyrillic', 'latin'],
	weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
	title: 'Анализ влияния в социальных сетях',
	description: 'Приложение для анализа и улучшения влияния в социальных сетях',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='ru'>
			<body
				className={`${loraSans.variable} ${onestSans.variable} ${firaMono.variable} antialiased`}>
				<ProgressProvider>
					<Header />

					<main className='container mx-auto p-6'>
						<div className='mt-8'>{children}</div>
					</main>

					<Footer />
				</ProgressProvider>
			</body>
		</html>
	);
}
