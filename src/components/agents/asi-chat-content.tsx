"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useASIAgentStatus } from '@/hooks/useASIAgent';
import { toast } from 'sonner';

// Enhanced markdown renderer for chat messages
function renderMarkdown(text: string) {
  return text
    // Fix broken markdown first
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-blue-300">$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>') // Italic
    .replace(/`(.*?)`/g, '<code class="bg-gray-700 text-green-400 px-1 rounded text-xs font-mono">$1</code>') // Code
    // Handle bullet points with emojis
    .replace(/^([🔍🎯📊🧠💡⚠️📈🥇💰📅⏰✅❌🚀📋🔄💭⚖️🖥️🔬🧮]) (.*$)/gim, '<div class="flex items-start mb-1"><span class="mr-2">$1</span><span>$2</span></div>')
    // Handle regular bullet points
    .replace(/^• (.*$)/gim, '<div class="flex items-start mb-1"><span class="text-blue-400 mr-2">•</span><span>$1</span></div>')
    // Handle numbered lists
    .replace(/^(\d+)\. (.*$)/gim, '<div class="flex items-start mb-1"><span class="text-blue-400 mr-2 font-bold">$1.</span><span>$2</span></div>')
    // Handle section headers (lines ending with :)
    .replace(/^([^:\n]+):$/gim, '<div class="font-semibold text-blue-300 mt-2 mb-1">$1:</div>')
    // Handle double line breaks
    .replace(/\n\n/g, '<br><br>')
    // Handle single line breaks
    .replace(/\n/g, '<br>');
}

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  analysis?: {
    marketId: string;
    recommendation: string;
    confidence: number;
    reasoning: string;
  }[];
}

interface ASIChatContentProps {
  className?: string;
}

export function ASIChatContent({ className }: ASIChatContentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'agent',
      content: `🧠 Hello! I'm the **ChimeraProtocol Local ASI Agent** powered by MeTTa reasoning and Hyperon symbolic AI!

🖥️ **Running locally** for advanced market analysis and maximum privacy.

**What I can do**:
• 🔬 MeTTa symbolic reasoning for market analysis
• 🧮 Hyperon-based logical inference
• 🎯 Advanced contrarian betting strategies  
• 💡 Real-time market dynamics analysis
• 🔍 Continuous market monitoring

**Try asking me**:
• "analyze markets" - Get MeTTa-powered analysis
• "recommend bets" - Get AI-driven recommendations
• "explain strategy" - Learn contrarian approach
• "health" - Check local agent status
• "help" - See all available commands

**Agent**: agent1q0xt9x...flzn (Local MeTTa Engine)

Let's start chatting! Ask me anything about prediction markets! 💬`,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: agentStatus } = useASIAgentStatus();

  // Helper function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      // Try multiple selectors for Radix ScrollArea
      const scrollContainer = 
        scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') ||
        scrollAreaRef.current.querySelector('.scroll-area-viewport') ||
        scrollAreaRef.current;
      
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100); // Small delay to ensure content is rendered
      }
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setTimeout(scrollToBottom, 100);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to ASI Agent with enhanced context
      const response = await fetch('/api/asi-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: 'floating-chat',
          sessionId: `session-${Date.now()}`,
          userId: 'web-user',
          context: {
            platform: 'chimera-floating-chat',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from ASI Agent');
      }

      const data = await response.json();

      // If it's a connection error, show the message but don't auto-redirect
      if (data.error && data.direct_chat_url) {
        const agentMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: `🔌 I'm having trouble connecting to the Agentverse agent right now.

🤖 **ChimeraProtocol ASI Agent** is deployed on Agentverse with ASI-1 LLM and MeTTa reasoning!

**Current Status**: The agent is running on Agentverse but API connection is having issues.

**What you can do**:
• Try asking your question again in a few moments
• Use the "🚀 Chat on Agentverse" button below for direct access
• The agent is fully functional on Agentverse with advanced AI capabilities

**Available Commands**:
• "analyze markets" - Get market analysis with MeTTa reasoning
• "recommend bets" - Get betting recommendations  
• "explain strategy" - Learn contrarian approach
• "help" - See all commands

I'll keep trying to connect in the background! 🤖`,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, agentMessage]);
        setTimeout(scrollToBottom, 200);
        toast.info('Agent is on Agentverse - trying to connect...');
        return;
      }

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: data.message || 'I received your message but couldn\'t process it properly.',
        timestamp: new Date(),
        analysis: data.analysis,
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Error sending message to ASI Agent:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: `🔌 I'm having trouble connecting to the Agentverse agent right now.

🤖 **ChimeraProtocol ASI Agent** is deployed on Agentverse with advanced MeTTa reasoning!

**You can chat directly with the agent here**:
https://agentverse.ai/agents/agent1q0xt9xwp9924knna6hh4qnqwmlusxuvl8vcyh6pg3wfjgqa2ucefu46flzn

**Try these commands on Agentverse**:
• "analyze markets" - Get market analysis
• "recommend bets" - Get betting recommendations  
• "explain strategy" - Learn contrarian approach
• "help" - See all commands

Click the "🚀 Chat on Agentverse" button below to open direct chat!`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Redirecting to Agentverse for direct chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'agent',
        content: `🤖 Hello! I'm the **ChimeraProtocol ASI Agent** powered by ASI-1 LLM and MeTTa reasoning!

🚀 **I'm hosted on Agentverse** and ready to help you with prediction market analysis.

**What I can do**:
• 📊 Analyze prediction markets with symbolic AI
• 🎯 Provide contrarian betting strategies  
• 💡 Explain market dynamics and opportunities
• 🔍 Real-time market monitoring and alerts

**Try asking me**:
• "analyze markets" - Get detailed market analysis
• "recommend bets" - Get personalized recommendations
• "explain strategy" - Learn contrarian approach
• "help" - See all available commands

Let's start chatting! Ask me anything about prediction markets! 💬`,
        timestamp: new Date(),
      }
    ]);
  };

  const quickActions = [
    { label: 'Analyze Markets', message: 'analyze all markets' },
    { label: 'Get Recommendations', message: 'recommend bets' },
    { label: 'Check Status', message: 'health' },
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800/50">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-[#FFE100]" />
          <span className="font-semibold text-white">ASI Agent Chat</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
            On Agentverse
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 overflow-hidden">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-[#FFE100] text-black'
                    : 'bg-gray-800/50 text-white border border-gray-700/50'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'agent' && (
                    <Bot className="h-4 w-4 text-[#FFE100] mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="h-4 w-4 text-black mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                      style={{ 
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                      }}
                    />
                    
                    {/* Analysis Results */}
                    {message.analysis && message.analysis.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.analysis.map((analysis, index) => (
                          <div key={index} className="bg-gray-900/50 rounded p-2 border border-gray-600/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-[#FFE100]">
                                Market Analysis
                              </span>
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                {analysis.confidence}% confidence
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-300 mb-1">
                              <strong>Recommendation:</strong> {analysis.recommendation}
                            </p>
                            <p className="text-xs text-gray-400">
                              {analysis.reasoning}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/50 text-white border border-gray-700/50 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-[#FFE100]" />
                  <Loader2 className="h-4 w-4 animate-spin text-[#FFE100]" />
                  <span className="text-sm text-gray-300">ASI Agent is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-2 border-t border-gray-800/50">
        <div className="flex flex-wrap gap-1 mb-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => {
                setInputValue(action.message || '');
              }}
              className="text-xs border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              {action.label}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about markets, get recommendations, or say 'help'"
            className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-[#FFE100] focus:ring-[#FFE100]/20"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-[#FFE100] to-[#E6CC00] hover:from-[#E6CC00] hover:to-[#CCAA00] text-black"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}