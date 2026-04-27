"use client";

import { useState, useEffect } from "react";

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/community");
      const json = await res.json();
      if (json.success) setPosts(json.posts);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setAuthError("");
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newPost }),
      });
      const json = await res.json();
      if (json.success) {
        setPosts([json.post, ...posts]);
        setNewPost("");
      } else {
        if (res.status === 401) setAuthError(json.message);
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-brand-textDark md:text-3xl">🤝 किसान कम्युनिटी</h1>
        <p className="mt-1 text-sm text-brand-textMid">विशेषज्ञों और अन्य किसानों से जुड़ें, सवाल पूछें।</p>
      </div>

      <div className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-4 space-y-3">
        <textarea
          rows={2}
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          placeholder="अपना सवाल या जानकारी यहाँ लिखें..."
          className="w-full resize-none rounded-xl border border-green-200 p-3 outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex justify-between items-center">
          <button className="h-10 w-10 flex items-center justify-center rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition">
             📸
          </button>
          <div className="flex items-center gap-3">
            {authError && <span className="text-xs text-red-500 font-semibold">{authError}</span>}
            <button 
               onClick={handlePost}
               disabled={!newPost.trim()}
               className="min-h-[44px] px-6 rounded-xl bg-green-600 text-white font-semibold shadow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
               पोस्ट करें
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="h-24 bg-green-50 animate-pulse rounded-2xl w-full"></div>
        ) : posts.map(p => (
           <div key={p._id || p.id} className="bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow p-4">
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-10 w-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold">
                    {p.authorName?.charAt(0) || p.author?.charAt(0) || "U"}
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-gray-900">{p.authorName || p.author}</h3>
                    <p className="text-xs text-brand-accent">{p.role || "किसान"}</p>
                 </div>
              </div>
              <p className="text-gray-800 text-sm mt-2 mb-3">{p.text}</p>
              <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
                 <button className="text-gray-500 text-sm flex items-center gap-1 hover:text-green-600">👍 {p.likes}</button>
                 <button className="text-gray-500 text-sm flex items-center gap-1 hover:text-green-600">💬 {p.replies} कमेंट</button>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
}
