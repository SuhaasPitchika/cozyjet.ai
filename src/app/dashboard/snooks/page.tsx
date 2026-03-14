
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Twitter, Linkedin, Instagram, Youtube, Mail, Edit3, Copy, RefreshCcw } from "lucide-react";
import { snooksGenerateMarketingContent, SnooksGenerateMarketingContentOutput } from "@/ai/flows/snooks-generate-marketing-content";

export default function SnooksPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SnooksGenerateMarketingContentOutput | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);

  const handleSend = async () => {
    if (!prompt) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    const currentPrompt = prompt;
    setPrompt("");

    try {
      const output = await snooksGenerateMarketingContent({
        userPrompt: currentPrompt,
        userContext: JSON.stringify({ tone: "professional but bold", niche: "VFX & Motion Design" })
      });
      setResults(output);
      setMessages(prev => [...prev, { role: 'assistant', content: "I've drafted content for your platforms. Check the strategy cards below!" }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const platforms = [
    { id: 'linkedin', icon: Linkedin, key: 'linkedinPost' as const, color: '#0A66C2' },
    { id: 'x', icon: Twitter, key: 'xTweet' as const, color: '#1DA1F2' },
    { id: 'instagram', icon: Instagram, key: 'instagramPost' as const, color: '#E4405F' },
    { id: 'email', icon: Mail, key: 'emailContent' as const, color: '#EA4335' },
    { id: 'youtube', icon: Youtube, key: 'youtubeScript' as const, color: '#FF0000' },
  ];

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-[#231F2A]">
      {/* Left Column: Chat */}
      <div className="w-full md:w-1/3 border-r border-white/5 flex flex-col h-full bg-black/20">
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-xl">
             <div className="w-8 h-8 border-4 border-white rounded-full border-t-transparent animate-spin-slow" />
          </div>
          <div>
            <h2 className="font-headline font-bold text-lg">Snooks</h2>
            <p className="text-xs text-primary font-bold uppercase tracking-widest">Marketing Head</p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-2xl text-sm leading-relaxed border border-white/5">
              "Hey there! Ready to dominate the algorithms? Tell me what you're working on and I'll handle the copywriting."
            </div>
            
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white/5 border border-white/5'}`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <div className="flex gap-1 p-4 bg-white/5 rounded-2xl w-fit">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-white/5">
          <div className="relative">
            <Input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g. Write a LinkedIn post about my new VFX breakdown..."
              className="bg-white/5 border-white/10 py-8 rounded-2xl pr-16"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button 
              onClick={handleSend}
              disabled={isLoading}
              size="icon" 
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/80 rounded-xl"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column: Results */}
      <div className="flex-1 h-full overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30"
            >
              <Rocket className="w-16 h-16" />
              <h3 className="font-headline text-2xl font-bold">Waiting for input...</h3>
              <p className="max-w-xs text-sm">Initiate a conversation with Snooks to generate platform-native content cards.</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-12"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-2xl font-bold">Platform Strategies</h3>
                <Badge variant="secondary" className="bg-primary/20 text-primary">Viral Probability: 89%</Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {platforms.map((p) => (
                  <Card key={p.id} className="bg-white/5 border-white/10 group hover:border-primary/30 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5">
                          <p.icon className="w-5 h-5" style={{ color: p.color }} />
                        </div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">{p.id}</CardTitle>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Copy className="h-4 w-4" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                        {results[p.key]}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="p-8 bg-black/40 rounded-3xl border border-white/5 space-y-6">
                 <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h4 className="font-headline text-xl font-bold">Viral Roadmap</h4>
                 </div>
                 <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-white/30 uppercase">Optimal Time</p>
                       <p className="font-medium">9:15 AM EST (Thursday)</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-white/30 uppercase">Engagement Hook</p>
                       <p className="font-medium">Question-based CTA</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-white/30 uppercase">Trend Score</p>
                       <p className="font-medium">High (Trending in #vfx)</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
