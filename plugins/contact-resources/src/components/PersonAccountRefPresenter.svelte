<!--
// Copyright © 2020, 2021 Anticrm Platform Contributors.
// Copyright © 2021 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
-->
<script lang="ts">
  import { PersonAccount } from '@hcengineering/contact'
  import { Ref } from '@hcengineering/core'
  import { IconSize } from '@hcengineering/ui'
  import { personAccountByIdStore } from '../utils'
  import PersonAccountPresenter from './PersonAccountPresenter.svelte'

  export let value: Ref<PersonAccount>
  export let avatarSize: IconSize = 'x-small'
  export let disabled: boolean = false
  export let inline: boolean = false
  export let accent: boolean = false
  export let compact = false

  $: account = $personAccountByIdStore.get(value)
</script>

{#if account}
  <PersonAccountPresenter value={account} {disabled} {inline} {avatarSize} {accent} {compact} on:accent-color />
{/if}
