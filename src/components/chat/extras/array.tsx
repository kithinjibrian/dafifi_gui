import { Button } from "@/components/ui/button";
import { useChatsStore } from "@/store/chats";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { ArrayDash } from "./array-dash";

export const ArrayUI = () => {
    const [array, setArray] = useState([]);
    const { active, getArrayAll } = useChatsStore();

    if (!active) {
        return null;
    }

    useEffect(() => {
        const fun = async () => {
            setArray(await getArrayAll(active.id));
        }

        fun();
    }, [])

    return (
        <div>
            {array.map((arr: any) => (
                <div
                    key={arr.id}
                    className="p-2 cursor-pointer flex flex-row items-center justify-between group"
                >
                    <div>
                        {arr.nickname}
                    </div>
                    <div className="flex flex-row">
                        <ArrayDash
                            id={arr.id}
                        />
                        <Button
                            variant="ghost"
                            onClick={async () => {

                            }}
                        >
                            Delete
                            <Trash size={"20"} />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}