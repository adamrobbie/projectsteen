import { Octokit } from '@octokit/rest';
import { GitHubAdapter } from '../GitHubAdapter';
import { GitHubConfig } from '../types';

// Mock Octokit
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        repos: {
          get: jest.fn().mockRejectedValue(new Error('Repository not found')),
        },
        issues: {
          get: jest.fn().mockRejectedValue(new Error('Issue not found')),
          create: jest.fn().mockRejectedValue(new Error('Failed to create issue')),
        },
        pulls: {
          get: jest.fn().mockRejectedValue(new Error('Pull request not found')),
          create: jest.fn().mockRejectedValue(new Error('Failed to create pull request')),
        },
      };
    }),
  };
});

describe('GitHubAdapter Error Handling', () => {
  let adapter: GitHubAdapter;
  const config: GitHubConfig = {
    enabled: true,
    apiKey: 'test-api-key',
    baseUrl: 'https://api.github.com',
  };

  beforeEach(() => {
    adapter = new GitHubAdapter();
  });

  describe('initialization', () => {
    it('should handle initialization errors', async () => {
      // Mock Octokit to throw an error during initialization
      const mockOctokit = Octokit as unknown as jest.Mock;
      mockOctokit.mockImplementationOnce(() => {
        throw new Error('Failed to initialize Octokit');
      });

      await expect(adapter.initialize(config)).rejects.toThrow('Failed to initialize Octokit');
      expect(adapter.isConfigured()).toBe(false);
    });
  });

  describe('repository operations', () => {
    beforeEach(async () => {
      await adapter.initialize(config);
    });

    it('should handle repository not found error', async () => {
      const response = await adapter.getRepository('non-existent-org', 'non-existent-repo');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Repository not found');
    });
  });

  describe('issue operations', () => {
    beforeEach(async () => {
      await adapter.initialize(config);
    });

    it('should handle issue not found error', async () => {
      const response = await adapter.getIssue('test-org', 'test-repo', 999);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Issue not found');
    });

    it('should handle issue creation error', async () => {
      const response = await adapter.createIssue('test-org', 'test-repo', {
        title: 'Test Issue',
        body: 'Test issue body',
      });
      expect(response.success).toBe(false);
      expect(response.error).toBe('Failed to create issue');
    });
  });

  describe('pull request operations', () => {
    beforeEach(async () => {
      await adapter.initialize(config);
    });

    it('should handle pull request not found error', async () => {
      const response = await adapter.getPullRequest('test-org', 'test-repo', 999);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Pull request not found');
    });

    it('should handle pull request creation error', async () => {
      const response = await adapter.createPullRequest(
        'test-org',
        'test-repo',
        'Test PR',
        'non-existent-branch',
        'main',
        'Test PR body'
      );
      expect(response.success).toBe(false);
      expect(response.error).toBe('Failed to create pull request');
    });
  });

  describe('uninitialized adapter', () => {
    it('should handle operations when adapter is not initialized', async () => {
      // Don't initialize the adapter
      const response = await adapter.getRepository('test-org', 'test-repo');
      expect(response.success).toBe(false);
      expect(response.error).toBe('GitHub adapter not initialized');
    });
  });
}); 