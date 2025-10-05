// utils/voiceCommandProcessor.ts
interface VoiceCommand {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, fullTranscript: string) => void;
  description: string;
}

export class VoiceCommandProcessor {
  private commands: VoiceCommand[] = [];
  private fallbackHandler?: (transcript: string) => void;

  registerCommand(pattern: RegExp, handler: (match: RegExpMatchArray, fullTranscript: string) => void, description: string) {
    this.commands.push({ pattern, handler, description });
  }

  setFallbackHandler(handler: (transcript: string) => void) {
    this.fallbackHandler = handler;
  }

  process(transcript: string): boolean {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    for (const command of this.commands) {
      const match = normalizedTranscript.match(command.pattern);
      if (match) {
        command.handler(match, transcript);
        return true;
      }
    }

    if (this.fallbackHandler) {
      this.fallbackHandler(transcript);
    }
    
    return false;
  }

  getAvailableCommands(): { pattern: string; description: string }[] {
    return this.commands.map(cmd => ({
      pattern: cmd.pattern.toString(),
      description: cmd.description
    }));
  }
}

// Instance for chat-specific commands
export const chatCommandProcessor = new VoiceCommandProcessor();

// Initialize with common commands
chatCommandProcessor.registerCommand(
  /відкрий чат (.+)/,
  (match) => {
    const chatName = match[1];
    console.log('Opening chat:', chatName);
    // Logic to open chat
  },
  'Відкрити чат з вказаним користувачем'
);

chatCommandProcessor.registerCommand(
  /надішли повідомлення (.+)/,
  (match) => {
    const message = match[1];
    console.log('Sending message:', message);
    // Logic to send message
  },
  'Надіслати текстове повідомлення'
);

chatCommandProcessor.registerCommand(
  /пошук (.+)/,
  (match) => {
    const query = match[1];
    console.log('Searching for:', query);
    // Logic to perform search
  },
  'Виконати пошук по чатах'
);