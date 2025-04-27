import { GitHubAdapter } from '../GitHubAdapter';
import { GitHubConfig } from '../types';

// Skip these tests if no GitHub token is provided
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SKIP_INTEGRATION_TESTS = !GITHUB_TOKEN;

// Test repository details
const TEST_OWNER = 'octocat';
const TEST_REPO = 'Hello-World';

// Skip all tests in this file if no GitHub token is provided
(SKIP_INTEGRATION_TESTS ? describe.skip : describe)('GitHubAdapter Integration Tests', () => {
  let adapter: GitHubAdapter;
  const config: GitHubConfig = {
    enabled: true,
    apiKey: GITHUB_TOKEN || '',
    baseUrl: 'https://api.github.com',
  };

  beforeAll(async () => {
    adapter = new GitHubAdapter();
    await adapter.initialize(config);
  });

  describe('Repository operations', () => {
    it('should get repository details', async () => {
      const response = await adapter.getRepository(TEST_OWNER, TEST_REPO);
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.name).toBe(TEST_REPO);
      expect(response.data?.full_name).toBe(`${TEST_OWNER}/${TEST_REPO}`);
    });
  });

  describe('Issue operations', () => {
    it('should get issue details', async () => {
      // This test assumes there's at least one issue in the test repository
      const response = await adapter.getIssue(TEST_OWNER, TEST_REPO, 1);
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.number).toBe(1);
    });

    // Skip issue creation test to avoid creating real issues in the test repo
    it.skip('should create a new issue', async () => {
      const response = await adapter.createIssue(TEST_OWNER, TEST_REPO, {
        title: `Test Issue ${Date.now()}`,
        body: 'This is a test issue created by integration tests',
      });
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.title).toContain('Test Issue');
    });
  });

  describe('Pull Request operations', () => {
    it('should get pull request details', async () => {
      // This test assumes there's at least one PR in the test repository
      const response = await adapter.getPullRequest(TEST_OWNER, TEST_REPO, 1);
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.number).toBe(1);
    });

    // Skip PR creation test to avoid creating real PRs in the test repo
    it.skip('should create a new pull request', async () => {
      const response = await adapter.createPullRequest(
        TEST_OWNER,
        TEST_REPO,
        `Test PR ${Date.now()}`,
        'main',
        'main',
        'This is a test PR created by integration tests'
      );
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.title).toContain('Test PR');
    });
  });
}); 