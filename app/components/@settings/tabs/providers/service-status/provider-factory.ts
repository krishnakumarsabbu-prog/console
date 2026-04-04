import type { ProviderName, ProviderConfig, StatusCheckResult } from './types';
import { BaseProviderChecker } from './base-provider';

// Tachyon local server status checker
class TachyonStatusChecker extends BaseProviderChecker {
  async checkStatus(): Promise<StatusCheckResult> {
    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return {
          status: 'operational',
          message: 'Tachyon server is running',
          incidents: [],
        };
      }

      return {
        status: 'degraded',
        message: 'Tachyon server returned an error',
        incidents: [`HTTP ${response.status}: ${response.statusText}`],
      };
    } catch (error) {
      return {
        status: 'down',
        message: 'Unable to connect to Tachyon server',
        incidents: [error instanceof Error ? error.message : 'Connection failed'],
      };
    }
  }
}

export class ProviderStatusCheckerFactory {
  private static _providerConfigs: Record<ProviderName, ProviderConfig> = {
    Tachyon: {
      statusUrl: 'http://localhost:8000/health',
      apiUrl: 'http://localhost:8000/v1/models',
      headers: {},
      testModel: 'tachyon-default',
    },
  };

  static getChecker(provider: ProviderName): BaseProviderChecker {
    const config = this._providerConfigs[provider];

    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}`);
    }

    if (provider === 'Tachyon') {
      return new TachyonStatusChecker(config);
    }

    // Fallback generic checker
    return new (class extends BaseProviderChecker {
      async checkStatus(): Promise<StatusCheckResult> {
        const endpointStatus = await this.checkEndpoint(this.config.statusUrl);
        const apiStatus = await this.checkEndpoint(this.config.apiUrl);

        return {
          status: endpointStatus === 'reachable' && apiStatus === 'reachable' ? 'operational' : 'degraded',
          message: `Status page: ${endpointStatus}, API: ${apiStatus}`,
          incidents: [],
        };
      }
    })(config);
  }

  static getProviderNames(): ProviderName[] {
    return Object.keys(this._providerConfigs) as ProviderName[];
  }

  static getProviderConfig(provider: ProviderName): ProviderConfig {
    const config = this._providerConfigs[provider];

    if (!config) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    return config;
  }
}
