"use client";

import React, { useState } from "react";
import { Typography } from "../components/ui/Typography";
import { Button } from "../components/ui/Button";
import { Bot, Send } from "lucide-react";
import { askAIAction } from "../app/actions";

export const AIAssistantTeaserContainer: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      // Use the Server Action instead of importing the use case and repository directly
      const result = await askAIAction(query);
      setResponse(result);
    } catch (error) {
      setResponse("Maaf, terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-6 bg-primary text-cream rounded-3xl mx-6 my-10 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
        <Bot size={200} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <Bot className="text-accent" size={40} />
          <Typography variant="h2" className="text-cream">Tanya HMTKBA AI</Typography>
        </div>

        <Typography variant="p" className="mb-8 text-sky-200">
          Punya pertanyaan tentang konstruksi bangunan air atau birokrasi himpunan?
          Tanya asisten cerdas kami di sini.
        </Typography>

        <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Bagaimana cara pinjam alat laboratorium?"
            className="flex-1 px-6 py-3 rounded-md bg-white/10 border border-white/20 text-cream placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button variant="cta" type="submit" disabled={loading} className="flex items-center justify-center gap-2">
            <Send size={18} />
            {loading ? "Berpikir..." : "Tanya"}
          </Button>
        </form>

        {response && (
          <div className="p-6 rounded-md bg-white/5 border border-white/10 animate-in fade-in slide-in-from-bottom-4">
            <Typography variant="p" className="text-cream italic">
              "{response}"
            </Typography>
          </div>
        )}
      </div>
    </section>
  );
};
