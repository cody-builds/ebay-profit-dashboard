import {
  EbayAuthConfig,
  EbayTokens,
  EbayOAuthResponse,
  EbayGetSellerTransactionsRequest,
  EbayGetSellerTransactionsResponse,
  EbayTransactionData,
} from './types';
import { parseStringPromise } from 'xml2js';

/**
 * eBay API Client for OAuth 2.0 authentication and Trading API integration
 */
export class EbayAPIClient {
  private config: EbayAuthConfig;
  private baseAuthUrl: string;
  private baseApiUrl: string;

  constructor(config: EbayAuthConfig) {
    this.config = config;
    this.baseAuthUrl = config.sandbox
      ? 'https://auth.sandbox.ebay.com'
      : 'https://auth.ebay.com';
    this.baseApiUrl = config.sandbox
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com';
  }

  /**
   * Generate OAuth 2.0 authorization URL
   */
  generateAuthURL(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
      state,
    });

    return `${this.baseAuthUrl}/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  async exchangeCodeForTokens(code: string): Promise<EbayTokens> {
    const response = await fetch(`${this.baseAuthUrl}/identity/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data: EbayOAuthResponse = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      tokenType: data.token_type,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<EbayTokens> {
    const response = await fetch(`${this.baseAuthUrl}/identity/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    const data: EbayOAuthResponse = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      tokenType: data.token_type,
    };
  }

  /**
   * Get seller transactions from eBay Trading API
   */
  async getSellerTransactions(
    accessToken: string,
    modTimeFrom: Date,
    modTimeTo: Date,
    pageNumber: number = 1,
    entriesPerPage: number = 200
  ): Promise<EbayGetSellerTransactionsResponse> {
    const requestXml = this.buildGetSellerTransactionsXML({
      DetailLevel: 'ReturnAll',
      ModTimeFrom: modTimeFrom.toISOString(),
      ModTimeTo: modTimeTo.toISOString(),
      Pagination: {
        EntriesPerPage: entriesPerPage,
        PageNumber: pageNumber,
      },
      IncludeFinalValueFee: true,
      IncludeContainingOrder: true,
    });

    const response = await fetch(`${this.baseApiUrl}/ws/api.dll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-CALL-NAME': 'GetSellerTransactions',
        'X-EBAY-API-SITEID': '0', // US site
        'Authorization': `Bearer ${accessToken}`,
      },
      body: requestXml,
    });

    if (!response.ok) {
      throw new Error(`eBay API request failed: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    return await this.parseGetSellerTransactionsResponse(xmlText);
  }

  /**
   * Build XML request for GetSellerTransactions
   */
  private buildGetSellerTransactionsXML(request: EbayGetSellerTransactionsRequest): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<GetSellerTransactionsRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken></eBayAuthToken>
  </RequesterCredentials>
  <DetailLevel>${request.DetailLevel}</DetailLevel>
  <ModTimeFrom>${request.ModTimeFrom}</ModTimeFrom>
  <ModTimeTo>${request.ModTimeTo}</ModTimeTo>
  <Pagination>
    <EntriesPerPage>${request.Pagination.EntriesPerPage}</EntriesPerPage>
    <PageNumber>${request.Pagination.PageNumber}</PageNumber>
  </Pagination>
  <IncludeFinalValueFee>${request.IncludeFinalValueFee}</IncludeFinalValueFee>
  <IncludeContainingOrder>${request.IncludeContainingOrder}</IncludeContainingOrder>
</GetSellerTransactionsRequest>`;
  }

  /**
   * Parse XML response from GetSellerTransactions
   */
  private async parseGetSellerTransactionsResponse(xmlText: string): Promise<EbayGetSellerTransactionsResponse> {
    try {
      const result = await parseStringPromise(xmlText, {
        explicitArray: false,
        ignoreAttrs: true,
      });

      const response = result.GetSellerTransactionsResponse || {};
      const errors = response.Errors;
      
      // Check for eBay API errors
      if (errors) {
        const errorMessage = Array.isArray(errors) 
          ? errors.map(e => e.LongMessage || e.ShortMessage).join(', ')
          : errors.LongMessage || errors.ShortMessage || 'Unknown eBay API error';
        
        throw new Error(`eBay API Error: ${errorMessage}`);
      }

      // Extract transaction data
      const transactionArray = response.TransactionArray || {};
      const transactions = transactionArray.Transaction || [];
      
      // Ensure transactions is always an array
      const transactionList = Array.isArray(transactions) ? transactions : [transactions].filter(Boolean);

      // Extract pagination data
      const paginationResult = response.PaginationResult || {};
      
      return {
        TransactionArray: {
          Transaction: transactionList,
        },
        PaginationResult: {
          TotalNumberOfPages: parseInt(paginationResult.TotalNumberOfPages) || 1,
          TotalNumberOfEntries: parseInt(paginationResult.TotalNumberOfEntries) || 0,
        },
      };
    } catch (error) {
      console.error('Error parsing eBay XML response:', error);
      console.log('XML Response:', xmlText.substring(0, 500));
      throw new Error(`Failed to parse eBay response: ${error}`);
    }
  }

  /**
   * Transform eBay transaction data to internal format
   */
  transformTransaction(ebayTransaction: Record<string, unknown>): EbayTransactionData {
    try {
      // Handle nested objects that might be strings or objects
      const getNumericValue = (obj: unknown): number => {
        if (typeof obj === 'number') return obj;
        if (typeof obj === 'string') return parseFloat(obj) || 0;
        if (obj && typeof obj === 'object' && obj.value) {
          return parseFloat(obj.value) || 0;
        }
        return 0;
      };

      const getString = (obj: unknown): string => {
        if (typeof obj === 'string') return obj;
        if (obj && typeof obj === 'object' && obj.value) return obj.value || '';
        return obj?.toString() || '';
      };

      // Calculate eBay fees
      const finalValueFee = getNumericValue(ebayTransaction.FinalValueFee);
      const paymentProcessingFee = 0.30; // Standard eBay managed payments fee
      
      // Extract item details safely
      const item = ebayTransaction.Item || {};
      const listingDetails = item.ListingDetails || {};
      const primaryCategory = item.PrimaryCategory || {};
      const shippingService = ebayTransaction.ShippingServiceSelected || {};
      
      return {
        transactionId: getString(ebayTransaction.TransactionID),
        itemId: getString(item.ItemID),
        title: getString(item.Title) || 'Untitled Item',
        soldPrice: getNumericValue(ebayTransaction.TransactionPrice),
        soldDate: new Date(getString(ebayTransaction.CreatedDate) || ebayTransaction.PaidTime || Date.now()),
        listedDate: new Date(getString(listingDetails.StartTime) || Date.now()),
        shippingCost: getNumericValue(ebayTransaction.ActualShippingCost || shippingService.ShippingServiceCost),
        shippingService: getString(shippingService.ShippingService) || 'Standard Shipping',
        category: getString(primaryCategory.CategoryName) || 'Other',
        condition: getString(item.ConditionDisplayName) || 'Used',
        fees: {
          finalValueFee: Number(finalValueFee.toFixed(2)),
          paymentProcessingFee,
          total: Number((finalValueFee + paymentProcessingFee).toFixed(2)),
        },
      };
    } catch (error) {
      console.error('Error transforming eBay transaction:', error, ebayTransaction);
      throw new Error(`Failed to transform transaction: ${error}`);
    }
  }

  /**
   * Validate if access token is still valid
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseApiUrl}/commerce/identity/v1/user/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Create eBay API client from environment variables
 */
export function createEbayClient(): EbayAPIClient {
  const config: EbayAuthConfig = {
    clientId: process.env.EBAY_CLIENT_ID!,
    clientSecret: process.env.EBAY_CLIENT_SECRET!,
    redirectUri: process.env.EBAY_REDIRECT_URI!,
    sandbox: process.env.EBAY_ENVIRONMENT === 'sandbox',
  };

  return new EbayAPIClient(config);
}

/**
 * Generate secure state parameter for OAuth
 */
export function generateOAuthState(): string {
  return crypto.randomUUID();
}

/**
 * Validate OAuth state parameter
 */
export function validateOAuthState(state: string, expectedState: string): boolean {
  return state === expectedState && state.length > 0;
}