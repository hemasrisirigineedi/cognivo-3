import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Home from "@/pages/home";
import SubjectPage from "@/pages/subject";
import ChapterPage from "@/pages/chapter";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/subject/:subjectId" component={SubjectPage} />
      <Route path="/subject/:subjectId/chapter/:chapterId" component={ChapterPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="studyai-theme">
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
