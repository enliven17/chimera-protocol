import { NextRequest, NextResponse } from 'next/server';

// ASI Agent chat endpoint - Uses local MeTTa engine and Hyperon reasoning
export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, sessionId, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🧠 Local ASI Agent chat request:', { message, conversationId, sessionId });
    
    // Connect to local ASI agent server
    const localAgentUrl = process.env.LOCAL_AGENT_URL || 'http://localhost:8001';
    console.log('🔗 Connecting to local agent at:', localAgentUrl);
    
    console.log('🤖 Connecting to local MeTTa agent...');
    
    try {
      // Send message to local agent server
      const localResponse = await fetch(`${localAgentUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationId: conversationId || sessionId || 'web-chat',
          userId: userId || 'web-user'
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (localResponse.ok) {
        const data = await localResponse.json();
        console.log('✅ Local MeTTa agent response received:', data);
        
        return NextResponse.json({
          message: data.message || 'Response from local MeTTa agent',
          type: 'local_metta_response',
          timestamp: new Date().toISOString(),
          source: 'local_metta_engine',
          conversation_id: data.conversation_id || conversationId
        });
      } else {
        const errorText = await localResponse.text();
        console.error('❌ Local agent error:', localResponse.status, errorText);
        
        // Try fallback to structured query endpoint
        console.log('🔄 Trying structured query endpoint...');
        
        const queryResponse = await fetch(`${localAgentUrl}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: message,
            parameters: {
              userId: userId || 'web-user',
              sessionId: sessionId || conversationId || 'web-chat'
            }
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (queryResponse.ok) {
          const queryData = await queryResponse.json();
          console.log('✅ Structured query response received:', queryData);
          
          return NextResponse.json({
            message: queryData.message || 'Response from MeTTa reasoning engine',
            analysis: queryData.analysis,
            type: 'metta_query_response',
            timestamp: new Date().toISOString(),
            source: 'local_metta_engine'
          });
        }
        
        throw new Error(`Local agent server not responding`);
      }
      
    } catch (error) {
      console.error('❌ Failed to connect to local MeTTa agent:', error);
      
      // Return helpful error message with local agent info
      return NextResponse.json({
        message: `🔌 Unable to connect to local MeTTa agent right now.

🧠 **ChimeraProtocol Local ASI Agent**
🖥️ **Server**: ${localAgentUrl}
🔬 **Engine**: MeTTa + Hyperon Reasoning

**Possible Issues**:
• Local agent server not running
• Port 8001 might be blocked
• MeTTa engine initialization failed
• Python dependencies missing

**To start the local agent**:
1. Navigate to agents/asi-agent/
2. Run: python simple_http_server.py
3. Or run: python http_server.py

**Available Commands**:
• "analyze markets" - Get MeTTa market analysis
• "recommend bets" - Get betting recommendations  
• "explain strategy" - Learn contrarian betting approach
• "health" - Check agent status
• "help" - See all available commands

The local agent uses advanced MeTTa reasoning and Hyperon symbolic AI for market analysis!`,
        error: true,
        type: 'connection_error',
        local_agent_url: localAgentUrl,
        instructions: {
          start_command: 'python agents/asi-agent/simple_http_server.py',
          port: 8001,
          engine: 'MeTTa + Hyperon'
        }
      });
    }

  } catch (error) {
    console.error('Error communicating with local ASI Agent:', error);
    
    const localAgentUrl = process.env.LOCAL_AGENT_URL || 'http://localhost:8001';
    
    // Return a helpful error message with local setup instructions
    return NextResponse.json({
      message: `🔌 I'm having trouble connecting to the local MeTTa agent.

🧠 **ChimeraProtocol Local ASI Agent**
🖥️ **Expected URL**: ${localAgentUrl}
🔬 **Technology**: MeTTa Reasoning + Hyperon Symbolic AI

**Quick Setup**:
1. Open terminal in project root
2. cd agents/asi-agent/
3. pip install -r requirements.txt
4. python simple_http_server.py

**Features**:
• MeTTa symbolic reasoning for market analysis
• Hyperon-based logical inference
• Contrarian betting strategy detection
• Real-time market data integration
• Advanced risk assessment

**Available Commands**:
• "analyze markets" - Get MeTTa market analysis
• "recommend bets" - Get betting recommendations  
• "explain strategy" - Learn contrarian betting approach
• "health" - Check agent status
• "help" - See all available commands

The local agent provides more advanced reasoning than cloud-based alternatives!`,
      error: true,
      type: 'setup_required',
      local_agent_url: localAgentUrl,
      setup_instructions: [
        'cd agents/asi-agent/',
        'pip install -r requirements.txt',
        'python simple_http_server.py'
      ]
    });
  }
}

// Health check endpoint for local MeTTa agent
export async function GET() {
  try {
    const localAgentUrl = process.env.LOCAL_AGENT_URL || 'http://localhost:8001';
    
    // Try to ping local agent
    const response = await fetch(`${localAgentUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: 'healthy',
        local_agent_url: localAgentUrl,
        agent_status: data,
        engine: 'MeTTa + Hyperon',
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error(`Local agent returned ${response.status}`);
    }

  } catch (error) {
    const localAgentUrl = process.env.LOCAL_AGENT_URL || 'http://localhost:8001';
    
    return NextResponse.json({
      status: 'offline',
      message: 'Local MeTTa agent is not running',
      local_agent_url: localAgentUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
      setup_instructions: [
        'cd agents/asi-agent/',
        'pip install -r requirements.txt', 
        'python simple_http_server.py'
      ],
      timestamp: new Date().toISOString(),
    }, { status: 200 }); // Return 200 to indicate API is working, just agent is offline
  }
}