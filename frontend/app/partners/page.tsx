"use client"

import { Suspense, useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Building2, 
  Search, 
  X,
  Globe,
  Handshake,
  TrendingUp,
  Users,
  Briefcase,
  Award,
  ExternalLink,
  Calendar,
  DollarSign,
  Target,
  MapPin,
  CheckCircle2
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import Link from "next/link"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

// Partners will be fetched from API
const partners: any[] = []
