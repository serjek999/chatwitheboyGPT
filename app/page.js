'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [floatingTexts, setFloatingTexts] = useState([]);

  useEffect(() => {
    const messages = [
      "Hello there!",
      "Welcome to E-boy GPT!",
      "How can I assist you today?",
      "Let's chat!",
      "This is floating text!",
      "AI Power in motion!",
      "Smart. Fast. Friendly.",
      "Your digital companion.",
      "Ask me anything!",
      "Need help?",
      "Just say the word!",
      "Powered by intelligence.",
      "Let’s explore ideas!",
      "Thinking… thinking…",
      "I’m here for you.",
      "Smooth. Sleek. Smart.",
      "Coding? I got you.",
      "E-boy at your service.",
      "Always learning.",
      "Ready when you are.",
    ];

    const generateText = () => {
      const id = Date.now() + Math.random(); // Unique key
      const message = messages[Math.floor(Math.random() * messages.length)];
      const style = {
        top: `${Math.random() * 90}%`,
        left: `${Math.random() * 90}%`,
        animationName: Math.random() > 0.5 ? 'floatUpDown' : 'floatDownUp',
        animationDuration: `10s`,
        animationTimingFunction: 'ease-in-out',
      };
      return { id, message, style };
    };

    const interval = setInterval(() => {
      const newText = generateText();
      setFloatingTexts(prev => [...prev, newText]);

      // Remove it after 4s (same as animation duration)
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(text => text.id !== newText.id));
      }, 4000);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Floating animated text */}
      {floatingTexts.map((item) => (
        <div
          key={item.id}
          className="floating-text text-lg font-semibold text-foreground/70"
          style={{
            position: 'absolute',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            ...item.style,
          }}
        >
          {item.message}
        </div>
      ))}

      {/* Card with title, subtitle, and button */}
      <Card className="w-[350px] shadow-xl border z-10 bg-background text-foreground">
        <CardContent className="p-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to E-boy GPT</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Your AI companion for helpful conversations.
          </p>
          <Button className="w-full" onClick={() => window.location.href = "/chat"}>
            Try E-boy GPT
          </Button>
        </CardContent>
      </Card>

      {/* Smooth float + fade-in/out animation styles */}
      <style jsx>{`
        @keyframes floatUpDown {
          0% { transform: translateY(0px); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translateY(-30px); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(0px); opacity: 0; }
        }

        @keyframes floatDownUp {
          0% { transform: translateY(0px); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translateY(30px); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(0px); opacity: 0; }
        }

        .floating-text {
          animation-iteration-count: 1;
          animation-fill-mode: both;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}
