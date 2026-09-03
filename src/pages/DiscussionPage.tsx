import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { ChatMessage } from '../types';
import { Send, Trash2, Shield, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const LOCAL_CHAT_STORAGE_KEY = 'topgss_local_messages';

export const DiscussionPage: React.FC = () => {
  const { user, profile, isAdmin, isApproved, isConfigured } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch initial messages
  const fetchMessages = async () => {
    if (!isConfigured) {
      // Local fallback
      const stored = localStorage.getItem(LOCAL_CHAT_STORAGE_KEY);
      if (stored) {
        try {
          setMessages(JSON.parse(stored));
        } catch (e) {
          setMessages([]);
        }
      } else {
        // Initial sample messages for the community
        const initialSample: ChatMessage[] = [
          {
            id: 'msg_welcome',
            user_id: 'system',
            message: 'Bienvenue dans le salon officiel TOP GSS ! Respectez les règles de courtoisie.',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            profile: {
              id: 'system',
              username: 'Modérateur TOP GSS',
              email: 'admin@topgss.app',
              phone: '',
              role: 'admin',
              status: 'approved',
              created_at: new Date().toISOString(),
            },
          },
        ];
        setMessages(initialSample);
        localStorage.setItem(LOCAL_CHAT_STORAGE_KEY, JSON.stringify(initialSample));
      }
      setLoading(false);
      return;
    }

    try {
      // Supabase query with profiles join
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          user_id,
          message,
          created_at,
          profiles:user_id (
            id,
            username,
            role,
            status,
            avatar_url
          )
        `)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.warn('Error fetching messages from Supabase:', error.message);
        setErrorMsg(error.message);
      } else if (data) {
        const mapped: ChatMessage[] = data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          message: item.message,
          created_at: item.created_at,
          profile: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
        }));
        setMessages(mapped);
      }
    } catch (err: any) {
      console.error('Messages fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [isConfigured]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 2. Realtime listener via Supabase
  useEffect(() => {
    if (!isConfigured) return;

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          // Fetch sender profile
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('id, username, role, status, avatar_url')
            .eq('id', payload.new.user_id)
            .maybeSingle();

          const incoming: ChatMessage = {
            id: payload.new.id,
            user_id: payload.new.user_id,
            message: payload.new.message,
            created_at: payload.new.created_at,
            profile: senderProfile || undefined,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isConfigured]);

  // 3. Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();

    if (!trimmed) return;
    if (trimmed.length > 500) {
      setErrorMsg('Le message ne peut pas dépasser 500 caractères.');
      return;
    }
    if (!user || !isApproved) {
      setErrorMsg('Votre compte doit être validé pour participer au chat.');
      return;
    }

    setSending(true);
    setErrorMsg(null);

    // SUPABASE SEND
    if (isConfigured) {
      try {
        const { error } = await supabase.from('messages').insert({
          user_id: user.id,
          message: trimmed,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setNewMessage('');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Erreur lors de l’envoi.');
      } finally {
        setSending(false);
      }
      return;
    }

    // LOCAL SANDBOX SEND
    const newMsgObj: ChatMessage = {
      id: `local_${Date.now()}`,
      user_id: user.id,
      message: trimmed,
      created_at: new Date().toISOString(),
      profile: profile || undefined,
    };

    const updatedList = [...messages, newMsgObj];
    setMessages(updatedList);
    localStorage.setItem(LOCAL_CHAT_STORAGE_KEY, JSON.stringify(updatedList));
    setNewMessage('');
    setSending(false);
  };

  // 4. Delete message handler (user can delete own, admin can delete any)
  const handleDeleteMessage = async (messageId: string, authorId: string) => {
    if (!user) return;
    const canDelete = user.id === authorId || isAdmin;
    if (!canDelete) return;

    if (isConfigured) {
      try {
        const { error } = await supabase.from('messages').delete().eq('id', messageId);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
        }
      } catch (err: any) {
        setErrorMsg(err.message);
      }
      return;
    }

    // Local sandbox
    const updated = messages.filter((m) => m.id !== messageId);
    setMessages(updated);
    localStorage.setItem(LOCAL_CHAT_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E50914]/30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-black border border-[#E50914] flex items-center justify-center text-lg shadow-[0_0_10px_rgba(229,9,20,0.3)]">
            🗨️
          </div>
          <div>
            <h1 className="text-base font-black text-white flex items-center gap-2">
              DISCUSSION
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-mono uppercase">
                Direct
              </span>
            </h1>
            <p className="text-[10px] text-white/50 font-mono">
              Membres confirmés TOP GSS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/60 bg-[#121212] px-2.5 py-1 rounded-full border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{messages.length} messages</span>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mt-2 p-2.5 rounded-lg bg-red-950/60 border border-[#E50914] text-xs text-[#ff8088] flex items-center gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 text-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-white/50 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#E50914]" />
            <span className="font-mono text-xs">Chargement des échanges...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40 gap-2 text-center p-6">
            <MessageSquare className="w-10 h-10 text-white/20" />
            <p className="text-xs">Aucun message pour le moment.<br />Soyez le premier à engager la discussion !</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = user?.id === msg.user_id;
            const isMsgAdmin = msg.profile?.role === 'admin';
            const authorName = msg.profile?.username || 'Membre';
            const formattedTime = new Date(msg.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
              >
                {/* Author Info Header */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-mono">
                  {isMsgAdmin && (
                    <span className="flex items-center gap-0.5 px-1 rounded bg-[#E50914] text-white text-[9px] font-bold">
                      <Shield className="w-2.5 h-2.5" /> ADMIN
                    </span>
                  )}
                  <span className={`font-semibold ${isMine ? 'text-[#ff757e]' : 'text-white/80'}`}>
                    {isMine ? 'Vous' : authorName}
                  </span>
                  <span className="text-[10px] text-white/40">{formattedTime}</span>
                </div>

                {/* Message Bubble */}
                <div className="relative group max-w-[85%]">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 break-words shadow-sm ${
                      isMine
                        ? 'bg-gradient-to-r from-[#b30810] to-[#E50914] text-white rounded-tr-none'
                        : 'bg-[#181818] border border-white/10 text-white/90 rounded-tl-none'
                    }`}
                  >
                    <p className="text-xs leading-relaxed select-text">{msg.message}</p>
                  </div>

                  {/* Delete button (only if author or admin) */}
                  {(isMine || isAdmin) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg.id, msg.user_id)}
                      className={`absolute top-1 text-white/30 hover:text-[#E50914] transition-colors p-1 ${
                        isMine ? '-left-6' : '-right-6'
                      }`}
                      title={isAdmin && !isMine ? 'Supprimer (Modération Admin)' : 'Supprimer mon message'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input bar */}
      <form onSubmit={handleSendMessage} className="pt-2 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez un message (500 car. max)..."
            maxLength={500}
            disabled={sending || !isApproved}
            className="w-full bg-[#141414] border border-[#E50914]/40 focus:border-[#E50914] rounded-2xl pl-4 pr-12 py-3 text-xs text-white placeholder-white/40 outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim() || !isApproved}
            className="absolute right-1.5 p-2 rounded-xl bg-[#E50914] hover:bg-[#b8050f] text-white transition-all disabled:opacity-40 disabled:hover:bg-[#E50914] cursor-pointer"
            title="Envoyer"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="flex justify-between items-center px-2 mt-1 text-[10px] text-white/40 font-mono">
          <span>{newMessage.length} / 500 caractères</span>
          <span>Appuyez sur Entrée pour envoyer</span>
        </div>
      </form>
    </div>
  );
};
