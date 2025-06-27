// Provider principal qui remplace le SessionProvider de NextAuth
'use client';

import React from 'react';
import { AuthProvider } from './auth-context';

interface AppProvidersProps {
    children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
