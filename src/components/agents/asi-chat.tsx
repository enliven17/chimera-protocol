"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
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
    .replace(/^([🔍🎯📊🧠💡⚠️📈🥇💰📅⏰✅❌🚀📋🔄💭⚖️]) (.*$)/gim, '<div class="flex items-start mb-1"><span class="mr-2">$1</span><span>$2</span></div>')
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

interface ASIChatProps {
  className?: string;
}

export function ASIChat({ className }: ASIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'agent',
      content: `🧠 Hello! I'm the **ChimeraProtocol Local ASI Agent** with MeTTa reasoning!

🖥️ **Running locally** with advanced symbolic AI capabilities.

**Try these commands**:
• "analyze markets" - Get MeTTa market analysis
• "recommend bets" - Get AI recommendations
• "health" - Check agent status
• "help" - See all commands

**Status**: 🟢 Local MeTTa engine ready`,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: agentStatus, isLoading: statusLoading } = useASIAgentStatus();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
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
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('🚀 Sending message to local MeTTa agent:', userMessage.content);
      
      // Send message to ASI Agent with enhanced context
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/asi-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: 'web-chat',
          sessionId: `session-${Date.now()}`,
          userId: 'web-user',
          context: {
            platform: 'chimera-web',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log('📡 Response received:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Failed to get response from ASI Agent: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Response data:', data);

      // If it's a connection error, show local setup instructions
      if (data.error && data.setup_instructions) {
        const agentMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: data.message,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, agentMessage]);
        
        // Show setup instructions
        toast.error('Local MeTTa agent not running. Check setup instructions in chat.');
        
        return;
      }

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: data.message || 'Response received from local MeTTa agent.',
        timestamp: new Date(),
        analysis: data.analysis,
      };

      setMessages(prev => [...prev, agentMessage]);
      console.log('✅ Message processed successfully:', data);

    } catch (error) {
      console.error('Error sending message to ASI Agent:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: `🔌 I'm having trouble connecting to the local MeTTa agent.

🧠 **ChimeraProtocol Local ASI Agent** uses MeTTa reasoning and Hyperon symbolic AI!

**To start the local agent**:
1. Open terminal in project root
2. cd agents/asi-agent/
3. python simple_http_server.py

**Features when running**:
• 🔬 MeTTa symbolic reasoning
• 🧮 Hyperon logical inference  
• 🎯 Advanced contrarian analysis
• 💡 Real-time market insights

**Try these commands once running**:
• "analyze markets" - Get MeTTa analysis
• "recommend bets" - Get AI recommendations  
• "explain strategy" - Learn contrarian approach
• "health" - Check agent status

The local agent provides more advanced reasoning than cloud alternatives!`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Local MeTTa agent not running. Check setup instructions.');
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
        content: 'Chat cleared. How can I help you with market analysis?',
        timestamp: new Date(),
      }
    ]);
  };

  const getStatusColor = () => {
    if (statusLoading) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (agentStatus?.status === 'healthy') return 'bg-green-500/20 text-green-400 border-green-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getStatusText = () => {
    if (statusLoading) return 'Connecting...';
    if (agentStatus?.status === 'healthy') return 'Online';
    return 'Offline';
  };

  return (
    <Card className={`bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Bot className="h-5 w-5 text-blue-400" />
            <span>ASI Agent Chat</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-96 w-full rounded-md border border-gray-800/50 p-4 bg-[#0A0C14]"
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'agent' && (
                      <Bot className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User className="h-4 w-4 mt-0.5 text-white flex-shrink-0" />
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
                      
                      {/* Show analysis results if available */}
                      {message.analysis && message.analysis.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.analysis.map((analysis, idx) => (
                            <div key={idx} className="bg-gray-700/50 rounded p-2 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">Market {analysis.marketId}</span>
                                <Badge 
                                  className={`text-xs ${
                                    analysis.confidence > 0.7 
                                      ? 'bg-green-500/20 text-green-400' 
                                      : analysis.confidence > 0.5
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {(analysis.confidence * 100).toFixed(0)}% confidence
                                </Badge>
                              </div>
                              <p className="text-gray-300 mb-1">
                                <TrendingUp className="h-3 w-3 inline mr-1" />
                                {analysis.recommendation}
                              </p>
                              <p className="text-gray-400 text-xs">{analysis.reasoning}</p>
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
                <div className="bg-gray-800 text-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-blue-400" />
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    <span className="text-sm">ASI Agent is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about markets, get recommendations, or say 'help'..."
            className="flex-1 bg-[#0A0C14] border-gray-800/50 text-white placeholder-gray-400"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue('analyze all markets')}
            className="text-xs border-gray-700 text-gray-300 hover:text-white"
            disabled={isLoading}
          >
            Analyze Markets
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue('what should I bet on?')}
            className="text-xs border-gray-700 text-gray-300 hover:text-white"
            disabled={isLoading}
          >
            Get Recommendations
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue('show me crypto markets')}
            className="text-xs border-gray-700 text-gray-300 hover:text-white"
            disabled={isLoading}
          >
            Crypto Markets
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue('health')}
            className="text-xs border-green-600 text-green-400 hover:text-white hover:border-green-500"
            disabled={isLoading}
          >
            🔍 Check Status
          </Button>
        </div>

        {/* Local Agent Info */}
        <div className="mt-2 p-3 bg-purple-900/20 border border-purple-800/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-300">
                Local MeTTa + Hyperon reasoning engine
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor()}>
                {getStatusText()}
              </Badge>
              {agentStatus?.status !== 'healthy' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.info('Run: python agents/asi-agent/simple_http_server.py')}
                  className="text-purple-400 hover:text-purple-300 text-xs"
                >
                  Setup Help
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}