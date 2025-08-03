# SSE Gateway Service

A Spring Boot 3 application that serves as a gateway for Server-Sent Events (SSE) from multiple backend services. This service aggregates real-time events from various sources and provides unified endpoints for clients to consume these streams.

## Project Overview

The SSE Gateway acts as a proxy and aggregator for multiple SSE endpoints, providing both public and secured access to real-time event streams. 

## Prerequisites

- Java 21 or higher
- Node.js (for mock servers)
- Gradle (included as wrapper)

## How to Run

### Quick Start with Mock Services

The easiest way to run the complete system is using the provided start script:

```bash
./start-all.sh
```

This script will:
- Check and install npm dependencies for mock servers
- Start three mock SSE servers on ports 8081, 8082, 8083
- Start the SSE Gateway on port 8080
- Display all available endpoints and example usage

### Manual Setup

#### 1. Start Mock Servers (Optional)

```bash
cd mock-sse-servers
npm install
npm run start-all
```

This starts:
- Wallet Service on port 8081
- Game Service on port 8082  
- User Service on port 8083

#### 2. Start the Gateway Service

```bash
./gradlew bootRun
```

Or with a specific profile:

```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```

## How to Build

### Build JAR

```bash
./gradlew build
```

## Configuration Properties

The application uses Spring Boot configuration with the prefix `sse-gateway`. Configuration can be set in `application.yaml` or `application-local.yaml`.

### Core Properties

```yaml
sse-gateway:
  debug: false                    # Enable debug logging
  security: false                 # Enable/disable JWT security
  endpoints: []                   # List of public SSE endpoints
  secured-endpoints: []           # List of secured SSE endpoints (requires JWT)
```

### Endpoint Configuration

Each endpoint is configured with:
- `name`: Unique identifier for the endpoint
- `url`: Backend SSE service URL
- `filter-params`: List of allowed query parameters

Example endpoint configuration:

```yaml
sse-gateway:
  endpoints:
    - name: wallet-transactions
      url: http://localhost:8081/wallet/transaction-events
      filter-params:
        - userId
        - currency
        - minAmount
```

### Security Configuration

When `sse-gateway.security: true`, the secured endpoints require JWT authentication. You must also configure the JWT issuer URI:

```yaml
sse-gateway:
  security: true
  secured-endpoints:
    - name: user-profile-events
      url: http://localhost:8083/users/profile-events
      filter-params:
        - profileType

spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://your-auth-server.com  # Required when security is enabled
```

### Spring Boot Properties

Standard Spring Boot properties are also available:

```yaml
server:
  port: 8080

spring:
  application:
    name: sse-gateway-services

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

## API Endpoints

### Public Endpoints

- `GET /public/events` - Access public SSE streams without authentication
- `GET /actuator/health` - Health check endpoint
- `GET /actuator/info` - Application information
- `GET /actuator/metrics` - Metrics endpoint

### Secured Endpoints (when sse-gateway.security=true)

- `GET /events` - Access secured SSE streams with JWT authentication

### Query Parameters

- `sources`: Comma-separated list of endpoint names to subscribe to
- Additional parameters as defined in endpoint `filter-params`

### Example Usage

Public access:
```bash
curl "http://localhost:8080/public/events?sources=wallet-transactions,wallet-zero-balance&userId=user123"
```

Secured access (when security enabled):
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" "http://localhost:8080/events?sources=user-profile-events"
```

## Environment Profiles

### Default Profile
Uses configuration from `application.yaml` with production-ready settings.

### Local Profile  
Uses `application-local.yaml` with:
- Debug logging enabled
- H2 in-memory database
- OpenTelemetry disabled
