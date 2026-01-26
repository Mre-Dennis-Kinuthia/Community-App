# React Native Migration Strategy
## Impact Hub Nairobi Community Platform

**Document Version:** 1.0  
**Date:** 2024  
**Status:** Planning Phase

---

## Executive Summary

This document outlines a comprehensive strategy for migrating the Impact Hub Nairobi Community Platform from a Next.js web application to a React Native mobile application. The strategy focuses on code reusability, maintaining feature parity, and leveraging the existing robust backend API infrastructure.

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

## 1. Architecture Strategy

### 1.1 Monorepo Approach (Recommended)

**Structure:**
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

**Benefits:**
- Maximum code reuse between web and mobile
- Shared TypeScript types ensure consistency
- Single source of truth for API integration
- Easier maintenance and updates
- Unified dependency management

**Tools:**
- **Turborepo** or **Nx** for monorepo management
- **Yarn Workspaces** or **pnpm workspaces** for package management

### 1.2 Alternative: Separate Repository

If monorepo is not preferred:
- Create separate `mobile/` repository
- Share code via npm packages or git submodules
- Less ideal but simpler initial setup

---

## 2. Technology Stack Decisions

### 2.1 Core Framework
- **React Native:** Latest stable version (0.74+)
- **TypeScript:** Same version as web app
- **Expo:** Recommended for faster development and easier deployment
  - **Expo SDK 51+** (latest stable)
  - **Expo Router** for file-based routing (similar to Next.js)

### 2.2 State Management
- **React Query (TanStack Query):** For server state management
  - Replaces current custom hooks pattern
  - Excellent caching and synchronization
  - Works seamlessly with existing REST APIs
- **Zustand** or **Jotai:** For client-side state (if needed)
  - Simpler than Redux
  - Good TypeScript support

### 2.3 Navigation
- **Expo Router:** If using Expo (recommended)
  - File-based routing like Next.js
  - Deep linking support built-in
- **React Navigation:** If using bare React Native
  - Industry standard
  - More control over navigation

### 2.4 UI Components
- **React Native Paper** or **NativeBase:** Component libraries
  - Pre-built, accessible components
  - Theme support
- **React Native Reusables:** shadcn/ui for React Native
  - Similar API to current Radix UI components
  - Maintains design consistency
- **Custom Components:** Build mobile-specific versions of existing components

### 2.5 Styling
- **StyleSheet API:** Native styling (recommended)
- **NativeWind:** Tailwind CSS for React Native
  - Reuse existing Tailwind classes
  - Maintains design consistency with web
- **Styled Components:** Alternative if preferred

### 2.6 Authentication
- **Expo AuthSession:** For OAuth flows
- **SecureStore:** For token storage
- **Custom implementation:** Adapt NextAuth flow for mobile
  - Use same backend endpoints
  - Store session tokens securely

### 2.7 API Client
- **Axios** or **Fetch API:** HTTP client
- **React Query:** Data fetching and caching
- **Shared API client:** From `packages/shared/api/`

### 2.8 Additional Libraries
- **React Hook Form:** Form management (already used in web)
- **Zod:** Schema validation (already used)
- **date-fns:** Date utilities (already used)
- **React Native Reanimated:** Animations
- **React Native Gesture Handler:** Advanced gestures

---

## 3. Code Sharing Strategy

### 3.1 Shared Code Organization

#### Types (`packages/shared/types/`)
```typescript
// Reuse all existing types
- community.ts
- booking.ts
- events.ts
- news.ts
- user.ts
- etc.
```

#### API Client (`packages/shared/api/`)
```typescript
// Centralized API client
export const apiClient = {
  community: {
    getMembers: (params) => fetch('/api/community', { params }),
    getMember: (id) => fetch(`/api/community/${id}`),
  },
  bookings: {
    create: (data) => fetch('/api/bookings', { method: 'POST', body: data }),
    // ... etc
  },
  // ... all other endpoints
}
```

#### Hooks (`packages/shared/hooks/`)
```typescript
// Convert existing hooks to use React Query
export function useCommunityMembers(options) {
  return useQuery({
    queryKey: ['community', options],
    queryFn: () => apiClient.community.getMembers(options),
  })
}
```

#### Utilities (`packages/shared/utils/`)
- Date formatting
- Validation helpers
- Constants
- Business logic

### 3.2 Migration Path for Existing Code

1. **Extract shared code** from `frontend/lib/` to `packages/shared/`
2. **Refactor hooks** to use React Query
3. **Create mobile-specific implementations** in `packages/mobile/src/`
4. **Update web app** to import from shared packages

---

## 4. Feature Migration Plan

### Phase 1: Foundation (Weeks 1-3)
**Priority: Critical**

- [ ] Project setup (monorepo or separate repo)
- [ ] Shared code extraction
- [ ] API client setup
- [ ] Authentication flow
- [ ] Navigation structure
- [ ] Basic UI component library
- [ ] Theme/styling system

**Deliverables:**
- Working app with login/register
- Basic navigation
- API integration working

### Phase 2: Core Features (Weeks 4-8)
**Priority: High**

#### 2.1 Authentication & Profile
- [ ] Login/Register screens
- [ ] Profile view/edit
- [ ] Session management
- [ ] OAuth integration (Google)

#### 2.2 Dashboard
- [ ] Dashboard screen
- [ ] Stats display
- [ ] Upcoming bookings widget
- [ ] Quick actions

#### 2.3 Community Directory
- [ ] Member list screen
- [ ] Search and filters
- [ ] Member profile view
- [ ] Connection requests
- [ ] Follow/unfollow

**Deliverables:**
- Complete authentication flow
- Functional dashboard
- Community directory with all features

### Phase 3: Booking & Events (Weeks 9-12)
**Priority: High**

#### 3.1 Workspace Booking
- [ ] Workspace selection
- [ ] Availability calendar
- [ ] Booking form
- [ ] Booking confirmation
- [ ] Booking history

#### 3.2 Events
- [ ] Events list
- [ ] Event details
- [ ] Event registration
- [ ] Event filters

**Deliverables:**
- Full booking flow
- Event management

### Phase 4: Content & Engagement (Weeks 13-16)
**Priority: Medium**

#### 4.1 News
- [ ] News feed
- [ ] News article view
- [ ] Comments system
- [ ] Categories and tags

#### 4.2 Notifications
- [ ] Push notifications setup
- [ ] Notification center
- [ ] Real-time updates
- [ ] Notification preferences

**Deliverables:**
- News system
- Push notifications working

### Phase 5: Enhanced Features (Weeks 17-20)
**Priority: Low**

- [ ] Resources section
- [ ] Partners directory
- [ ] Projects showcase
- [ ] Billing/payments (if needed)
- [ ] Offline support
- [ ] Deep linking

### Phase 6: Polish & Optimization (Weeks 21-24)
**Priority: Medium**

- [ ] Performance optimization
- [ ] Animations and transitions
- [ ] Error handling improvements
- [ ] Loading states
- [ ] Accessibility improvements
- [ ] Testing (unit, integration, E2E)
- [ ] App store preparation

---

## 5. API Integration Strategy

### 5.1 Current API Endpoints

All existing endpoints are mobile-ready:
- ✅ RESTful design
- ✅ JSON responses
- ✅ Authentication via headers
- ✅ Error handling

### 5.2 API Client Implementation

```typescript
// packages/shared/api/client.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.impacthubnairobi.com'

export const apiClient = {
  get: async (endpoint: string, options?: RequestInit) => {
    const token = await getAuthToken()
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    })
  },
  // ... post, put, delete methods
}
```

### 5.3 React Query Integration

```typescript
// packages/shared/hooks/use-community.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '../api/client'

export function useCommunityMembers(filters) {
  return useQuery({
    queryKey: ['community', filters],
    queryFn: () => apiClient.get('/api/community', { params: filters }),
  })
}

export function useSendConnectionRequest() {
  return useMutation({
    mutationFn: (userId: string) => 
      apiClient.post('/api/connections', { userId }),
  })
}
```

### 5.4 Error Handling

- Global error handler
- Retry logic for failed requests
- Offline detection
- Error boundaries in React Native

---

## 6. UI/UX Design Strategy

### 6.1 Design Principles

1. **Mobile-First:** Optimize for touch interactions
2. **Native Feel:** Use platform conventions (iOS/Android)
3. **Consistency:** Maintain brand identity from web
4. **Performance:** Smooth 60fps animations
5. **Accessibility:** WCAG compliance

### 6.2 Screen Design Approach

#### Navigation Pattern
- **Bottom Tab Navigation:** Main sections (Dashboard, Community, Events, News, Profile)
- **Stack Navigation:** Detail screens
- **Modal:** Forms and actions

#### Component Mapping

| Web Component | Mobile Component |
|--------------|------------------|
| Page layout | Screen component |
| Card | Card (React Native Paper) |
| Button | Button (native) |
| Input | TextInput |
| Select | Picker/Select |
| Dialog | Modal |
| Toast | Toast (react-native-toast-message) |
| Table | FlatList/ScrollView |
| Calendar | Calendar picker library |

### 6.3 Responsive Design

- Use `Dimensions` API for screen sizes
- Flexible layouts with Flexbox
- Platform-specific adjustments (iOS vs Android)

### 6.4 Branding

- Maintain Impact Hub Nairobi colors (deep red primary)
- Use same typography scale (adjusted for mobile)
- Consistent iconography (Lucide React Native)

---

## 7. Platform-Specific Features

### 7.1 iOS Features
- Face ID / Touch ID authentication
- Apple Sign In
- Haptic feedback
- iOS-style navigation
- Share sheet integration

### 7.2 Android Features
- Fingerprint authentication
- Google Sign In
- Material Design components
- Android-style navigation
- Share intent

### 7.3 Cross-Platform Features
- Push notifications (Expo Notifications)
- Deep linking (Expo Linking)
- Camera access (for profile photos)
- File picker (for document uploads)
- Location services (if needed)
- Biometric authentication

---

## 8. Authentication Strategy

### 8.1 Current Web Auth (NextAuth)

The web app uses NextAuth with:
- Email/password
- Google OAuth
- Session management

### 8.2 Mobile Auth Approach

**Option 1: Adapt NextAuth Flow**
- Use same backend endpoints
- Implement OAuth flow with Expo AuthSession
- Store tokens in SecureStore
- Manual session management

**Option 2: Custom Auth Endpoints**
- Create mobile-specific auth endpoints
- Use JWT tokens
- Refresh token mechanism
- Secure storage

**Recommended:** Option 1 (reuse existing)

### 8.3 Implementation

```typescript
// packages/mobile/src/services/auth.ts
import * as AuthSession from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'

export async function signInWithGoogle() {
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  }
  
  const request = new AuthSession.AuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.Code,
  })
  
  const result = await request.promptAsync(discovery)
  
  if (result.type === 'success') {
    // Exchange code for token
    // Store in SecureStore
    // Update app state
  }
}
```

---

## 9. Testing Strategy

### 9.1 Testing Levels

1. **Unit Tests:** Jest + React Native Testing Library
   - Utilities
   - Hooks
   - Components

2. **Integration Tests:** 
   - API integration
   - Navigation flows
   - State management

3. **E2E Tests:** Detox or Maestro
   - Critical user flows
   - Authentication
   - Booking flow

4. **Manual Testing:**
   - Device testing (iOS & Android)
   - Different screen sizes
   - Performance testing

### 9.2 Test Coverage Goals

- **Critical paths:** 90%+
- **Components:** 80%+
- **Utilities:** 90%+
- **Overall:** 75%+

---

## 10. Performance Optimization

### 10.1 Code Optimization
- Code splitting
- Lazy loading screens
- Image optimization
- Bundle size optimization

### 10.2 Runtime Optimization
- React.memo for expensive components
- useMemo/useCallback for expensive computations
- FlatList optimization (getItemLayout, keyExtractor)
- Image caching

### 10.3 Network Optimization
- Request caching (React Query)
- Request deduplication
- Offline support
- Optimistic updates

---

## 11. Deployment Strategy

### 11.1 Development
- **Expo Go:** For rapid development and testing
- **Development builds:** For testing native features

### 11.2 Staging
- **EAS Build:** Expo Application Services
- **TestFlight (iOS):** Internal testing
- **Internal Testing (Android):** Google Play Console

### 11.3 Production
- **App Store (iOS):** Full release
- **Google Play (Android):** Full release
- **Over-the-air updates:** Expo Updates for JS changes

### 11.4 CI/CD Pipeline
- Automated builds on git push
- Automated testing
- Automated deployment to TestFlight/Play Console
- Version management

---

## 12. Risk Mitigation

### 12.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| API incompatibility | High | Test all endpoints early |
| Performance issues | Medium | Performance testing throughout |
| Native module issues | Medium | Use Expo managed workflow where possible |
| Platform-specific bugs | Medium | Regular testing on both platforms |

### 12.2 Project Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Timeline delays | High | Phased approach, MVP first |
| Resource constraints | Medium | Prioritize features, use shared code |
| Learning curve | Medium | Training, documentation |
| Maintenance burden | Low | Code sharing reduces duplication |

---

## 13. Success Metrics

### 13.1 Technical Metrics
- App load time < 3 seconds
- API response time < 500ms
- Crash rate < 0.1%
- App size < 50MB

### 13.2 User Metrics
- User adoption rate
- Daily active users
- Feature usage
- User satisfaction (ratings)

### 13.3 Business Metrics
- Booking conversion rate
- Event registration rate
- Community engagement
- User retention

---

## 14. Timeline & Resources

### 14.1 Estimated Timeline

- **Phase 1 (Foundation):** 3 weeks
- **Phase 2 (Core Features):** 5 weeks
- **Phase 3 (Booking & Events):** 4 weeks
- **Phase 4 (Content & Engagement):** 4 weeks
- **Phase 5 (Enhanced Features):** 4 weeks
- **Phase 6 (Polish & Optimization):** 4 weeks

**Total:** ~24 weeks (6 months)

### 14.2 Team Requirements

- **1-2 React Native developers**
- **1 UI/UX designer** (part-time)
- **1 Backend developer** (support, part-time)
- **1 QA engineer** (part-time)

### 14.3 Budget Considerations

- Development tools (Expo, EAS)
- App store fees ($99/year iOS, $25 one-time Android)
- Testing devices
- CI/CD infrastructure
- Third-party services (push notifications, analytics)

---

## 15. Next Steps

### Immediate Actions (Week 1)

1. **Decision:** Choose monorepo vs separate repo
2. **Setup:** Initialize React Native project
3. **Extract:** Begin extracting shared code
4. **Design:** Create mobile UI mockups
5. **Planning:** Detailed sprint planning

### Documentation Needed

- [ ] API documentation review
- [ ] Design system documentation
- [ ] Component library documentation
- [ ] Deployment guide
- [ ] Developer onboarding guide

### Tools to Set Up

- [ ] Monorepo tooling (Turborepo/Nx)
- [ ] React Native development environment
- [ ] Expo account and EAS setup
- [ ] CI/CD pipeline
- [ ] Testing infrastructure

---

## 16. Appendix

### 16.1 Useful Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [NativeWind Documentation](https://www.nativewind.dev/)

### 16.2 Recommended Libraries

**Navigation:**
- Expo Router (if using Expo)
- React Navigation (if bare React Native)

**UI Components:**
- React Native Paper
- React Native Reusables (shadcn/ui for RN)

**Forms:**
- React Hook Form
- Zod

**State Management:**
- TanStack Query (React Query)
- Zustand

**Styling:**
- NativeWind (Tailwind for RN)
- StyleSheet API

**Utilities:**
- date-fns
- axios
- expo-secure-store
- expo-auth-session

### 16.3 Code Examples

See separate implementation files for:
- Project structure
- API client setup
- Authentication flow
- Component examples
- Navigation setup

---

## Conclusion

This strategy provides a comprehensive roadmap for migrating the Impact Hub Nairobi Community Platform to React Native. The phased approach ensures manageable development cycles, while code sharing maximizes efficiency and maintains consistency between web and mobile platforms.

**Key Success Factors:**
1. Strong code sharing strategy
2. Phased, incremental development
3. Early and continuous testing
4. Performance optimization throughout
5. Clear communication and documentation

**Next Action:** Review this strategy with the team and begin Phase 1 setup.

---

**Document Owner:** Development Team  
**Last Updated:** 2024  
**Review Cycle:** Monthly during active development
