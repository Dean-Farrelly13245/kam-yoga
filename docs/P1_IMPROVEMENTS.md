# P1 Improvements - Implementation Guide

This document provides detailed implementation steps for the P1 (Important) improvements identified in the audit.

---

## 1. User Authentication for Bookings

**Priority:** P1 (High)  
**Estimated Time:** 4-6 hours  
**Risk:** Medium (requires schema changes)

### Problem
The "My Bookings" page allows anyone to view bookings by entering any email address. This is a security concern.

### Solution
Implement Supabase Auth with magic link (passwordless email authentication).

### Implementation Steps

#### Step 1: Enable Supabase Auth
```bash
# In Supabase dashboard:
# Authentication → Providers → Email → Enable
# Authentication → Email Templates → Customize magic link template
```

#### Step 2: Update Database Schema
```sql
-- Add user_id to bookings table
ALTER TABLE public.bookings ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);

-- Backfill existing bookings (optional, for migration)
-- This creates auth users for existing bookings
DO $$
DECLARE
  booking_record RECORD;
  new_user_id uuid;
BEGIN
  FOR booking_record IN 
    SELECT DISTINCT user_email FROM public.bookings WHERE user_id IS NULL
  LOOP
    -- Create auth user (if not exists)
    INSERT INTO auth.users (email, email_confirmed_at, created_at, updated_at)
    VALUES (
      booking_record.user_email,
      now(),
      now(),
      now()
    )
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id INTO new_user_id;
    
    -- Update bookings
    UPDATE public.bookings
    SET user_id = new_user_id
    WHERE user_email = booking_record.user_email AND user_id IS NULL;
  END LOOP;
END $$;
```

#### Step 3: Update RLS Policies
```sql
-- Drop old admin-only policies
DROP POLICY IF EXISTS "Admins read bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins manage bookings" ON public.bookings;

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- Users can insert their own bookings (for edge function)
CREATE POLICY "Users can create own bookings" ON public.bookings
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Users can update their own bookings (for cancellation)
CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

-- Admins can do anything
CREATE POLICY "Admins manage bookings" ON public.bookings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

#### Step 4: Update Edge Function (create-checkout-session)
```typescript
// In supabase/functions/create-checkout-session/index.ts
// Add after line 56 (after creating supabase client)

// Get authenticated user (if any)
const authHeader = req.headers.get("Authorization");
let userId: string | null = null;

if (authHeader) {
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (!authError && user) {
    userId = user.id;
  }
}

// Update booking insert (line 111-122)
const { data: booking, error: bookingError } = await supabase
  .from("bookings")
  .insert({
    class_id: classId,
    user_id: userId, // ADD THIS LINE
    user_name: name?.trim() || null,
    user_email: email.trim().toLowerCase(),
    user_phone: phone?.trim() || null,
    status: "pending",
    amount_cents: yogaClass.price_cents,
    currency: yogaClass.currency || "eur",
  })
  .select()
  .single();
```

#### Step 5: Update MyBookings.tsx
```typescript
// Replace email search with auth-based query
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const MyBookings = () => {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<BookingWithClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Load bookings for authenticated user
        const { data, error } = await supabase
          .from("bookings")
          .select("*, classes(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (!error) {
          setBookings(data || []);
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => subscription.unsubscribe();
  }, []);

  // If not authenticated, show login form
  if (!user) {
    return <MagicLinkLogin />;
  }

  // Rest of component...
};
```

#### Step 6: Create MagicLinkLogin Component
```typescript
// src/components/auth/MagicLinkLogin.tsx
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const MagicLinkLogin = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/bookings`,
        },
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Check your email",
        description: "We sent you a magic link to sign in.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center py-16">
        <h2 className="font-heading text-2xl mb-4">Check your email</h2>
        <p className="text-muted-foreground">
          We sent a magic link to {email}. Click the link to view your bookings.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h2 className="font-heading text-2xl mb-4">Sign in to view bookings</h2>
      <Input
        type="email"
        placeholder="your.email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading} className="mt-4">
        {isLoading ? "Sending..." : "Send Magic Link"}
      </Button>
    </form>
  );
};

export default MagicLinkLogin;
```

---

## 2. Complete Class Detail Page

**Priority:** P1 (High)  
**Estimated Time:** 2-3 hours  
**Risk:** Low

### Problem
Route `/classes/:sessionId` exists but page is incomplete.

### Solution
Complete `ClassSession.tsx` implementation.

### Implementation

```typescript
// src/pages/ClassSession.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Euro } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BookingModal from "@/components/classes/BookingModal";
import { Button } from "@/components/ui/button";
import { supabase, PublishedSession } from "@/lib/supabaseClient";
import { siteLocation } from "@/config/site";

const ClassSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<PublishedSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    if (!sessionId) {
      navigate("/classes");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("get_published_classes");
      if (error) throw error;

      const found = data?.find((s: any) => s.id === sessionId);
      if (!found) {
        navigate("/classes");
        return;
      }

      const remaining =
        found.capacity !== null && found.paid_count !== null
          ? Math.max(found.capacity - found.paid_count, 0)
          : null;

      setSession({
        ...found,
        remaining_spots: remaining,
      });
    } catch (error) {
      console.error("Error loading session:", error);
      navigate("/classes");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 lg:px-8 py-12">
            <p className="text-center text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const startDate = new Date(session.starts_at);
  const endDate = new Date(session.ends_at);
  const price = (session.price_cents || 0) / 100;
  const isFull = session.remaining_spots !== null && session.remaining_spots <= 0;
  const isPast = startDate < new Date();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 lg:px-8 pt-8">
          <Link
            to="/classes"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Classes
          </Link>
        </div>

        {/* Class Details */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                  <div>
                    <h1 className="font-heading text-3xl md:text-4xl font-light text-foreground mb-4">
                      {session.title}
                    </h1>
                    {session.description && (
                      <p className="font-body text-lg text-muted-foreground leading-relaxed">
                        {session.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-4xl text-foreground mb-2">
                      €{price.toFixed(2)}
                    </div>
                    {session.capacity && (
                      <p className="text-sm text-muted-foreground">
                        {session.remaining_spots} / {session.capacity} spots left
                      </p>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
                  <div className="flex items-start gap-4">
                    <Calendar className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-heading text-sm text-muted-foreground uppercase tracking-wide mb-1">
                        Date
                      </p>
                      <p className="font-body text-foreground">
                        {format(startDate, "EEEE, d MMMM yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-heading text-sm text-muted-foreground uppercase tracking-wide mb-1">
                        Time
                      </p>
                      <p className="font-body text-foreground">
                        {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-heading text-sm text-muted-foreground uppercase tracking-wide mb-1">
                        Location
                      </p>
                      <p className="font-body text-foreground">
                        {siteLocation.addressLine}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Users className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-heading text-sm text-muted-foreground uppercase tracking-wide mb-1">
                        Capacity
                      </p>
                      <p className="font-body text-foreground">
                        {session.capacity ? `${session.capacity} people` : "Open"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                  {isPast ? (
                    <p className="text-muted-foreground">This class has already taken place</p>
                  ) : isFull ? (
                    <p className="text-muted-foreground">This class is fully booked</p>
                  ) : (
                    <Button
                      size="lg"
                      className="rounded-xl px-8"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Book Your Spot
                    </Button>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-heading text-lg font-medium text-foreground mb-2">
                    First Time?
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    Arrive 10 minutes early. Wear comfortable clothing. All equipment is
                    provided.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-heading text-lg font-medium text-foreground mb-2">
                    Cancellation Policy
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    24-hour notice required for cancellations. Late cancellations may incur
                    a fee.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-heading text-lg font-medium text-foreground mb-2">
                    Questions?
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    Contact us if you have any questions about this class or need special
                    accommodations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        classItem={session}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ClassSession;
```

---

## 3. Per-Class Attendee List

**Priority:** P1 (Medium)  
**Estimated Time:** 2-3 hours  
**Risk:** Low

### Problem
Admin cannot see list of attendees for specific class.

### Solution
Add "View Attendees" button in AdminClasses.tsx.

### Implementation

```typescript
// Add to src/pages/admin/AdminClasses.tsx

// Add state for attendees modal
const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
const [attendees, setAttendees] = useState<any[]>([]);
const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);

// Add function to load attendees
const loadAttendees = async (classId: string) => {
  setIsLoadingAttendees(true);
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("id, user_name, user_email, user_phone, paid_at, created_at")
      .eq("class_id", classId)
      .eq("status", "paid")
      .order("paid_at", { ascending: false });

    if (error) throw error;
    setAttendees(data || []);
  } catch (error: any) {
    toast({
      title: "Failed to load attendees",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setIsLoadingAttendees(false);
  }
};

// Add button in session card (after Edit button)
<Button
  size="sm"
  variant="outline"
  className="rounded-xl"
  onClick={() => {
    setSelectedClassId(session.id);
    loadAttendees(session.id);
    setAttendeesModalOpen(true);
  }}
>
  <Users className="h-4 w-4 mr-1" /> Attendees
</Button>

// Add modal at end of component
<Dialog open={attendeesModalOpen} onOpenChange={setAttendeesModalOpen}>
  <DialogContent className="max-w-3xl rounded-2xl">
    <DialogHeader>
      <DialogTitle>Class Attendees</DialogTitle>
    </DialogHeader>
    {isLoadingAttendees ? (
      <p className="text-center py-8 text-muted-foreground">Loading...</p>
    ) : attendees.length === 0 ? (
      <p className="text-center py-8 text-muted-foreground">
        No paid bookings yet.
      </p>
    ) : (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {attendees.length} attendee{attendees.length === 1 ? "" : "s"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => {
              // Export to CSV
              const csv = [
                ["Name", "Email", "Phone", "Paid At"],
                ...attendees.map((a) => [
                  a.user_name || "",
                  a.user_email,
                  a.user_phone || "",
                  format(new Date(a.paid_at), "yyyy-MM-dd HH:mm"),
                ]),
              ]
                .map((row) => row.join(","))
                .join("\n");

              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `attendees-${selectedClassId}.csv`;
              a.click();
            }}
          >
            Export CSV
          </Button>
        </div>
        <div className="border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Paid At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.map((attendee) => (
                <TableRow key={attendee.id}>
                  <TableCell className="font-medium">
                    {attendee.user_name || "—"}
                  </TableCell>
                  <TableCell>{attendee.user_email}</TableCell>
                  <TableCell>{attendee.user_phone || "—"}</TableCell>
                  <TableCell>
                    {format(new Date(attendee.paid_at), "d MMM yyyy, HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
```

---

## 4. Block Cancellations After Class Starts

**Priority:** P1 (High)  
**Estimated Time:** 1 hour  
**Risk:** Low

### Problem
Users can cancel bookings after class has started.

### Solution
Update `cancel_pending_booking` RPC to check class start time.

### Implementation

```sql
-- supabase/migrations/0013_block_late_cancellations.sql

CREATE OR REPLACE FUNCTION public.cancel_pending_booking(p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_starts_at timestamptz;
  v_status text;
BEGIN
  -- Get booking status and class start time
  SELECT b.status, c.starts_at INTO v_status, v_starts_at
  FROM public.bookings b
  JOIN public.classes c ON c.id = b.class_id
  WHERE b.id = p_booking_id;

  -- Check if booking exists
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Check if booking is already cancelled
  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'Only pending bookings can be cancelled';
  END IF;

  -- Check if class has started
  IF v_starts_at < now() THEN
    RAISE EXCEPTION 'Cannot cancel booking after class has started';
  END IF;

  -- Cancel booking
  UPDATE public.bookings
    SET status = 'cancelled'
  WHERE id = p_booking_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_pending_booking(uuid) TO anon, authenticated;
```

---

## Testing Checklist

### User Authentication
- [ ] Magic link email sent
- [ ] Magic link redirects to /bookings
- [ ] Bookings filtered by user_id
- [ ] Non-authenticated users see login form
- [ ] RLS policies enforce user_id check

### Class Detail Page
- [ ] Page loads for valid session ID
- [ ] Shows all class details
- [ ] Book button opens modal
- [ ] Past classes show "already taken place"
- [ ] Full classes show "fully booked"

### Attendee List
- [ ] Modal opens with attendee list
- [ ] Shows paid bookings only
- [ ] CSV export works
- [ ] Empty state shows "no bookings"

### Late Cancellation Block
- [ ] Can cancel pending booking before class starts
- [ ] Cannot cancel after class starts (error message)
- [ ] Error message is user-friendly

---

## Deployment Order

1. User Authentication (requires schema changes)
2. Block Late Cancellations (quick SQL update)
3. Class Detail Page (frontend only)
4. Attendee List (frontend only)

---

## Rollback Plan

If issues arise:

1. **User Authentication:** Revert RLS policies, remove user_id column
2. **Late Cancellations:** Revert RPC function to previous version
3. **Class Detail/Attendees:** No rollback needed (frontend only)
