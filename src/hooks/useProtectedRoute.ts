'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth';

export function useProtectedRoute() {
    const router = useRouter()
    const { user, isHydrated } = useAuthStore();

    useEffect(() => {
        if (isHydrated && !user) {
            router.push('/user/login')
        }
    }, [user, isHydrated, router])

    return { user }
}