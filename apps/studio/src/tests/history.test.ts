// SPDX-FileCopyrightText: 2026 CalmStudio Contributors
//
// SPDX-License-Identifier: Apache-2.0

import { describe, test } from 'vitest';

describe('history - undo/redo', () => {
	test.todo('pushSnapshot adds snapshot to history stack');
	test.todo('undo returns previous snapshot');
	test.todo('undo at start of history returns null');
	test.todo('redo returns next snapshot');
	test.todo('redo at end of history returns null');
	test.todo('pushSnapshot after undo drops future history');
});
