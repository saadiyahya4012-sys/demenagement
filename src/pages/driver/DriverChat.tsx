import React, { useState, useRef, useEffect } from 'react';
import { DriverLayout } from '../../layouts/DriverLayout';
import { useAppStore } from '../../hooks/useAppStore';
import { formatPrice } from '../../utils/formatters';
import {
  ChevronLeft,
  Send,
  Phone,
  Truck,
  MapPin,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';

export const DriverChat: React.FC = () => {
  const {
    requests,
    selectedRequestId,
    messages,
    sendMessage,
    clientUser,
    driverUser,
    navigate
  } = useAppStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Resolve the active moving request or fallback to shared conversation key
  const request = requests.find(r => r.id === selectedRequestId) 
    || requests.find(r => r.assignedDriver?.id === driverUser.id) 
    || requests[0];

  const activeConversationId = request?.id || 'conv_moovvert_demo';
  const currentChatMessages = messages[activeConversationId] || [];

  // Account 1: Authenticated Client Account
  const client = request?.clientId === clientUser.id ? clientUser : (request?.client || clientUser);
  const clientPhoto = clientUser.profileImage || client.profileImage || clientUser.avatar || client.avatar;
  const clientName = client.name || clientUser.name;
  const clientPhone = client.phone || clientUser.phone;

  // Account 2: Authenticated Chauffeur Account
  const chauffeurPhoto = driverUser.profileImage || driverUser.avatar;
  const chauffeurName = driverUser.name;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeConversationId, inputText.trim());
    setInputText('');
  };

  const handleQuickPreset = (text: string) => {
    sendMessage(activeConversationId, text);
  };

  return (
    <DriverLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
        {/* Top Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs mb-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (request) {
                  navigate('driver-request-details', { requestId: request.id });
                } else {
                  navigate('my-jobs');
                }
              }}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Retour"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Client's Real Profile Photo */}
            <div className="relative">
              <img
                src={clientPhoto}
                alt={clientName}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/20"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" title="Client" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-slate-900">{clientName}</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  Client
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[160px] sm:max-w-xs">
                  {request ? `${request.pickup.city} → ${request.dropoff.city}` : 'Course de transport'}
                </span>
                {request && (
                  <>
                    <span>·</span>
                    <span className="font-semibold text-emerald-700">{formatPrice(request.clientProposedPrice)}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <a
            href={`tel:${clientPhone}`}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Appeler le client"
          >
            <Phone className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">{clientPhone}</span>
          </a>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5 overflow-y-auto space-y-3">
          <div className="text-center my-1">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
              {request
                ? `Mission #${request.id} · ${request.title}`
                : 'Discussion directe avec votre client MoovVert'}
            </span>
          </div>

          {currentChatMessages.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center mx-auto">
                <MessageCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Discussion avec {clientName}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Coordonnez l'heure de départ, le point de rendez-vous ou les accès pour le camion.
              </p>
            </div>
          ) : (
            currentChatMessages.map(msg => {
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="p-3 my-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs text-emerald-900">
                    <span className="font-bold">Notification MoovVert : </span>
                    {msg.text}
                  </div>
                );
              }

              // Determine sender identity dynamically from authenticated accounts
              const isMe = msg.senderId === driverUser.id || msg.senderRole === 'driver';
              const senderPhoto = isMe ? chauffeurPhoto : clientPhoto;
              const senderName = isMe ? chauffeurName : clientName;

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 my-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Received Message: Display Client's real profile photo */}
                  {!isMe && (
                    <img
                      src={senderPhoto}
                      alt={senderName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 shrink-0 mb-0.5 shadow-2xs"
                      title={senderName}
                    />
                  )}

                  <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && (
                      <span className="text-[10px] font-bold text-slate-500 mb-1 ml-1">
                        {senderName}
                      </span>
                    )}

                    <div
                      className={`rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                        isMe
                          ? 'bg-slate-900 text-white rounded-tr-xs'
                          : 'bg-emerald-50 text-slate-800 rounded-tl-xs border border-emerald-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span
                        className={`block text-[10px] mt-1.5 font-mono ${
                          isMe ? 'text-slate-400 text-right' : 'text-slate-500'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Sent Message: Display Chauffeur's real profile photo */}
                  {isMe && (
                    <img
                      src={senderPhoto}
                      alt={senderName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0 mb-0.5 shadow-2xs"
                      title={senderName}
                    />
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Driver Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 shrink-0 scrollbar-none">
          {[
            'Salam, ana qrib nwsel.',
            'Je suis en route avec le camion.',
            'Je suis arrivé au pied de l\'immeuble.',
            'Pouvez-vous m\'ouvrir le portail d\'accès ?',
            'Tout est bien chargé et sanglé dans le camion.'
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickPreset(preset)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-[11px] font-medium text-slate-700 whitespace-nowrap shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 shrink-0">
          <img
            src={chauffeurPhoto}
            alt={chauffeurName}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
            title={`Connecté en tant que ${chauffeurName}`}
          />
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Écrivez un message au client..."
            className="flex-1 px-3 py-2 text-xs text-slate-900 bg-transparent focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4 text-emerald-400" />
          </button>
        </form>
      </div>
    </DriverLayout>
  );
};
