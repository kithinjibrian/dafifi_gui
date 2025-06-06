import { Button } from "@/components/ui/button";
import { useChatsStore } from "@/store/chats";
import { useEffect, useState } from "react";

export const Desktop = () => {
    const [loading, setLoading] = useState(false);
    const { active, createSandbox, refreshChat } = useChatsStore();

    if (!active) return <div>Loading...</div>

    useEffect(() => {
        refreshChat();
    }, []);

    if (!active.sandbox) return (
        <div className="py-3 border-b flex items-center justify-center">
            <Button
                className="bg-sky-500 text-foreground"
                onClick={async () => {
                    setLoading(true);
                    await createSandbox(active.id);
                    setLoading(false);
                }}>
                {loading ? "Launching..." : "Launch Instance"}
            </Button>
        </div>
    )

    return (
        <div style={{ width: '100%', height: '85vh' }}>
            <iframe
                title="Ubuntu Desktop"
                src={`https://${active.id}.dafifi.net/vnc.html?autoconnect=true&resize=remote&password=${active.sandbox.password}`}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                }}
            />
        </div>
    )
}