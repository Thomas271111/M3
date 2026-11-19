import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { BottomNav } from "./BottomNav.jsx";
import { LoadingBlock, ErrorBlock } from "../ui/DataStatus.jsx";
import { useAppData } from "../../context/DataContext.jsx";

export function AppShell() {
  const { status, reload } = useAppData();

  return (
    <div>
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-dvh">
        {status === "ready" && <Outlet />}
        {status === "loading" && <LoadingBlock label="Cargando tu hato…" />}
        {status === "error" && <ErrorBlock onRetry={reload} />}
      </div>
      <BottomNav />
    </div>
  );
}
