"use client"

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

export default function Header() {
    const { user } = useAuthStore();
    return (
        <div className="flex justify-between w-full border h-[40px] px-2">
            <div className="flex items-center">
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
            {!user && (
                <div>
                    <Link href="/user/login">
                        <Button
                            className="bg-sky-500 text-foreground mr-4">Log in</Button>
                    </Link>
                    <Link href="/user/signup">
                        <Button
                            variant="outline"
                            className="text-sky-500">Sign up</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}