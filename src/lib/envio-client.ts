
import { GraphQLClient } from 'graphql-request';

export class EnvioClient {
  private client: GraphQLClient;

  constructor(endpoint: string = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_ENDPOINT || 'https://indexer.dev.hyperindex.xyz/be31b19/v1/graphql') {
    this.client = new GraphQLClient(endpoint);
  }

  async getActiveMarkets() {
    const query = `
      query GetActiveMarkets {
        MarketCreatedEvent(limit: 100, order_by: {blockTimestamp: desc}) {
          id
          marketId
          title
          creator
          marketType
          blockTimestamp
          transactionHash
        }
      }
    `;

    try {
      const data = await this.client.request(query);
      return data.MarketCreatedEvent || [];
    } catch (error) {
      console.error('Error fetching markets:', error);
      return [];
    }
  }

  async getMarketHistory(marketId: string) {
    const query = `
      query GetMarketHistory($marketId: String!) {
        BetPlacedEvent(where: {marketId: {_eq: $marketId}}, order_by: {blockTimestamp: desc}) {
          id
          marketId
          user
          agent
          option
          amount
          shares
          blockTimestamp
          transactionHash
        }
      }
    `;

    try {
      const data = await this.client.request(query, { marketId });
      return data.BetPlacedEvent || [];
    } catch (error) {
      console.error('Error fetching market history:', error);
      return [];
    }
  }

  async getUserBets(userAddress: string) {
    const query = `
      query GetUserBets($user: String!) {
        BetPlacedEvent(where: {user: {_eq: $user}}, order_by: {blockTimestamp: desc}) {
          id
          marketId
          user
          agent
          option
          amount
          shares
          blockTimestamp
          transactionHash
        }
      }
    `;

    try {
      const data = await this.client.request(query, { user: userAddress });
      return data.BetPlacedEvent || [];
    } catch (error) {
      console.error('Error fetching user bets:', error);
      return [];
    }
  }

  async getAgentDelegations(userAddress: string) {
    const query = `
      query GetAgentDelegations($user: String!) {
        AgentDelegationUpdatedEvent(where: {user: {_eq: $user}, approved: {_eq: true}}, order_by: {blockTimestamp: desc}) {
          id
          user
          agent
          approved
          maxBetAmount
          blockTimestamp
          transactionHash
        }
      }
    `;

    try {
      const data = await this.client.request(query, { user: userAddress });
      return data.AgentDelegationUpdatedEvent || [];
    } catch (error) {
      console.error('Error fetching agent delegations:', error);
      return [];
    }
  }

  async getMarketResolutions() {
    const query = `
      query GetMarketResolutions {
        MarketResolvedEvent(order_by: {blockTimestamp: desc}) {
          id
          marketId
          outcome
          resolver
          finalPrice
          blockTimestamp
          transactionHash
        }
      }
    `;

    try {
      const data = await this.client.request(query);
      return data.MarketResolvedEvent || [];
    } catch (error) {
      console.error('Error fetching market resolutions:', error);
      return [];
    }
  }
}
