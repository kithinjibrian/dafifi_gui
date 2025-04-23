import {
    Sidebar,
    SidebarContent,
} from "@/components/ui/sidebar"
import { NavBar } from "../chat/nav-bar"

export const AppSidebar = () => {
    return (
        <Sidebar className="z-100">
            <SidebarContent>
                <NavBar panelRef={null} />
            </SidebarContent>
        </Sidebar>
    )
}