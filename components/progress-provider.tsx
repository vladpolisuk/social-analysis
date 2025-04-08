'use client';

import { ProgressProvider as ProgressProviderComponent } from '@bprogress/next/app';
import { FC, PropsWithChildren } from 'react';

const ProgressProvider: FC<PropsWithChildren> = ({ children }) => {
	return (
		<ProgressProviderComponent
			height='2px'
			color='#111111'
			options={{ showSpinner: false }}
			shallowRouting>
			{children}
		</ProgressProviderComponent>
	);
};

export default ProgressProvider;
