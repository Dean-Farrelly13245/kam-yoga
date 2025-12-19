import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
              </div>
              
              <h1 className="font-heading text-4xl sm:text-5xl font-light text-foreground mb-4">
                Payment Received
              </h1>
              
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
                Your booking is confirmed. We've received your payment and you're all set!
              </p>

              {sessionId && (
                <p className="font-body text-sm text-muted-foreground mb-8">
                  Session ID: {sessionId}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="rounded-xl">
                  <Link to="/classes">View More Classes</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BookingSuccess;
