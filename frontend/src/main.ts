import './styles.css';

class App {
    private contentElement: HTMLElement;

    constructor() {
        this.contentElement = document.getElementById('content') as HTMLElement;
        this.init();
    }

    private init(): void {
        this.renderWelcomeMessage();
        this.setupEventListeners();
    }

    private renderWelcomeMessage(): void {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'text-center';
        welcomeMessage.innerHTML = `
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Welcome to AI Scrum Master</h2>
            <p class="text-gray-600">Your intelligent assistant for agile project management</p>
        `;
        this.contentElement.appendChild(welcomeMessage);
    }

    private setupEventListeners(): void {
        // Add event listeners for user interactions
        document.addEventListener('DOMContentLoaded', () => {
            console.log('Frontend application initialized');
        });
    }
}

// Initialize the application
new App(); 