import { GitHubService } from '../githubService';
import { GitHubAdapter } from '../../integrations/github/GitHubAdapter';
import { GitHubConfig } from '../../integrations/github/types';

// Mock the GitHubAdapter
jest.mock('../../integrations/github/GitHubAdapter');

describe('GitHubService', () => {
  let service: GitHubService;
  let mockAdapter: jest.Mocked<GitHubAdapter>;
  const config: GitHubConfig = {
    enabled: true,
    apiKey: 'test-api-key',
    baseUrl: 'https://api.github.com',
    defaultOrg: 'test-org',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of the service
    service = new GitHubService();
    
    // Get the mocked adapter instance
    mockAdapter = service['adapter'] as jest.Mocked<GitHubAdapter>;
    
    // Setup mock implementations
    mockAdapter.initialize = jest.fn().mockResolvedValue(undefined);
    mockAdapter.getRepository = jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: 123,
        name: 'test-repo',
        full_name: 'test-org/test-repo',
        description: 'Test repository',
        private: false,
        html_url: 'https://github.com/test-org/test-repo',
        default_branch: 'main',
      },
    });
    mockAdapter.getIssue = jest.fn().mockResolvedValue({
      success: true,
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
    });
    mockAdapter.createIssue = jest.fn().mockResolvedValue({
      success: true,
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
    });
    mockAdapter.getPullRequest = jest.fn().mockResolvedValue({
      success: true,
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
    });
    mockAdapter.createPullRequest = jest.fn().mockResolvedValue({
      success: true,
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
    });
  });

  describe('initialization', () => {
    it('should initialize the adapter with the provided config', async () => {
      await service.initialize(config);
      expect(mockAdapter.initialize).toHaveBeenCalledWith(config);
    });
  });

  describe('repository operations', () => {
    beforeEach(async () => {
      await service.initialize(config);
    });

    it('should get repository information', async () => {
      const response = await service.getRepositoryInfo('test-org', 'test-repo');
      expect(mockAdapter.getRepository).toHaveBeenCalledWith('test-org', 'test-repo');
      expect(response.success).toBe(true);
      expect(response.data?.name).toBe('test-repo');
    });
  });

  describe('issue operations', () => {
    beforeEach(async () => {
      await service.initialize(config);
    });

    it('should get issue information', async () => {
      const response = await service.getIssueInfo('test-org', 'test-repo', 1);
      expect(mockAdapter.getIssue).toHaveBeenCalledWith('test-org', 'test-repo', 1);
      expect(response.success).toBe(true);
      expect(response.data?.number).toBe(1);
      expect(response.data?.title).toBe('Test Issue');
    });

    it('should create a new issue', async () => {
      const response = await service.createNewIssue(
        'test-org',
        'test-repo',
        'New Issue',
        'New issue body',
        [{ name: 'bug' }],
        [{ login: 'testuser' }]
      );
      
      expect(mockAdapter.createIssue).toHaveBeenCalledWith('test-org', 'test-repo', {
        title: 'New Issue',
        body: 'New issue body',
        labels: [{ name: 'bug' }],
        assignees: [{ login: 'testuser' }],
      });
      
      expect(response.success).toBe(true);
      expect(response.data?.number).toBe(2);
      expect(response.data?.title).toBe('New Issue');
    });
  });

  describe('pull request operations', () => {
    beforeEach(async () => {
      await service.initialize(config);
    });

    it('should get pull request information', async () => {
      const response = await service.getPullRequestInfo('test-org', 'test-repo', 1);
      expect(mockAdapter.getPullRequest).toHaveBeenCalledWith('test-org', 'test-repo', 1);
      expect(response.success).toBe(true);
      expect(response.data?.number).toBe(1);
      expect(response.data?.title).toBe('Test PR');
    });

    it('should create a new pull request', async () => {
      const response = await service.createNewPullRequest(
        'test-org',
        'test-repo',
        'New PR',
        'feature-branch',
        'main',
        'New PR body'
      );
      
      expect(mockAdapter.createPullRequest).toHaveBeenCalledWith(
        'test-org',
        'test-repo',
        'New PR',
        'feature-branch',
        'main',
        'New PR body'
      );
      
      expect(response.success).toBe(true);
      expect(response.data?.number).toBe(2);
      expect(response.data?.title).toBe('New PR');
    });
  });
}); 