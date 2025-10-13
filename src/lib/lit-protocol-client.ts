// Lit Protocol Vincent Skill client for secure execution
export class LitProtocolClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_LIT_PROTOCOL_ENDPOINT || 'http://localhost:3001';
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_LIT_PROTOCOL_API_KEY;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Lit Protocol API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get Vincent skill status
  async getSkillStatus() {
    return this.makeRequest('/status');
  }

  // Execute a betting action through Vincent skill
  async executeBettingAction(params: {
    action: 'place_bet' | 'claim_winnings' | 'delegate_agent' | 'revoke_delegation';
    marketId?: string;
    option?: number;
    amount?: string;
    agentAddress?: string;
    maxBetAmount?: string;
    userAddress: string;
    signature?: string;
  }) {
    return this.makeRequest('/execute_action', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Get execution history
  async getExecutionHistory(userAddress: string, limit = 50) {
    return this.makeRequest(`/execution_history?user=${userAddress}&limit=${limit}`);
  }

  // Validate a transaction before execution
  async validateTransaction(params: {
    userAddress: string;
    contractAddress: string;
    functionName: string;
    args: any[];
    value?: string;
  }) {
    return this.makeRequest('/validate_transaction', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Get user's delegation permissions
  async getUserDelegations(userAddress: string) {
    return this.makeRequest(`/delegations?user=${userAddress}`);
  }

  // Create a secure execution session
  async createExecutionSession(params: {
    userAddress: string;
    permissions: string[];
    expiresAt: number;
  }) {
    return this.makeRequest('/create_session', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Revoke an execution session
  async revokeExecutionSession(sessionId: string) {
    return this.makeRequest(`/revoke_session/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Get audit trail for a user
  async getAuditTrail(userAddress: string, fromDate?: string, toDate?: string) {
    const params = new URLSearchParams({
      user: userAddress,
      ...(fromDate && { from: fromDate }),
      ...(toDate && { to: toDate }),
    });
    
    return this.makeRequest(`/audit_trail?${params}`);
  }

  // Emergency stop for all user actions
  async emergencyStop(userAddress: string, reason: string) {
    return this.makeRequest('/emergency_stop', {
      method: 'POST',
      body: JSON.stringify({
        userAddress,
        reason,
      }),
    });
  }

  // Get security metrics
  async getSecurityMetrics() {
    return this.makeRequest('/security_metrics');
  }

  // Batch execute multiple actions
  async batchExecute(actions: Array<{
    action: string;
    params: any;
    priority?: number;
  }>) {
    return this.makeRequest('/batch_execute', {
      method: 'POST',
      body: JSON.stringify({ actions }),
    });
  }
}

// Response types
export interface ExecutionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: number;
  executionTime: number;
  timestamp: string;
  auditId: string;
}

export interface ExecutionHistory {
  id: string;
  userAddress: string;
  action: string;
  params: any;
  result: ExecutionResult;
  timestamp: string;
  blockNumber?: number;
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  estimatedGas: number;
  securityScore: number;
  riskFactors: string[];
}

export interface UserDelegation {
  agentAddress: string;
  permissions: string[];
  maxBetAmount: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface ExecutionSession {
  sessionId: string;
  userAddress: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
  lastUsed?: string;
}

export interface AuditEntry {
  id: string;
  userAddress: string;
  action: string;
  params: any;
  result: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  riskScore: number;
}

export interface SecurityMetrics {
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  securityIncidents: number;
  activeUsers: number;
  activeSessions: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

// Create singleton instance
export const litProtocolClient = new LitProtocolClient();