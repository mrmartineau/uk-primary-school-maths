// Rules, shortcuts and "little cheats" worth memorising, by topic.
// Language follows the parents' guide (src/chapters.js).

export const TRICKS = {
  bonds: [
    ['🖐️', 'Bonds to 10', '1+9, 2+8, 3+7, 4+6, 5+5. Learn these and you know loads more!'],
    ['🔟', 'Bonds to 100', 'The ones make 10 and the tens make 90: 37 + 63 → 7+3 = 10, 30+60 = 90.'],
    ['💯', 'Bonds to 1000', 'Same idea: the tens make 100 and the hundreds make 900: 340 + 660.'],
    ['🔍', 'Decimal bonds to 1', 'Tenths make 10 tenths: 0.3 + 0.7 = 1. Hundredths: 0.25 + 0.75 = 1.'],
  ],
  add: [
    ['✂️', 'Partitioning', 'Split the second number into tens and ones. Add the tens, then the ones.'],
    ['🤝', 'Friendly numbers', '99 + 48 → 100 + 48 − 1. Round to a friendly number, then fix it.'],
    ['🔟', 'Make the next 10', '8 + 5 → 8 + 2 = 10, then 3 more = 13.'],
    ['👯', 'Near doubles', '6 + 7 is double 6 plus 1 = 13.'],
    ['🔄', 'Swap them', '3 + 48 is the same as 48 + 3. Start with the bigger number.'],
    ['🤔', 'Estimate first', 'Round both numbers first so you know roughly what to expect.'],
  ],
  sub: [
    ['🪜', 'Counting up', 'Find the difference: 201 − 196 → count up from 196 to 201 = 5.'],
    ['✂️', 'Take away in parts', 'Take away the tens, then the ones.'],
    ['🤝', 'Friendly numbers', '7000 − 1999 → 7000 − 2000 + 1.'],
    ['✅', 'Check by adding', 'Answer + the number you took away should give the start number.'],
    ['⚖️', 'Same difference', 'Add the same to both: 82 − 29 = 83 − 30 = 53.'],
  ],
  tables: [
    ['👯', '× 2, 4, 8', 'Double for ×2, double double for ×4, double double double for ×8.'],
    ['✋', '× 5', 'Half of × 10: 7 × 5 = 70 ÷ 2 = 35. Answers end in 0 or 5.'],
    ['🔟', '× 9', '× 10 then take one away: 9 × 6 = 60 − 6 = 54. Digits add to 9!'],
    ['🖐️', '9s finger trick', 'Hold up 10 fingers. For 9 × 4 put down finger 4: 3 fingers left, 6 right → 36.'],
    ['➕', '× 3, 6', '× 3 = double + one more. × 6 = × 5 + one more.'],
    ['🧩', '× 7', '× 5 plus × 2: 7 × 8 = 40 + 16 = 56.'],
    ['🔟', '× 11, 12', '× 11 = × 10 + one more. × 12 = × 10 + × 2.'],
    ['🔄', 'Swap it', '3 × 8 = 8 × 3. Every fact you learn is really two (and two divisions too)!'],
    ['🧭', 'Nearby facts', 'Know 5 × 7 = 35? Then 6 × 7 = 35 + 7 = 42.'],
    ['🎵', 'Tricky ones', '56 = 7 × 8 (5, 6, 7, 8!). 6 × 8 = 48. 7 × 7 = 49.'],
  ],
  div: [
    ['🔁', 'Inverse', '28 ÷ 7: think "what × 7 = 28?" Use your times tables backwards.'],
    ['✂️', 'Halving', '÷ 2 = halve. ÷ 4 = halve twice. ÷ 8 = halve three times.'],
    ['✋', '÷ 5', '÷ 10, then double: 85 ÷ 5 = 8.5 × 2 = 17.'],
    ['🧱', 'Chunking', 'Take away big chunks you know (10 lots, 5 lots) and count the chunks.'],
    ['✂️', 'Partition', '84 ÷ 4 = 80 ÷ 4 + 4 ÷ 4 = 20 + 1 = 21.'],
    ['🕵️', 'Divisibility rules', '÷2: even. ÷3: digits add to a 3× number. ÷5: ends 0 or 5. ÷9: digits add to 9×. ÷10: ends 0.'],
  ],
  doubles: [
    ['✂️', 'Double in parts', 'Double 37 = double 30 + double 7 = 60 + 14 = 74.'],
    ['✂️', 'Halve in parts', 'Half of 74 = half of 70 + half of 4 = 35 + 2 = 37.'],
    ['🔁', 'Doubles ↔ halves', 'If double 37 = 74, then half of 74 = 37.'],
  ],
  place: [
    ['🏠', 'Columns', 'Thousands, Hundreds, Tens, Ones. A digit is worth more the further left it is.'],
    ['➡️', '× 10, 100, 1000', 'Digits move 1, 2 or 3 places left. The decimal point stays still!'],
    ['⬅️', '÷ 10, 100, 1000', 'Digits move 1, 2 or 3 places right.'],
    ['0️⃣', 'Zero holds the place', 'In 305 the zero says "no tens".'],
  ],
  round: [
    ['👀', 'Look next door', 'Look at the digit to the right of where you round. 5 or more: up. 4 or less: down.'],
    ['📏', 'Number line', 'Which multiple is it closer to? Halfway (5) rounds up.'],
  ],
  fractions: [
    ['🍕', 'Fraction of an amount', 'Divide by the bottom, times by the top. 3/4 of 20: 20 ÷ 4 = 5, × 3 = 15.'],
    ['⚖️', 'Equivalent fractions', 'Do the same to the top and bottom: 1/2 = 2/4 = 3/6 = 4/8.'],
    ['✂️', 'Simplify', 'Divide top and bottom by the same number until you can’t any more.'],
    ['➕', 'Adding', 'Same bottom number? Add the tops. Different? Make the bottoms match first.'],
  ],
  decimals: [
    ['🍕', 'Know these', '1/2 = 0.5 = 50%. 1/4 = 0.25 = 25%. 3/4 = 0.75 = 75%. 1/10 = 0.1 = 10%. 1/5 = 0.2 = 20%.'],
    ['🧱', 'Percentages from 10%', '10% = ÷ 10. 5% = half of 10%. 20% = double 10%. Build the rest.'],
    ['🔄', 'Swap it', '8% of 50 = 50% of 8 = 4. Swapping can make it easy!'],
  ],
  money: [
    ['🪙', 'Biggest coins first', 'Count the biggest coins first, then count on.'],
    ['🪜', 'Change: count up', 'From £3.65 to £5: + 35p → £4, + £1 → £5. Change = £1.35.'],
    ['🤝', '£x.99 trick', '£3.99 × 4: think £4 × 4 = £16, then take 4p off = £15.96.'],
  ],
  time: [
    ['🕰️', 'The hands', 'Short hand = hours. Long hand = minutes (count in 5s).'],
    ['⏰', 'Through the hour', 'Add time by going to the next o’clock first.'],
    ['🌙', '24-hour clock', 'After 12 noon, add 12 to the hour: 3 pm = 15:00.'],
    ['🔢', 'Remember', '60 seconds = 1 minute. 60 minutes = 1 hour. Quarter = 15 min, half = 30 min.'],
  ],
  measure: [
    ['📏', 'Key facts', '10 mm = 1 cm. 100 cm = 1 m. 1000 m = 1 km. 1000 g = 1 kg. 1000 ml = 1 l.'],
    ['➡️', 'Big to small: ×', 'Going to a smaller unit means more of them, so multiply.'],
    ['⬅️', 'Small to big: ÷', 'Going to a bigger unit means fewer of them, so divide.'],
  ],
  shape: [
    ['🔷', 'Sides', 'Tri 3, quad 4, pent 5, hex 6, hept 7, oct 8 (octopus!).'],
    ['📐', 'Angles', 'Right angle 90°. Straight line 180°. Full turn 360°. Triangle adds to 180°.'],
    ['📏', 'Perimeter & area', 'Perimeter = all the way round. Area = length × width.'],
  ],
  missing: [
    ['🔁', 'Undo it', 'Work backwards with the opposite: + ↔ −, × ↔ ÷.'],
    ['🧮', 'Order of operations', '× and ÷ before + and −. Brackets first of all.'],
    ['✅', 'Put it back in', 'Check by putting your answer into the question.'],
  ],
  patterns: [
    ['🔍', 'Find the gap', 'What do you add or take each time? Is the gap always the same?'],
    ['🟩', 'Special numbers', 'Squares: 1, 4, 9, 16, 25… Doubles: 1, 2, 4, 8, 16…'],
  ],
  negatives: [
    ['🌡️', 'Thermometer', 'Think of a thermometer. Below zero is negative.'],
    ['🪜', 'Through zero', 'Count to 0 first, then the rest.'],
    ['➖', 'Minus a minus', 'Taking away a negative is the same as adding: 5 − −3 = 8.'],
  ],
  words: [
    ['🔑', 'Key words', 'Altogether/total → add. Left/difference → subtract. Each/groups of → × or ÷. Share → ÷.'],
    ['✏️', 'Draw it', 'A quick sketch or bar model often shows what to do.'],
    ['🤔', 'Does it make sense?', 'Read your answer back in the story. Is it sensible?'],
  ],
}

export const GENERAL_TRICKS = [
  ['🤔', 'Estimate first', 'Have a rough idea before you work it out, then check your answer is close.'],
  ['🔄', 'Try another way', 'If one way feels hard, there is almost always another. Pick the one you like!'],
  ['✅', 'Check it backwards', 'Use the opposite operation to check.'],
]
