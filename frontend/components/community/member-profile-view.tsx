"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  MapPin,
  Calendar,
  Mail,
  UserPlus,
  CheckCircle2,
  Clock,
  Users,
  Heart,
  Briefcase,
  CalendarDays,
  Star,
  Loader2,
  Pencil,
  ArrowRight,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { badgeClassForLabel } from "@/lib/badge-styles"
import { FEATURE_FLAGS } from "@/lib/feature-flags"
import { toast } from "@/lib/toast"
import { getInitials } from "@/lib/utils"
import type { CommunityMember } from "@/types/community"

type MemberProfileViewProps = {
  member: CommunityMember
  onRefresh: () => void
}

function ProfileSection({
  title,
  children,
  empty,
}: {
  title: string
  children?: React.ReactNode
  empty?: string
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {empty ? (
        <p className="text-sm text-muted-foreground leading-relaxed">{empty}</p>
      ) : (
        children
      )}
    </section>
  )
}

export function MemberProfileView({ member, onRefresh }: MemberProfileViewProps) {
  const [connectLoading, setConnectLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const bio = member.fullBio || member.bio
  const hasAbout = Boolean(bio?.trim())
  const hasSkills = member.skills.length > 0
  const hasInterests = member.interests.length > 0
  const hasAvailability = member.availability.length > 0
  const projects = member.projects ?? []
  const events = member.recentEvents ?? []

  const handleConnect = async () => {
    if (member.isSelf || member.connectionStatus === "connected") return
    setConnectLoading(true)
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: member.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Could not send connection request")
      }
      toast.success("Request sent", "They will see your connection request in the hub.")
      onRefresh()
    } catch (e) {
      toast.error(
        "Connection failed",
        e instanceof Error ? e.message : "Please try again."
      )
    } finally {
      setConnectLoading(false)
    }
  }

  const handleFollow = async () => {
    if (member.isSelf) return
    setFollowLoading(true)
    try {
      const res = await fetch(
        member.isFollowing
          ? `/api/follow?followingId=${member.id}`
          : "/api/follow",
        {
          method: member.isFollowing ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: member.isFollowing ? undefined : JSON.stringify({ followingId: member.id }),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Could not update follow status")
      }
      toast.success(
        member.isFollowing ? "Unfollowed" : "Following",
        member.isFollowing
          ? "You will no longer see their updates here."
          : "You are now following this member."
      )
      onRefresh()
    } catch (e) {
      toast.error("Follow failed", e instanceof Error ? e.message : "Please try again.")
    } finally {
      setFollowLoading(false)
    }
  }

  const connectLabel = () => {
    switch (member.connectionStatus) {
      case "connected":
        return "Connected"
      case "pending_sent":
        return "Request pending"
      case "pending_received":
        return "Respond to request"
      default:
        return "Connect"
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Community", href: "/community" },
          { label: member.name },
        ]}
      />

      {/* Hero */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-6 py-8 md:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24 shrink-0 border-2 border-background shadow-sm md:h-28 md:w-28">
              <AvatarImage src={member.avatar || undefined} alt={member.name} />
              <AvatarFallback className="text-2xl">
                {getInitials(member.name, member.email)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {member.featured && (
                  <Badge className="bg-primary/10 text-primary border border-primary/20">
                    <Star className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                )}
                {member.experienceLevel && (
                  <Badge variant="outline" className={badgeClassForLabel(member.experienceLevel)}>
                    {member.experienceLevel}
                  </Badge>
                )}
                {member.connectionStatus === "connected" && (
                  <Badge variant="secondary">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Connection
                  </Badge>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{member.name}</h1>
                {(member.role || member.industry) && (
                  <p className="mt-1 text-base text-muted-foreground">
                    {[member.role, member.industry].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {member.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {member.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Member since {format(new Date(member.joinedDate), "MMMM yyyy")}
                </span>
              </div>

              {hasAvailability && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {member.availability.map((item) => (
                    <Badge
                      key={item}
                      variant="outline"
                      className={badgeClassForLabel(item)}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              )}

              {hasAbout && (
                <p className="text-sm leading-relaxed text-foreground/90 max-w-2xl pt-1">
                  {bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {!member.isSelf && (
          <div className="flex flex-col gap-2 border-t border-border px-6 py-4 sm:flex-row sm:flex-wrap md:px-8">
            <Button
              className="sm:min-w-[140px]"
              disabled={
                connectLoading ||
                member.connectionStatus === "connected" ||
                member.connectionStatus === "pending_sent"
              }
              onClick={handleConnect}
            >
              {connectLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {connectLabel()}
            </Button>
            {member.email && (member.isConnected || member.connectionStatus === "connected") && (
              <Button variant="outline" asChild className="sm:min-w-[120px]">
                <a href={`mailto:${member.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              className="sm:min-w-[120px]"
              disabled={followLoading}
              onClick={handleFollow}
            >
              {followLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Heart className="mr-2 h-4 w-4" />
              )}
              {member.isFollowing ? "Following" : "Follow"}
            </Button>
            <Button variant="ghost" asChild className="sm:ml-auto">
              <Link href="/community">
                Back to directory
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {member.isSelf && (
          <div className="border-t border-border px-6 py-4 md:px-8">
            <Button asChild>
              <Link href="/profile">
                <Pencil className="mr-2 h-4 w-4" />
                Edit your profile
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {!hasAbout && (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {member.isSelf
                    ? "Add a short bio on your profile so other members know what you are working on."
                    : "This member has not added a bio yet. Connect to learn more about their work."}
                </p>
                {member.isSelf && (
                  <Button className="mt-4" asChild>
                    <Link href="/profile">Complete profile</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {hasAbout && bio!.length > 280 && (
            <ProfileSection title="About">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {bio}
              </p>
            </ProfileSection>
          )}

          <ProfileSection
            title="Skills"
            empty={
              !hasSkills
                ? member.isSelf
                  ? "Add skills on your profile to help others find you."
                  : "No skills listed yet."
                : undefined
            }
          >
            {hasSkills ? (
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : null}
          </ProfileSection>

          {hasInterests && (
            <ProfileSection title="Interests">
              <div className="flex flex-wrap gap-2">
                {member.interests.map((interest) => (
                  <Badge key={interest} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            </ProfileSection>
          )}

          {projects.length > 0 && (
            <ProfileSection title="Projects & initiatives">
              <div className="grid gap-3 sm:grid-cols-2">
                {projects.map((project) => {
                  const inner = (
                    <div className="flex gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/40">
                      <div className="h-14 w-14 shrink-0 rounded-md bg-muted overflow-hidden">
                        {project.imageUrl ? (
                          <img
                            src={project.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{project.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {[project.category, project.stage].filter(Boolean).join(" · ") ||
                            "Impact project"}
                        </p>
                      </div>
                    </div>
                  )
                  if (FEATURE_FLAGS.projectsAndInitiatives) {
                    return (
                      <Link key={project.id} href={`/projects/${project.id}`}>
                        {inner}
                      </Link>
                    )
                  }
                  return <div key={project.id}>{inner}</div>
                })}
              </div>
            </ProfileSection>
          )}

          {events.length > 0 && (
            <ProfileSection title="Recent events">
              <ul className="space-y-2">
                {events.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.id}`}
                      className="flex items-start justify-between gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {format(new Date(event.startDate), "MMM d, yyyy")}
                          {event.location ? ` · ${event.location}` : ""}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </ProfileSection>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">At a glance</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Connections</p>
                <p className="text-xl font-semibold tabular-nums">{member.connections}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Followers</p>
                <p className="text-xl font-semibold tabular-nums">{member.followers}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Projects</p>
                <p className="text-xl font-semibold tabular-nums">{projects.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Events</p>
                <p className="text-xl font-semibold tabular-nums">{events.length}</p>
              </div>
            </CardContent>
          </Card>

          {member.mutualConnections && member.mutualConnections.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Mutual connections ({member.mutualConnections.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {member.mutualConnections.map((connection) => (
                  <Link
                    key={connection.id}
                    href={`/community/${connection.id}`}
                    className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={connection.avatar || undefined} alt={connection.name} />
                      <AvatarFallback>{connection.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{connection.name}</p>
                      {connection.role && (
                        <p className="text-xs text-muted-foreground truncate">{connection.role}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {member.profileUpdatedAt && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 px-1">
              <Clock className="h-3.5 w-3.5" />
              Profile updated {format(new Date(member.profileUpdatedAt), "MMM d, yyyy")}
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
