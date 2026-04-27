export const chapters = [
  {
    id: 'ch1',
    title: '1. The Big Questions',
    theme: 'Why school maths looks different now',
    summary:
      'Modern primary maths emphasises understanding, discussion, mental strategies and reasoning, rather than memorising one written method too early.',
    keyPoints: [
      {
        point: 'Children may learn several methods before the compact written method.',
        detail:
          'For example, a child might solve 79 × 43 by splitting it into 79 × 40 + 79 × 3 before ever seeing long multiplication. This builds a genuine understanding of why the compact method works.',
      },
      {
        point: 'The aim is to understand why a method works, not just follow rules.',
        detail:
          'A child who understands place value can adapt when numbers change. A child who only knows a rule gets stuck the moment the numbers look different.',
      },
      {
        point: 'Ask "Can you show me how you got that?" rather than correcting immediately.',
        detail:
          'This keeps the conversation open. Even if the method looks different from what you were taught, it may be completely correct. Understanding the child\'s thinking is the first step.',
      },
    ],
    examples: [
      '79 × 43 can be split into 79 × 40 + 79 × 3 = 3160 + 237 = 3397.',
      '45 × 23 can be split into 45 × 20 + 45 × 3 = 900 + 135 = 1035.',
      '62 × 35 = 62 × 30 + 62 × 5 = 1860 + 310 = 2170.',
      'Instead of "Is that right?", try "Can you convince me?" — this invites explanation rather than a yes/no.',
    ],
    teachingIdea:
      'Ask "Can you show me another way?" rather than "What\'s the proper method?" — this encourages flexibility.',
    activities: [
      { type: 'input', label: 'Split 34 × 12 using place value. What is the answer?', answer: '408', placeholder: 'e.g. 408' },
      { type: 'input', label: 'Split 45 × 23 into tens and ones. What is the answer?', answer: '1035', placeholder: 'e.g. 1035' },
      { type: 'input', label: 'Split 25 × 16 into two easier multiplications. What is the answer?', answer: '400', placeholder: 'e.g. 400' },
    ],
  },
  {
    id: 'ch2',
    title: '2. Maths Props',
    theme: 'Using everyday objects',
    summary:
      'Maths can be practised through ordinary family life using clocks, calendars, dice, cards, board games, measuring jugs, rulers, scales, coins and calculators.',
    keyPoints: [
      {
        point: 'Short, playful maths conversations are more powerful than long "maths sessions".',
        detail:
          'Five minutes at the dinner table asking "how many altogether?" or "what change would we get?" builds habits of mathematical thinking that a worksheet cannot replicate.',
      },
      {
        point: 'Everyday objects make abstract ideas concrete.',
        detail:
          'Coins show place value (pennies, tens, pounds). Clocks show fractions (half past = 1/2). Dice show probability. Calendars show addition and counting on.',
      },
      {
        point: 'You do not need worksheets — use clocks, calendars, dice, cards, scales and measuring jugs.',
        detail: null,
      },
    ],
    examples: [
      'Roll 4 and 5: what\'s the total, and what number is needed to make 12?',
      'How many 20p coins make £1?',
      'Today is the 8th. What date will it be in two weeks?',
      'Weigh two objects — which is heavier? By how much?',
    ],
    teachingIdea: 'Keep maths casual and woven into everyday routines.',
    activities: [
      { type: 'input', label: 'Dice target: you roll 4 and 5. What number is needed to make 12?', answer: '3' },
      { type: 'input', label: 'How many 20p coins make £1?', answer: ['5', 'five'] },
      { type: 'input', label: 'Today is the 8th. What date will it be in two weeks?', answer: ['22', '22nd'] },
    ],
  },
  {
    id: 'ch3',
    title: '3. A Year-by-Year Guide',
    theme: 'What children learn from Reception to Year 6',
    summary:
      'This is a roadmap, not a rigid checklist. Schools vary and children revisit topics many times, adding extra layers of understanding as they grow.',
    keyPoints: [
      {
        point: 'Your role is to support, encourage and connect maths to real life — not replace school.',
        detail:
          'Ask "what are you doing in maths at the moment?" and use the year-group guide below to find a practical home activity that matches.',
      },
      {
        point: 'Reception builds counting, comparison and play-based maths.',
        detail:
          'At this age, counting stairs, sharing snacks, sorting toys and spotting patterns are all valuable maths. It should feel like play, not lessons.',
      },
      {
        point: 'Key Stage 1 (Years 1–2) builds confidence with small numbers, time, money, shapes and simple fractions.',
        detail: null,
      },
      {
        point: 'Key Stage 2 (Years 3–6) develops written methods, fractions, decimals, percentages, geometry, data and early algebra.',
        detail:
          'Topics always come back with more layers. Fractions in Year 3 means adding 2/7 + 3/7. In Year 6 it means dividing 1/2 ÷ 2. Same topic, very different level.',
      },
    ],
    yearGroups: [
      {
        name: 'Reception',
        focus: 'Counting, comparison, sorting, patterns and simple sharing.',
        learns: [
          'Count forwards and backwards',
          'Count real objects, not just recite number words',
          'Use words such as more, less, bigger, smaller, heavier and lighter',
          'Begin simple addition and subtraction',
          'Meet early multiplication and division through grouping and sharing',
          'Make patterns, build models and sort objects',
        ],
        example:
          'Share 9 biscuits between 3 teddy bears. How many does each teddy get?',
      },
      {
        name: 'Year 1',
        focus:
          'Small-number confidence, number bonds, basic time, money, measures and shapes.',
        learns: [
          'Count to and beyond 100',
          'Read and write numbers to 100, and number words to 20',
          'Know number bonds, especially facts up to 20',
          'Count in 2s, 5s and 10s',
          'Understand half and quarter',
          'Recognise coins and tell time to the hour and half hour',
          'Recognise common 2D and 3D shapes',
        ],
        example: 'If 6 + 5 = 11, then 11 − 6 = 5 and 11 − 5 = 6.',
      },
      {
        name: 'Year 2',
        focus:
          'Two-digit place value, number facts, early times tables, fractions, time and data.',
        learns: [
          'Count in 2s, 3s, 5s and 10s',
          'Understand two-digit place value',
          'Become fluent with addition and subtraction facts up to 20',
          'Understand odd and even numbers',
          'Connect addition with subtraction and multiplication with division',
          'Work with 1/2, 1/3, 1/4, 2/4 and 3/4',
          'Tell the time to quarter past, quarter to and five-minute intervals',
          'Use pictograms, tally charts, block diagrams and tables',
        ],
        example: '47 means 4 tens and 7 ones. One quarter of 12 sweets is 3.',
      },
      {
        name: 'Year 3',
        focus:
          'Three-digit numbers, written methods, tables, fractions, perimeter, time and data.',
        learns: [
          'Work with numbers up to at least 1000',
          'Understand hundreds, tens and ones',
          'Count in multiples of 4, 8, 50 and 100',
          'Find 10 or 100 more or less than a number',
          'Use column methods for addition and subtraction',
          'Learn 3, 4 and 8 times tables',
          'Multiply two-digit numbers by one-digit numbers',
          'Add and subtract fractions with the same denominator',
          'Learn about perimeter, right angles, parallel and perpendicular lines',
        ],
        example: '23 × 4 can be split into 20 × 4 + 3 × 4 = 80 + 12 = 92.',
      },
      {
        name: 'Year 4',
        focus:
          'Four-digit numbers, times tables to 12 × 12, decimals, fractions, area and coordinates.',
        learns: [
          'Count in multiples of 6, 7, 25 and 1000',
          'Count backwards through zero into negative numbers',
          'Round to the nearest 10, 100 and 1000',
          'Use written methods with four-digit numbers',
          'Recall multiplication facts up to 12 × 12',
          'Work with hundredths and decimal equivalents',
          'Compare decimals and round one-decimal-place numbers',
          'Convert units, find area by counting squares, and use coordinates',
        ],
        example: '3/4 of 20: one quarter is 5, so three quarters is 15.',
      },
      {
        name: 'Year 5',
        focus:
          'Large numbers, factors, primes, written calculation, decimals, percentages and angles.',
        learns: [
          'Work with numbers up to one million',
          'Round to 10, 100, 1000, 10,000 and 100,000',
          'Use negative numbers in context',
          'Learn factors, multiples, primes, square numbers and cube numbers',
          'Multiply and divide by 10, 100 and 1000',
          'Read, compare and round decimals to three decimal places',
          'Understand percentages as parts per hundred',
          'Calculate area and perimeter, estimate volume and measure angles',
        ],
        example: '1/2 = 0.5 = 50%, 1/4 = 0.25 = 25%, and 3/4 = 0.75 = 75%.',
      },
      {
        name: 'Year 6',
        focus:
          'Primary consolidation and bridge to secondary: fractions, ratio, algebra, geometry, graphs and averages.',
        learns: [
          'Work with numbers up to ten million',
          'Multiply up to four-digit numbers by two-digit numbers',
          'Divide up to four-digit numbers by two-digit numbers',
          'Interpret remainders in real contexts',
          'Simplify, compare, add, subtract, multiply and divide fractions',
          'Solve percentage, ratio and proportion problems',
          'Start algebra, formulae and sequences',
          'Calculate area of triangles and parallelograms and volume of cuboids',
          'Use four-quadrant coordinates, pie charts, line graphs and mean averages',
        ],
        example:
          'Angles in a triangle add to 180°, so if two are 60° and 70°, the third is 50°.',
      },
    ],
    teachingIdea:
      'Ask "What version of this topic are they working on now?" rather than expecting full mastery at once.',
    // activities: [
    //   { type: 'input', label: 'Year-group check: which year focuses on times tables up to 12 × 12?', answer: ['Year 4', '4'], placeholder: 'e.g. Year 4' },
    //   { type: 'input', label: 'In which Key Stage do children first learn about algebra?', answer: ['Key Stage 2', 'KS2', '2', 'year 6', 'Year 6'], placeholder: 'e.g. Key Stage 2' },
    //   { type: 'input', label: 'What fraction concept do Year 3 children learn first?', answer: ['same denominator', 'fractions with the same denominator', 'adding fractions', 'equal denominator'], placeholder: 'e.g. same denominator' },
    // ],
  },
  {
    id: 'ch4',
    title: '4. DOs and DON\'Ts',
    theme: 'Helping without pressure',
    summary:
      'Practical advice for keeping maths positive, exploratory and confidence-building.',
    keyPoints: [
      {
        point: 'Praise effort and thinking, not just correct answers.',
        detail:
          'When a child tries a creative method that doesn\'t work, praise the thinking: "I like how you tried breaking it apart. Let\'s see where it went." This builds resilience and willingness to try again.',
      },
      {
        point: 'Use mistakes as learning opportunities.',
        detail:
          'A wrong answer is a window into how a child is thinking. Ask "how did you get that?" before showing the right method — you will often find the child\'s reasoning is almost right.',
      },
      {
        point: 'Do not say "I was never good at maths" — it gives children permission to give up.',
        detail: null,
      },
      {
        point: 'Do not rush to show your own method — ask your child to explain theirs first.',
        detail:
          'If a child\'s method works, support it, even if it is different from what you were taught. Undermining their method can damage confidence.',
      },
    ],
    examples: [
      'Instead of "No, that\'s wrong", try "Interesting. How did you get that? Let\'s check it together."',
      'Instead of "I\'ll show you the right way", try "Can you explain your thinking to me?"',
      'Instead of "This is easy, you should know this", try "Let\'s work through it together."',
    ],
    teachingIdea:
      'A child who thinks maths is about exploring and improving is more likely to persevere.',
    // activities: [
    //   {
    //     type: 'input',
    //     label: 'Rewrite this positively: "No, that\'s wrong."',
    //     answer: [
    //       "Interesting. How did you get that? Let's check it together.",
    //       'Interesting how did you get that lets check it together',
    //       "interesting how did you get that let's check it together",
    //     ],
    //     placeholder: 'Type a kinder response',
    //   },
    //   { type: 'input', label: 'True or false: saying "I was never good at maths" is harmless.', answer: ['false', 'no'] },
    //   { type: 'input', label: 'When your child makes a mistake, what should you ask first?', answer: ['how did you get that', 'how did you get that?', 'explain your thinking', 'show me your thinking'], placeholder: 'e.g. How did you get that?' },
    // ],
  },
  {
    id: 'ch5',
    title: '5. Numbers and Place Value',
    theme: 'What digits are worth',
    summary:
      'Children need to understand that a digit changes value depending on its position, and that zero can hold a place.',
    keyPoints: [
      {
        point: 'A digit\'s value depends entirely on its position.',
        detail:
          'In 243, the 2 is worth 200, the 4 is worth 40 and the 3 is worth 3. In 324, the 2 is only worth 20. The same digit, a completely different value.',
      },
      {
        point: 'Zero is important — it holds a place.',
        detail:
          'In 507, the zero means there are no tens. Without it, 507 would become 57 — a completely different number. Children sometimes skip zeros when writing numbers like "one hundred and three" as 1003.',
      },
      {
        point: 'Decimals extend place value to tenths, hundredths and thousandths.',
        detail:
          '3.45 means 3 ones, 4 tenths and 5 hundredths. A common mistake is thinking 3.45 > 3.453 because "45 looks bigger than 453" — but 3.453 has more thousandths, so it is larger.',
      },
      {
        point: 'Money is a helpful place-value model.',
        detail: '£2.43 means 2 pounds, 4 tens of pence and 3 pence. Most children already understand coins, so this makes place value concrete and familiar.',
      },
    ],
    examples: [
      'In 472, the 7 is worth 70.',
      '3.5 can be written as 3.50, making it easier to see that 3.50 > 3.45.',
      'Writing "one hundred and thirty-six" as 10036 is a common mistake — it should be 136.',
      'In 507, the zero holds the tens place so the 5 stays as 500 and does not slide down to 50.',
    ],
    teachingIdea: 'Use £2.43 as 2 pounds, 4 tens of pence and 3 pence.',
    activities: [
      { type: 'input', label: 'Place value: what is the 7 worth in 472?', answer: ['70', 'seventy'] },
      { type: 'input', label: 'In 3,456, what is the value of the digit 4?', answer: ['400', 'four hundred'] },
      { type: 'input', label: 'Which is bigger: 3.5 or 3.45?', answer: ['3.5', 'three point five'] },
    ],
  },
  {
    id: 'ch6',
    title: '6. Addition and Subtraction: Mental Methods',
    theme: 'Choosing efficient strategies',
    summary:
      'Mental maths means choosing a sensible strategy, not just trying to do everything quickly in your head.',
    keyPoints: [
      {
        point: 'Mental maths means choosing a sensible strategy — not just computing in your head.',
        detail:
          'The best strategy depends on the numbers. 99 + 48 is easier as 100 + 48 − 1 = 147. 27 + 35 might be easier split as 27 + 30 + 5. Flexibility matters more than speed.',
      },
      {
        point: 'Subtraction can mean "take away" or "find the difference" — both are the same operation.',
        detail:
          '201 − 196 is much easier to think of as "how far from 196 to 201?" (answer: 5) than to subtract 196 step by step from 201. The difference interpretation is often faster.',
      },
      {
        point: 'Friendly numbers like 10, 20, 50 and 100 are useful stepping stones.',
        detail: null,
      },
    ],
    examples: [
      '201 − 196: count up from 196 → 200 (4 steps) → 201 (1 step) = 5.',
      '48 + 27 can become 50 + 25 = 75 by moving 2 from the 27 to the 48.',
      '99 + 48 is easiest as 100 + 48 − 1 = 147.',
      '7000 − 1999 is easiest as 7000 − 2000 + 1 = 5001.',
    ],
    teachingIdea: 'Ask "What friendly number could help?" when your child is stuck.',
    activities: [
      { type: 'input', label: 'Friendly numbers: solve 201 − 196 by counting up.', answer: '5' },
      { type: 'input', label: 'Use compensation: what is 99 + 48?', answer: '147' },
      { type: 'input', label: 'Use a friendly number: what is 7000 − 1999?', answer: '5001' },
    ],
  },
  {
    id: 'ch7',
    title: '7. Addition and Subtraction: Written Methods',
    theme: 'Written methods with understanding',
    summary:
      'Written methods are useful for awkward calculations, but expanded methods help children see the hundreds, tens and ones before moving to compact column methods.',
    keyPoints: [
      {
        point: 'Expanded written methods help children see the hundreds, tens and ones.',
        detail:
          '356 + 278 becomes 300 + 200 = 500, 50 + 70 = 120, 6 + 8 = 14. Add them: 634. This makes clear why the column method works — it is just a shortcut for the same steps.',
      },
      {
        point: 'Column methods are powerful but should not become meaningless procedures.',
        detail:
          'A child who only follows the column algorithm without understanding cannot check if the answer is sensible. Estimation and understanding go together.',
      },
      {
        point: 'Counting up is an effective subtraction strategy, especially across zeros.',
        detail:
          'For 503 − 487: count up 487 → 500 (13 steps), then 500 → 503 (3 steps). Total: 16. This avoids the tricky "borrowing across a zero" that trips many children up.',
      },
    ],
    examples: [
      '356 + 278: 300+200=500, 50+70=120, 6+8=14. Total: 500+120+14=634.',
      '503 − 487: from 487 to 500 is 13, then 500 to 503 is 3. Answer: 16.',
      '4729 + 2186: estimate first — roughly 4700 + 2200 = 6900 — then calculate to get 6915.',
      '600 − 348: count up: 348 → 400 is 52, 400 → 600 is 200. Total: 252.',
    ],
    teachingIdea: 'Do not rush straight to the compact method — expanded steps build understanding.',
    activities: [
      { type: 'input', label: 'Expanded addition: 356 + 278 = ?', answer: '634' },
      { type: 'input', label: 'Count up to subtract: what is 503 − 487?', answer: '16' },
      { type: 'input', label: 'Count up to subtract: what is 600 − 348?', answer: '252' },
    ],
  },
  {
    id: 'ch8',
    title: '8. Simple Multiplication and Tables',
    theme: 'Facts, arrays and relationships',
    summary:
      'Times tables matter, but they are easier to learn when children understand patterns, arrays and inverse relationships.',
    keyPoints: [
      {
        point: 'Multiplication is repeated addition, grouping, arrays and scaling — not just one thing.',
        detail:
          '3 × 5 means 3 groups of 5, or 5 groups of 3, or a 3-by-5 array of dots, or scaling by a factor of 3. Understanding all these meanings makes times tables more flexible.',
      },
      {
        point: 'One known fact gives four related facts.',
        detail:
          'If 4 × 9 = 36, then 9 × 4 = 36, 36 ÷ 4 = 9 and 36 ÷ 9 = 4 all follow immediately. Every multiplication fact a child learns is really four facts at once.',
      },
      {
        point: 'Known facts help with nearby facts.',
        detail:
          'If 5 × 7 = 35, then 6 × 7 is just one more group of 7: 35 + 7 = 42. Children never need to memorise 6 × 7 in isolation if they have 5 × 7 secure.',
      },
    ],
    examples: [
      'If 5 × 7 = 35, then 6 × 7 = 42 (add one more group of 7).',
      '7 × 8 can be seen as 7 × 4 doubled: 7 × 4 = 28, doubled = 56.',
      'A 3 × 5 array turned sideways becomes 5 × 3 — same dots, different orientation.',
      '9 × 6 = 10 × 6 − 6 = 60 − 6 = 54. The "times 10, subtract one group" trick works for any 9× fact.',
    ],
    teachingIdea: 'Use arrays — arrange objects in rows and columns, then turn them sideways to show commutativity.',
    activities: [
      { type: 'input', label: 'Known facts: if 5 × 7 = 35, what is 6 × 7?', answer: '42' },
      { type: 'input', label: 'If 4 × 9 = 36, what is 36 ÷ 9?', answer: '4' },
      { type: 'input', label: '"Times 10, subtract one group" trick: what is 9 × 8?', answer: '72' },
    ],
  },
  {
    id: 'ch9',
    title: '9. Multiplication Beyond Tables',
    theme: 'Breaking larger multiplication apart',
    summary:
      'Larger multiplication works best when children see how place value and splitting numbers make the calculation manageable.',
    keyPoints: [
      {
        point: 'Grid and area models make larger multiplication visible.',
        detail:
          '23 × 14 drawn as a grid gives four parts: 20×10=200, 20×4=80, 3×10=30, 3×4=12. Add them: 322. The grid shows exactly what is happening and why nothing gets missed.',
      },
      {
        point: 'Long multiplication is powerful but can become mechanical if taught too early.',
        detail:
          'Children who learn the compact algorithm before understanding place value often make errors and cannot tell if their answer is reasonable. The grid method first builds that understanding.',
      },
      {
        point: 'Multiplying by a decimal can make a number smaller.',
        detail:
          '10 × 0.5 = 5. Multiplying by 0.5 means finding half. This surprises many children (and adults) who assume multiplication always makes numbers bigger.',
      },
    ],
    examples: [
      '23 × 14 = 23 × 10 + 23 × 4 = 230 + 92 = 322.',
      '10 × 0.5 = 5, because multiplying by 0.5 means finding half.',
      '46 × 23: grid gives 40×20=800, 40×3=120, 6×20=120, 6×3=18. Total: 1058.',
      '15 × 12 = 15 × 10 + 15 × 2 = 150 + 30 = 180.',
    ],
    teachingIdea: 'Use grids to make each part of the multiplication visible before introducing compact long multiplication.',
    activities: [
      { type: 'input', label: 'Grid multiply: 23 × 14 = ?', answer: '322' },
      { type: 'input', label: 'Split 15 × 12 into tens and ones. What is the answer?', answer: '180' },
      { type: 'input', label: 'Split 46 × 23 using a grid. What is the answer?', answer: '1058' },
    ],
  },
  {
    id: 'ch10',
    title: '10. Division',
    theme: 'Sharing, grouping and inverse facts',
    summary:
      'Division can mean sharing equally or grouping, and children benefit from connecting division directly to multiplication facts.',
    keyPoints: [
      {
        point: '"Sharing" asks how many in each group.',
        detail:
          '48 ÷ 8: I have 48 sweets and share them between 8 bags. How many in each bag? (Answer: 6.) The number of bags is fixed; the size of each share is the unknown.',
      },
      {
        point: '"Grouping" asks how many groups.',
        detail:
          '48 ÷ 8: I have 48 sweets and put 8 in each bag. How many bags do I need? (Answer: 6.) Same calculation, different real-world story — both meanings are important.',
      },
      {
        point: 'Division is the inverse of multiplication — use times-table facts.',
        detail:
          'If you know 7 × 4 = 28, then 28 ÷ 7 = 4 and 28 ÷ 4 = 7 follow immediately. Division does not need to be a separate skill if multiplication facts are solid.',
      },
    ],
    examples: [
      '48 ÷ 8: sharing — 6 sweets in each of 8 bags. Grouping — 6 bags of 8 sweets. Same answer, two stories.',
      'If 7 × 4 = 28, then 28 ÷ 7 = 4 and 28 ÷ 4 = 7.',
      '27 ÷ 4 = 6 remainder 3. If 27 children need cars holding 4, you need 7 cars — remainders have real-world meaning.',
      '72 ÷ 9: think "what times 9 equals 72?" Answer: 8. So 72 ÷ 9 = 8.',
    ],
    teachingIdea: 'Ask "Is this asking how many in each group, or how many groups?" — one question clears up a lot of confusion.',
    activities: [
      { type: 'input', label: '48 sweets shared equally between 8 bags. How many in each bag?', answer: '6' },
      { type: 'input', label: 'If 9 × 7 = 63, what is 63 ÷ 9?', answer: '7' },
      { type: 'input', label: '27 children need cars. Each car holds 4. How many cars are needed?', answer: '7' },
    ],
  },
  {
    id: 'ch11',
    title: '11. Fractions, Percentages and Decimals',
    theme: 'Different ways to describe parts',
    summary:
      'Fractions, decimals and percentages are linked ways of talking about parts of a whole — but the size of the whole always matters.',
    keyPoints: [
      {
        point: 'A fraction is about equal parts of a whole.',
        detail:
          'The whole matters. Half of £10 is £5, but half of £100 is £50. One quarter can be more than one half if the whole is much larger — context is everything.',
      },
      {
        point: 'Equivalent fractions look different but mean the same amount.',
        detail:
          '1/2 = 2/4 = 3/6 = 4/8. All describe exactly half. Children who understand equivalence can compare and simplify fractions rather than just memorising facts.',
      },
      {
        point: 'Fractions, decimals and percentages are different notations for the same idea.',
        detail:
          '1/4 = 0.25 = 25%. 3/4 = 0.75 = 75%. 1/10 = 0.1 = 10%. Knowing these common equivalents makes percentage calculations much faster and more intuitive.',
      },
    ],
    examples: [
      'Half of £10 is £5, but a quarter of £100 is £25 — the whole determines the size.',
      '25% = 25 out of 100 = 1/4.',
      '1/2 = 0.5 = 50%, 1/4 = 0.25 = 25%, 3/4 = 0.75 = 75%, 1/10 = 0.1 = 10%.',
      'To find 30% of 60: find 10% (= 6), then multiply by 3 (= 18).',
    ],
    teachingIdea: 'Use food, money and measuring jugs. Always ask "Half of what?" to reinforce that the whole matters.',
    activities: [
      { type: 'input', label: 'Fraction link: what is 25% as a simple fraction?', answer: ['1/4', 'one quarter', 'quarter'] },
      { type: 'input', label: 'What is 1/2 as a decimal?', answer: ['0.5', '0.50'] },
      { type: 'input', label: 'Find 10% of 80.', answer: '8' },
    ],
  },
  {
    id: 'ch12',
    title: '12. Shapes, Symmetry and Angles',
    theme: 'Properties, not just appearance',
    summary:
      'Children need to recognise shapes by their properties, not just by how familiar or regular they look.',
    keyPoints: [
      {
        point: 'Shapes are defined by properties, not by how they look.',
        detail:
          'A tilted square is still a square — it has four equal sides and four right angles. A shape does not stop being a hexagon because it is not the "honeycomb" shape children usually see in books.',
      },
      {
        point: 'A square is a special type of rectangle.',
        detail:
          'A rectangle has four right angles and opposite sides equal. A square has four right angles and all four sides equal — so it is always a rectangle. But a rectangle is not always a square.',
      },
      {
        point: 'Angle size depends on the amount of turn, not the length of the lines.',
        detail:
          'A small pair of lines can make a 170° angle. Long lines can make just 5°. Children often think bigger arms = bigger angle, which is wrong — the length of the arms is irrelevant.',
      },
    ],
    examples: [
      'A tilted square is still a square — four equal sides and four right angles.',
      'Short lines can make a 170° angle; long lines can make just 5° — arm length is irrelevant.',
      'A square has 4 right angles, so it is always a rectangle — but a rectangle is not always a square.',
      'A 6-sided shape with unequal sides is still a hexagon — it does not need to look like a honeycomb cell.',
    ],
    teachingIdea: 'Use "always, sometimes, never" questions — they prompt precise mathematical thinking.',
    activities: [
      { type: 'input', label: 'Always, sometimes or never: is a square a rectangle?', answer: ['always', 'yes', 'always yes'] },
      { type: 'input', label: 'How many sides does a hexagon have?', answer: ['6', 'six'] },
      { type: 'input', label: 'True or false: longer arms on an angle make the angle bigger.', answer: ['false', 'no'] },
    ],
  },
  {
    id: 'ch13',
    title: '13. Measuring',
    theme: 'Units, scales, area and perimeter',
    summary:
      'Measurement means choosing sensible units, estimating, reading scales accurately and understanding what is being measured.',
    keyPoints: [
      {
        point: 'Always start measuring from zero, not the end of the ruler.',
        detail:
          'If an object starts at 2 cm and ends at 7 cm on a ruler, its length is 5 cm — not 7 cm. Children often read the end mark rather than calculating the difference from the start.',
      },
      {
        point: 'Area and perimeter are different things and do not depend on each other.',
        detail:
          'A 1×10 rectangle has area 10 cm² but perimeter 22 cm. A 4×4 square has area 16 cm² and perimeter 16 cm. Two shapes with the same area can have very different perimeters.',
      },
      {
        point: 'Choose the unit that makes sense for the object being measured.',
        detail:
          'A pencil: centimetres. A room: metres. A feather: grams. A person: kilograms. Using the wrong unit produces needlessly awkward numbers and is a sign of poor number sense.',
      },
    ],
    examples: [
      'A 1 cm × 10 cm rectangle has area 10 cm² and perimeter 22 cm.',
      'If an object starts at 2 cm and ends at 7 cm on a ruler, its length is 5 cm, not 7 cm.',
      'A 3 cm × 4 cm rectangle has area 12 cm² and perimeter 14 cm.',
      'A 4×4 square and a 1×7 rectangle both have perimeter 16 cm — same perimeter, different shapes.',
    ],
    teachingIdea: 'Before measuring anything, ask "What unit would make sense here?" to build estimation habits.',
    activities: [
      { type: 'input', label: 'A rectangle is 3 cm by 4 cm. What is its area?', answer: ['12', '12 cm2', '12 cm²'] },
      { type: 'input', label: 'A rectangle is 3 cm by 4 cm. What is its perimeter?', answer: ['14', '14 cm'] },
      { type: 'input', label: 'An object starts at 3 cm and ends at 9 cm on a ruler. How long is it?', answer: ['6', '6 cm'] },
    ],
  },
  {
    id: 'ch14',
    title: '14. Statistics and Chance',
    theme: 'Data, probability and useful questions',
    summary:
      'Statistics is about asking questions, collecting data, presenting it clearly and interpreting it. Chance is about likelihood, not just luck.',
    keyPoints: [
      {
        point: 'A "no" answer still gives useful information.',
        detail:
          'In "guess my number", if you ask "is it even?" and the answer is "no", you now know it is odd — that is half the numbers eliminated. Negative information is still information.',
      },
      {
        point: 'Statistics starts with a good question, not random data collection.',
        detail:
          '"What is the most common pet in our street?" is a useful starting question. Collecting random numbers without a question teaches nothing about statistical thinking.',
      },
      {
        point: 'Probability can be written as a fraction: favourable outcomes ÷ total possible outcomes.',
        detail:
          'Rolling a die: chance of a 6 is 1/6 (one favourable out of six possible). Chance of an even number is 3/6 = 1/2 (three favourables: 2, 4, 6). The fraction represents likelihood, not certainty.',
      },
    ],
    examples: [
      'Rolling a die: chance of a 6 is 1/6; chance of an even number is 3/6 = 1/2.',
      'Asking "is it less than 5?" eliminates half the numbers 1–10 whatever the answer — a very efficient question.',
      'Tally: Apple 3, Banana 2, Grapes 4. How many more grapes than bananas? 4 − 2 = 2.',
      'After 3 heads in a row, the next coin flip is still 1/2 heads — each flip is independent.',
    ],
    teachingIdea: 'Use real family data — collect it together, then ask "what is most popular?", "how many more?" and "what surprised you?"',
    activities: [
      { type: 'input', label: 'Rolling a normal die: what is the chance of an even number? (Write as a fraction)', answer: ['1/2', '3/6', 'half', '0.5'] },
      { type: 'input', label: 'A fair coin is flipped. What is the probability of heads?', answer: ['1/2', 'half', '0.5', '50%', '50 percent'] },
      { type: 'input', label: 'A bag has 3 red and 7 blue balls. What is the probability of picking a red? (Write as a fraction)', answer: ['3/10', 'three tenths'] },
    ],
  },
  {
    id: 'ch15',
    title: '15. Calculator Maths',
    theme: 'Estimating before calculating',
    summary:
      'Calculators are useful tools, but children still need estimation and number sense so they can spot silly answers.',
    keyPoints: [
      {
        point: 'Always estimate before using a calculator.',
        detail:
          '49 × 21 ≈ 50 × 20 = 1000. So 1029 seems right. If the calculator says 10290, something went wrong — perhaps a misplaced decimal point or an extra digit pressed by accident.',
      },
      {
        point: 'Input errors are the most common calculator mistakes.',
        detail:
          'A child might press 4 instead of 40, miss a decimal point, or forget to clear the previous answer. A mental estimate catches all of these errors before they cause problems.',
      },
      {
        point: 'Different calculators handle order of operations differently.',
        detail:
          '7 + 3 × 2 should be 13 (multiplication first, then addition), but a simple left-to-right calculator gives 20. Children need to know which type they are using.',
      },
    ],
    examples: [
      '49 × 21 ≈ 50 × 20 = 1000, so 1029 is sensible but 10290 is not.',
      '7 + 3 × 2 = 13 on a proper calculator (× before +), but 20 on a left-to-right calculator.',
      '£4.50 × 3 ≈ £4.50 × 3 = £13.50. If the calculator shows 135, a decimal point is missing.',
      'Always clear the calculator before a new sum — leftover numbers from the last answer cause wrong results.',
    ],
    teachingIdea: 'Use the calculator as a checking and exploring tool, not just an answer machine. Always ask "Roughly what should the answer be?" first.',
    activities: [
      { type: 'input', label: 'Estimate check: 49 × 21 is closest to 100, 1000 or 10000?', answer: ['1000', '1,000'] },
      { type: 'input', label: 'Estimate: roughly what is 98 × 31?', answer: ['3000', '3,000', '2938', '3100'] },
      { type: 'input', label: 'What is 7 + 3 × 2 if multiplication is done before addition?', answer: '13' },
    ],
  },
  {
    id: 'ch16',
    title: '16. Big Ideas for Small People',
    theme: 'Patterns, logic and algebra as magic explained',
    summary:
      'Children can explore algebra, infinity, patterns and logic in playful ways that feel like magic — because they are underpinned by mathematical structure.',
    keyPoints: [
      {
        point: 'Algebra is about patterns and rules, not just letters.',
        detail:
          'Before children meet formal algebra, they already do it: "my number + 3 = 7, so my number is 4." The letter n is just a name for "the number I am thinking of." Algebra formalises intuition.',
      },
      {
        point: 'Maths tricks that always work do so because of structure, not coincidence.',
        detail:
          'The "think of a number" trick always gives 5 because the unknown cancels out: n → 2n → 2n+10 → n+5 → 5. Using algebra to prove it works for every number is real mathematical thinking.',
      },
      {
        point: 'Asking "why does this always work?" is exactly what mathematicians do.',
        detail:
          'Encouraging a child to prove a pattern — not just notice it — is more valuable than memorising a hundred examples. This habit of mind is the foundation of all higher mathematics.',
      },
    ],
    examples: [
      'Think of a number, double it, add 10, divide by 2, subtract your original — the answer is always 5.',
      'n → 2n → 2n+10 → n+5 → 5. The unknown cancels, which is why it always works.',
      'The sequence 3, 6, 9, 12, … has the rule "add 3". So 15 is next.',
      'n + 5 = 12 means n = 7 — the same logic as "what plus 5 makes 12?" Algebra is formal notation for reasoning children already do.',
    ],
    teachingIdea: 'Present algebra as a way to explain why maths tricks always work — mystery becomes understanding.',
    activities: [
      { type: 'trick' },
      { type: 'input', label: 'Solve: n + 5 = 12. What is n?', answer: ['7', 'seven'] },
      { type: 'input', label: 'The sequence is 3, 6, 9, 12, … What comes next?', answer: ['15', 'fifteen'] },
    ],
  },
]
