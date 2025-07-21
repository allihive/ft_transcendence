import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { Room } from "./room.entity";

@Entity()
export class RoomMember {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid' })
  userId!: string;

  @Property()
  name!: string;

  @Property()
  joinedAt: Date = new Date();

  @ManyToOne(() => Room)
  room!: Room;
} 