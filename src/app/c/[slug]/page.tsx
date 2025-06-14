'use client'

import Header from "@/components/header";
import { MainArea } from "@/components/chat/main-area";
import { NavBar } from "@/components/chat/nav-bar";
import { PanelProps, RenderPanels } from "@/components/chat/render-panels";
import { useChatsStore } from "@/store/chats";
import { useEffect, useState } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useAuthStore } from "@/store/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/mobile/sidebar";
import { MobileHeader } from "@/components/mobile/header";
import { useIsMobile } from "@/hooks/use-mobile";
import { builtin } from "@kithinji/tlugha-browser";
import { ExtrasSM } from "@/components/mobile/extras";
import { ExtrasMD } from "@/components/chat/extras";


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
        content: MainArea
    },
    {
        id: 3,
        collapsible: true,
        content: ExtrasMD
    }
];

export default function Chat() {
    const isMobile = useIsMobile();
    const { fetchChats, sendMessageWrap } = useChatsStore();

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

    useEffect(() => {
        builtin["user_auto_answer"] = {
            type: "function",
            signature: "<T, U>(args: T) -> U",
            async: true,
            exec: async (args: any[]) => {
                let json = JSON.stringify(args[0]);
                await sendMessageWrap({
                    message: `p{ ${json} }`,
                    sender: "user",
                })
            }
        }
    }, [isAuthenticated]);

    const [open, setOpen] = useState(false)

    return (
        <>
            {isMobile ? (
                <>
                    <SidebarProvider open={open} onOpenChange={setOpen}>
                        <div className="h-screen w-full">
                            <AppSidebar />

                            {!open && (
                                <div className="relative">
                                    <MobileHeader />
                                </div>
                            )}
                            <MainArea panelRef={null} />
                            <ExtrasSM />
                        </div>
                    </SidebarProvider>
                </>
            ) : (
                <>
                    <Header />
                    <RenderPanels panels={panels} direction="horizontal" />
                </>
            )
            }
        </>
    )
}