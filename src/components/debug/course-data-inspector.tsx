"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";

interface CourseDataInspectorProps {
  data: any;
  title?: string;
}

export function CourseDataInspector({ data, title = "Course Data Inspector" }: CourseDataInspectorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const renderValue = (value: any, key: string, depth: number = 0): JSX.Element => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">null</span>;
    }

    if (typeof value === "boolean") {
      return <Badge variant={value ? "default" : "secondary"}>{String(value)}</Badge>;
    }

    if (typeof value === "string") {
      if (value.length > 100) {
        return (
          <div className="max-w-md">
            <span className="text-sm text-gray-600 block truncate">{value}</span>
            <Badge variant="outline" className="text-xs">
              {value.length} chars
            </Badge>
          </div>
        );
      }
      return <span className="text-green-600">"{value}"</span>;
    }

    if (typeof value === "number") {
      return <span className="text-blue-600">{value}</span>;
    }

    if (Array.isArray(value)) {
      return (
        <div className="ml-2">
          <Badge variant="outline" className="mb-2">
            Array ({value.length} items)
          </Badge>
          {value.length > 0 && (
            <Collapsible open={expandedSections.has(`${key}-array`)} onOpenChange={() => toggleSection(`${key}-array`)}>
              <CollapsibleTrigger className="flex items-center text-sm hover:bg-gray-50 p-1 rounded">
                {expandedSections.has(`${key}-array`) ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                Show items
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-4 border-l border-gray-200 pl-2 mt-1">
                {value.slice(0, 5).map((item, index) => (
                  <div key={index} className="mb-2">
                    <span className="text-xs text-gray-500">[{index}]:</span>
                    {renderValue(item, `${key}-${index}`, depth + 1)}
                  </div>
                ))}
                {value.length > 5 && (
                  <div className="text-xs text-gray-400">... and {value.length - 5} more items</div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      );
    }

    if (typeof value === "object") {
      const keys = Object.keys(value);
      return (
        <div className="ml-2">
          <Badge variant="outline" className="mb-2">
            Object ({keys.length} keys)
          </Badge>
          {keys.length > 0 && (
            <Collapsible open={expandedSections.has(`${key}-object`)} onOpenChange={() => toggleSection(`${key}-object`)}>
              <CollapsibleTrigger className="flex items-center text-sm hover:bg-gray-50 p-1 rounded">
                {expandedSections.has(`${key}-object`) ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                Show properties
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-4 border-l border-gray-200 pl-2 mt-1">
                {keys.slice(0, 10).map((objKey) => (
                  <div key={objKey} className="mb-2">
                    <span className="font-medium text-purple-600">{objKey}:</span>{" "}
                    {renderValue(value[objKey], `${key}-${objKey}`, depth + 1)}
                  </div>
                ))}
                {keys.length > 10 && (
                  <div className="text-xs text-gray-400">... and {keys.length - 10} more properties</div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
        >
          <Eye className="h-4 w-4 mr-2" />
          Debug Data
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 z-50 bg-white border border-gray-300 rounded-lg shadow-2xl overflow-hidden flex flex-col">
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {data ? (
            Object.entries(data).map(([key, value]) => (
              <Card key={key} className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">
                    {key}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {renderValue(value, key)}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No data to display</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 border-t border-gray-200 p-2">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Debug Inspector</span>
          <Button
            onClick={() => {
              setExpandedSections(new Set());
            }}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            Collapse All
          </Button>
        </div>
      </div>
    </div>
  );
}
