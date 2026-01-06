"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, ExternalLink, BookOpen, Lightbulb, Scale, Search, X } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"

const resourceCategories = [
  {
    id: 1,
    title: "Legal & Compliance",
    icon: Scale,
    resources: [
      { id: 1, name: "Company Registration Guide", type: "PDF", size: "1.2 MB", popular: true },
      { id: 2, name: "Standard NDA Template", type: "DOCX", size: "45 KB", new: true },
    ],
  },
  {
    id: 2,
    title: "Marketing & Growth",
    icon: Lightbulb,
    resources: [
      { id: 3, name: "Social Media Strategy 2026", type: "PDF", size: "3.5 MB", popular: true },
      { id: 4, name: "Pitch Deck Checklist", type: "PDF", size: "800 KB" },
    ],
  },
  {
    id: 3,
    title: "Tech & Product",
    icon: BookOpen,
    resources: [
      { id: 5, name: "Nairobi Tech Ecosystem Map", type: "Link", size: "External", new: true },
      { id: 6, name: "MVP Development Framework", type: "PDF", size: "2.1 MB", popular: true },
    ],
  },
]

const typeColors: Record<string, string> = {
  PDF: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  DOCX: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  Link: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
}

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")

  const filteredCategories = useMemo(() => {
    return resourceCategories.map((category) => {
      const filteredResources = category.resources.filter((resource) => {
        const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = selectedType === "all" || resource.type.toLowerCase() === selectedType.toLowerCase()
        return matchesSearch && matchesType
      })

      return { ...category, resources: filteredResources }
    }).filter((category) => category.resources.length > 0)
  }, [searchQuery, selectedType])

  const allResources = useMemo(() => {
    return resourceCategories.flatMap((cat) => cat.resources)
  }, [])

  const hasActiveFilters = searchQuery || selectedType !== "all"

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Resources" }]} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
          <p className="text-muted-foreground">
            Access curated guides, templates, and tools to help your business grow.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="link">Links</option>
            </select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedType("all")
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No resources found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {filteredCategories.map((category) => {
              const Icon = category.icon
              return (
                <Card key={category.id} className="flex flex-col">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>Curated tools and guides.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    {category.resources.map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center justify-between rounded-lg border p-3 text-sm transition-all hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium truncate">{res.name}</p>
                              {res.popular && (
                                <Badge variant="secondary" className="text-[10px]">Popular</Badge>
                              )}
                              {res.new && (
                                <Badge variant="default" className="text-[10px]">New</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${typeColors[res.type] || ""}`}>
                                {res.type}
                              </span>
                              <span>•</span>
                              <span>{res.size}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => {
                            if (res.type === "Link") {
                              alert(`Opening ${res.name}`)
                            } else {
                              alert(`Downloading ${res.name}`)
                            }
                          }}
                        >
                          {res.type === "Link" ? (
                            <ExternalLink className="h-4 w-4" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>Can't find what you're looking for?</CardTitle>
            <CardDescription>Suggest a resource or template for the community library.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => alert("Resource suggestion form would open here")}
            >
              Suggest Resource
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
