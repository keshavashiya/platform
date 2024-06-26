//
// Copyright © 2024 Hardcore Engineering Inc.
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
//

import contact from '@hcengineering/contact'
import { TxOperations, type Ref } from '@hcengineering/core'
import drive from '@hcengineering/drive'
import {
  createDefaultSpace,
  tryUpgrade,
  type MigrateOperation,
  type MigrationClient,
  type MigrationUpgradeClient
} from '@hcengineering/model'
import core from '@hcengineering/model-core'
import { RoomAccess, RoomType, createDefaultRooms, isOffice, loveId, type Floor } from '@hcengineering/love'
import love from './plugin'

async function createDefaultFloor (tx: TxOperations): Promise<void> {
  const current = await tx.findOne(love.class.Floor, {
    _id: love.ids.MainFloor
  })
  if (current === undefined) {
    await tx.createDoc(
      love.class.Floor,
      love.space.Rooms,
      {
        name: 'Main'
      },
      love.ids.MainFloor
    )
  }
}

async function createRooms (client: MigrationUpgradeClient): Promise<void> {
  const tx = new TxOperations(client, core.account.System)
  const rooms = await client.findAll(love.class.Room, {})
  for (const room of rooms) {
    await tx.remove(room)
  }
  const employees = await client.findAll(contact.mixin.Employee, { active: true })
  const data = createDefaultRooms(employees.map((p) => p._id))
  for (const room of data) {
    const _class = isOffice(room) ? love.class.Office : love.class.Room
    await tx.createDoc(_class, love.space.Rooms, room)
  }
}

async function createReception (client: MigrationUpgradeClient): Promise<void> {
  const tx = new TxOperations(client, core.account.System)
  const current = await tx.findOne(love.class.Room, {
    _id: love.ids.Reception
  })
  if (current !== undefined) return
  await tx.createDoc(
    love.class.Room,
    love.space.Rooms,
    {
      name: 'Reception',
      type: RoomType.Reception,
      access: RoomAccess.Open,
      floor: '' as Ref<Floor>,
      width: 100,
      height: 0,
      x: 0,
      y: 0
    },
    love.ids.Reception
  )
}

export const loveOperation: MigrateOperation = {
  async migrate (client: MigrationClient): Promise<void> {},
  async upgrade (client: MigrationUpgradeClient): Promise<void> {
    const tx = new TxOperations(client, core.account.System)
    await tryUpgrade(client, loveId, [
      {
        state: 'create-defaults-v2',
        func: async (client) => {
          await createDefaultSpace(client, love.space.Rooms, { name: 'Rooms', description: 'Space for all rooms' })
        }
      },
      {
        state: 'initial-defaults',
        func: async (client) => {
          await createDefaultFloor(tx)
        }
      },
      {
        state: 'createRooms_v2',
        func: createRooms
      },

      {
        state: 'create-reception',
        func: async (client) => {
          await createReception(client)
        }
      }
    ])

    await createDefaultSpace(
      client,
      love.space.Drive,
      {
        name: 'Records',
        description: 'Office records',
        type: drive.spaceType.DefaultDrive,
        autoJoin: true
      },
      drive.class.Drive
    )
  }
}
