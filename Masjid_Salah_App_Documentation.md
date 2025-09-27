# Masjid Salah App - Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [UI Screens](#ui-screens)
   - [Public Screens](#public-screens)
   - [Admin Screens](#admin-screens)
4. [APIs Used](#apis-used)
5. [Features](#features)
   - [User Features](#user-features)
   - [Admin Features](#admin-features)
6. [Technical Details](#technical-details)

## Overview

The Masjid Salah App is a comprehensive mobile application built with React Native for the frontend and .NET Core for the backend. It provides users with accurate prayer timings for masjids (mosques) and allows administrators to manage all aspects of the application including masjid information, prayer timings, and special events.

## Architecture

### Frontend (@ReactNativeSalah)
- Built with React Native for cross-platform mobile development
- Uses React Navigation for screen routing and navigation
- Implements a clean, intuitive UI with Islamic-themed green color scheme
- Features responsive design with proper loading states and error handling
- Uses AsyncStorage for local storage of admin authentication tokens

### Backend (@SalahApp)
- .NET Core Web API with Entity Framework Core
- SQL Server database with migrations
- JWT-based authentication for admin security
- RESTful API design with standardized response formats
- AutoMapper for object-to-object mapping
- Swagger documentation for API endpoints
- CORS support for web/mobile integration

## UI Screens

### Public Screens

#### SplashScreen
- Initial loading screen that appears when the app starts
- Displays while the app initializes and checks admin authentication status

#### HomeScreen
- Main screen showing nearby masjids based on user location
- Features:
  - Location-based masjid discovery within a 5km radius
  - Search functionality to find masjids by name, city, or imam
  - Pull-to-refresh capability
  - Directions button to navigate to masjids using maps
  - Display of masjid details including name, address, imam, and contact information

#### MasjidDetailsScreen
- Detailed view of a specific masjid with comprehensive prayer information
- Features:
  - Daily prayer timings (Fajr, Dhuhr, Asr, Maghrib, Isha, Jummah)
  - Additional timings (Sunrise, Sunset, Sehri, Iftar, Zawal, Tahajjud)
  - Special events and announcements
  - Current time display
  - Islamic date display
  - Default schedule indicators
  - Directions to masjid

### Admin Screens

#### AdminLoginScreen
- Secure login screen for administrators
- Features:
  - Username and password authentication
  - Password visibility toggle
  - Test credentials option for development
  - JWT token-based authentication

#### AdminDashboardScreen
- Central hub for all administrative functions
- Features:
  - Quick access cards for all management sections
  - Admin profile information display
  - Logout functionality
  - Statistics overview (placeholder)

#### ManageMasjidsScreen
- CRUD operations for masjid management
- Features:
  - List view of all masjids
  - Add/Edit/Delete functionality
  - Form for masjid details (name, address, location, contact info)
  - Quick access to timing management for each masjid

#### ManageTimingsScreen
- Management of prayer timings for masjids
- Features:
  - Default schedule management
  - Date-specific timing management
  - Time picker for precise time entry
  - Visual indicators for default vs. specific timings
  - Support for all 5 daily prayers plus Jummah

#### ManageStatesScreen
- Management of states/regions in the system
- Features:
  - List view of all states
  - Add/Edit/Delete functionality
  - Form for state names

#### ManageCitiesScreen
- Management of cities within states
- Features:
  - List view of all cities grouped by state
  - Add/Edit/Delete functionality
  - Form for city details with state selection

#### ManageAdditionalTimingsScreen
- Management of additional timings (sunrise, sunset, etc.)
- Features:
  - Date-specific additional timing management
  - Time picker for precise time entry
  - Support for Sunrise, Sunset, Sehri, Iftar, Zawal, and Tahajjud times

## APIs Used

### MasjidsController
- `GET /api/masjids` - Get all masjids with pagination and search
- `GET /api/masjids/{id}` - Get a specific masjid by ID
- `GET /api/masjids/{id}/with-timings` - Get a masjid with all its timings
- `GET /api/masjids/by-city/{cityId}` - Get masjids by city ID
- `GET /api/masjids/nearby` - Get nearby masjids based on coordinates
- `POST /api/masjids` - Create a new masjid
- `PUT /api/masjids/{id}` - Update an existing masjid
- `DELETE /api/masjids/{id}` - Delete a masjid

### SalahTimingsController
- `GET /api/salahtimings` - Get all salah timings with filters
- `GET /api/salahtimings/{id}` - Get a specific salah timing by ID
- `GET /api/salahtimings/masjid/{masjidId}/date/{date}` - Get timing for a masjid on a specific date
- `GET /api/salahtimings/daily-schedule/masjid/{masjidId}/date/{date}` - Get daily schedule
- `GET /api/salahtimings/default-schedule/masjid/{masjidId}` - Get default schedule for a masjid
- `POST /api/salahtimings` - Create a new salah timing
- `PUT /api/salahtimings/{id}` - Update an existing salah timing
- `DELETE /api/salahtimings/{id}` - Delete a salah timing
- `POST /api/salahtimings/default-schedule` - Create a default schedule
- `PUT /api/salahtimings/default-schedule/{scheduleId}` - Update a default schedule

### AdditionalTimingsController
- `GET /api/additionaltimings/masjid/{masjidId}/date/{date}` - Get additional timings for a masjid on a specific date
- `POST /api/additionaltimings` - Create new additional timings
- `PUT /api/additionaltimings/{id}` - Update existing additional timings
- `DELETE /api/additionaltimings/{id}` - Delete additional timings

### StatesController
- `GET /api/states` - Get all states
- `GET /api/states/{id}` - Get a specific state by ID
- `POST /api/states` - Create a new state
- `PUT /api/states/{id}` - Update an existing state
- `DELETE /api/states/{id}` - Delete a state

### CitiesController
- `GET /api/cities/by-state/{stateId}` - Get cities by state ID
- `GET /api/cities/{id}` - Get a specific city by ID
- `POST /api/cities` - Create a new city
- `PUT /api/cities/{id}` - Update an existing city
- `DELETE /api/cities/{id}` - Delete a city

### SpecialEventsController
- `GET /api/specialevents/upcoming` - Get upcoming events
- `GET /api/specialevents/masjid/{masjidId}` - Get events for a specific masjid
- `POST /api/specialevents` - Create a new special event
- `PUT /api/specialevents/{id}` - Update an existing special event
- `DELETE /api/specialevents/{id}` - Delete a special event

### AdminController
- `POST /api/admin/login` - Admin login with JWT token generation
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/profile` - Get admin profile information

## Features

### User Features

#### Location-based Discovery
- Automatically detects user location
- Finds nearby masjids within a 5km radius
- Displays distance to each masjid
- Fallback to all masjids if location services are unavailable

#### Comprehensive Prayer Information
- Displays all 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Shows both Azan (call to prayer) and Iqamah (start of prayer) times
- Includes Jummah prayer timings for Friday prayers
- Additional timings: Sunrise, Sunset, Sehri (end of Suhoor), Iftar (breaking fast), Zawal, Tahajjud

#### Special Events & Announcements
- Displays special events and announcements for masjids
- Date-range filtering for upcoming events

#### Easy Navigation
- Integrated map directions to masjids
- Address display with city and state information

#### Search Functionality
- Search masjids by name, city, or imam name
- Real-time filtering of results

#### Islamic Date System
- Displays Gregorian date
- Shows corresponding Islamic (Hijri) date

#### Default Schedule Indicators
- Visual indicators showing when default timings are being used
- Timestamp of last update for default schedules

### Admin Features

#### Hierarchical Location Management
- Manage states and cities in a hierarchical structure
- Assign masjids to specific cities and states

#### Flexible Timing System
- Set default schedules that apply to all dates unless overridden
- Create date-specific timings for special occasions
- Manage additional timings (sunrise, sunset, etc.)

#### Comprehensive Masjid Management
- Create, read, update, and delete masjid information
- Store detailed information including address, coordinates, contact info, and imam name

#### Special Events Management
- Create and manage special events and announcements
- Set date ranges for events

#### Role-based Access Control
- Secure authentication system with JWT tokens
- Protected admin routes
- Secure logout functionality

#### Data Integrity
- Validation on all forms
- Error handling and user feedback
- Consistent data formats across the application

## Technical Details

### Frontend Technologies
- React Native with Expo
- React Navigation for routing
- Axios for API communication
- AsyncStorage for local data storage
- Expo Location services for geolocation
- DateTimePicker for time selection

### Backend Technologies
- .NET Core 6.0
- Entity Framework Core for data access
- SQL Server database
- JWT for authentication
- AutoMapper for object mapping
- Swagger for API documentation
- HijriCalendar for Islamic date conversion

### Security
- JWT token-based authentication
- Password hashing
- HTTPS enforcement
- CORS policy implementation

### Data Models
- **Masjid**: Main entity with name, address, location, and contact information
- **State/City**: Hierarchical location structure
- **SalahTiming**: Daily prayer timings for specific dates
- **DefaultSchedule**: Default prayer timings for masjids
- **DailyAdditionalTimings**: Additional timings like sunrise, sunset
- **SpecialEvents**: Special events and announcements
- **Admin**: Administrator accounts with roles

### API Response Format
All API responses follow a standardized format:
```json
{
  "Success": true,
  "Message": "Success message",
  "Data": { }
}
```

### Error Handling
- Comprehensive error handling in both frontend and backend
- User-friendly error messages
- Network error detection and handling
- Validation error reporting