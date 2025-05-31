import { Button } from "@/components/ui/button";
import { useChatsStore } from "@/store/chats";
import { Pause, Pencil, Play, Trash } from "lucide-react";

export const List = ({ type }: { type: string }) => {
    const { active, updateTask } = useChatsStore();

    if (!active) {
        return null;
    }

    if (active.tasks.filter((task: any) => task.type == type).length == 0) {
        return (
            <div className="p-2">
                No tasks found
            </div>
        );
    }

    return (
        <div>
            {active.tasks
                .filter((task: any) => task.type == type)
                .map((task: any) => (
                    <div
                        key={task.id}
                        className="p-2 cursor-pointer flex flex-row items-center justify-between group"
                    >
                        <div>
                            {task.nickname}
                        </div>
                        <div className="flex flex-row">
                            {task.state == "running" ? (
                                <div>
                                    <Button
                                        variant="ghost"
                                        onClick={async () => {
                                            await updateTask(task.id, { state: "stopped" })
                                        }}>
                                        Stop
                                        <Pause
                                            className="text-red-500"
                                            size={"20"}

                                        />
                                    </Button>
                                </div>
                            ) : task.state == "stopped" && (
                                <div>
                                    <Button
                                        variant="ghost"
                                        onClick={async () => {
                                            await updateTask(task.id, { state: "running" })
                                        }}>
                                        Start
                                        <Play
                                            className="text-green-500"
                                            size={"20"}

                                        />
                                    </Button>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                onClick={async () => {

                                }}
                            >
                                Edit
                                <Pencil size={"20"} />
                            </Button>
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