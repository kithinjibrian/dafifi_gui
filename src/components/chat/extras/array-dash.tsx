import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useChatsStore } from "@/store/chats";
import { Eye } from "lucide-react"
import { useEffect, useState } from "react";

export const ArrayDash = ({ id }: { id: string }) => {
    const [items, setItems] = useState([]);
    const { getArrayOne } = useChatsStore();

    useEffect(() => {
        const fun = async () => {
            setItems(await getArrayOne(id));
        }

        fun();
    }, [])

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    onClick={async () => {

                    }}
                >
                    View
                    <Eye size={"20"} />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-screen max-w-screen h-screen">
                <DialogHeader>
                    <DialogTitle>Array Items</DialogTitle>
                    <DialogDescription>
                        array items
                    </DialogDescription>
                </DialogHeader>
                <div>
                    {items.map((item: any, index) => (
                        <div
                            key={index}
                            className="p-2 cursor-pointer flex flex-row items-center justify-between group"
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
