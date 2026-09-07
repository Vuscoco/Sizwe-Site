# Testing Guide: Dynamic Table Functionality

## Overview
The TestPage now has dynamic functionality that allows you to add new entries to both the Clients and Accreditation tables. Data is stored in the browser's localStorage and persists between sessions.

## How to Test

### 1. Adding Client Data
- Navigate to **Client Creation** page
- Fill out the form with client information
- Submit the form
- The new client will automatically appear in the TestPage Clients table

### 2. Adding Accreditation Data
- Navigate to **TestPage**
- Switch to the "Accreditation" table using the toggle button
- Click "Add New" to show the quick add form
- Fill out the accreditation details
- Click "Add Accreditation"
- The new accreditation will appear in the table

### 3. Viewing Data
- All new entries are displayed in the respective tables
- The table headers show the total count of entries
- Static sample data remains for reference
- Dynamic data appears below the sample data

### 4. Clearing Data
- Use the "Clear All Data" button on TestPage to reset all stored data
- This is useful for testing the functionality multiple times

## Technical Details

### Data Storage
- Data is stored in browser localStorage
- Keys: `clientsData` and `accreditationData`
- Data persists between browser sessions
- Data is shared across all pages in the application

### Integration Points
- **ClientCreation.js**: Saves client data to localStorage after successful Django API submission

- **TestPage.js**: Loads and displays data from localStorage
- **TestPage.js**: Provides quick add form for accreditation data

### Data Structure

#### Client Data
```javascript
{
  id: timestamp,
  clientName: string,
  seta: string,
  service: string,
  status: string,
  contactPerson: string,
  sdlNumber: string,
  monthlyRetainer: number,
  paymentTerms: string,
  costPerLearner: number,
  totalValue: number,
  lastContact: string (YYYY-MM-DD),
  nextFollowUp: string (YYYY-MM-DD),
  createdAt: string (ISO date)
}
```

#### Accreditation Data
```javascript
{
  id: timestamp,
  accreditingBody: string,
  accreditationNumber: string,
  qualifications: string,
  nqfLevel: string,
  ofoNumber: string,
  issuedBy: string (YYYY-MM-DD),
  expires: string,
  duration: string,
  createdAt: string (ISO date)
}
```

## Future Enhancements
- Connect to Django backend for permanent storage
- Add edit/delete functionality for entries
- Add search and filter capabilities
- Add data export functionality
- Add data validation and error handling

## Notes
- This is a frontend-only implementation using localStorage
- Data is not synchronized with the Django backend
- For production use, integrate with Django API endpoints
- The functionality preserves all existing code and styling 