import { GitHubAdapter } from '../integrations/github/GitHubAdapter';
import { GitHubConfig, GitHubIssue } from '../integrations/github/types';

export class GitHubService {
  private adapter: GitHubAdapter;

  constructor() {
    this.adapter = new GitHubAdapter();
  }

  async initialize(config: GitHubConfig): Promise<void> {
    await this.adapter.initialize(config);
  }

  async getRepositoryInfo(owner: string, repo: string) {
    return this.adapter.getRepository(owner, repo);
  }

  async getIssueInfo(owner: string, repo: string, issueNumber: number) {
    return this.adapter.getIssue(owner, repo, issueNumber);
  }

  async createNewIssue(
    owner: string, 
    repo: string, 
    title: string, 
    body: string, 
    labels?: Array<{name: string}>, 
    assignees?: Array<{login: string}>
  ) {
    return this.adapter.createIssue(owner, repo, {
      title,
      body,
      labels,
      assignees,
    });
  }

  async getPullRequestInfo(owner: string, repo: string, pullNumber: number) {
    return this.adapter.getPullRequest(owner, repo, pullNumber);
  }

  async createNewPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ) {
    return this.adapter.createPullRequest(owner, repo, title, head, base, body);
  }
} 