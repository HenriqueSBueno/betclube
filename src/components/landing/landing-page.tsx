
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState } from "react";

export function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  return (
    <div className="flex flex-col items-center">
      <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Discover the Best Betting Sites
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Join our community and vote for your favorite betting sites. See what others recommend and make informed decisions.
              </p>
            </div>
            <div className="space-x-4">
              <Button 
                size="lg" 
                onClick={() => setIsAuthModalOpen(true)}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 items-stretch">
            <div className="flex flex-col justify-between p-6 bg-background rounded-lg border shadow-sm">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Community Driven</h3>
                <p className="text-muted-foreground">
                  Rankings based on real user votes and experiences, not paid placements.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between p-6 bg-background rounded-lg border shadow-sm">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Daily Updates</h3>
                <p className="text-muted-foreground">
                  Our rankings update every day to reflect the latest user votes and trends.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between p-6 bg-background rounded-lg border shadow-sm">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Multiple Categories</h3>
                <p className="text-muted-foreground">
                  Find the best sites for sports betting, casino games, poker and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
