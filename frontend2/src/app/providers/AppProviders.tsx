import { useState } from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthProvider.tsx";
import { ToastProvider } from "../../components/shared/ToastProvider.tsx";
import { CareerDataProvider } from "./CareerDataProvider.tsx";
import { JobRecommendationsProvider } from "./JobRecommendationsProvider.tsx";
import { YouTubeRecommendationsProvider } from "./YouTubeRecommendationsProvider.tsx";

type Props = {
  children: ReactNode;
};

export const AppProviders = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CareerDataProvider>
          <JobRecommendationsProvider>
            <YouTubeRecommendationsProvider>
              <ToastProvider>{children}</ToastProvider>
            </YouTubeRecommendationsProvider>
          </JobRecommendationsProvider>
        </CareerDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
