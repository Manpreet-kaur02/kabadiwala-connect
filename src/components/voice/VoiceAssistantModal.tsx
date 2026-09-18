import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  CornerDownLeft,
} from 'lucide-react';
import { UserRole, Language, MaterialType, VoiceAssistantState } from '../../types';
import {
  parseVoiceCommand,
  speakText,
  ROLE_SUGGESTED_VOICE_PROMPTS,
  VoiceCommandParseResult,
} from '../../services/voiceService';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  language: Language;
  onNavigate: (tab: string) => void;
  onOpenScanner: (suggestedMaterial?: MaterialType) => void;
  onOpenPriceEstimator: (
    material?: MaterialType,
    weight?: number,
    condition?: 'Good' | 'Used' | 'Damaged',
    location?: string
  ) => void;
  onOpenFindCollector: () => void;
}

interface ConversationMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'price_review' | 'confirm_action' | 'navigation_link';
    title: string;
    details: string;
    actionLabel: string;
    onAction: () => void;
  };
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  language,
  onNavigate,
  onOpenScanner,
  onOpenPriceEstimator,
  onOpenFindCollector,
}) => {
  const [state, setState] = useState<VoiceAssistantState>('idle');
  const [typedInput, setTypedInput] = useState<string>('');
  const [showTypeInput, setShowTypeInput] = useState<boolean>(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversationContext, setConversationContext] = useState<{
    step?: 'awaiting_weight' | 'awaiting_condition' | 'awaiting_location' | 'confirming_action';
    material?: MaterialType;
    weight?: number;
    condition?: 'Good' | 'Used' | 'Damaged';
    location?: string;
  }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize messages and welcome prompt when opened
  useEffect(() => {
    if (isOpen) {
      const welcomeText =
        language === 'hi'
          ? 'नमस्ते! मैं Kabadiwala Connect वॉइस असिस्टेंट हूँ। आप ई-कचरे का भाव पूछ सकते हैं, सामग्री स्कैन कर सकते हैं, या नजदीकी कलेक्टर ढूंढ सकते हैं।'
          : 'Hello! I am your Kabadiwala Connect Voice Assistant. Ask me scrap prices, say "Scan material", or find nearby collectors.';

      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setState('idle');
      setShowTypeInput(false);
      setConversationContext({});

      // Read welcome aloud
      speakText(welcomeText, language);
    } else {
      stopListening();
    }
  }, [isOpen, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
  };

  const startListening = () => {
    stopListening();
    setState('listening');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState('error');
      setShowTypeInput(true);
      const fallbackMsg =
        language === 'hi'
          ? 'आपके ब्राउज़र में स्पीच रिकॉग्निशन समर्थित नहीं है। कृपया नीचे टाइप करें या क्विक प्रॉम्प्ट चुनें।'
          : 'Speech recognition is not supported in this browser. Please type or click the suggestions below.';
      addAssistantMessage(fallbackMsg);
      speakText(fallbackMsg, language);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setState('listening');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          handleProcessInput(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        if (event.error === 'no-speech') {
          setState('idle');
        } else {
          setState('error');
          setShowTypeInput(true);
        }
      };

      recognition.onend = () => {
        if (state === 'listening') {
          setState('idle');
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setState('error');
      setShowTypeInput(true);
    }
  };

  const addAssistantMessage = (text: string, actionCard?: ConversationMessage['actionCard']) => {
    setMessages((prev) => [
      ...prev,
      {
        id: 'msg-' + Date.now() + Math.random(),
        sender: 'assistant',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard,
      },
    ]);
  };

  const handleProcessInput = (rawText: string) => {
    stopListening();
    setState('processing');

    // Add user message to thread
    setMessages((prev) => [
      ...prev,
      {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: rawText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Parse the command
    const result: VoiceCommandParseResult = parseVoiceCommand(
      rawText,
      currentRole,
      conversationContext
    );

    setTimeout(() => {
      executeCommand(result);
    }, 450);
  };

  const executeCommand = (result: VoiceCommandParseResult) => {
    setState('success');
    const spokenResponse = language === 'hi' ? result.responseMessageHi : result.responseMessageEn;
    speakText(spokenResponse, language);

    switch (result.intent) {
      case 'SCAN_MATERIAL': {
        addAssistantMessage(spokenResponse, {
          type: 'navigation_link',
          title: 'AI Material Scanner',
          details: 'Launch camera or image uploader to identify e-waste components.',
          actionLabel: 'Open Scanner Now',
          onAction: () => {
            onClose();
            onOpenScanner(result.material);
          },
        });
        setTimeout(() => {
          onClose();
          onOpenScanner(result.material);
        }, 1200);
        break;
      }

      case 'PRICE_CHECK': {
        const mat = result.material || 'PCB / Circuit Board';
        setConversationContext({
          step: 'awaiting_weight',
          material: mat,
        });
        addAssistantMessage(spokenResponse);
        break;
      }

      case 'PRICE_STEP_WEIGHT': {
        const currentMat = conversationContext.material || 'PCB / Circuit Board';
        const wt = result.weight || 5.0;
        setConversationContext((prev) => ({
          ...prev,
          step: 'awaiting_condition',
          weight: wt,
        }));
        addAssistantMessage(spokenResponse);
        break;
      }

      case 'PRICE_STEP_CONDITION': {
        const cond = result.condition || 'Good';
        setConversationContext((prev) => ({
          ...prev,
          step: 'awaiting_location',
          condition: cond,
        }));
        addAssistantMessage(spokenResponse);
        break;
      }

      case 'PRICE_STEP_LOCATION': {
        const loc = result.location || 'Chandigarh';
        const finalMat = conversationContext.material || 'PCB / Circuit Board';
        const finalWt = conversationContext.weight || 5.0;
        const finalCond = conversationContext.condition || 'Good';

        setConversationContext({
          material: finalMat,
          weight: finalWt,
          condition: finalCond,
          location: loc,
        });

        addAssistantMessage(
          spokenResponse,
          {
            type: 'price_review',
            title: `Review: ${finalWt} kg ${finalMat}`,
            details: `Condition: ${finalCond} | Location: ${loc}`,
            actionLabel: 'Calculate Fair Estimate',
            onAction: () => {
              onClose();
              onOpenPriceEstimator(finalMat, finalWt, finalCond, loc);
            },
          }
        );
        break;
      }

      case 'FIND_COLLECTOR': {
        addAssistantMessage(spokenResponse, {
          type: 'navigation_link',
          title: 'Find Nearby Collectors',
          details: 'Direct doorstep pickup by verified local kabadiwalas.',
          actionLabel: 'View Collectors',
          onAction: () => {
            onClose();
            onOpenFindCollector();
          },
        });
        setTimeout(() => {
          onClose();
          onOpenFindCollector();
        }, 1200);
        break;
      }

      case 'SHOW_REQUESTS': {
        addAssistantMessage(spokenResponse);
        setTimeout(() => {
          onClose();
          onNavigate(currentRole === 'collector' ? 'pickup-requests' : 'my-requests');
        }, 1000);
        break;
      }

      case 'SHOW_TRANSACTIONS': {
        addAssistantMessage(spokenResponse);
        setTimeout(() => {
          onClose();
          onNavigate('transactions');
        }, 1000);
        break;
      }

      case 'SHOW_EARNINGS': {
        addAssistantMessage(spokenResponse);
        setTimeout(() => {
          onClose();
          onNavigate('earnings');
        }, 1000);
        break;
      }

      case 'OPEN_INVENTORY': {
        addAssistantMessage(spokenResponse);
        setTimeout(() => {
          onClose();
          onNavigate('inventory');
        }, 1000);
        break;
      }

      case 'OPEN_SAFETY': {
        addAssistantMessage(spokenResponse);
        setTimeout(() => {
          onClose();
          onNavigate('safety');
        }, 1000);
        break;
      }

      case 'UNKNOWN':
      default: {
        addAssistantMessage(spokenResponse);
        break;
      }
    }
  };

  const handleSendTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    const text = typedInput.trim();
    setTypedInput('');
    handleProcessInput(text);
  };

  const handlePromptClick = (prompt: { en: string; hi: string }) => {
    const text = language === 'hi' ? prompt.hi : prompt.en;
    handleProcessInput(text);
  };

  if (!isOpen) return null;

  const currentPrompts = ROLE_SUGGESTED_VOICE_PROMPTS[currentRole] || ROLE_SUGGESTED_VOICE_PROMPTS.seller;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[85vh] sm:h-[650px] max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>{language === 'hi' ? 'आवाज़ सहायक' : 'Voice Assistant'}</span>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {language === 'hi' ? 'हिंदी / Hinglish' : 'En / Hi'}
                </span>
              </h3>
              <span className="text-[11px] text-slate-500">
                {currentRole.toUpperCase()} mode navigation & inquiries
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                {msg.text}

                {/* Optional Action Card */}
                {msg.actionCard && (
                  <div className="mt-3 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                    <span className="font-bold text-emerald-900 block text-xs">
                      {msg.actionCard.title}
                    </span>
                    <p className="text-[11px] text-emerald-800 leading-snug">
                      {msg.actionCard.details}
                    </p>
                    <button
                      onClick={msg.actionCard.onAction}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>{msg.actionCard.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Commands */}
        <div className="px-4 py-2 bg-white border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            {language === 'hi' ? 'त्वरित निर्देश (Tap to say):' : 'Suggested Commands:'}
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {currentPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(p)}
                className="shrink-0 px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-full text-[11px] font-medium transition-all"
              >
                {language === 'hi' ? p.hi : p.en}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Mic & Controls Section */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-3">
          {/* Active Listening Waveform or State Status */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {state === 'listening' ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-bold text-rose-600">
                    {language === 'hi' ? 'सुन रहा हूँ... बोलिए' : '🔴 Listening... speak now'}
                  </span>
                </>
              ) : state === 'processing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  <span className="font-bold text-emerald-700">
                    {language === 'hi' ? 'समझ रहा हूँ...' : '⏳ Understanding...'}
                  </span>
                </>
              ) : state === 'error' ? (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'कृपया दोबारा प्रयास करें' : 'Tap mic to retry'}</span>
                </span>
              ) : (
                <span className="text-slate-500 font-medium">
                  {language === 'hi' ? '🎙 बोलने के लिए माइक दबाएं' : '🎙 Tap mic to speak'}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowTypeInput(!showTypeInput)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              {showTypeInput ? 'Hide text input' : 'Type instead'}
            </button>
          </div>

          {/* Audio Wave Visualizer while listening */}
          {state === 'listening' && (
            <div className="flex items-center justify-center gap-1.5 py-1">
              {[0.4, 0.9, 0.6, 1.0, 0.7, 0.5, 0.8, 0.3].map((heightScale, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-emerald-500 rounded-full animate-pulse"
                  style={{
                    height: `${heightScale * 24}px`,
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Primary Action Row: Big Mic Button or Text Input */}
          {showTypeInput ? (
            <form onSubmit={handleSendTyped} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  language === 'hi'
                    ? 'कमांड लिखें (जैसे PCB ka price batao)...'
                    : 'Type a command (e.g., Check PCB price, scan material)...'
                }
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!typedInput.trim()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center">
              <button
                onClick={state === 'listening' ? stopListening : startListening}
                className={`relative p-4 rounded-full transition-all shadow-lg flex items-center justify-center ${
                  state === 'listening'
                    ? 'bg-rose-500 text-white shadow-rose-500/30 scale-105'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                }`}
                title="Tap to talk"
              >
                {state === 'listening' ? (
                  <MicOff className="w-7 h-7" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const FloatingVoiceTrigger: React.FC<{
  onClick: () => void;
  language: Language;
}> = ({ onClick, language }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 p-3.5 sm:px-4 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl shadow-emerald-700/25 border-2 border-white/20 transition-all hover:scale-105 flex items-center gap-2 group cursor-pointer"
      title="Voice Assistant (English / Hindi)"
    >
      <div className="relative">
        <Mic className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
      </div>
      <span className="hidden sm:inline text-xs font-bold tracking-wide">
        {language === 'hi' ? 'आवाज़ सहायक' : 'Voice Assistant'}
      </span>
    </button>
  );
};
