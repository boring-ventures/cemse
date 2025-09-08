"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Landmark,
  Newspaper,
  AlertCircle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { NewsCard } from "@/components/news/news-card";
import { usePublicNews } from "@/hooks/useNewsArticleApi";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton loader component for news cards
function NewsCardSkeleton() {
  return (
    <Card className="bg-white shadow-sm border-0 overflow-hidden">
      {/* Image skeleton */}
      <div className="relative h-48 bg-gray-100">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Content skeleton */}
      <CardContent className="p-6 space-y-4">
        {/* Title skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>

        {/* Summary skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* Meta info skeleton */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Newspaper className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Centro de Noticias
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Mantente informado sobre las últimas novedades y oportunidades
          </p>
        </div>

        <Tabs
          defaultValue="company"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="company"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              Noticias Empresariales
            </TabsTrigger>
            <TabsTrigger
              value="institutional"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
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
                  <Card className="bg-white shadow-sm border-0">
                    <CardContent className="p-8 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-full">
                          <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Error al cargar noticias
                          </h3>
                          <p className="text-gray-600 mb-4">{error.message}</p>
                          <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Reintentar
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.length > 0 ? (
                      filteredNews.map((news) => (
                        <NewsCard key={news.id} news={news} />
                      ))
                    ) : (
                      <Card className="col-span-full bg-white shadow-sm border-0">
                        <CardContent className="p-8 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-full">
                              <TrendingUp className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {activeTab === "company"
                                  ? "No hay noticias empresariales"
                                  : "No hay noticias institucionales"}
                              </h3>
                              <p className="text-gray-600">
                                {activeTab === "company"
                                  ? "Las empresas aún no han publicado noticias. Vuelve pronto para ver las últimas novedades."
                                  : "Las instituciones aún no han publicado noticias. Vuelve pronto para ver las últimas novedades."}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="institutional" className="mt-0">
                {loading ? (
                  <NewsLoadingSkeleton />
                ) : error ? (
                  <Card className="bg-white shadow-sm border-0">
                    <CardContent className="p-8 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-full">
                          <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Error al cargar noticias
                          </h3>
                          <p className="text-gray-600 mb-4">{error.message}</p>
                          <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Reintentar
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.length > 0 ? (
                      filteredNews.map((news) => (
                        <NewsCard key={news.id} news={news} />
                      ))
                    ) : (
                      <Card className="col-span-full bg-white shadow-sm border-0">
                        <CardContent className="p-8 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-full">
                              <TrendingUp className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {activeTab === "company"
                                  ? "No hay noticias empresariales"
                                  : "No hay noticias institucionales"}
                              </h3>
                              <p className="text-gray-600">
                                {activeTab === "company"
                                  ? "Las empresas aún no han publicado noticias. Vuelve pronto para ver las últimas novedades."
                                  : "Las instituciones aún no han publicado noticias. Vuelve pronto para ver las últimas novedades."}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
