# URL Shortener Application - Design Document

## Project Overview

This document outlines the architecture, design decisions, and implementation strategy for the React URL Shortener Web Application developed for the Campus Hiring Evaluation.

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Environment                       │
├─────────────────────────────────────────────────────────────┤
│  React Application (Frontend Test Submission)               │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  UrlShortener   │  │ RedirectHandler │                  │
│  │   Component     │  │   Component     │                  │
│  └─────────────────┘  └─────────────────┘                  │
│           │                      │                          │
│           └──────────┬───────────┘                          │
│                      │                                      │
│  ┌─────────────────────────────────────────────────────────┤
│  │              UrlService                                 │
│  │        (Business Logic Layer)                           │
│  └─────────────────────────────────────────────────────────┤
│           │                      │                          │
│  ┌────────────────┐    ┌─────────────────────────────────┐ │
│  │  LocalStorage  │    │     Logging Middleware          │ │
│  │   (Client-side │    │                                 │ │
│  │   Persistence) │    │                                 │ │
│  └────────────────┘    └─────────────────────────────────┘ │
│                                   │                         │
└───────────────────────────────────┼─────────────────────────┘
                                    │
                        ┌───────────▼──────────────┐
                        │  External Logging API    │
                        │ (20.244.56.144/logs)     │
                        └──────────────────────────┘
```

## Technology Stack & Rationale

### Frontend Framework: React 18 with TypeScript
**Rationale:**
- **Component-based Architecture**: Enables modular, reusable UI components
- **TypeScript Integration**: Provides compile-time type checking and better developer experience
- **React Router**: Built-in support for client-side routing required for redirection
- **Modern Hooks**: useState, useEffect for efficient state management
- **Production Ready**: Mature ecosystem with extensive tooling

### State Management: React Hooks + LocalStorage
**Rationale:**
- **Simplicity**: No complex state management needed for this scope
- **Client-side Persistence**: LocalStorage provides data persistence across sessions
- **No Backend Required**: Meets evaluation requirements for client-side operation
- **Real-time Updates**: Direct state synchronization with storage

### Routing Strategy: React Router DOM v6
**Rationale:**
- **Client-side Routing**: Handles URL redirection without server involvement
- **Dynamic Routes**: Supports parameterized routes for shortcode handling
- **Browser History**: Maintains proper navigation experience
- **Programmatic Navigation**: Enables redirect functionality

### Styling: Custom CSS with Modern Design
**Rationale:**
- **No External Dependencies**: Reduces bundle size and external dependencies
- **Full Control**: Complete customization over design and responsive behavior
- **Performance**: No CSS framework overhead
- **Modern Features**: CSS Grid, Flexbox, CSS Variables

## Data Modeling

### Core Data Structures

#### UrlMapping Interface
```typescript
interface UrlMapping {
  shortcode: string;        // 6-char generated or 3-10 char custom
  originalUrl: string;      // Validated URL
  expiresAt: Date;         // Expiration timestamp
  createdAt: Date;         // Creation timestamp
  accessCount: number;     // Usage analytics
}
```

#### Logging Interfaces
```typescript
interface LogRequest {
  stack: string;           // Component identifier
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  package: string;         // Module name
  message: string;         // Descriptive message
}

interface LogResponse {
  logID: string;          // Unique log identifier
  timestamp: string;      // Server timestamp
  status: 'success' | 'error';
}
```

### Data Flow Architecture

1. **User Input** → Component State
2. **Validation** → UrlService Business Logic
3. **Storage** → LocalStorage Persistence
4. **Logging** → External API via Middleware
5. **Display** → Component Re-render

## Component Architecture

### UrlShortener Component
**Responsibilities:**
- URL input form handling
- Validation feedback
- Display of existing short URLs
- User interaction management

**Key Features:**
- Form validation with real-time feedback
- Copy-to-clipboard functionality
- URL management (create, view, delete)
- Responsive grid layout

### RedirectHandler Component
**Responsibilities:**
- Extract shortcode from URL parameters
- Resolve shortcode to original URL
- Handle redirection logic
- Display appropriate error states

**Key Features:**
- Loading states with spinner
- Error handling for expired/invalid links
- Automatic redirection with delay
- User-friendly error messages

### UrlService (Business Logic)
**Responsibilities:**
- URL validation and shortcode generation
- LocalStorage operations
- Expiration management
- Logging integration

**Key Features:**
- Unique shortcode generation algorithm
- Custom shortcode validation
- Automatic cleanup of expired URLs
- Comprehensive error handling

## Routing Implementation

### Route Structure
```typescript
<Routes>
  <Route path="/" element={<UrlShortener />} />
  <Route path="/:shortcode" element={<RedirectHandler />} />
</Routes>
```

### Redirection Flow
1. **URL Access**: User visits `/{shortcode}`
2. **Parameter Extraction**: React Router extracts shortcode
3. **Resolution**: UrlService resolves shortcode to original URL
4. **Validation**: Check expiration and existence
5. **Redirection**: `window.location.href` for external navigation
6. **Analytics**: Increment access count
7. **Logging**: Log all steps for monitoring

## Validation Strategy

### URL Validation
```typescript
private static isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

### Shortcode Validation
```typescript
private static isValidShortcode(shortcode: string): boolean {
  const regex = /^[a-zA-Z0-9]{3,10}$/;
  return regex.test(shortcode);
}
```

### Uniqueness Checking
- Real-time validation against existing shortcodes
- Case-sensitive comparison
- Automatic generation until unique shortcode found

## Logging Integration

### Middleware Architecture
```typescript
export class Logger {
  private static readonly API_URL = 'http://20.244.56.144/evaluation-service/logs';
  
  static async Log(
    stack: string,
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
    package: string,
    message: string
  ): Promise<LogResponse | null>
}
```

### Logging Strategy
- **Comprehensive Coverage**: All user actions and system events
- **Structured Format**: Consistent log message structure
- **Error Handling**: Graceful degradation if logging fails
- **No Console Usage**: Strict adherence to evaluation requirements

### Log Categories
- **User Actions**: URL creation, deletion, access
- **System Events**: Validation, redirection, cleanup
- **Errors**: Validation failures, network issues
- **Performance**: Response times, operation success

## Error Handling Strategy

### Client-side Error Handling
1. **Input Validation**: Real-time form validation
2. **Network Errors**: Graceful handling of API failures
3. **Storage Errors**: LocalStorage quota and access issues
4. **Routing Errors**: Invalid shortcode handling

### User Experience
- **Clear Error Messages**: Descriptive, actionable feedback
- **Loading States**: Visual feedback during operations
- **Fallback UI**: Graceful degradation for failures
- **Recovery Options**: Clear paths to resolve issues

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Components loaded on demand
2. **Efficient Re-renders**: Proper dependency arrays in useEffect
3. **Storage Optimization**: Automatic cleanup of expired data
4. **Network Efficiency**: Batched logging where possible

### Scalability Considerations
- **Client-side Limitations**: LocalStorage 5-10MB limit
- **Memory Management**: Efficient data structures
- **Cleanup Mechanisms**: Automatic expired data removal

## Security Considerations

### Input Sanitization
- URL validation using native browser APIs
- Shortcode format enforcement
- XSS prevention through React's built-in protections

### Data Protection
- Client-side only storage (no sensitive data transmission)
- URL validation prevents malicious redirects
- Expiration-based access control

## Assumptions & Constraints

### Technical Assumptions
1. **Modern Browser Support**: ES6+, LocalStorage, Fetch API
2. **Single Domain Deployment**: No cross-domain considerations
3. **Client-side Operation**: No backend database required
4. **Network Connectivity**: Logging API accessible

### Business Assumptions
1. **No Authentication**: Users pre-authorized
2. **Evaluation Context**: Production-ready but evaluation-focused
3. **Limited Scale**: Client-side storage sufficient
4. **Short-term Usage**: 30-minute default validity appropriate

## Future Enhancement Opportunities

### Technical Enhancements
1. **Server-side Storage**: Database integration for persistence
2. **Caching Strategy**: Service worker for offline functionality
3. **Analytics Dashboard**: Advanced usage statistics
4. **API Integration**: RESTful backend services

### Feature Enhancements
1. **User Authentication**: Personal URL management
2. **QR Code Generation**: Visual sharing options
3. **Bulk Operations**: Multiple URL processing
4. **Advanced Analytics**: Click tracking, geographic data

## Testing Strategy

### Unit Testing Approach
- Component testing with React Testing Library
- Service layer testing for business logic
- Utility function testing for validation

### Integration Testing
- End-to-end user flows
- Routing behavior validation
- LocalStorage integration testing

### Manual Testing Checklist
- Cross-browser compatibility
- Responsive design validation
- Error scenario handling
- Performance under load

## Deployment Considerations

### Build Configuration
- TypeScript compilation
- CSS optimization
- Bundle size optimization
- Source map generation for debugging

### Environment Setup
- Development server configuration
- Production build optimization
- Static file serving
- Browser compatibility polyfills

This design document provides a comprehensive overview of the technical decisions, architecture, and implementation strategy for the URL Shortener application, ensuring it meets all evaluation requirements while maintaining production-quality standards.
