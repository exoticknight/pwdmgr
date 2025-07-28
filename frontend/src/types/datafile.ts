import type { Datum } from './data'
import type { Setting } from './setting'

export interface DataFile {
  version: string
  setting: Setting
  data: Datum[]
}
