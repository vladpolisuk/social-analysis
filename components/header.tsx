'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
	const pathname = usePathname();

	const isInstructionPage = pathname === '/instruction';

	return (
		<header className='px-4 h-[70px] bg-neutral-100 border border-b border-neutral-200 text-black'>
			<div className='container mx-auto flex justify-center items-center'>
				<div className='flex items-center justify-between gap-4 w-full max-w-4xl'>
					<Link
						className='h-[70px] flex items-center'
						href='/'>
						<Image
							src='/logo.svg'
							alt='logo'
							priority
							draggable={false}
							width={140}
							height={20}
							loading='eager'
							className='w-auto select-none h-5 invert'
						/>
					</Link>

					<nav className='flex items-center gap-4'>
						<Link
							className={`h-[70px] flex items-center ${
								isInstructionPage
									? 'text-neutral-800'
									: 'hover:text-neutral-800 text-neutral-500'
							}`}
							href='/instruction'>
							<p>Инструкция</p>
						</Link>
					</nav>
				</div>
			</div>
		</header>
	);
};

export default Header;
