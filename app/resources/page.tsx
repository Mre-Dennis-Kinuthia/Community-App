import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, ExternalLink, BookOpen, Lightbulb, Scale } from "lucide-react"

const resourceCategories = [
  {
    title: "Legal & Compliance",
    icon: Scale,
    resources: [
      { name: "Company Registration Guide", type: "PDF", size: "1.2 MB" },
      { name: "Standard NDA Template", type: "DOCX", size: "45 KB" },
    ],
  },
  {
    title: "Marketing & Growth",
    icon: Lightbulb,
    resources: [
      { name: "Social Media Strategy 2026", type: "PDF", size: "3.5 MB" },
      { name: "Pitch Deck Checklist", type: "PDF", size: "800 KB" },
    ],
  },
  {
    title: "Tech & Product",
    icon: BookOpen,
    resources: [
      { name: "Nairobi Tech Ecosystem Map", type: "Link", size: "External" },
      { name: "MVP Development Framework", type: "PDF", size: "2.1 MB" },
    ],
  },
]

export default function ResourcesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
          <p className="text-muted-foreground">
            Access curated guides, templates, and tools to help your business grow.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {resourceCategories.map((category, i) => {
            const Icon = category.icon
            return (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>Curated tools and guides.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {category.resources.map((res, j) => (
                    <div key={j} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{res.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{res.type}</span>
                            <span>•</span>
                            <span>{res.size}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {res.type === "Link" ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>Can't find what you're looking for?</CardTitle>
            <CardDescription>Suggest a resource or template for the community library.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Suggest Resource</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
