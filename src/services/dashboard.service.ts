import { apiService, PaginatedResponse } from './api-enhanced';
import { STORAGE_KEYS } from '../api/config';

// Dashboard data types
export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    currency: string;
  };
  financial: {
    monthlyIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
    nextPayDate: string;
  };
  summary: {
    totalTransactions: number;
    activeBudgets: number;
    investmentSuggestions: number;
    alerts: number;
  };
  recentActivity: DashboardActivity[];
  alerts: DashboardAlert[];
}

export interface DashboardActivity {
  id: string;
  type: 'transaction' | 'budget' | 'investment' | 'salary';
  description: string;
  amount?: number;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

export interface DashboardAlert {
  id: string;
  type: 'budget_exceeded' | 'low_savings' | 'investment_opportunity' | 'payment_due';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface DashboardFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  transactionTypes?: string[];
  categories?: string[];
  minAmount?: number;
  maxAmount?: number;
}

class DashboardService {
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Fetch main dashboard data
  async getDashboardData(filters?: DashboardFilters): Promise<DashboardData> {
    try {
      const params = filters ? this.formatFilters(filters) : undefined;
      return await apiService.get<DashboardData>('/dashboard', params, true);
    } catch (error) {
      throw new Error('Failed to load dashboard data');
    }
  }

  // Fetch financial summary
  async getFinancialSummary(): Promise<DashboardData['financial']> {
    try {
      return await apiService.get<DashboardData['financial']>('/dashboard/financial', undefined, true);
    } catch (error) {
      throw new Error('Failed to load financial summary');
    }
  }

  // Fetch recent activities with pagination
  async getRecentActivities(
    page: number = 1, 
    limit: number = 10,
    filters?: DashboardFilters
  ): Promise<PaginatedResponse<DashboardActivity>> {
    try {
      const params = filters ? this.formatFilters(filters) : undefined;
      return await apiService.getPaginated<DashboardActivity>('/dashboard/activities', page, limit, params);
    } catch (error) {
      throw new Error('Failed to load recent activities');
    }
  }

  // Fetch alerts with pagination
  async getAlerts(
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<PaginatedResponse<DashboardAlert>> {
    try {
      const params = unreadOnly ? { unreadOnly: true } : undefined;
      return await apiService.getPaginated<DashboardAlert>('/dashboard/alerts', page, limit, params);
    } catch (error) {
      throw new Error('Failed to load alerts');
    }
  }

  // Mark alert as read
  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      await apiService.patch(`/dashboard/alerts/${alertId}/read`);
    } catch (error) {
      throw new Error('Failed to mark alert as read');
    }
  }

  // Mark all alerts as read
  async markAllAlertsAsRead(): Promise<void> {
    try {
      await apiService.patch('/dashboard/alerts/read-all');
    } catch (error) {
      throw new Error('Failed to mark all alerts as read');
    }
  }

  // Dismiss alert
  async dismissAlert(alertId: string): Promise<void> {
    try {
      await apiService.delete(`/dashboard/alerts/${alertId}`);
    } catch (error) {
      throw new Error('Failed to dismiss alert');
    }
  }

  // Refresh dashboard data
  async refreshDashboard(): Promise<DashboardData> {
    try {
      return await apiService.post<DashboardData>('/dashboard/refresh');
    } catch (error) {
      throw new Error('Failed to refresh dashboard');
    }
  }

  // Export dashboard data
  async exportDashboardData(
    format: 'csv' | 'pdf' | 'xlsx',
    filters?: DashboardFilters
  ): Promise<Blob> {
    try {
      const params = {
        format,
        ...(filters ? this.formatFilters(filters) : {})
      };
      
      const response = await fetch(`${apiService['api'].defaults.baseURL}/dashboard/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)}`,
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return await response.blob();
    } catch (error) {
      throw new Error('Failed to export dashboard data');
    }
  }

  // Real-time updates via WebSocket
  connectWebSocket(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onClose?: (event: CloseEvent) => void
  ): void {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        throw new Error('No authentication token found');
      }

      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:3001'}/dashboard?token=${token}`;
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = () => {
        this.reconnectAttempts = 0;
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          }
      };

      this.wsConnection.onerror = (error) => {
        if (onError) onError(error);
      };

      this.wsConnection.onclose = (event) => {
        if (onClose) onClose(event);
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connectWebSocket(onMessage, onError, onClose);
          }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
        }
      };
    } catch (error) {
      if (onError) onError(error as Event);
    }
  }

  // Disconnect WebSocket
  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  // Send WebSocket message
  sendWebSocketMessage(message: any): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(message));
    } else {
      }
  }

  // Get dashboard insights
  async getDashboardInsights(): Promise<{
    spendingTrends: any[];
    savingsProjection: any;
    investmentOpportunities: any[];
    budgetPerformance: any[];
  }> {
    try {
      return await apiService.get('/dashboard/insights', undefined, true);
    } catch (error) {
      throw new Error('Failed to load dashboard insights');
    }
  }

  // Private helper methods
  private formatFilters(filters: DashboardFilters): Record<string, any> {
    const params: Record<string, any> = {};

    if (filters.dateRange) {
      params.startDate = filters.dateRange.start;
      params.endDate = filters.dateRange.end;
    }

    if (filters.transactionTypes?.length) {
      params.transactionTypes = filters.transactionTypes.join(',');
    }

    if (filters.categories?.length) {
      params.categories = filters.categories.join(',');
    }

    if (filters.minAmount !== undefined) {
      params.minAmount = filters.minAmount;
    }

    if (filters.maxAmount !== undefined) {
      params.maxAmount = filters.maxAmount;
    }

    return params;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;

