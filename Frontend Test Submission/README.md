# URL Shortener Application

A React-based URL shortener application built for the Campus Hiring Evaluation. This application creates short, memorable links that redirect to original URLs with client-side routing and comprehensive logging.

## Features

- **URL Shortening**: Convert long URLs into short, memorable links
- **Custom Shortcodes**: Optional custom shortcodes (3-10 alphanumeric characters)
- **Validity Control**: Set custom validity periods (default: 30 minutes)
- **Client-side Routing**: Handle redirections without server involvement
- **Comprehensive Logging**: All actions logged via custom middleware
- **Responsive Design**: Modern, mobile-friendly UI
- **Real-time Management**: View, copy, and delete shortened URLs
- **Analytics**: Track click counts for each shortened URL

## Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Routing**: React Router DOM v6
- **Storage**: Browser LocalStorage for client-side data persistence
- **Styling**: Custom CSS with modern design patterns
- **Logging**: Custom middleware with external API integration

### Project Structure
```
Frontend Test Submission/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── UrlShortener.tsx      # Main URL shortening interface
│   │   ├── UrlShortener.css      # Component styles
│   │   ├── RedirectHandler.tsx   # Handles short URL redirections
│   │   └── RedirectHandler.css   # Redirect page styles
│   ├── services/
│   │   └── urlService.ts         # URL shortening business logic
│   ├── App.tsx                   # Main application component
│   ├── App.css                   # Global application styles
│   ├── index.tsx                 # Application entry point
│   └── index.css                 # Base styles
├── package.json
├── tsconfig.json
└── README.md

Logging Middleware/
├── src/
│   └── logger.ts                 # Custom logging middleware
└── package.json
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   cd "Frontend Test Submission"
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Access Application**
   - Open http://localhost:3000 in your browser
   - The application will be ready to use

## Usage

### Creating Short URLs
1. Enter the original URL in the input field
2. Optionally provide a custom shortcode (3-10 alphanumeric characters)
3. Set validity period in minutes (default: 30 minutes)
4. Click "Shorten URL" to generate the short link

### Using Short URLs
- Short URLs follow the format: `http://localhost:3000/{shortcode}`
- Clicking a short URL automatically redirects to the original URL
- Expired or invalid short URLs show appropriate error messages

### Managing URLs
- View all created short URLs in the dashboard
- Copy short URLs to clipboard with one click
- Delete unwanted short URLs
- Monitor click statistics for each URL

## Key Features Implementation

### Client-side URL Management
- All URL mappings stored in browser LocalStorage
- Automatic cleanup of expired URLs
- Unique shortcode generation and validation
- Real-time synchronization across browser tabs

### Logging Integration
- Every user action logged via custom middleware
- API integration with http://20.244.56.144/evaluation-service/logs
- Structured logging with stack, level, package, and message
- No console.log usage as per requirements

### Validation & Error Handling
- URL format validation using native URL constructor
- Custom shortcode format validation (alphanumeric, 3-10 chars)
- Uniqueness checking for custom shortcodes
- Comprehensive error messages and user feedback

### Responsive Design
- Mobile-first design approach
- Grid-based layout that adapts to screen size
- Touch-friendly interface elements
- Modern gradient backgrounds and smooth animations

## Data Model

### URL Mapping Interface
```typescript
interface UrlMapping {
  shortcode: string;        // Unique identifier
  originalUrl: string;      // Target URL
  expiresAt: Date;         // Expiration timestamp
  createdAt: Date;         // Creation timestamp
  accessCount: number;     // Click tracking
}
```

### Logging Interface
```typescript
interface LogRequest {
  stack: string;           // Component/service name
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  package: string;         // Module identifier
  message: string;         // Log message
}
```

## Routing Strategy

### Client-side Routing
- **Home Route** (`/`): Main URL shortener interface
- **Redirect Route** (`/:shortcode`): Handles short URL redirections
- **404 Handling**: Invalid shortcodes show user-friendly error pages

### Redirection Flow
1. User visits short URL (`/abc123`)
2. `RedirectHandler` component extracts shortcode
3. `UrlService` resolves shortcode to original URL
4. Automatic redirection to target URL
5. All steps logged via middleware

## Security & Validation

- Input sanitization for URLs and shortcodes
- XSS prevention through React's built-in protections
- URL validation using browser's native URL constructor
- Shortcode format enforcement (alphanumeric only)
- Expiration-based access control

## Performance Considerations

- Lazy loading of components
- Efficient LocalStorage operations
- Automatic cleanup of expired data
- Minimal re-renders through proper state management
- Optimized CSS with modern selectors

## Browser Compatibility

- Modern browsers supporting ES6+ features
- LocalStorage API support required
- Fetch API for logging requests
- CSS Grid and Flexbox support

## Assumptions Made

1. **No Authentication**: Users are pre-authorized as specified
2. **Client-side Storage**: LocalStorage sufficient for evaluation purposes
3. **Single Domain**: Application runs on single domain/port
4. **Modern Browsers**: ES6+ and modern web APIs available
5. **Network Connectivity**: Logging API accessible during usage

## Future Enhancements

- Server-side storage integration
- User authentication and personal dashboards
- QR code generation for short URLs
- Advanced analytics and reporting
- Bulk URL shortening
- API rate limiting and abuse prevention

## Development Notes

- Built with React 18 and TypeScript for type safety
- Follows React best practices and hooks patterns
- Comprehensive error handling and user feedback
- Extensive logging for debugging and monitoring
- Production-ready code structure and organization
