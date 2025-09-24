# Masjid Salah App API

A comprehensive REST API for managing masjid (mosque) prayer timings and information across India, built with ASP.NET Core 8 and Entity Framework Core.

## Overview

This application provides a centralized platform for managing prayer schedules, masjid details, and special events. It allows administrators to maintain accurate prayer timings while providing users easy access to location-based masjid information.

## Features

### Core Functionality
- **Location Management**: Hierarchical state → city → masjid organization
- **Prayer Timings**: Complete Salah schedules (Fajr, Dhuhr, Asr, Maghrib, Isha, Jummah)
- **Additional Timings**: Sunrise, sunset, tahajjud, sehri, iftar times
- **Special Events**: Eid prayers, Ramadan events, community programs
- **Location-based Search**: Find nearby masjids using coordinates
- **Admin Management**: Secure admin authentication and role management

### Technical Features
- RESTful API design with comprehensive CRUD operations
- Model-first Entity Framework approach
- Automatic database creation with seed data
- Pagination support for large datasets
- Geographic distance calculations
- Comprehensive DTO mapping
- Swagger/OpenAPI documentation

## Database Schema

### Core Entities
- **Admin**: Administrative users with authentication
- **State**: Indian states (pre-seeded with 20 major states)
- **City**: Cities within states (pre-seeded with major cities)
- **Masjid**: Mosque information with location coordinates
- **SalahTiming**: Daily prayer schedules
- **DailyAdditionalTimings**: Additional Islamic timings
- **SpecialEvents**: Community events and special prayers

## API Endpoints

### Location APIs
- `GET /api/states` - Get all states with cities
- `GET /api/cities/by-state/{stateId}` - Get cities by state
- `POST /api/states` - Create new state (Admin)
- `PUT /api/states/{id}` - Update state (Admin)

### Masjid APIs
- `GET /api/masjids` - Get masjids with search & pagination
- `GET /api/masjids/{id}/with-timings` - Get masjid with all timings
- `GET /api/masjids/by-city/{cityId}` - Get masjids by city
- `GET /api/masjids/nearby?lat={lat}&lon={lon}&radius={km}` - Find nearby masjids
- `POST /api/masjids` - Create masjid (Admin)

### Prayer Timing APIs
- `GET /api/salahtimings/masjid/{masjidId}/date/{date}` - Get specific day timings
- `GET /api/salahtimings/daily-schedule/masjid/{masjidId}/date/{date}` - Complete daily schedule
- `GET /api/salahtimings/masjid/{masjidId}` - Get timings by date range
- `POST /api/salahtimings` - Create prayer timings (Admin)

### Additional Timing APIs
- `GET /api/additionaltimings/masjid/{masjidId}/date/{date}` - Get additional timings
- `POST /api/additionaltimings` - Create additional timings (Admin)

### Special Events APIs
- `GET /api/specialevents/upcoming` - Get upcoming events
- `GET /api/specialevents/masjid/{masjidId}` - Get masjid events
- `POST /api/specialevents` - Create events (Admin)

### Admin APIs
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin` - Create admin account
- `POST /api/admin/{id}/change-password` - Change password

## Getting Started

### Prerequisites
- .NET 8 SDK
- SQL Server or LocalDB
- Visual Studio 2022 or VS Code

### Installation

1. **Clone the repository**
2. **Navigate to project directory**
3. **Install dependencies**
   ```bash
   dotnet restore
   ```

4. **Database Connection**
   - The application is configured to use remote SQL Server
   - Connection string is already configured in `appsettings.json`
   - Database will be automatically migrated on first run

5. **Run the application**
   ```bash
   dotnet run
   ```

6. **Access Swagger Documentation**
   - Navigate to `https://localhost:7105` (or your configured port)
   - Swagger UI provides interactive API documentation

### Database Setup

The application uses **Model-First** approach with Entity Framework migrations:
- **Remote SQL Server**: Connected to SalahTimes.mssql.somee.com
- **Database**: SalahTimes (SQL Server 2022 Express)
- **Migrations**: Automatically applied on startup
- **Seed Data**: Includes 20 Indian states, major cities, and default admin
- **Admin Account**: `username: admin`, `password: admin123`

**Connection Details:**
- Server: SalahTimes.mssql.somee.com
- Database: SalahTimes
- Authentication: SQL Server Authentication
- Migrations are automatically applied when the application starts

### Sample Usage

1. **Get all states**: `GET /api/states`
2. **Get cities in Maharashtra**: `GET /api/cities/by-state/6`
3. **Find masjids in Mumbai**: `GET /api/masjids/by-city/15`
4. **Get today's prayer times**: `GET /api/salahtimings/masjid/1/date/2025-09-14`

## Architecture

### Project Structure
```
SalahApp/
├── Controllers/          # API Controllers
├── Data/                # Entity Framework DbContext
├── DTOs/                # Data Transfer Objects
├── Extensions/          # Extension methods and utilities
├── Mappings/            # AutoMapper profiles
├── Models/              # Domain entities
└── Services/            # Service interfaces (implementations pending)
```

### Key Technologies
- **ASP.NET Core 8**: Web API framework
- **Entity Framework Core 9**: ORM and database management
- **AutoMapper**: Object-to-object mapping
- **BCrypt.Net**: Password hashing
- **Swagger/OpenAPI**: API documentation
- **SQL Server**: Database (configurable)

## Next Steps

1. **Implement Service Layer**: Create concrete implementations for all service interfaces
2. **Add Authentication**: Implement JWT tokens for admin authentication
3. **Add Validation**: Enhanced input validation and business rules
4. **Add Caching**: Redis caching for frequently accessed data
5. **Add Logging**: Structured logging with Serilog
6. **Add Tests**: Unit and integration tests
7. **Add Rate Limiting**: API rate limiting for public endpoints
8. **Mobile Apps**: Develop Flutter/React Native mobile applications
9. **Web Frontend**: Create admin dashboard and public website

## Security Considerations

- Admin passwords are hashed using BCrypt
- API endpoints require proper authorization (to be implemented)
- Input validation through Data Annotations
- SQL injection protection through Entity Framework

## Use Cases

### For Administrators
- Manage masjid information and prayer schedules
- Update special events and announcements
- Monitor prayer timing accuracy across regions

### For Users
- Find nearby masjids with accurate prayer times
- Access complete daily schedules including special timings
- Stay informed about upcoming events and programs

### For Developers
- Well-documented REST API for integration
- Consistent response formats and error handling
- Geographic search capabilities for location-based features

This API serves as the foundation for a comprehensive Islamic prayer timing platform, designed to serve the needs of Muslim communities across India while providing administrators with powerful management tools.