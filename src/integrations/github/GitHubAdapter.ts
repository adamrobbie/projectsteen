import { Octokit } from '@octokit/rest';
import { IntegrationAdapter, IntegrationResponse } from '../types';
import { GitHubConfig, GitHubIssue, GitHubPullRequest, GitHubRepository } from './types';

export class GitHubAdapter implements IntegrationAdapter {
  private octokit: Octokit | null = null;
  private config: GitHubConfig | null = null;

  async initialize(config: GitHubConfig): Promise<void> {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.apiKey,
      baseUrl: config.baseUrl || 'https://api.github.com',
    });
  }

  getName(): string {
    return 'github';
  }

  isConfigured(): boolean {
    return this.octokit !== null && this.config?.apiKey !== undefined;
  }

  getConfig(): Record<string, any> {
    return this.config || {};
  }

  // Repository methods
  async getRepository(owner: string, repo: string): Promise<IntegrationResponse<GitHubRepository>> {
    try {
      if (!this.octokit) throw new Error('GitHub adapter not initialized');
      
      const response = await this.octokit.repos.get({
        owner,
        repo,
      });

      return {
        success: true,
        data: response.data as GitHubRepository,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Issue methods
  async getIssue(owner: string, repo: string, issueNumber: number): Promise<IntegrationResponse<GitHubIssue>> {
    try {
      if (!this.octokit) throw new Error('GitHub adapter not initialized');
      
      const response = await this.octokit.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      });

      return {
        success: true,
        data: response.data as GitHubIssue,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async createIssue(
    owner: string, 
    repo: string, 
    issue: {
      title: string;
      body?: string;
      labels?: Array<{name: string}>;
      assignees?: Array<{login: string}>;
    }
  ): Promise<IntegrationResponse<GitHubIssue>> {
    try {
      if (!this.octokit) throw new Error('GitHub adapter not initialized');
      
      // Convert simplified label objects to just names
      const labelNames = issue.labels?.map(label => label.name) || [];
      
      // Convert simplified assignee objects to just logins
      const assigneeLogins = issue.assignees?.map(assignee => assignee.login) || [];
      
      const response = await this.octokit.issues.create({
        owner,
        repo,
        title: issue.title,
        body: issue.body,
        labels: labelNames,
        assignees: assigneeLogins,
      });

      return {
        success: true,
        data: response.data as GitHubIssue,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Pull Request methods
  async getPullRequest(owner: string, repo: string, pullNumber: number): Promise<IntegrationResponse<GitHubPullRequest>> {
    try {
      if (!this.octokit) throw new Error('GitHub adapter not initialized');
      
      const response = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
      });

      return {
        success: true,
        data: response.data as GitHubPullRequest,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ): Promise<IntegrationResponse<GitHubPullRequest>> {
    try {
      if (!this.octokit) throw new Error('GitHub adapter not initialized');
      
      const response = await this.octokit.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
        body,
      });

      return {
        success: true,
        data: response.data as GitHubPullRequest,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
} 