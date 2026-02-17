# Option 2 User Flow Diagrams

## Flow 1: Guest Booking (No Account)

```
┌─────────────────┐
│ User (Guest)    │
│ Not Logged In   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Browse /classes                 │
│ Click "Book Now"                │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ BookingModal                    │
│ - Enter name                    │
│ - Enter email                   │
│ - Enter phone (optional)        │
│ - Accept policies               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Edge Function:                  │
│ create-checkout-session         │
│ - Create pending booking        │
│ - user_id = NULL (guest)        │
│ - Generate manage_token         │
│ - Return Stripe URL + token     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Stripe Checkout                 │
│ - Customer pays                 │
│ - Redirects to success page     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Stripe Webhook                  │
│ - Receives payment event        │
│ - Calls confirm_booking_payment │
│ - Updates status to 'paid'      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ /booking/success                │
│ - Shows booking details         │
│ - Shows manage link:            │
│   /booking/manage/{token}       │
│ - CTA: "Create Account"         │
└─────────────────────────────────┘
```

## Flow 2: Guest Manages Booking (Token-Based)

```
┌─────────────────┐
│ User (Guest)    │
│ Has manage link │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Opens link:                     │
│ /booking/manage/{token}         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ BookingManage Page              │
│ - Calls get_booking_by_token()  │
│ - Shows booking details         │
│ - Shows class info              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ If status = 'pending' AND       │
│ before class starts:            │
│ - Show "Cancel Booking" button  │
└────────┬────────────────────────┘
         │
         ▼ (user clicks cancel)
┌─────────────────────────────────┐
│ Calls cancel_booking_by_token() │
│ - Validates: pending + future   │
│ - Updates status to 'cancelled' │
│ - Returns success message       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Shows updated status            │
│ "Booking cancelled"             │
└─────────────────────────────────┘
```

## Flow 3: Create Account & Claim Bookings

```
┌─────────────────┐
│ User (Guest)    │
│ Has booking(s)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Clicks "Create Account" or      │
│ Navigates to /bookings          │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ MagicLinkAuth Component         │
│ - Enter email                   │
│ - Click "Send magic link"       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Supabase Auth                   │
│ - Sends magic link email        │
│ - User clicks link in email     │
│ - Creates session               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Redirected to /bookings         │
│ - useAuth hook detects user     │
│ - useEffect triggers            │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Auto-claim guest bookings:      │
│ - Calls claim_my_bookings()     │
│ - Matches by email              │
│ - Sets user_id = auth.uid()     │
│ - Returns count claimed         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Load user bookings:             │
│ - Calls get_my_bookings()       │
│ - Returns all user's bookings   │
│ - Displays in list              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Shows notification:             │
│ "We found X previous booking(s)"│
│ + List of all bookings          │
└─────────────────────────────────┘
```

## Flow 4: Logged-In Booking

```
┌─────────────────┐
│ User (Logged In)│
│ Has account     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Browse /classes                 │
│ Click "Book Now"                │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ BookingModal                    │
│ - Email PRE-FILLED              │
│ - Enter name                    │
│ - Enter phone (optional)        │
│ - Accept policies               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Edge Function:                  │
│ create-checkout-session         │
│ - Extracts user_id from token   │
│ - Create pending booking        │
│ - user_id = auth.uid()          │
│ - Generate manage_token         │
│ - Return Stripe URL             │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Stripe Checkout                 │
│ - Customer pays                 │
│ - Redirects to success page     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Stripe Webhook                  │
│ - Updates status to 'paid'      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ /booking/success                │
│ - Shows booking details         │
│ - Shows "View My Bookings" btn  │
│ - No manage link needed         │
└────────┬────────────────────────┘
         │
         ▼ (clicks button)
┌─────────────────────────────────┐
│ /bookings                       │
│ - Shows all user bookings       │
│ - Can cancel pending bookings   │
└─────────────────────────────────┘
```

## Flow 5: Manage Bookings (Logged In)

```
┌─────────────────┐
│ User (Logged In)│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Navigate to /bookings           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ MyBookings Page                 │
│ - Shows user email              │
│ - Shows sign out button         │
│ - Calls get_my_bookings()       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Display bookings list:          │
│ - Upcoming bookings first       │
│ - Status badges                 │
│ - Class details                 │
│ - Cancel button (if pending)    │
└────────┬────────────────────────┘
         │
         ▼ (user clicks cancel)
┌─────────────────────────────────┐
│ Confirmation dialog             │
│ "Cancel this booking?"          │
└────────┬────────────────────────┘
         │
         ▼ (confirms)
┌─────────────────────────────────┐
│ Calls cancel_my_booking()       │
│ - Validates: ownership          │
│ - Validates: pending + future   │
│ - Updates status to 'cancelled' │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Reload bookings                 │
│ - Shows updated status          │
│ - Toast: "Booking cancelled"    │
└─────────────────────────────────┘
```

## Database Flow: Claiming Guest Bookings

```
┌─────────────────────────────────┐
│ BEFORE SIGN-IN                  │
│ bookings table:                 │
│ ┌────────────────────────────┐  │
│ │ id: uuid-1                 │  │
│ │ user_id: NULL              │  │
│ │ user_email: user@email.com │  │
│ │ manage_token: abc123...    │  │
│ │ status: paid               │  │
│ └────────────────────────────┘  │
└─────────────────────────────────┘
         │
         ▼ User signs in with user@email.com
┌─────────────────────────────────┐
│ claim_my_bookings() RPC         │
│ UPDATE bookings                 │
│ SET user_id = auth.uid()        │
│ WHERE user_id IS NULL           │
│   AND lower(user_email) =       │
│       lower(auth.email())       │
│   AND status IN ('pending','paid')│
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ AFTER SIGN-IN                   │
│ bookings table:                 │
│ ┌────────────────────────────┐  │
│ │ id: uuid-1                 │  │
│ │ user_id: user-uuid-123     │  │ ← CLAIMED
│ │ user_email: user@email.com │  │
│ │ manage_token: abc123...    │  │
│ │ status: paid               │  │
│ └────────────────────────────┘  │
└─────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────┐
│ GUEST USER (Not Authenticated)  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Direct Table Access:            │
│ ❌ SELECT from bookings         │
│ ❌ UPDATE bookings              │
│ ❌ DELETE from bookings         │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Token-Based RPC Access:         │
│ ✅ get_booking_by_token()       │
│ ✅ cancel_booking_by_token()    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ AUTHENTICATED USER              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Direct Table Access (RLS):      │
│ ✅ SELECT where user_id=auth.uid()│
│ ✅ UPDATE where user_id=auth.uid()│
│ ❌ SELECT other users' bookings │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ RPC Access:                     │
│ ✅ claim_my_bookings()          │
│ ✅ get_my_bookings()            │
│ ✅ cancel_my_booking()          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ADMIN USER                      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Full Access (RLS):              │
│ ✅ SELECT all bookings          │
│ ✅ UPDATE all bookings          │
│ ✅ DELETE all bookings          │
│ ✅ SELECT all payments          │
└─────────────────────────────────┘
```

## Cancellation Logic Flow

```
┌─────────────────────────────────┐
│ User requests cancellation      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Check 1: Booking exists?        │
│ ✅ Yes → Continue               │
│ ❌ No → Error: "Not found"      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Check 2: User owns booking?     │
│ (for logged-in users)           │
│ ✅ Yes → Continue               │
│ ❌ No → Error: "Access denied"  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Check 3: Status = 'pending'?    │
│ ✅ Yes → Continue               │
│ ❌ No → Error: "Only pending    │
│         bookings can be         │
│         cancelled"              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Check 4: Class not started?     │
│ (starts_at > now())             │
│ ✅ Yes → Continue               │
│ ❌ No → Error: "Class already   │
│         started"                │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ UPDATE bookings                 │
│ SET status = 'cancelled'        │
│ WHERE id = booking_id           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Return success                  │
│ { success: true,                │
│   message: "Booking cancelled" }│
└─────────────────────────────────┘
```

## Component Hierarchy

```
App.tsx
├── Routes
│   ├── /classes → Classes.tsx
│   │   └── BookingModal.tsx
│   │       └── useAuth() hook
│   │
│   ├── /bookings → MyBookings.tsx
│   │   ├── useAuth() hook
│   │   ├── MagicLinkAuth.tsx (if not logged in)
│   │   └── Booking List (if logged in)
│   │       └── Cancel Dialog
│   │
│   ├── /booking/success → BookingSuccess.tsx
│   │   ├── useAuth() hook
│   │   └── Shows manage link or "View My Bookings"
│   │
│   └── /booking/manage/:token → BookingManage.tsx
│       └── Token-based booking view
│           └── Cancel Dialog
│
└── Layout
    ├── Header
    ├── Footer
    └── TestModeBanner
```

## Data Flow: Booking Creation

```
User Input (BookingModal)
    │
    ├─ name: string
    ├─ email: string
    └─ phone: string
    │
    ▼
callFunction("create-checkout-session")
    │
    ├─ Includes auth token (if logged in)
    │
    ▼
Edge Function
    │
    ├─ Extract user_id from auth token
    ├─ Validate class exists
    ├─ Check capacity
    │
    ▼
INSERT INTO bookings
    │
    ├─ user_id: uuid | NULL
    ├─ user_email: string
    ├─ user_name: string
    ├─ user_phone: string
    ├─ status: 'pending'
    ├─ manage_token: auto-generated (trigger)
    │
    ▼
Create Stripe Session
    │
    ├─ customer_email
    ├─ metadata: { booking_id }
    │
    ▼
Return to client
    │
    ├─ url: stripe_checkout_url
    ├─ booking_id: uuid
    └─ manage_token: string
    │
    ▼
Redirect to Stripe
    │
    ▼
Payment Complete
    │
    ▼
Webhook → confirm_booking_payment()
    │
    └─ UPDATE status = 'paid'
```
