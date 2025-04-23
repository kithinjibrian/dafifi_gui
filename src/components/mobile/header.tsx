"use client"

import Link from "next/link";
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const MobileHeader = () => {
    return (
        <div className="fixed top-0 z-50 bg-background flex justify-between w-full border h-[40px] px-2">
            <div className="flex items-center w-full">
                <div className="mr-4">
                    <SidebarTrigger />
                </div>
                <Link className="flex items-center" href="/">
                    <Image
                        src="/logo.svg"
                        alt="Dafifi logomark"
                        width={50}
                        height={50}
                    />
                    <div className="font-bold text-xl ml-4 mr-4">
                        Dafifi
                    </div>
                </Link>
            </div>
        </div>
    );
}