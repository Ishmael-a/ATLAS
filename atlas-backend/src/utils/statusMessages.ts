export enum StatusCategory {
  THINKING = 'THINKING',
  SEARCHING = 'SEARCHING',
  FINALIZING = 'FINALIZING',
}

const STATUS_MESSAGES: Record<StatusCategory, readonly string[]> = {
  [StatusCategory.THINKING]: [
    'Let me think about that..',
    'Give me a second..',
    'On it..',
    'Let me take a look..',
  ],
  [StatusCategory.SEARCHING]: [
    "Searching through Yusif's work...",
    "Digging through Yusif's portfolio...",
    'Checking projects and experience...',
    'Pulling up the relevant details...',
  ],
  [StatusCategory.FINALIZING]: [
    'Almost there...',
    'Wrapping up...',
    'Putting it together...',
    'Just a moment more...',
  ],
};

export function getRandomStatus(category: StatusCategory): string {
  const categoryMessages = STATUS_MESSAGES[category];
  const randomIndex = Math.floor(Math.random() * categoryMessages.length);
  return categoryMessages[randomIndex]!;
}
