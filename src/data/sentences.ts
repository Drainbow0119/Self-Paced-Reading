export type TestGroup = 'R1' | 'R2' | 'R3' | 'R4';

export interface SentenceItem {
  sentence: string;
  targetWord: string;
}

/**
 * Practice sentences (not graded).
 * Bold text from instructions is preserved verbatim without any alteration.
 */
export const PRACTICE_SENTENCES: SentenceItem[] = [
  {
    sentence: 'Clara is looking after her pets',
    targetWord: 'pets',
  },
  {
    sentence: 'Daisy likes gardening',
    targetWord: 'cooking',
  },
];

/**
 * Graded test sentence sets (R1 to R4).
 * Every sentence string matches the bold baseline text from the specification verbatim.
 */
export const GRADED_TESTS: Record<TestGroup, SentenceItem[]> = {
  R1: [
    {
      sentence: 'While the singer sang the pop song played in the background.',
      targetWord: 'singer',
    },
    {
      sentence: 'After the student finished, the assignment was sent online.',
      targetWord: 'library',
    },
    {
      sentence: 'The patient hurried to the hospital recovered quickly.',
      targetWord: 'hospital',
    },
    {
      sentence: 'The artist who was sent the flowers was pleased.',
      targetWord: 'painting',
    },
    {
      sentence: 'After the teacher called the students ran into the classroom.',
      targetWord: 'classroom',
    },
    {
      sentence: 'While the nurse treated, the patient slept in the recovery room.',
      targetWord: 'medicine',
    },
    {
      sentence: 'The hikers guided through the forest reached the campsite safely.',
      targetWord: 'forest',
    },
    {
      sentence: 'The horse that raced around the track fell down.',
      targetWord: 'jockey',
    },
  ],
  R2: [
    {
      sentence: 'While the chef cooked the soup spilled on the floor.',
      targetWord: 'soup',
    },
    {
      sentence: 'While the singer sang, the pop song played in the background.',
      targetWord: 'guitar',
    },
    {
      sentence: 'The boat sailed across the lake sank suddenly.',
      targetWord: 'lake',
    },
    {
      sentence: 'The patient that hurried to the hospital recovered quickly.',
      targetWord: 'ambulance',
    },
    {
      sentence: 'While the coach trained the athletes rested in the locker room.',
      targetWord: 'athletes',
    },
    {
      sentence: 'After the teacher called, the students ran into the classroom.',
      targetWord: 'homework',
    },
    {
      sentence: 'The athletes trained at the gym won the championship.',
      targetWord: 'gym',
    },
    {
      sentence: 'The hikers that guided through the forest reached the campsite safely.',
      targetWord: 'mountain',
    },
  ],
  R3: [
    {
      sentence: 'After the tourist visited the museum closed for the day.',
      targetWord: 'museum',
    },
    {
      sentence: 'While the chef cooked, the soup spilled on the floor.',
      targetWord: 'kitchen',
    },
    {
      sentence: 'The soldiers walked across the field passed out from hunger.',
      targetWord: 'field',
    },
    {
      sentence: 'The boat that sailed across the lake sank suddenly.',
      targetWord: 'ocean',
    },
    {
      sentence: 'While the manager interviewed the employees waited outside.',
      targetWord: 'employees',
    },
    {
      sentence: 'While the coach trained, the athletes rested in the locker room',
      targetWord: 'stadium',
    },
    {
      sentence: 'The dog walked through the neighborhood disappeared.',
      targetWord: 'neighborhood',
    },
    {
      sentence: 'The athletes that trained at the gym won the championship.',
      targetWord: 'trophy',
    },
  ],
  R4: [
    {
      sentence: 'After the student finished the assignment was sent online.',
      targetWord: 'assignment',
    },
    {
      sentence: 'After the tourist visited, the museum closed for the day.',
      targetWord: 'ticket',
    },
    {
      sentence: 'The artist sent the flowers was pleased.',
      targetWord: 'flowers',
    },
    {
      sentence: 'The soldiers that walked across the field passed out from hunger.',
      targetWord: 'water',
    },
    {
      sentence: 'While the nurse treated the patient slept in the recovery room.',
      targetWord: 'patient',
    },
    {
      sentence: 'While the manager interviewed, the employees waited outside.',
      targetWord: 'office',
    },
    {
      sentence: 'The horse raced around the track fell down.',
      targetWord: 'track',
    },
    {
      sentence: 'The dog that walked through the neighborhood disappeared.',
      targetWord: 'collar',
    },
  ],
};

export const TEST_GROUPS: TestGroup[] = ['R1', 'R2', 'R3', 'R4'];

export function getRandomTestGroup(): TestGroup {
  const randomIndex = Math.floor(Math.random() * TEST_GROUPS.length);
  return TEST_GROUPS[randomIndex];
}
