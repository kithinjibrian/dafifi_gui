import { Button } from "@/components/ui/button";
import Link from "next/link";

export const NewChat = () => {
    return (
        <div className="h-full w-full">
            <div className="py-3 border-b flex items-center justify-center">
                <Link href={`/`} className="no-underline">
                    <Button
                        className="bg-sky-500 text-foreground">
                        New Chat
                    </Button>
                </Link>
            </div>
        </div>
    );
}