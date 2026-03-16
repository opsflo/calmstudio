// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

import * as core from '@actions/core';

async function run(): Promise<void> {
  core.info('CalmStudio GitHub Action');
}

run().catch((e: unknown) => core.setFailed(String(e)));
