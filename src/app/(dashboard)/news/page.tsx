"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Landmark } from "lucide-react";
import { NewsCard } from "@/components/news/news-card";
import { usePublicNews } from "@/hooks/useNewsArticleApi";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton loader component for news cards
function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-48 bg-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />

        {/* Summary skeleton */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        {/* Meta info skeleton */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton grid
function NewsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const { data: newsArticles, isLoading: loading, error } = usePublicNews();

  // Filter news based on the selected tab
  const filteredNews = Array.isArray(newsArticles)
    ? newsArticles.filter((news) => {
        if (activeTab === "company") {
          // Show only company news
          return news.authorType === "COMPANY";
        } else {
          // Show institutional news (GOVERNMENT and NGO)
          return news.authorType === "GOVERNMENT" || news.authorType === "NGO";
        }
      })
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Centro de Noticias</h1>
        <p className="text-gray-600">
          Mantente informado sobre las últimas novedades y oportunidades
        </p>
      </div>

      <Tabs
        defaultValue="company"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="company" className="flex items-center gap-2 py-3">
            <Building2 className="w-4 h-4" />
            Noticias Empresariales
          </TabsTrigger>
          <TabsTrigger
            value="institutional"
            className="flex items-center gap-2 py-3"
          >
            <Landmark className="w-4 h-4" />
            Noticias Institucionales
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="company" className="mt-0">
              {loading ? (
                <NewsLoadingSkeleton />
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">
                    Error al cargar las noticias: {error.message}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNews.length > 0 ? (
                    filteredNews.map((news) => (
                      <NewsCard key={news.id} news={news} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-600">
                        {activeTab === "company"
                          ? "No hay noticias empresariales disponibles"
                          : "No hay noticias institucionales disponibles"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="institutional" className="mt-0">
              {loading ? (
                <NewsLoadingSkeleton />
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">
                    Error al cargar las noticias: {error.message}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNews.length > 0 ? (
                    filteredNews.map((news) => (
                      <NewsCard key={news.id} news={news} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-600">
                        {activeTab === "company"
                          ? "No hay noticias empresariales disponibles"
                          : "No hay noticias institucionales disponibles"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
