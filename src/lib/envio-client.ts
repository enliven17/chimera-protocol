
import { GraphQLClient } from 'graphql-request';

export class EnvioClient {
  private client: GraphQLClient;

  constructor(endpoint: string) {
    this.client = new GraphQLClient(endpoint);
  }

  async getActiveMarkets() {
    const query = `
      query GetActiveMarkets {
        markets(where: {status: 0, resolved: false}) {
          id
          marketId
          title
          totalPool
          totalOptionAShares
          totalOptionBShares
          createdAt
          updatedAt
          marketType
          status
        }
      }
    `;

    try {
      const data = await this.client.request(query);
      return data.markets || [];
    } catch (error) {
      console.error('Error fetching markets:', error);
      return [];
    }
  }

  async getMarketHistory(marketId: string) {
    const query = `
      query GetMarketHistory($marketId: String!) {
        betPlacedEvents(where: {marketId: $marketId}) {
          id
          user
          agent
          option
          amount
          shares
          blockTimestamp
        }
      }
    `;

    try {
      const data = await this.client.request(query, { marketId });
      return data.betPlacedEvents || [];
    } catch (error) {
      console.error('Error fetching market history:', error);
      return [];
    }
  }

  async getUserPositions(userAddress: string) {
    const query = `
      query GetUserPositions($user: String!) {
        userPositions(where: {user: $user}) {
          id
          marketId
          optionAShares
          optionBShares
          totalInvested
        }
      }
    `;

    try {
      const data = await this.client.request(query, { user: userAddress });
      return data.userPositions || [];
    } catch (error) {
      console.error('Error fetching user positions:', error);
      return [];
    }
  }

  async getAgentDelegations(userAddress: string) {
    const query = `
      query GetAgentDelegations($user: String!) {
        agentDelegations(where: {user: $user, approved: true}) {
          id
          agent
          maxBetAmount
          createdAt
        }
      }
    `;

    try {
      const data = await this.client.request(query, { user: userAddress });
      return data.agentDelegations || [];
    } catch (error) {
      console.error('Error fetching agent delegations:', error);
      return [];
    }
  }
}
