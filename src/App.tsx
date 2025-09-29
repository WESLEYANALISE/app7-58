
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavigationProvider } from "@/context/NavigationContext";
import { AuthProvider } from "@/context/AuthContext";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import { AudioProgressProvider } from "@/context/AudioProgressContext";
import { MediaManagerProvider } from "@/context/MediaManagerContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ResetPasswordScreen } from "@/components/auth/ResetPasswordScreen";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";
import { ProfessoraIAGlobal } from "@/components/ProfessoraIAGlobal";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AIAnalysisDetailPage } from "@/components/AIAnalysisDetailPage";
import { BookDetailPage } from "@/components/BookDetailPage";
import { BookReaderPage } from "@/components/BookReaderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <MediaManagerProvider>
          <AudioPlayerProvider>
            <AudioProgressProvider>
              <NavigationProvider>
                <Toaster />
                <Sonner />
                  <Routes>
                    <Route path="/reset-password" element={<ResetPasswordScreen />} />
                    <Route path="/ai-analysis" element={
                      <ProtectedRoute>
                        <AIAnalysisDetailPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/book/:id" element={
                      <ProtectedRoute>
                        <BookDetailPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/book/read" element={
                      <ProtectedRoute>
                        <BookReaderPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={
                      <ProtectedRoute>
                        <NotFound />
                      </ProtectedRoute>
                    } />
                  </Routes>
                <AudioPlayerBar />
                <ProfessoraIAGlobal />
              </NavigationProvider>
            </AudioProgressProvider>
          </AudioPlayerProvider>
        </MediaManagerProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
