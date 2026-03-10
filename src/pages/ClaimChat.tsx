import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClaimChat, sendChatMessage, ChatMessage } from '../api/services';
import { Send, ArrowLeft, AlertCircle, MessageSquare } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

const ClaimChat: React.FC = () => {
    const { claimId } = useParams<{ claimId: string }>();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user, userProfile } = useAuth();

    useEffect(() => {
        if (claimId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [claimId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await getClaimChat(claimId!);
            setMessages(response.data || []);
            setFetchError(null);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            setFetchError('Failed to load messages.');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await sendChatMessage(claimId!, newMessage);
            setNewMessage('');
            await fetchMessages();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const getInitials = (name: string) => {
        return (name || 'U').charAt(0).toUpperCase();
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 font-medium text-sm transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                {/* Chat Container */}
                <div className="card overflow-hidden" style={{ transform: 'none' }}>
                    {/* Chat Header */}
                    <div className="p-5 border-b border-white/[0.04] flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-accent-light" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-white">Claim Discussion</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Communicate with admin · ID: {claimId?.slice(0, 8)}...
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-zinc-500">Live</span>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="h-[440px] overflow-y-auto p-5 space-y-4 bg-surface/50">
                        {fetchError && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 px-3 py-2 rounded-xl text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{fetchError}</span>
                            </div>
                        )}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                <div className="skeleton w-12 h-12 rounded-2xl" />
                                <p className="text-zinc-600 text-sm">Loading messages...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-surface-200 flex items-center justify-center">
                                    <MessageSquare className="w-7 h-7 text-zinc-600" />
                                </div>
                                <p className="text-zinc-500 text-sm">No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((message: any, idx: number) => {
                                const senderId = message.senderId || message.senderUid;
                                const isOwnMessage = senderId === user?.uid;
                                const timestamp = message.timestamp
                                    ? (typeof message.timestamp === 'object' && '_seconds' in message.timestamp)
                                        ? new Date(message.timestamp._seconds * 1000)
                                        : new Date(message.timestamp)
                                    : new Date();

                                return (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 animate-fade-in ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                                        style={{ animationDelay: `${idx * 30}ms` }}
                                    >
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${isOwnMessage
                                                ? 'bg-gradient-accent text-white'
                                                : message.isProofRequest
                                                    ? 'bg-amber-500/20 text-amber-300'
                                                    : 'bg-surface-300 text-zinc-400'
                                            }`}>
                                            {getInitials(isOwnMessage ? 'You' : message.senderName)}
                                        </div>

                                        {/* Bubble */}
                                        <div className={`max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
                                            {!isOwnMessage && (
                                                <p className="text-[11px] font-medium text-zinc-500 mb-1 px-1">
                                                    {message.senderName || (userProfile?.role === 'admin' ? 'User' : 'Admin')}
                                                </p>
                                            )}
                                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isOwnMessage
                                                    ? 'bg-gradient-accent text-white rounded-br-md'
                                                    : message.isProofRequest
                                                        ? 'bg-amber-500/10 text-amber-200 border border-amber-500/20 rounded-bl-md'
                                                        : 'bg-surface-200 text-zinc-200 rounded-bl-md'
                                                }`}>
                                                {message.isProofRequest && (
                                                    <p className="text-[11px] font-semibold text-amber-400 mb-1">⚠️ Proof Request</p>
                                                )}
                                                <p>{message.content}</p>
                                            </div>
                                            <p className={`text-[10px] mt-1.5 px-1 ${isOwnMessage ? 'text-zinc-600' : 'text-zinc-600'}`}>
                                                {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 border-t border-white/[0.04] bg-surface-50/50">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="input flex-1"
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="btn-primary px-4 disabled:opacity-30"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default ClaimChat;
