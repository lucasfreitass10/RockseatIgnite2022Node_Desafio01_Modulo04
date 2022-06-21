import { Column, Entity, PrimaryColumn } from "typeorm";
import { v4 as uuid } from 'uuid'

@Entity('transfers')
class Transfer {
  @PrimaryColumn()
  id: string

  @Column()
  sender_id: string

  @Column()
  receiver_id: string

  constructor() {
    if (!this.id) {
      this.id = uuid()
    }
  }
}

export { Transfer }
