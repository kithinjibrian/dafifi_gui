'use client'

import Header from "@/components/header";
import { MainArea } from "@/components/chat/main-area";
import { NavBar } from "@/components/chat/nav-bar";
import { PanelProps, RenderPanels } from "@/components/chat/render-panels";
import { useChatsStore } from "@/store/chats";
import { useEffect } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useAuthStore } from "@/store/auth";
import { Artifact } from "@/components/chat/artifact";

const panels: PanelProps[] = [
    {
        id: 1,
        content: NavBar,
        defaultSize: 25,
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
        content: Artifact
    }
];

export default function Chat() {
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
            <Header />
            <RenderPanels panels={panels} direction="horizontal" />
        </>
    )
}