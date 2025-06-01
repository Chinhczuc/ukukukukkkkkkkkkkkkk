import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

// Pages
import Dashboard from "@/pages/dashboard";
import Clans from "@/pages/clans";
import Register from "@/pages/register";
import Ranking from "@/pages/ranking";
import Announcements from "@/pages/announcements";
import Admin from "@/pages/admin";
import ClanManagement from "@/pages/clan-management";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/clans" component={Clans} />
      <Route path="/register" component={Register} />
      <Route path="/ranking" component={Ranking} />
      <Route path="/announcements" component={Announcements} />
      <Route path="/admin" component={Admin} />
      <Route path="/clan-management" component={ClanManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-slate-900 text-white">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">
              <div className="max-w-7xl mx-auto">
                <Router />
              </div>
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
