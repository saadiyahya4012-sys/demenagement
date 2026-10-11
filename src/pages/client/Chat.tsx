import React, { useState, useRef, useEffect } from 'react';
import { ClientLayout } from '../../layouts/ClientLayout';
import { useAppStore } from '../../hooks/useAppStore';
import { formatPrice } from '../../utils/formatters';
import {
  ChevronLeft,
  Send,
  Phone,
  Truck,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';

export const Chat: React.FC = () => {
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
    || requests.find(r => r.assignedDriver) 
    || requests[0];

  const activeConversationId = request?.id || 'conv_moovvert_demo';
  const currentChatMessages = messages[activeConversationId] || [];

  // Account 1: Authenticated Client Account
  const clientPhoto = clientUser.profileImage || clientUser.avatar;
  const clientName = clientUser.name;

  // Account 2: Authenticated Chauffeur Account
  const chauffeurPhoto = driverUser.profileImage || driverUser.avatar;
  const chauffeurName = driverUser.name;
  const chauffeurPhone = driverUser.phone;
  const chauffeurTruck = driverUser.vehicle?.typeName || driverUser.vehicle?.model || 'Camion 20m³ avec Hayon';

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
    <ClientLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col h-[calc(100vh-120px)] min-h-[500px]">
        {/* Chat Top Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs mb-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (request) {
                  navigate('request-details', { requestId: request.id });
                } else {
                  navigate('my-requests');
                }
              }}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Retour"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Chauffeur's Real Profile Photo */}
            <div className="relative">
              <img
                src={chauffeurPhoto}
                alt={chauffeurName}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/20"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" title="En ligne" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-slate-900">{chauffeurName}</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#00A86B] bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  Chauffeur vérifié
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[160px] sm:max-w-xs">{chauffeurTruck}</span>
                {request && (
                  <>
                    <span>·</span>
                    <span className="font-semibold text-emerald-700">{formatPrice(request.clientProposedPrice)}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${chauffeurPhone}`}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Appeler le chauffeur"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">{chauffeurPhone}</span>
            </a>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-5 overflow-y-auto space-y-3">
          <div className="text-center my-1">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
              {request
                ? `Mission #${request.id} · ${request.pickup.city} → ${request.dropoff.city}`
                : 'Discussion sécurisée avec votre chauffeur vérifié MoovVert'}
            </span>
          </div>

          {currentChatMessages.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center mx-auto">
                <MessageCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Discussion avec {chauffeurName}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Envoyez un message pour organiser les détails de votre déménagement ou de votre trajet.
              </p>
            </div>
          ) : (
            currentChatMessages.map(msg => {
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="p-3 my-2 bg-emerald-50/80 border border-emerald-200/60 rounded-2xl text-center text-xs text-emerald-900">
                    <span className="font-bold">Notification MoovVert : </span>
                    {msg.text}
                  </div>
                );
              }

              // Determine sender identity dynamically from authenticated accounts
              const isClient = msg.senderId === 'client_001' || msg.senderId === clientUser.id || msg.senderRole === 'client';
              const isMe = isClient;
              const senderPhoto = isClient
                ? (clientUser.profileImage || clientUser.avatar)
                : (driverUser.profileImage || driverUser.avatar);
              const senderName = isClient ? clientUser.name : driverUser.name;

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 my-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Received Message: Display Chauffeur's real profile photo */}
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
                          ? 'bg-[#00A86B] text-white rounded-tr-xs'
                          : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span
                        className={`block text-[10px] mt-1.5 font-mono ${
                          isMe ? 'text-emerald-100 text-right' : 'text-slate-500'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Sent Message: Display Client's real profile photo */}
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

        {/* Quick Suggestion Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 shrink-0 scrollbar-none">
          {[
            'Salam, fin wslti ?',
            'Je serai bien présent à l\'heure prévue.',
            'Avez-vous besoin d\'aide pour le stationnement ?',
            'Tous les meubles sont démontés et prêts.'
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

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 shrink-0">
          <img
            src={clientPhoto}
            alt={clientName}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
            title={`Connecté en tant que ${clientName}`}
          />
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Écrivez un message au chauffeur..."
            className="flex-1 px-3 py-2 text-xs text-slate-900 bg-transparent focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-[#00A86B] hover:bg-[#008f5a] disabled:opacity-50 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </ClientLayout>
  );
};
