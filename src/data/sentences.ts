export type TestGroup = 'R1' | 'R2' | 'R3' | 'R4';
export type QuestionLevel = 1 | 2;

export interface MultipleChoiceQuestion {
  prompt: string;
  options: [string, string, string, string]; // a, b, c, d
  correctIndex: number; // 0 = a, 1 = b, 2 = c, 3 = d
}

export interface SentenceItem {
  sentence: string;
  level: QuestionLevel;
  /** Used for Practice and Level 1 sentences ("Did the word ~~~ appear in the sentence?") */
  targetWord?: string;
  /** Used for Level 2 sentences (4-option theme question with one correct answer) */
  themeQuestion?: MultipleChoiceQuestion;
}

/**
 * Practice sentences (not graded).
 * Bold text from instructions is preserved verbatim without any alteration.
 */
export const PRACTICE_SENTENCES: SentenceItem[] = [
  {
    sentence: 'Clara is looking after her pets',
    level: 1,
    targetWord: 'pets',
  },
  {
    sentence: 'Daisy likes gardening',
    level: 1,
    targetWord: 'cooking',
  },
];

/**
 * Graded test sentence sets (R1 to R4).
 * Each group contains 4 Level 1 sentences followed by 4 Level 2 sentences.
 * Every sentence string matches the bold baseline text from the specification verbatim.
 */
export const GRADED_TESTS: Record<TestGroup, SentenceItem[]> = {
  R1: [
    // Level 1 (Sentences 1-4)
    {
      sentence: 'While the singer sang the pop song played in the background.',
      level: 1,
      targetWord: 'singer',
    },
    {
      sentence: 'After the teacher called the students ran into the classroom.',
      level: 1,
      targetWord: 'classroom',
    },
    {
      sentence: 'After the student finished, the assignment was sent online.',
      level: 1,
      targetWord: 'library',
    },
    {
      sentence: 'While the nurse treated, the patient slept in the recovery room.',
      level: 1,
      targetWord: 'medicine',
    },
    // Level 2 (Sentences 5-8)
    {
      sentence: 'After the tourist visited the museum closed for the day.',
      level: 2,
      themeQuestion: {
        prompt: 'What closed for the day after the tourist visited?',
        options: ['a. the library', 'b. the museum', 'c. the theater', 'd. the park'],
        correctIndex: 1,
      },
    },
    {
      sentence: 'While the manager interviewed the employees waited outside.',
      level: 2,
      themeQuestion: {
        prompt: 'What did the employees do while the manager interviewed?',
        options: [
          'a. worked at their desks',
          'b. left the building',
          'c. waited outside',
          'd. had lunch',
        ],
        correctIndex: 2,
      },
    },
    {
      sentence: 'While the chef cooked, the soup spilled on the floor.',
      level: 2,
      themeQuestion: {
        prompt: 'What happened to the soup while the chef cooked?',
        options: [
          'a. it spilled on the floor',
          'b. it burned in the pot',
          'c. it was served cold',
          'd. it froze in the fridge',
        ],
        correctIndex: 0,
      },
    },
    {
      sentence: 'While the coach trained, the athletes rested in the locker room.',
      level: 2,
      themeQuestion: {
        prompt: 'Where did the athletes rest while the coach trained?',
        options: [
          'a. on the field',
          'b. in the gym',
          'c. on the bus',
          'd. in the locker room',
        ],
        correctIndex: 3,
      },
    },
  ],

  R2: [
    // Level 1 (Sentences 1-4)
    {
      sentence: 'While the chef cooked the soup spilled on the floor.',
      level: 1,
      targetWord: 'soup',
    },
    {
      sentence: 'While the coach trained the athletes rested in the locker room.',
      level: 1,
      targetWord: 'athletes',
    },
    {
      sentence: 'While the singer sang, the pop song played in the background.',
      level: 1,
      targetWord: 'guitar',
    },
    {
      sentence: 'After the teacher called, the students ran into the classroom.',
      level: 1,
      targetWord: 'homework',
    },
    // Level 2 (Sentences 5-8)
    {
      sentence: 'After the student finished the assignment was sent online.',
      level: 2,
      themeQuestion: {
        prompt: 'How was the assignment sent after the student finished?',
        options: ['a. by mail', 'b. online', 'c. in person', 'd. by fax'],
        correctIndex: 1,
      },
    },
    {
      sentence: 'While the nurse treated the patient slept in the recovery room.',
      level: 2,
      themeQuestion: {
        prompt: 'What did the patient do in the recovery room while the nurse treated?',
        options: [
          'a. watched television',
          'b. read a book',
          'c. slept',
          'd. walked around',
        ],
        correctIndex: 2,
      },
    },
    {
      sentence: 'After the tourist visited, the museum closed for the day.',
      level: 2,
      themeQuestion: {
        prompt: 'What closed for the day after the tourist visited?',
        options: ['a. the library', 'b. the museum', 'c. the theater', 'd. the park'],
        correctIndex: 1,
      },
    },
    {
      sentence: 'While the manager interviewed, the employees waited outside.',
      level: 2,
      themeQuestion: {
        prompt: 'What did the employees do while the manager interviewed?',
        options: [
          'a. worked at their desks',
          'b. left the building',
          'c. waited outside',
          'd. had lunch',
        ],
        correctIndex: 2,
      },
    },
  ],

  R3: [
    // Level 1 (Sentences 1-4)
    {
      sentence: 'After the tourist visited the museum closed for the day.',
      level: 1,
      targetWord: 'museum',
    },
    {
      sentence: 'While the manager interviewed the employees waited outside.',
      level: 1,
      targetWord: 'employees',
    },
    {
      sentence: 'While the chef cooked, the soup spilled on the floor.',
      level: 1,
      targetWord: 'kitchen',
    },
    {
      sentence: 'While the coach trained, the athletes rested in the locker room.',
      level: 1,
      targetWord: 'stadium',
    },
    // Level 2 (Sentences 5-8)
    {
      sentence: 'While the singer sang the pop song played in the background.',
      level: 2,
      themeQuestion: {
        prompt: 'What played in the background while the singer sang?',
        options: [
          'a. the pop song',
          'b. the classical piano',
          'c. a movie soundtrack',
          'd. a radio interview',
        ],
        correctIndex: 0,
      },
    },
    {
      sentence: 'After the teacher called the students ran into the classroom.',
      level: 2,
      themeQuestion: {
        prompt: 'Where did the students run after the teacher called?',
        options: [
          'a. into the cafeteria',
          'b. onto the playground',
          'c. into the classroom',
          'd. to the school bus',
        ],
        correctIndex: 2,
      },
    },
    {
      sentence: 'After the student finished, the assignment was sent online.',
      level: 2,
      themeQuestion: {
        prompt: 'How was the assignment sent after the student finished?',
        options: ['a. by mail', 'b. online', 'c. in person', 'd. by fax'],
        correctIndex: 1,
      },
    },
    {
      sentence: 'While the nurse treated, the patient slept in the recovery room.',
      level: 2,
      themeQuestion: {
        prompt: 'What did the patient do in the recovery room while the nurse treated?',
        options: [
          'a. watched television',
          'b. read a book',
          'c. slept',
          'd. walked around',
        ],
        correctIndex: 2,
      },
    },
  ],

  R4: [
    // Level 1 (Sentences 1-4)
    {
      sentence: 'After the student finished the assignment was sent online.',
      level: 1,
      targetWord: 'assignment',
    },
    {
      sentence: 'While the nurse treated the patient slept in the recovery room.',
      level: 1,
      targetWord: 'patient',
    },
    {
      sentence: 'After the tourist visited, the museum closed for the day.',
      level: 1,
      targetWord: 'ticket',
    },
    {
      sentence: 'While the manager interviewed, the employees waited outside.',
      level: 1,
      targetWord: 'office',
    },
    // Level 2 (Sentences 5-8)
    {
      sentence: 'While the chef cooked the soup spilled on the floor.',
      level: 2,
      themeQuestion: {
        prompt: 'What happened to the soup while the chef cooked?',
        options: [
          'a. it spilled on the floor',
          'b. it burned in the pot',
          'c. it was served cold',
          'd. it froze in the fridge',
        ],
        correctIndex: 0,
      },
    },
    {
      sentence: 'While the coach trained the athletes rested in the locker room.',
      level: 2,
      themeQuestion: {
        prompt: 'Where did the athletes rest while the coach trained?',
        options: [
          'a. on the field',
          'b. in the gym',
          'c. on the bus',
          'd. in the locker room',
        ],
        correctIndex: 3,
      },
    },
    {
      sentence: 'While the singer sang, the pop song played in the background.',
      level: 2,
      themeQuestion: {
        prompt: 'What played in the background while the singer sang?',
        options: [
          'a. the pop song',
          'b. the classical piano',
          'c. a movie soundtrack',
          'd. a radio interview',
        ],
        correctIndex: 0,
      },
    },
    {
      sentence: 'After the teacher called, the students ran into the classroom.',
      level: 2,
      themeQuestion: {
        prompt: 'Where did the students run after the teacher called?',
        options: [
          'a. into the cafeteria',
          'b. onto the playground',
          'c. into the classroom',
          'd. to the school bus',
        ],
        correctIndex: 2,
      },
    },
  ],
};

export const TEST_GROUPS: TestGroup[] = ['R1', 'R2', 'R3', 'R4'];

export function getRandomTestGroup(): TestGroup {
  const randomIndex = Math.floor(Math.random() * TEST_GROUPS.length);
  return TEST_GROUPS[randomIndex];
}
