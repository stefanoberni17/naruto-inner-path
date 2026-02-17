// Mapping episodi (numero) → Notion Page ID
// Per MVP: Episodi 1-19 (Week 1-6)

export const EPISODE_MAPPING: Record<number, string> = {
  // Week 1-2: La ferita del rifiuto (Ep 1-5)
  1: '2b1655f726c780a89749c23c9dab1a3f', // Enter: Naruto Uzumaki!
  2: '2b1655f726c7806696e9c7032458099e', // My Name is Konohamaru!
  3: '2b1655f726c78070a7d0f14414e537e9', // Sasuke and Sakura: Friends or Foes?
  4: '2b1655f726c7809da5e1efc76b083063', // Pass or Fail: Survival Test
  5: '2b1655f726c78060a330fc1856659f37', // You Failed! Kakashi's Final Decision
  
  // Week 3-4: Presenza e ascolto (Ep 6-12)
  6: '2b1655f726c7809bb3d8d6f4a077ec23', // A Dangerous Mission! Journey to the Land of Waves!
  7: '2b1655f726c780ad8f8cde821a99ea88', // The Assassin of the Mist!
  8: '2b1655f726c78093abe0e398b8be7421', // The Oath of Pain
  9: '2b1655f726c780099243edc9151fe53b', // Kakashi: Sharingan Warrior!
  10: '2b1655f726c78030bf8bcafb5c64b4aa', // The Forest of Chakra
  11: '2b1655f726c7802bb43ff1b53846299b', // The Land Where a Hero Once Lived
  12: '2b1655f726c780aab64dd6ccd7ce6396', // Battle on the Bridge! Zabuza Returns!
  
  // Week 5-6: Valore e appartenenza (Ep 13-19)
  13: '2b1655f726c780eebac5d5cb928a1d4a', // Haku's Secret Jutsu: Crystal Ice Mirrors
  14: '2b1655f726c780be82c6de51da91012e', // The Number One Hyperactive, Knucklehead Ninja Joins the Fight!
  15: '2b1655f726c780b8b8d1d8a384b9bf0f', // Zero Visibility: The Sharingan Shatters
  16: '', // TODO: Episodio 16-19 da aggiungere dopo
  17: '',
  18: '',
  19: '',
};

// Mapping episodi → settimane
export const EPISODE_TO_WEEK: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 1, 5: 2,
  6: 3, 7: 3, 8: 3, 9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 6, 17: 6, 18: 6, 19: 6,
};

// Helper: Get Notion page ID from episode number
export function getEpisodePageId(episodeNumber: number): string | null {
  return EPISODE_MAPPING[episodeNumber] || null;
}

// Helper: Get week number from episode
export function getWeekFromEpisode(episodeNumber: number): number {
  return EPISODE_TO_WEEK[episodeNumber] || 1;
}

// Helper: Check if episode is in MVP scope
export function isEpisodeInMVP(episodeNumber: number): boolean {
  return episodeNumber >= 1 && episodeNumber <= 19;
}
