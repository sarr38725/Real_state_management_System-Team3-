# Firebase Functions Documentation

## Callable Functions

### Property Management
- `calculatePropertyStats`: Calculate average prices, market trends
- `sendPropertyInquiry`: Send inquiry emails to property owners
- `generatePropertyReport`: Generate PDF reports for properties

### User Management
- `updateUserRole`: Admin function to update user roles
- `sendWelcomeEmail`: Send welcome email to new users
- `generateUserReport`: Generate user activity reports

### Notifications
- `sendPushNotification`: Send push notifications to users
- `schedulePropertyReminders`: Schedule viewing reminders
- `sendMarketUpdates`: Send market update emails

## Triggers

### Firestore Triggers
- `onPropertyCreate`: Index property, send notifications
- `onUserCreate`: Create user profile, send welcome email
- `onFavoriteAdd`: Update property stats, send notifications

### Authentication Triggers
- `onUserSignUp`: Create user profile, assign default role
- `onUserDelete`: Clean up user data, transfer properties

### Storage Triggers
- `onImageUpload`: Generate thumbnails, validate images
- `onImageDelete`: Clean up references in database