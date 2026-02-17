import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Classes from "./pages/Classes";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import BookingSuccess from "./pages/BookingSuccess";
import BookingCancelled from "./pages/BookingCancelled";
import BookingManage from "./pages/BookingManage";
import MyBookings from "./pages/MyBookings";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminBlog from "./pages/admin/AdminBlog";
import ClassSessionPage from "./pages/ClassSession";
import BlogEditor from "./pages/admin/BlogEditor";
import AdminBookings from "./pages/admin/Bookings";
import AdminAnalytics from "./pages/admin/Analytics";
import TestModeBanner from "./components/layout/TestModeBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TestModeBanner />
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/kam-yoga">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/classes/:sessionId" element={<ClassSessionPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/booking/cancelled" element={<BookingCancelled />} />
          <Route path="/booking/manage/:token" element={<BookingManage />} />
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/classes" element={<AdminClasses />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/blog/new" element={<BlogEditor />} />
          <Route path="/admin/blog/edit/:id" element={<BlogEditor />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
