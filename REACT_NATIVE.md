# React Native Migration

**Platform:** Impact Hub Nairobi Community Platform
**Status:** Planning Phase

---

## Strategy & Architecture

### Current State
- **Frontend:** Next.js 16 with TypeScript, Tailwind CSS, Radix UI
- **Backend:** RESTful API with Next.js API routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with Google OAuth
- **Key Features:** Community directory, workspace booking, events, news, notifications, profile management

### Target State
- **Mobile:** React Native app (iOS & Android)
- **Code Sharing:** Shared business logic, types, and API clients
- **UI:** Native mobile components with platform-specific optimizations
- **Authentication:** Mobile-optimized auth flow
- **Feature Parity:** All core features available on mobile

---

## Monorepo Setup

### Architecture: Monorepo Approach (Recommended)

```
Community-App/
├── packages/
│   ├── shared/              # Shared code
│   │   ├── types/          # TypeScript types
│   │   ├── api/            # API client & hooks
│   │   ├── utils/          # Utility functions
│   │   └── constants/      # Constants & config
│   ├── web/                # Next.js web app
│   │   └── (existing frontend code)
│   └── mobile/             # React Native app
│       ├── src/
│       │   ├── screens/    # Screen components
│       │   ├── components/ # Mobile-specific components
│       │   ├── navigation/ # Navigation setup
│       │   ├── services/   # Mobile services (push, deep links)
│       │   └── hooks/     # Mobile-specific hooks
│       └── app.json
├── backend/                # Existing backend
└── package.json           # Root workspace config
```

**Benefits:** Maximum code reuse, shared TypeScript types, single source of truth for API integration, unified dependency management.

**Tools:** Turborepo or Nx for monorepo management; Yarn Workspaces or pnpm workspaces.

**Alternative:** Separate repository — simpler initial setup but less ideal for ongoing maintenance.

### Initialization

```bash
# Install Turborepo
npm install -g turbo

# Initialize monorepo
mkdir Community-App
cd Community-App
npm init -y
npm install --save-dev turbo
mkdir packages
```

**Root package.json:**
```json
{
  "name": "community-app-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

**Create shared package:**
```bash
cd packages
mkdir shared && cd shared
npm init -y
```

**packages/shared/package.json:**
```json
{
  "name": "@community-app/shared",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**Create mobile package (Expo):**
```bash
cd packages
npx create-expo-app mobile --template blank-typescript
cd mobile
```

**packages/mobile/package.json additions:**
```json
{
  "dependencies": {
    "@community-app/shared": "*",
    "@tanstack/react-query": "^5.0.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "expo-router": "^3.0.0",
    "expo-secure-store": "~13.0.0",
    "expo-auth-session": "~5.0.0",
    "react-native-paper": "^5.11.0",
    "nativewind": "^4.0.0"
  }
}
```

---

## Technology Stack

### Core Framework
- **React Native:** Latest stable (0.74+) with TypeScript
- **Expo SDK 51+** — recommended for faster development and easier deployment
- **Expo Router** — file-based routing (mirrors Next.js conventions)

### State Management
- **TanStack Query (React Query v5)** — server state, caching, synchronization; replaces custom hooks pattern
- **Zustand** or **Jotai** — client-side state if needed

### Navigation
- **Expo Router** (if using Expo) — file-based routing with built-in deep linking
- **React Navigation** (if bare React Native) — industry standard, more control

### UI Components
- **React Native Paper** or **NativeBase** — pre-built accessible components with theme support
- **React Native Reusables** — shadcn/ui for React Native; similar API to current Radix UI components

### Styling
- **NativeWind** — Tailwind CSS for React Native; reuse existing Tailwind classes
- **StyleSheet API** — native styling fallback

### Authentication
- **Expo AuthSession** for OAuth flows
- **SecureStore** for token storage
- Adapt existing NextAuth flow using same backend endpoints

### Additional Libraries
- **React Hook Form** + **Zod** — already used in web app
- **date-fns** — already used in web app
- **React Native Reanimated** — animations
- **React Native Gesture Handler** — advanced gestures
- **Axios** or **Fetch API** — HTTP client

### Component Mapping

| Web Component | Mobile Component |
|--------------|------------------|
| Page layout | Screen component |
| Card | Card (React Native Paper) |
| Button | Button (native) |
| Input | TextInput |
| Select | Picker/Select |
| Dialog | Modal |
| Toast | react-native-toast-message |
| Table | FlatList/ScrollView |
| Calendar | Calendar picker library |

---

## Feature Migration Plan

### Phase 1: Foundation (Weeks 1–3)
- Project setup (monorepo), shared code extraction, API client setup
- Authentication flow, navigation structure, basic UI component library, theme/styling system
- **Deliverables:** Working app with login/register, basic navigation, API integration

### Phase 2: Core Features (Weeks 4–8)
- Login/Register screens, profile view/edit, session management, Google OAuth
- Dashboard screen with stats, upcoming bookings widget, quick actions
- Community directory: member list, search/filters, member profile view, connection requests
- **Deliverables:** Complete auth flow, functional dashboard, community directory

### Phase 3: Booking & Events (Weeks 9–12)
- Workspace selection, availability calendar, booking form, booking confirmation, history
- Events list, event details, event registration, event filters
- **Deliverables:** Full booking flow, event management

### Phase 4: Content & Engagement (Weeks 13–16)
- News feed, article view, comments system, categories and tags
- Push notifications setup, notification center, real-time updates, notification preferences
- **Deliverables:** News system, push notifications

### Phase 5: Enhanced Features (Weeks 17–20)
- Resources section, partners directory, projects showcase
- Billing/payments (if needed), offline support, deep linking

### Phase 6: Polish & Optimization (Weeks 21–24)
- Performance optimization, animations/transitions, error handling
- Loading states, accessibility improvements
- Testing (unit, integration, E2E), app store preparation

**Total estimated timeline: ~24 weeks (6 months)**

**Team requirements:** 1–2 React Native developers, 1 UI/UX designer (part-time), 1 backend developer (support, part-time), 1 QA engineer (part-time)

---

## Implementation Guide

### Shared Code Structure

**packages/shared/src/types/community.ts:**
```typescript
export interface CommunityMember {
  id: string
  name: string
  email: string
  avatar?: string
  industry?: string
  role?: string
  experienceLevel?: string
  // ... rest of fields
}

export interface CommunityMembersResponse {
  members: CommunityMember[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters?: {
    industries: string[]
    roles: string[]
    // ... etc
  }
}
```

**packages/shared/src/api/client.ts:**
```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  process.env.NEXT_PUBLIC_API_URL || 
  'http://localhost:3000'

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    if (typeof window !== 'undefined') {
      // Web
      return localStorage.getItem('auth_token')
    } else {
      // Mobile — implemented in mobile package via SecureStore
      return null
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, API_BASE_URL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }
    return url.toString()
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = await this.getAuthToken()
    const url = this.buildUrl(endpoint, options.params)
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) })
  }

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
```

**packages/shared/src/api/community.ts:**
```typescript
import { apiClient } from './client'
import type { CommunityMember, CommunityMembersResponse, CommunityMemberResponse } from '../types/community'

export interface CommunityFilters {
  page?: number
  limit?: number
  search?: string
  industry?: string
  role?: string
  experience?: string
  location?: string
  skills?: string[]
  sort?: string
  featured?: boolean
  connectionsOnly?: boolean
}

export const communityApi = {
  getMembers: (filters: CommunityFilters = {}): Promise<CommunityMembersResponse> => {
    const params: Record<string, string> = {}
    if (filters.page) params.page = String(filters.page)
    if (filters.limit) params.limit = String(filters.limit)
    if (filters.search) params.search = filters.search
    if (filters.industry) params.industry = filters.industry
    if (filters.role) params.role = filters.role
    if (filters.experience) params.experience = filters.experience
    if (filters.location) params.location = filters.location
    if (filters.skills?.length) params.skills = filters.skills.join(',')
    if (filters.sort) params.sort = filters.sort
    if (filters.featured) params.featured = 'true'
    if (filters.connectionsOnly) params.connectionsOnly = 'true'

    return apiClient.get<CommunityMembersResponse>('/api/community', params)
  },

  getMember: (id: string): Promise<CommunityMemberResponse> => {
    return apiClient.get<CommunityMemberResponse>(`/api/community/${id}`)
  },
}
```

**packages/shared/src/hooks/use-community.ts:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communityApi, type CommunityFilters } from '../api/community'

export function useCommunityMembers(filters: CommunityFilters = {}) {
  return useQuery({
    queryKey: ['community', 'members', filters],
    queryFn: () => communityApi.getMembers(filters),
    staleTime: 30000, // 30 seconds
  })
}

export function useCommunityMember(id: string | null) {
  return useQuery({
    queryKey: ['community', 'member', id],
    queryFn: () => communityApi.getMember(id!),
    enabled: !!id,
  })
}

export function useSendConnectionRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userId: string) => 
      apiClient.post('/api/connections', { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] })
    },
  })
}
```

**packages/shared/src/index.ts:**
```typescript
export * from './types'
export * from './api'
export * from './hooks'
export * from './utils'
```

### Code Sharing Migration Path

1. Extract shared code from `frontend/lib/` to `packages/shared/`
2. Refactor hooks to use React Query
3. Create mobile-specific implementations in `packages/mobile/src/`
4. Update web app to import from shared packages

All existing API endpoints are mobile-ready: RESTful design, JSON responses, authentication via headers, error handling.

### Mobile App Entry Point

**packages/mobile/App.tsx:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { AppNavigator } from './src/navigation/AppNavigator'
import { theme } from './src/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
    </QueryClientProvider>
  )
}
```

### Navigation Setup

**packages/mobile/src/navigation/AppNavigator.tsx:**
```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { DashboardScreen } from '../screens/DashboardScreen'
import { CommunityScreen } from '../screens/CommunityScreen'
import { CommunityMemberScreen } from '../screens/CommunityMemberScreen'
import { EventsScreen } from '../screens/EventsScreen'
import { NewsScreen } from '../screens/NewsScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { Icon } from '../components/Icon'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function CommunityStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CommunityList" 
        component={CommunityScreen}
        options={{ title: 'Community' }}
      />
      <Stack.Screen 
        name="CommunityMember" 
        component={CommunityMemberScreen}
        options={{ title: 'Member Profile' }}
      />
    </Stack.Navigator>
  )
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#C41E3A', // Impact Hub red
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color }) => <Icon name="home" color={color} /> }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityStack}
        options={{ tabBarIcon: ({ color }) => <Icon name="users" color={color} /> }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{ tabBarIcon: ({ color }) => <Icon name="calendar" color={color} /> }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{ tabBarIcon: ({ color }) => <Icon name="newspaper" color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <Icon name="user" color={color} /> }}
      />
    </Tab.Navigator>
  )
}
```

### Screen Example: Community List

**packages/mobile/src/screens/CommunityScreen.tsx:**
```typescript
import React, { useState } from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useCommunityMembers } from '@community-app/shared'
import { ActivityIndicator, Text, Searchbar } from 'react-native-paper'
import { CommunityMemberCard } from '../components/CommunityMemberCard'

export function CommunityScreen() {
  const navigation = useNavigation()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ page: 1, limit: 20 })

  const { data, isLoading, error, refetch } = useCommunityMembers({
    ...filters,
    search: search || undefined,
  })

  const handleMemberPress = (memberId: string) => {
    navigation.navigate('CommunityMember', { memberId })
  }

  if (isLoading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error: {error.message}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search members..."
        onChangeText={setSearch}
        value={search}
        style={styles.searchbar}
      />
      <FlatList
        data={data?.members || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CommunityMemberCard
            member={item}
            onPress={() => handleMemberPress(item.id)}
          />
        )}
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchbar: { margin: 16 },
  list: { padding: 16 },
})
```

### Component Example: Member Card

**packages/mobile/src/components/CommunityMemberCard.tsx:**
```typescript
import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Card, Avatar, Text } from 'react-native-paper'
import type { CommunityMember } from '@community-app/shared'

interface Props {
  member: CommunityMember
  onPress: () => void
}

export function CommunityMemberCard({ member, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Avatar.Image
            size={60}
            source={{ uri: member.avatar || undefined }}
            style={styles.avatar}
          />
          <View style={styles.info}>
            <Text variant="titleMedium">{member.name}</Text>
            {member.role && (
              <Text variant="bodyMedium" style={styles.role}>{member.role}</Text>
            )}
            {member.industry && (
              <Text variant="bodySmall" style={styles.industry}>{member.industry}</Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  content: { flexDirection: 'row', alignItems: 'center' },
  avatar: { marginRight: 16 },
  info: { flex: 1 },
  role: { marginTop: 4, color: '#666' },
  industry: { marginTop: 2, color: '#999' },
})
```

### Authentication Service

**packages/mobile/src/services/auth.ts:**
```typescript
import * as AuthSession from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'
import { apiClient } from '@community-app/shared'

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || ''

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
}

const TOKEN_KEY = 'auth_tokens'

export async function signInWithGoogle() {
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  }

  const request = new AuthSession.AuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.Code,
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
  })

  const result = await request.promptAsync(discovery)

  if (result.type === 'success') {
    const response = await fetch(`${apiClient.baseUrl}/api/auth/google/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: result.params.code }),
    })
    const tokens: AuthTokens = await response.json()
    await storeTokens(tokens)
    return tokens
  }

  throw new Error('Authentication cancelled or failed')
}

export async function signInWithEmail(email: string, password: string) {
  const response = await fetch(`${apiClient.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) throw new Error('Invalid credentials')

  const tokens: AuthTokens = await response.json()
  await storeTokens(tokens)
  return tokens
}

export async function storeTokens(tokens: AuthTokens) {
  await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens))
}

export async function getStoredTokens(): Promise<AuthTokens | null> {
  const tokensJson = await SecureStore.getItemAsync(TOKEN_KEY)
  if (!tokensJson) return null
  return JSON.parse(tokensJson)
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

export async function isAuthenticated(): Promise<boolean> {
  const tokens = await getStoredTokens()
  if (!tokens) return false
  if (tokens.expiresAt && tokens.expiresAt < Date.now()) {
    return await refreshToken()
  }
  return true
}

async function refreshToken(): Promise<boolean> {
  // Implement token refresh logic
  return false
}
```

### Theme Configuration

**packages/mobile/src/theme.ts:**
```typescript
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper'

const brandColors = {
  primary: '#C41E3A', // Deep red
  secondary: '#2C3E50', // Dark gray
  accent: '#E74C3C',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  error: '#E74C3C',
  text: '#2C3E50',
}

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    accent: brandColors.accent,
    background: brandColors.background,
    surface: brandColors.surface,
    error: brandColors.error,
    text: brandColors.text,
  },
}

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    accent: brandColors.accent,
  },
}

export const theme = lightTheme
```

### Environment Configuration

**packages/mobile/.env:**
```env
EXPO_PUBLIC_API_URL=https://api.impacthubnairobi.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

**packages/mobile/app.json:**
```json
{
  "expo": {
    "name": "Impact Hub Nairobi",
    "slug": "impact-hub-nairobi",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#C41E3A"
    },
    "scheme": "impacthubnairobi",
    "ios": {
      "bundleIdentifier": "com.impacthubnairobi.app",
      "supportsTablet": true
    },
    "android": {
      "package": "com.impacthubnairobi.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#C41E3A"
      }
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ]
  }
}
```

### Testing Setup

**packages/mobile/jest.config.js:**
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
}
```

**Test coverage goals:** Critical paths 90%+, components 80%+, utilities 90%+, overall 75%+

**Example test — packages/mobile/src/screens/__tests__/CommunityScreen.test.tsx:**
```typescript
import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CommunityScreen } from '../CommunityScreen'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

test('renders community members', async () => {
  render(<CommunityScreen />, { wrapper })
  // Add your test assertions
})
```

### Build & Deployment

**eas.json:**
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id",
        "ascAppId": "your-app-id",
        "appleTeamId": "your-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account.json",
        "track": "internal"
      }
    }
  }
}
```

**Build commands:**
```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform all

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

**Deployment pipeline:**
- Development: Expo Go for rapid iteration; development builds for native features
- Staging: EAS Build → TestFlight (iOS) / Google Play Internal Testing (Android)
- Production: App Store + Google Play; Expo Updates for OTA JS changes
- CI/CD: Automated builds and tests on git push; automated deployment to TestFlight/Play Console

---

## Platform-Specific Features

### iOS
- Face ID / Touch ID authentication
- Apple Sign In
- Haptic feedback, iOS-style navigation
- Share sheet integration

### Android
- Fingerprint authentication
- Google Sign In
- Material Design components, Android-style navigation
- Share intent

### Cross-Platform
- Push notifications (Expo Notifications)
- Deep linking (Expo Linking)
- Camera access (profile photos)
- File picker (document uploads)
- Biometric authentication

---

## Performance Targets

| Metric | Target |
|--------|--------|
| App load time | < 3 seconds |
| API response time | < 500ms |
| Crash rate | < 0.1% |
| App size | < 50MB |

**Optimization strategies:** Lazy-load screens, React.memo for expensive components, FlatList with `getItemLayout`/`keyExtractor`, React Query caching and deduplication, image caching, optimistic updates.

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| API incompatibility | High | Test all endpoints early in Phase 1 |
| Performance issues | Medium | Performance testing throughout development |
| Native module issues | Medium | Use Expo managed workflow where possible |
| Platform-specific bugs | Medium | Regular testing on both iOS and Android |
| Timeline delays | High | Phased approach, deliver MVP first |
| Learning curve | Medium | Training, documentation |

---

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [React Navigation](https://reactnavigation.org/)
