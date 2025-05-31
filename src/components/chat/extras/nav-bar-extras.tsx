import { Braces, Brackets, Clock4, Code, Server as ServerIcon, SquarePen } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { TooltipComponent } from "../../utils/tooltip";
import { Server } from "./server";
import { Cron } from "./cron";
import { ArrayUI } from "./array";
import { useExtrasStore } from "@/store/extras";
import { Editor } from "./editor";
import { CodeEd } from "./code";

const navItems = [
    { value: 'Editor', icon: SquarePen, content: Editor },
    { value: 'Code', icon: Code, content: CodeEd },
    { value: 'Server', icon: ServerIcon, content: Server },
    { value: 'Cronjobs', icon: Clock4, content: Cron },
    { value: 'Array', icon: Brackets, content: ArrayUI },
    { value: 'Map', icon: Braces, content: () => null },
]

export const NavBarExtras = () => {
    const { menu, setMenu } = useExtrasStore();

    const renderNavItems = () =>
        navItems.map((item, index) => (
            <TabsTrigger
                value={item.value}
                key={item.value}
                className="bg-background w-full border-l-4 border-l-transparent data-[state=active]:border-l-sky-900 data-[state=active]:shadow-none">
                <TooltipComponent side="right" description={item.value}>
                    <item.icon size={30} strokeWidth={2} />
                </TooltipComponent>
            </TabsTrigger>
        ));

    const renderTabContents = () =>
        navItems.map((item) => (
            <TabsContent className="m-0 p-0 h-full w-full" value={item.value} key={item.value}>
                {item.content && <item.content />}
            </TabsContent>
        ));


    return (
        <div>
            <Tabs
                value={menu}
                onValueChange={setMenu}
                orientation="vertical"
                className="flex flex-row gap-0 h-[calc(100vh-40px)] w-full">
                <div className="h-full border-x w-16">
                    <TabsList className="m-0 p-0 flex flex-col items-start h-96 w-full">
                        {renderNavItems()}
                    </TabsList>
                </div>
                <div className="flex-1 w-5/6">
                    {renderTabContents()}
                </div>
            </Tabs>
        </div>
    )
}