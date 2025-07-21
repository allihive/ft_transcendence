import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { User } from "../../user/entities/user.entity";
import { Room } from "./room.entity";
import { v4 } from "uuid";

@Entity()
export class UserReadMessageEntity {
  @PrimaryKey()
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Room)
  room!: Room;

  @Property()
  lastReadTimestamp: number = Date.now();

  @Property({ type: 'uuid', nullable: true })
  lastReadMessageId?: string;

  @Property()
  unreadCount: number = 0;

  @Property()
  updatedAt: Date = new Date();
}
