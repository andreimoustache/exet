/**
 * Romanian accent-insensitive solving for exported Exolve puzzles.
 *
 * Exolve has no native "ignore accents" option, and exolve-alternatives caps
 * at 3 alternative-groups per clue (Romanian words often have 4+ diacritics),
 * so neither fits blanket folding. This patch hooks the single choke point all
 * letter writes pass through -- setCellLetter -- and promotes a typed base
 * letter (A I S T) to the cell's diacritic solution (Ă Â Î Ș Ț) when they fold
 * to the same letter. Because the cell ends up storing its true diacritic
 * state char, Exolve's native check / reveal / solved logic keeps working
 * unchanged, and the proper Romanian letter is what gets displayed and revealed.
 *
 * The promotion rule is safe for every caller of setCellLetter:
 *   - solver input  -> base letter folds to the solution -> promoted
 *   - reveal        -> passed the solution already -> unchanged (no-op)
 *   - check (wrong) -> passed '0' -> never fold-matches -> unchanged
 *
 * Usage: this file defines a global customizeExolve(p) that createExolve()
 * calls for every puzzle on the page. Include it with a <script> tag in the
 * exported puzzle's <head>, BEFORE the Exolve script that builds the grid:
 *   <script src="accent-insensitive-ro.js"></script>
 * (See inject-accent-insensitive.sh for an automated post-export step.)
 */
function customizeExolve(p) {
  // State chars are uppercase single codepoints for Latin letters, so the
  // fold map is expressed in uppercase state-char space.
  const FOLD = { 'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T' };

  const origSetCellLetter = p.setCellLetter.bind(p);
  p.setCellLetter = function(gridCell, letter) {
    const sol = gridCell && gridCell.solution;
    if (sol && FOLD[sol] && letter === FOLD[sol] && letter !== sol) {
      letter = sol;   // promote typed base letter to this cell's diacritic
    }
    return origSetCellLetter(gridCell, letter);
  };
}
