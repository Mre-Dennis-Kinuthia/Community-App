"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { startNavigation } from "@/lib/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SearchResult {
  id: string
  title: string
  type: "event" | "member" | "project" | "partner" | "resource" | "news"
  href: string
  description?: string
}

const typeLabels: Record<string, string> = {
  event: "Event",
  member: "Member",
  project: "Project",
  partner: "Partner",
  resource: "Resource",
  news: "News",
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recentSearches")
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    }
  }, [])

  const saveSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5)
    setRecentSearches(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("recentSearches", JSON.stringify(updated))
    }
  }

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => {
        const input = document.querySelector('[data-search-input]') as HTMLInputElement
        input?.focus()
      })
      return () => cancelAnimationFrame(id)
    }
  }, [open])

  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    const controller = new AbortController()
    setIsSearching(true)
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
        credentials: "include",
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : { results: [] }))
        .then((data) => {
          setSearchResults(data.results || [])
        })
        .catch((err) => {
          if (err?.name !== "AbortError") {
            console.error("Search error:", err)
          }
          setSearchResults([])
        })
        .finally(() => setIsSearching(false))
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const filteredResults = searchResults

  const handleSelect = (href: string, searchTerm?: string) => {
    if (searchTerm) {
      saveSearch(searchTerm)
    }
    startNavigation()
    router.push(href)
    setOpen(false)
    setQuery("")
  }

  const handleSearch = () => {
    if (query.trim() && filteredResults.length > 0) {
      saveSearch(query)
      handleSelect(filteredResults[0].href, query)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-10 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Search for events, members, projects, and more
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                data-search-input
                placeholder="Search events, members, projects..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (filteredResults.length > 0) {
                      handleSelect(filteredResults[0].href, query)
                    } else {
                      handleSearch()
                    }
                  }
                }}
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {isSearching ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : query.length > 0 && filteredResults.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No results found for "{query}"
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground px-2">Results</p>
                  {filteredResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result.href, query)}
                      className="w-full text-left rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{result.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {typeLabels[result.type]}
                        </Badge>
                      </div>
                      {result.description && (
                        <span className="text-xs text-muted-foreground">
                          {result.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSearches.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground px-2">Recent Searches</p>
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(search)
                            // Trigger search
                          }}
                          className="w-full text-left rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            <span>{search}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground px-2">Quick Actions</p>
                    <button
                      onClick={() => handleSelect("/events")}
                      className="w-full text-left rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <span>Browse Events</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSelect("/community")}
                      className="w-full text-left rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <span>Explore Community</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSelect("/projects")}
                      className="w-full text-left rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <span>View Projects</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

