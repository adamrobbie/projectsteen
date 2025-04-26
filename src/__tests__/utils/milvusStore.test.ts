import { MilvusConversationStore } from '../../utils/milvusStore';
import { Message, ScrumContext, UserStory } from '../../models/types';

// Mock environment variables
process.env.MILVUS_URL = 'http://localhost:19530';
process.env.OPENAI_API_KEY = 'test-api-key';

describe('MilvusConversationStore', () => {
  let store: MilvusConversationStore;
  const testCollectionName = 'test_conversations';

  beforeAll(async () => {
    // Initialize the store with test collection
    store = new MilvusConversationStore(
      process.env.MILVUS_URL!,
      testCollectionName,
      process.env.OPENAI_API_KEY!
    );
    await store.initialize();
  });

  afterAll(async () => {
    // Clean up test data
    try {
      // Delete all test conversations
      const conversations = await store.findSimilarConversations('test', undefined, 100);
      for (const conv of conversations) {
        await store.deleteConversation(conv.id);
      }
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  });

  const testMessages: Message[] = [
    {
      role: 'user',
      content: 'What is the status of the current sprint?',
      timestamp: new Date().toISOString()
    },
    {
      role: 'assistant',
      content: 'The sprint is on track with 70% of stories completed.',
      timestamp: new Date().toISOString()
    }
  ];

  const testUserStories: UserStory[] = [
    {
      id: 'US-1',
      title: 'Implement user authentication',
      description: 'As a user, I want to log in to the system',
      status: 'in-progress',
      assignee: 'Alice',
      storyPoints: 5,
      tags: ['auth', 'security'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'US-2',
      title: 'Add user profile page',
      description: 'As a user, I want to view and edit my profile',
      status: 'todo',
      assignee: 'Bob',
      storyPoints: 3,
      tags: ['ui', 'profile'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const testContext: ScrumContext = {
    sprintName: 'Sprint 1',
    teamMembers: ['Alice', 'Bob'],
    userStories: testUserStories,
    previousMeetingNotes: 'Previous sprint planning meeting notes'
  };

  it('should store and retrieve a conversation', async () => {
    const conversationId = 'test-conv-1';
    
    // Store the conversation
    await store.storeConversation(conversationId, testMessages, testContext);
    
    // Retrieve the conversation
    const retrieved = await store.getConversation(conversationId);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(conversationId);
    expect(retrieved?.messages).toEqual(testMessages);
    expect(retrieved?.context).toEqual(testContext);
  });

  it('should find similar conversations', async () => {
    const query = 'What is the sprint status?';
    
    // Store a few conversations
    await store.storeConversation('test-conv-2', testMessages, testContext);
    await store.storeConversation('test-conv-3', testMessages, testContext);
    
    // Search for similar conversations
    const results = await store.findSimilarConversations(query);
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('id');
    expect(results[0]).toHaveProperty('similarity');
    expect(results[0]).toHaveProperty('messages');
    expect(results[0]).toHaveProperty('context');
  });

  it('should update a conversation', async () => {
    const conversationId = 'test-conv-4';
    
    // Store initial conversation
    await store.storeConversation(conversationId, testMessages, testContext);
    
    // Update with new messages
    const updatedMessages: Message[] = [
      ...testMessages,
      {
        role: 'user',
        content: 'What about the remaining stories?',
        timestamp: new Date().toISOString()
      }
    ];
    
    await store.updateConversation(conversationId, updatedMessages, testContext);
    
    // Retrieve and verify update
    const retrieved = await store.getConversation(conversationId);
    expect(retrieved?.messages).toEqual(updatedMessages);
  });

  it('should delete a conversation', async () => {
    const conversationId = 'test-conv-5';
    
    // Store a conversation
    await store.storeConversation(conversationId, testMessages, testContext);
    
    // Delete the conversation
    await store.deleteConversation(conversationId);
    
    // Verify deletion
    const retrieved = await store.getConversation(conversationId);
    expect(retrieved).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    // Test with invalid conversation ID
    const retrieved = await store.getConversation('non-existent-id');
    expect(retrieved).toBeNull();
    
    // Test with invalid data
    await expect(store.storeConversation('', [], {} as ScrumContext))
      .rejects
      .toThrow();
  });
}); 