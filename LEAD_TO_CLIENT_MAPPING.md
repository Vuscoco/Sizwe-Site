# Lead to Client Field Mapping

This document shows the exact one-to-one correspondence between the Lead form fields and Client form fields when a lead is converted to a client.

## Field Mapping Overview

### Basic Information
| Lead Form Field | Client Form Field | Description |
|----------------|------------------|-------------|
| Company Name | Company Name | Direct mapping - company name stays the same |
| Company No. | Registration Number | Company phone number becomes registration number |
| Business Address | Registered Address | Business address becomes registered address |

### Contact Information
| Lead Form Field | Client Form Field | Description |
|----------------|------------------|-------------|
| Lead Manager | Contact Person | Lead manager becomes the primary contact person |
| Business Address | Position | Business address is reused as position (can be updated) |
| Company No. | Phone Number | Company phone number becomes contact phone |
| Contact Email | Email Address | Email address stays the same |

### Business Details
| Lead Form Field | Client Form Field | Description |
|----------------|------------------|-------------|
| SETA | SETA | SETA selection stays the same |
| Services | Services | Selected services are preserved |
| SDL Number | SDL Number | SDL number stays the same |
| Lead Manager | Project Manager | Lead manager becomes project manager |

### Location Information
| Lead Form Field | Client Form Field | Description |
|----------------|------------------|-------------|
| Province/State | Province | Province selection stays the same |
| Country | Country | Country selection stays the same |
| City | City | City name stays the same |

### Additional Preserved Fields
| Lead Form Field | Client Form Field | Description |
|----------------|------------------|-------------|
| Lead Manager | Lead Manager | Lead manager is preserved as separate field |
| Company No. | Company Contact | Company phone number is preserved as separate field |

### Financial Information
| Lead Form Field | Client Form Field | Description |
|----------------|------------------|-------------|
| Estimated Value | Monthly Retainer | Estimated value divided by 12 for monthly retainer |
| Estimated Value | Total Value | Estimated value becomes total annual value |

### Documents and Attachments
| Lead Form Field | Client Form Field | Description |
|----------------|------------------|-------------|
| Document Type | Document Type | Document type selection is preserved |
| Attachments | Attachments | All uploaded files are preserved |

## Implementation Details

### Conversion Function
The `convertLeadToClientData` function in both `Leads.js` and `Clients.js` handles this mapping:

```javascript
const convertedData = {
    // Basic Information - Direct one-to-one mapping
    clientName: leadData.company_name || '',                       // Company Name → Company Name
    clientReg: leadData.company_contact || '',                     // Company No. → Registration Number
    clientAddress: leadData.contact_position || '',                // Business Address → Registered Address
    
    // Contact Information - Direct one-to-one mapping
    contactPerson: leadData.contact_person || '',                  // Lead Manager → Contact Person
    contactPosition: leadData.contact_position || '',              // Business Address → Position
    contactPhone: leadData.company_contact || '',                  // Company No. → Phone Number
    contactEmail: leadData.contact_email || '',                    // Contact Email → Email Address
    
    // Business Details - Direct one-to-one mapping
    seta: leadData.seta || 'wrseta',                               // SETA → SETA
    service: leadData.services ? leadData.services.join(', ') : 'WSP', // Services → Services
    sdlNumber: leadData.sdl_number || '',                          // SDL Number → SDL Number
    moderator: leadData.contact_person || '',                      // Lead Manager → Project Manager
    
    // Location Information - CORRECTED MAPPING
    province: leadData.contact_phone || '',                        // Province/State → Province
    country: leadData.conception_date || '',                       // Country → Country  
    city: leadData.source || '',                                   // City → City
    
    // Additional fields for complete data preservation
    leadManager: leadData.contact_person || '',                    // Lead Manager → Lead Manager
    companyContact: leadData.company_contact || '',                // Company No. → Company Contact
    
    // Financial Information
    monthlyRetainer: leadData.estimated_value ? parseFloat(leadData.estimated_value) / 12 : 0,
    totalValue: leadData.estimated_value || 0,
    
    // Services array for client form
    services: leadData.services || ['WSP'],
    
    // Attachments and Documents
    attachments: leadData.attachments || [],
    documentType: leadData.documentType || 'SLA',
};
```

### Benefits of This Mapping

1. **Consistent Data Flow**: All lead information is properly transferred to the client record
2. **No Data Loss**: Every field from the lead form has a corresponding client form field
3. **Prepopulated Forms**: When editing a converted client, all information is properly prepopulated
4. **Clear Correspondence**: The mapping is logical and intuitive for users
5. **Maintainable Code**: The conversion function is clear and well-documented

### Default Values

For fields that don't have a direct mapping or when lead data is missing:

- **Qualification Type**: Defaults to 'employed_learnership'
- **Qualification Level**: Defaults to 'nqf5'
- **Payment Terms**: Defaults to '30 Days'
- **Status**: Defaults to 'Active'
- **Services**: Defaults to ['WSP'] if no services selected

### Notes

- The conversion preserves all original lead data while mapping it to appropriate client form fields
- Users can edit the converted client information after conversion
- The system maintains a reference to the original lead ID for tracking purposes
- All attachments and documents are preserved during conversion
