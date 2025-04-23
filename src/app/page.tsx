'use client'

import Header from "@/components/header";
import { NavBar } from "@/components/chat/nav-bar";
import { PanelProps, RenderPanels } from "@/components/chat/render-panels";
import { Home } from "@/components/home/home";
import { useChatsStore } from "@/store/chats";
import { useEffect } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useAuthStore } from "@/store/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppSidebar } from "@/components/mobile/sidebar";
import { MobileHeader } from "@/components/mobile/header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const panels: PanelProps[] = [
    {
        id: 1,
        content: NavBar,
        defaultSize: 30,
        minSize: 10,
        maxSize: 70,
        collapsible: true,
        collapsedSize: 2.8,
    },
    {
        id: 2,
        direction: 'vertical',
        children: [
            {
                id: 3,
                content: Home
            }
        ]
    }
];

export default function Chat() {
    const isMobile = useIsMobile();
    const { fetchChats } = useChatsStore();

    const { user } = useProtectedRoute();
    const { isAuthenticated, refreshToken } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            refreshToken();
        }
    }, [isAuthenticated, refreshToken]);

    useEffect(() => {
        if (isAuthenticated)
            fetchChats();
    }, [isAuthenticated]);

    return (
        <>
            {isMobile ? (
                <>
                    <SidebarProvider>
                        <div className="w-full">
                            <AppSidebar />
                            <MobileHeader />
                            <Home />
                        </div>
                    </SidebarProvider>
                </>
            ) : (
                <>
                    <Header />
                    <RenderPanels panels={panels} direction="horizontal" />
                </>
            )}
        </>
    )
}