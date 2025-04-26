import { GitHubAdapter } from '../GitHubAdapter';
import { GitHubConfig } from '../types';

// Mock Octokit
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        repos: {
          get: jest.fn().mockResolvedValue({
            data: {
              id: 123,
              name: 'test-repo',
              full_name: 'test-org/test-repo',
              description: 'Test repository',
              private: false,
              html_url: 'https://github.com/test-org/test-repo',
              default_branch: 'main',
            },
          }),
        },
        issues: {
          get: jest.fn().mockResolvedValue({
            data: {
              number: 1,
              title: 'Test Issue',
              body: 'Test issue body',
              state: 'open',
              labels: [
                {
                  id: 1,
                  node_id: 'node1',
                  url: 'https://api.github.com/repos/test-org/test-repo/labels/bug',
                  name: 'bug',
                  description: 'Bug label',
                  color: 'f29513',
                  default: true,
                },
              ],
              assignees: [
                {
                  login: 'testuser',
                  id: 1,
                  node_id: 'node1',
                  avatar_url: 'https://github.com/avatars/testuser',
                  gravatar_id: null,
                  url: 'https://api.github.com/users/testuser',
                  html_url: 'https://github.com/testuser',
                  followers_url: 'https://api.github.com/users/testuser/followers',
                  following_url: 'https://api.github.com/users/testuser/following{/other_user}',
                  gists_url: 'https://api.github.com/users/testuser/gists{/gist_id}',
                  starred_url: 'https://api.github.com/users/testuser/starred{/owner}{/repo}',
                  subscriptions_url: 'https://api.github.com/users/testuser/subscriptions',
                  organizations_url: 'https://api.github.com/users/testuser/orgs',
                  repos_url: 'https://api.github.com/users/testuser/repos',
                  events_url: 'https://api.github.com/users/testuser/events{/privacy}',
                  received_events_url: 'https://api.github.com/users/testuser/received_events',
                  type: 'User',
                  site_admin: false,
                },
              ],
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z',
            },
          }),
          create: jest.fn().mockResolvedValue({
            data: {
              number: 2,
              title: 'New Issue',
              body: 'New issue body',
              state: 'open',
              labels: [],
              assignees: [],
              created_at: '2023-01-02T00:00:00Z',
              updated_at: '2023-01-02T00:00:00Z',
            },
          }),
        },
        pulls: {
          get: jest.fn().mockResolvedValue({
            data: {
              number: 1,
              title: 'Test PR',
              body: 'Test PR body',
              state: 'open',
              labels: [
                {
                  id: 1,
                  node_id: 'node1',
                  url: 'https://api.github.com/repos/test-org/test-repo/labels/enhancement',
                  name: 'enhancement',
                  description: 'Enhancement label',
                  color: 'a2eeef',
                  default: true,
                },
              ],
              assignees: [
                {
                  login: 'testuser',
                  id: 1,
                  node_id: 'node1',
                  avatar_url: 'https://github.com/avatars/testuser',
                  gravatar_id: null,
                  url: 'https://api.github.com/users/testuser',
                  html_url: 'https://github.com/testuser',
                  followers_url: 'https://api.github.com/users/testuser/followers',
                  following_url: 'https://api.github.com/users/testuser/following{/other_user}',
                  gists_url: 'https://api.github.com/users/testuser/gists{/gist_id}',
                  starred_url: 'https://api.github.com/users/testuser/starred{/owner}{/repo}',
                  subscriptions_url: 'https://api.github.com/users/testuser/subscriptions',
                  organizations_url: 'https://api.github.com/users/testuser/orgs',
                  repos_url: 'https://api.github.com/users/testuser/repos',
                  events_url: 'https://api.github.com/users/testuser/events{/privacy}',
                  received_events_url: 'https://api.github.com/users/testuser/received_events',
                  type: 'User',
                  site_admin: false,
                },
              ],
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z',
              merged_at: null,
            },
          }),
          create: jest.fn().mockResolvedValue({
            data: {
              number: 2,
              title: 'New PR',
              body: 'New PR body',
              state: 'open',
              labels: [],
              assignees: [],
              created_at: '2023-01-02T00:00:00Z',
              updated_at: '2023-01-02T00:00:00Z',
              merged_at: null,
            },
          }),
        },
      };
    }),
  };
});

describe('GitHubAdapter', () => {
  let adapter: GitHubAdapter;
  const config: GitHubConfig = {
    enabled: true,
    apiKey: 'test-api-key',
    baseUrl: 'https://api.github.com',
    defaultOrg: 'test-org',
  };

  beforeEach(() => {
    adapter = new GitHubAdapter();
  });

  describe('initialization', () => {
    it('should initialize with config', async () => {
      await adapter.initialize(config);
      expect(adapter.isConfigured()).toBe(true);
      expect(adapter.getName()).toBe('github');
      expect(adapter.getConfig()).toEqual(config);
    });
  });

  describe('repository operations', () => {
    beforeEach(async () => {
      await adapter.initialize(config);
    });

    it('should get repository details', async () => {
      const response = await adapter.getRepository('test-org', 'test-repo');
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.name).toBe('test-repo');
    });
  });

  describe('issue operations', () => {
    beforeEach(async () => {
      await adapter.initialize(config);
    });

    it('should get issue details', async () => {
      const response = await adapter.getIssue('test-org', 'test-repo', 1);
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.number).toBe(1);
      expect(response.data?.title).toBe('Test Issue');
    });

    it('should create a new issue', async () => {
      const response = await adapter.createIssue('test-org', 'test-repo', {
        title: 'New Issue',
        body: 'New issue body',
      });
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.number).toBe(2);
      expect(response.data?.title).toBe('New Issue');
    });
  });

  describe('pull request operations', () => {
    beforeEach(async () => {
      await adapter.initialize(config);
    });

    it('should get pull request details', async () => {
      const response = await adapter.getPullRequest('test-org', 'test-repo', 1);
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.number).toBe(1);
      expect(response.data?.title).toBe('Test PR');
    });

    it('should create a new pull request', async () => {
      const response = await adapter.createPullRequest(
        'test-org',
        'test-repo',
        'New PR',
        'feature-branch',
        'main',
        'New PR body'
      );
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.number).toBe(2);
      expect(response.data?.title).toBe('New PR');
    });
  });
}); 