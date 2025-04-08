const Footer = () => {
	return (
		<div>
			<footer className='px-4 pb-8 py-4 text-white'>
				<div className='container mx-auto flex justify-center items-center'>
					<p className='text-sm text-neutral-500'>
						<a
							href='https://t.me/vladpolisuk'
							className='hover:text-neutral-400 transition-colors'>
							Made by Vladislav
						</a>
					</p>

					<p className='text-sm text-neutral-500'>
						<a
							href='https://github.com/vladpolisuk/social-analysis'
							className='hover:text-neutral-400 transition-colors'>
							GitHub
						</a>
					</p>
				</div>
			</footer>
		</div>
	);
};

export default Footer;
