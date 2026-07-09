"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  Mail,
  UserPlus,
  Clock,
  Users,
  Heart,
  Briefcase,
  CalendarDays,
  Loader2,
  Pencil,
  ArrowRight,
  Linkedin,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { thumbnailImageClassName } from "@/lib/image-display"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { Badge } from "@/components/ui/badge"
import { MembershipTierBadge } from "@/components/membership-tier-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MobileBreadcrumbsHidden } from "@/components/mobile/mobile-page-shell"
import { badgeClassForLabel } from "@/lib/badge-styles"
import { FEATURE_FLAGS } from "@/lib/feature-flags"
import { toast } from "@/lib/toast"
import {
  respondToConnectionRequest,
  sendConnectionRequest,
} from "@/lib/connection-client"
import { MemberEmailDialog } from "@/components/community/member-email-dialog"
import { getInitials, cn } from "@/lib/utils"
import type { CommunityMember } from "@/types/community"

type MemberProfileViewProps = {
  member: CommunityMember
  onRefresh: () => void | Promise<void>
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
        <p className="text-sm leading-relaxed text-muted-foreground">{empty}</p>
      ) : (
        children
      )}
    </section>
  )
}

function TagList({ items, variant = "secondary" }: { items: string[]; variant?: "secondary" | "outline" }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
      {items.map((item) => (
        <Badge key={item} variant={variant} className="text-[10px] font-normal md:text-xs">
          {item}
        </Badge>
      ))}
    </div>
  )
}

export function MemberProfileView({ member, onRefresh }: MemberProfileViewProps) {
  const [connectLoading, setConnectLoading] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(Boolean(member.isFollowing))

  useEffect(() => {
    setIsFollowing(Boolean(member.isFollowing))
  }, [member.id, member.isFollowing])

  const bio = member.fullBio || member.bio
  const hasAbout = Boolean(bio?.trim())
  const hasSkills = member.skills.length > 0
  const hasInterests = member.interests.length > 0
  const hasAvailability = member.availability.length > 0
  const linkedinUrl = member.socialLinks?.linkedin?.trim()
  const projects = member.projects ?? []
  const events = member.recentEvents ?? []

  const handleConnect = async () => {
    if (member.isSelf || member.connectionStatus === "connected") return
    if (member.connectionStatus === "pending_sent") {
      toast.info("Request pending", "You already sent a connection request.")
      return
    }
    if (member.connectionStatus === "pending_received") {
      await handleAcceptConnection()
      return
    }
    setConnectLoading(true)
    try {
      const result = await sendConnectionRequest(member.id)
      if (!result.ok) {
        throw new Error(result.error || "Could not send connection request")
      }
      if (result.data.alreadyConnected) {
        toast.success("Already connected", "You are connected with this member.")
      } else if (result.data.alreadySent) {
        toast.info("Request pending", "You already sent a connection request.")
      } else {
        toast.success("Request sent", "They will get a notification and email.")
      }
      await onRefresh()
    } catch (e) {
      toast.error("Connection failed", e instanceof Error ? e.message : "Please try again.")
    } finally {
      setConnectLoading(false)
    }
  }

  const handleAcceptConnection = async () => {
    if (!member.connectionId) {
      toast.error("Connection failed", "Could not find the pending request. Refresh and try again.")
      return
    }
    setConnectLoading(true)
    try {
      const result = await respondToConnectionRequest(member.connectionId, "accepted")
      if (!result.ok) {
        throw new Error(result.error || "Could not accept connection request")
      }
      toast.success("Connected", `You are now connected with ${member.name}.`)
      await onRefresh()
    } catch (e) {
      toast.error("Connection failed", e instanceof Error ? e.message : "Please try again.")
    } finally {
      setConnectLoading(false)
    }
  }

  const handleDeclineConnection = async () => {
    if (!member.connectionId) {
      toast.error("Connection failed", "Could not find the pending request. Refresh and try again.")
      return
    }
    setConnectLoading(true)
    try {
      const result = await respondToConnectionRequest(member.connectionId, "rejected")
      if (!result.ok) {
        throw new Error(result.error || "Could not decline connection request")
      }
      toast.info("Request declined", "The connection request was removed.")
      await onRefresh()
    } catch (e) {
      toast.error("Connection failed", e instanceof Error ? e.message : "Please try again.")
    } finally {
      setConnectLoading(false)
    }
  }

  const handleFollow = async () => {
    if (member.isSelf) return
    const wasFollowing = isFollowing
    setFollowLoading(true)
    try {
      const res = await fetch(
        wasFollowing ? `/api/follow?followingId=${member.id}` : "/api/follow",
        {
          method: wasFollowing ? "DELETE" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: wasFollowing ? undefined : JSON.stringify({ followingId: member.id }),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message =
          res.status === 401
            ? "Your session may have expired. Please sign in again."
            : data.error || "Could not update follow status"
        throw new Error(message)
      }
      setIsFollowing(!wasFollowing)
      toast.success(
        wasFollowing ? "Unfollowed" : "Following",
        wasFollowing
          ? "You will no longer see their updates here."
          : "You are now following this member."
      )
      await onRefresh()
    } catch (e) {
      setIsFollowing(wasFollowing)
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
        return "Pending"
      case "pending_received":
        return "Respond"
      default:
        return "Connect"
    }
  }

  const isConnected = member.connectionStatus === "connected"
  const isPendingReceived = member.connectionStatus === "pending_received"

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 overflow-x-hidden md:space-y-6">
      <MobileBreadcrumbsHidden>
        <Breadcrumbs
          items={[
            { label: "Community", href: "/community" },
            { label: member.name },
          ]}
        />
      </MobileBreadcrumbsHidden>

      {/* Profile card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="px-5 py-6 md:px-8 md:py-8">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-start md:gap-6 md:text-left">
            <Avatar className="h-24 w-24 shrink-0 md:h-24 md:w-24 lg:h-28 lg:w-28">
              <AvatarImage
                src={getImageDisplayUrl(member.avatar) || undefined}
                alt={member.name}
              />
              <AvatarFallback className="text-lg md:text-2xl">{getInitials(member.name, member.email)}</AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col items-center space-y-3 md:items-start">
              {/* Desktop-only badges */}
              <div className="hidden flex-wrap items-center gap-2 md:flex">
                {member.membershipLabel && member.membershipTier ? (
                  <MembershipTierBadge
                    membership={{ tier: member.membershipTier, label: member.membershipLabel }}
                  />
                ) : null}
                {member.featured ? (
                  <Badge className="border border-primary/20 bg-primary/10 text-primary">Featured</Badge>
                ) : null}
                {member.experienceLevel ? (
                  <Badge variant="outline" className={badgeClassForLabel(member.experienceLevel)}>
                    {member.experienceLevel}
                  </Badge>
                ) : null}
                {isConnected ? <Badge variant="secondary">Connected</Badge> : null}
              </div>

              <div className="space-y-0.5">
                <h1 className="text-lg font-semibold tracking-tight md:text-2xl lg:text-3xl">
                  {member.name}
                </h1>
                {member.organization ? (
                  <p className="text-xs text-muted-foreground md:text-sm">{member.organization}</p>
                ) : null}
                {member.role ? (
                  <p className="text-xs text-muted-foreground/80 md:text-sm">{member.role}</p>
                ) : null}
              </div>

              {linkedinUrl ? (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded bg-[#0A66C2] text-white transition-opacity hover:opacity-90 md:hidden"
                  aria-label={`${member.name} on LinkedIn`}
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              ) : null}

              {hasAbout ? (
                <p className="max-w-2xl text-left text-xs leading-relaxed text-muted-foreground md:text-sm md:text-center lg:text-left">
                  {bio}
                </p>
              ) : (
                <p className="text-xs italic text-muted-foreground/60 md:hidden">No bio yet.</p>
              )}

              {hasSkills ? (
                <div className="w-full space-y-2 pt-1 md:hidden">
                  <p className="text-left text-xs font-medium text-muted-foreground">Skills</p>
                  <TagList items={member.skills} />
                </div>
              ) : null}

              {hasInterests ? (
                <div className="w-full space-y-2 md:hidden">
                  <p className="text-left text-xs font-medium text-muted-foreground">Interests</p>
                  <TagList items={member.interests} variant="outline" />
                </div>
              ) : null}

              {/* Desktop meta */}
              <div className="hidden flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground md:flex">
                {member.location ? <span>{member.location}</span> : null}
                <span>Member since {format(new Date(member.joinedDate), "MMMM yyyy")}</span>
              </div>

              {hasAvailability ? (
                <div className="hidden flex-wrap gap-2 md:flex">
                  {member.availability.map((item) => (
                    <Badge key={item} variant="outline" className={badgeClassForLabel(item)}>
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Actions */}
        {!member.isSelf ? (
          <>
            {/* Mobile — action buttons */}
            <div
              className={cn(
                "grid gap-3 border-t border-border px-5 py-4 md:hidden",
                isPendingReceived ? "grid-cols-3" : isConnected ? "grid-cols-2" : "grid-cols-2"
              )}
            >
              {isPendingReceived ? (
                <>
                  <Button
                    className="h-10 rounded-full text-xs"
                    disabled={connectLoading}
                    onClick={() => void handleAcceptConnection()}
                  >
                    {connectLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 rounded-full text-xs"
                    disabled={connectLoading}
                    onClick={() => void handleDeclineConnection()}
                  >
                    Decline
                  </Button>
                </>
              ) : (
                <>
                  {isConnected ? (
                    <Button
                      variant="outline"
                      className="h-10 rounded-full text-xs"
                      onClick={() => setEmailOpen(true)}
                    >
                      <Mail className="mr-1.5 h-3.5 w-3.5" />
                      Email
                    </Button>
                  ) : (
                    <Button
                      className="h-10 rounded-full text-xs"
                      disabled={connectLoading || member.connectionStatus === "pending_sent"}
                      onClick={() => void handleConnect()}
                    >
                      {connectLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        connectLabel()
                      )}
                    </Button>
                  )}
                  <Button
                    variant={isFollowing ? "secondary" : "outline"}
                    className="h-10 rounded-full text-xs"
                    disabled={followLoading}
                    onClick={() => void handleFollow()}
                  >
                    {followLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isFollowing ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Desktop actions */}
            <div className="hidden flex-wrap gap-2 border-t border-border px-8 py-4 md:flex">
              {isPendingReceived ? (
                <>
                  <Button disabled={connectLoading} onClick={() => void handleAcceptConnection()}>
                    {connectLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    Accept request
                  </Button>
                  <Button
                    variant="outline"
                    disabled={connectLoading}
                    onClick={() => void handleDeclineConnection()}
                  >
                    Decline
                  </Button>
                </>
              ) : (
                <Button
                  disabled={connectLoading || isConnected || member.connectionStatus === "pending_sent"}
                  onClick={() => void handleConnect()}
                >
                  {connectLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  {connectLabel()}
                </Button>
              )}
              {isConnected ? (
                <Button variant="outline" onClick={() => setEmailOpen(true)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              ) : null}
              {linkedinUrl ? (
                <Button variant="outline" asChild>
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-4 w-4 text-[#0A66C2]" />
                    LinkedIn
                  </a>
                </Button>
              ) : null}
              <Button
                variant={isFollowing ? "secondary" : "outline"}
                disabled={followLoading}
                onClick={handleFollow}
              >
                {followLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={cn("mr-2 h-4 w-4", isFollowing && "fill-current")} />
                )}
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button variant="ghost" asChild className="ml-auto">
                <Link href="/community">
                  Back to directory
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-2 border-t border-border px-5 py-4 md:px-8">
            <Button asChild className="w-full rounded-full md:w-auto md:rounded-md">
              <Link href="/profile">
                <Pencil className="mr-2 h-4 w-4" />
                Edit profile
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Secondary content — desktop-heavy, minimal on mobile */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2 lg:space-y-8">
          {!hasAbout && (
            <Card className="hidden border-dashed md:block">
              <CardContent className="py-8 text-center">
                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                  {member.isSelf
                    ? "Add a short bio on your profile so other members know what you are working on."
                    : "This member has not added a bio yet."}
                </p>
                {member.isSelf ? (
                  <Button className="mt-4" asChild>
                    <Link href="/profile">Complete profile</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          )}

          {hasAbout && bio!.length > 280 ? (
            <ProfileSection title="About">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{bio}</p>
            </ProfileSection>
          ) : null}

          <div className="hidden md:block md:space-y-8">
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
              {hasSkills ? <TagList items={member.skills} /> : null}
            </ProfileSection>

            {hasInterests ? (
              <ProfileSection title="Interests">
                <TagList items={member.interests} variant="outline" />
              </ProfileSection>
            ) : null}
          </div>

          {projects.length > 0 ? (
            <ProfileSection title="Projects">
              <div className="grid gap-2 sm:grid-cols-2">
                {projects.map((project) => {
                  const inner = (
                    <div className="flex gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        {project.imageUrl ? (
                          <img
                            src={getImageDisplayUrl(project.imageUrl) || project.imageUrl}
                            alt=""
                            className={thumbnailImageClassName}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium">{project.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[project.category, project.stage].filter(Boolean).join(" · ") || "Project"}
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
          ) : null}

          {events.length > 0 ? (
            <ProfileSection title="Recent events">
              <ul className="space-y-2">
                {events.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
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
          ) : null}
        </div>

        <aside className="hidden space-y-4 md:block">
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
                <p className="text-muted-foreground">Following</p>
                <p className="text-xl font-semibold tabular-nums">{member.following}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Projects</p>
                <p className="text-xl font-semibold tabular-nums">{projects.length}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Events</p>
                <p className="text-xl font-semibold tabular-nums">{events.length}</p>
              </div>
            </CardContent>
          </Card>

          {member.mutualConnections && member.mutualConnections.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Mutual connections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {member.mutualConnections.map((connection) => (
                  <Link
                    key={connection.id}
                    href={`/community/${connection.id}`}
                    className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getImageDisplayUrl(connection.avatar) || undefined}
                        alt={connection.name}
                      />
                      <AvatarFallback>{connection.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{connection.name}</p>
                      {connection.role ? (
                        <p className="truncate text-xs text-muted-foreground">{connection.role}</p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {member.profileUpdatedAt ? (
            <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Updated {format(new Date(member.profileUpdatedAt), "MMM d, yyyy")}
            </p>
          ) : null}
        </aside>
      </div>

      {!member.isSelf && isConnected ? (
        <MemberEmailDialog
          open={emailOpen}
          onOpenChange={setEmailOpen}
          memberId={member.id}
          memberName={member.name}
        />
      ) : null}
    </div>
  )
}
