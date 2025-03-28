import { DefaultBot } from './core/Bot.js';
import { BotConfig } from './types/bot.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  let bot: DefaultBot | null = null;
  
  try {
    console.log('Starting AI Scrum Master Bot...');

    // Create bot configuration
    const config: BotConfig = {
      id: 'scrum-master-bot',
      name: 'AI Scrum Master Bot',
      description: 'An AI-powered Scrum Master bot',
      version: '1.0.0',
      settings: {
        pollInterval: 60000, // 1 minute
        maxRetries: 3,
        retryDelay: 5000, // 5 seconds
        logLevel: 'info'
      }
    };

    // Create bot instance
    console.log('Creating bot instance...');
    bot = new DefaultBot(config);
    
    // Set up error handling
    bot.onError((error) => {
      console.error('Bot error:', error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    });

    // Set up status monitoring
    bot.onStatusChange((status) => {
      console.log('Bot status changed:', status);
    });

    // Initialize and start the bot
    console.log('Initializing bot...');
    await bot.initialize();
    
    console.log('Starting bot...');
    await bot.start();

    console.log('Bot started successfully!');

    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal} signal. Shutting down...`);
      if (bot) {
        await bot.stop();
      }
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('Failed to start bot:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    if (bot) {
      try {
        await bot.stop();
      } catch (stopError) {
        console.error('Error during shutdown:', stopError);
      }
    }
    process.exit(1);
  }
}

// Execute main function
main().catch(error => {
  console.error('Unhandled error in main:', error instanceof Error ? error.message : 'Unknown error');
  if (error instanceof Error && error.stack) {
    console.error('Stack trace:', error.stack);
  }
  process.exit(1);
}); 