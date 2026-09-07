# HubSpot Theme Implementation Guide

## Overview
This guide explains how to apply the HubSpot-style theme across your entire CRM application while preserving all existing functionality and data.

## What's Been Created

### 1. Global CSS Theme (`src/css/hubspot-global-theme.css`)
- Complete HubSpot-style design system
- Green color scheme (#006400) matching your branding
- Responsive layout components
- Form styles, table styles, button styles
- Modal and card components
- Status badges and utility classes

### 2. Reusable Layout Component (`src/components/HubSpotLayout.js`)
- Consistent navigation structure
- Top navigation bar with logo and user controls
- Left sidebar with navigation menu
- Content area with header and actions
- Automatic breadcrumb generation

### 3. Global Theme Import
- Added to `src/App.js` to apply across all pages

## How to Apply to Existing Pages

### Step 1: Import the Layout Component
Replace the existing layout structure in your page with the HubSpotLayout:

```javascript
import React from 'react';
import HubSpotLayout from '../components/HubSpotLayout';
import '../css/hubspot-global-theme.css';

const YourPage = () => {
    // Your existing state and functions here
    
    // Define header actions
    const headerActions = [
        {
            label: 'Create New',
            variant: 'primary',
            icon: 'fas fa-plus',
            onClick: () => setShowCreateModal(true)
        },
        {
            label: 'Export',
            variant: 'secondary',
            icon: 'fas fa-download',
            onClick: () => handleExport()
        }
    ];

    return (
        <HubSpotLayout
            title="Your Page Title"
            description="Description of what this page does"
            actions={headerActions}
        >
            {/* Your existing content goes here */}
            {/* All your existing JSX, modals, forms, etc. */}
        </HubSpotLayout>
    );
};
```

### Step 2: Update CSS Classes
Replace existing CSS classes with the new HubSpot theme classes:

#### Buttons
```javascript
// Old
<button className="btn btn-success">Save</button>

// New (same classes, but styled differently)
<button className="btn btn-primary">Save</button>
```

#### Cards
```javascript
// Old
<div className="card">
    <div className="card-header">
        <h3>Card Title</h3>
    </div>
    <div className="card-body">
        Content
    </div>
</div>

// New (same structure, new styling)
<div className="card">
    <div className="card-header">
        <h3 className="card-title">Card Title</h3>
    </div>
    <div>
        Content
    </div>
</div>
```

#### Tables
```javascript
// Old table structure
<table className="table">
    <thead>
        <tr>
            <th>Column</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Data</td>
        </tr>
    </tbody>
</table>

// New (wrap in container)
<div className="table-container">
    <div className="table-header">
        <h2>Table Title</h2>
        <div className="table-actions">
            <div className="table-search-container">
                <i className="fas fa-search table-search-icon"></i>
                <input className="table-search-input" placeholder="Search..." />
            </div>
        </div>
    </div>
    <div className="table-wrapper">
        <table className="table">
            {/* Your existing table content */}
        </table>
    </div>
</div>
```

#### Forms
```javascript
// Old
<div className="form-group">
    <label>Label</label>
    <input type="text" className="form-control" />
</div>

// New (same structure, enhanced styling)
<div className="form-group">
    <label className="form-label">Label</label>
    <input type="text" className="form-control" />
</div>
```

#### Modals
```javascript
// Old modal structure
{showModal && (
    <div className="modal">
        <div className="modal-content">
            <div className="modal-header">
                <h2>Title</h2>
                <button onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
                Content
            </div>
        </div>
    </div>
)}

// New
{showModal && (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h2>Title</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <div className="modal-body">
                Content
            </div>
        </div>
    </div>
)}
```

### Step 3: Status Badges
Update status badges to use the new classes:

```javascript
// Old
<span className="badge badge-success">Active</span>

// New
<span className="status-badge status-active">Active</span>
```

Available status classes:
- `status-active` / `status-converted` (green)
- `status-pending` / `status-prospect` (yellow)
- `status-inactive` / `status-lost` (red)
- `status-new` (blue)
- `status-contacted` (gray)
- `status-qualified` (green)

### Step 4: Remove Old Layout Components
Remove these components from your pages:
- `<Header />` component
- `<Sidebar />` component
- Any custom navigation elements

## Example: Converting the Leads Page

Here's how the Leads page would look with the new theme:

```javascript
import React, { useState, useEffect } from 'react';
import HubSpotLayout from '../components/HubSpotLayout';
import '../css/hubspot-global-theme.css';

const Leads = () => {
    // All your existing state and functions remain the same
    
    const headerActions = [
        {
            label: 'Create Lead',
            variant: 'primary',
            icon: 'fas fa-plus',
            onClick: () => setShowCreateModal(true)
        }
    ];

    return (
        <HubSpotLayout
            title="Leads Management"
            description="Manage and track your sales leads and prospects"
            actions={headerActions}
        >
            {/* Your existing content with updated CSS classes */}
            {/* All modals, forms, tables remain the same */}
        </HubSpotLayout>
    );
};
```

## Benefits of This Approach

1. **Consistent Design**: All pages will have the same professional HubSpot-style appearance
2. **Preserved Functionality**: All existing features, data, and logic remain intact
3. **Responsive**: Works on all screen sizes
4. **Maintainable**: Centralized styling and layout
5. **Scalable**: Easy to add new pages with consistent design

## Color Scheme

The theme uses your existing green color scheme:
- Primary: #006400 (dark green)
- Secondary: #6c757d (gray)
- Success: #28a745 (green)
- Warning: #ffc107 (yellow)
- Danger: #dc3545 (red)
- Background: #f8f9fa (light gray)

## Next Steps

1. **Start with one page**: Convert one page first to test the approach
2. **Gradual migration**: Convert pages one by one to ensure nothing breaks
3. **Test thoroughly**: Make sure all functionality works with the new layout
4. **Customize as needed**: Adjust the theme colors or components if needed

## Troubleshooting

If styles aren't applying correctly:
1. Make sure `hubspot-global-theme.css` is imported in `App.js`
2. Check that old CSS files aren't overriding the new styles
3. Use browser dev tools to inspect which styles are being applied
4. Add `!important` to critical styles if needed

## Support

The new theme is designed to be a drop-in replacement that preserves all your existing functionality while providing a modern, professional appearance consistent with HubSpot's design language. 